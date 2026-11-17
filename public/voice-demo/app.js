import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { planSentence } from "./isl-planner.js";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODELS = {
  pose: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
  hand: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  face: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
};
const DEFAULT_AVATAR = "models/avatar.vrm";
const FORMAT = 3;
const FACE_KEYS = ["jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthPucker", "mouthFunnel", "mouthStretchLeft", "mouthStretchRight", "browInnerUp", "browDownLeft", "browDownRight", "eyeBlinkLeft", "eyeBlinkRight", "eyeWideLeft", "eyeWideRight", "cheekPuff"];
const FINGERS = [
  ["Thumb", ["Metacarpal", "Proximal", "Distal"], [1, 2, 3, 4]],
  ["Index", ["Proximal", "Intermediate", "Distal"], [5, 6, 7, 8]],
  ["Middle", ["Proximal", "Intermediate", "Distal"], [9, 10, 11, 12]],
  ["Ring", ["Proximal", "Intermediate", "Distal"], [13, 14, 15, 16]],
  ["Little", ["Proximal", "Intermediate", "Distal"], [17, 18, 19, 20]]
];
const SIDES = {
  left: { shoulder: 12, elbow: 14, wrist: 16, hand: "left", s: "ls", e: "le", w: "lw", sign: 1 },
  right: { shoulder: 11, elbow: 13, wrist: 15, hand: "right", s: "rs", e: "re", w: "rw", sign: -1 }
};
const HAND_LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
const POSE_LINKS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [7, 8]];
const GAP_MS = 320;
const TEXT_MS = 650;         // caption time for a word that has no sign yet
const HOLD_FRAMES = 8;
// Time constants (seconds) for frame-rate independent smoothing toward the solved pose.
const LIVE_TAU = 0.06;
const PLAY_TAU = 0.035;
const FACE_TAU = 0.12;
// Fingers and wrists get gentler easing than the arms: tracking noise is largest there, and
// small, fast finger flicks read as glitches rather than motion.
const HAND_TAU = 0.055;
const FINGER_TAU = 0.075;
// Anatomical limits (radians) per finger segment: [min hinge, max hinge] for the middle/end joints,
// and a total swing cap for the knuckle. Keeps noisy tracking from bending fingers backwards or sideways.
const FINGER_LIMITS = {
  thumb: [{ swing: 1.0 }, { swing: 0.9 }, { swing: 1.2 }],
  finger: [{ swing: 1.65 }, { min: -0.05, max: 1.9 }, { min: -0.05, max: 1.45 }]
};
const VIS_MIN = 0.35;
// Motion clean-up applied to every sign before playback.
const ARM_RAMP = 6;          // frames used to ease in/out of occluded (untracked) arm sections
const HAND_GAP_MAX = 10;     // interior hand-tracking gaps up to this many frames are bridged
const ACTIVE_EPS = 0.04;     // wrist travel (m) that counts as the sign having started
const TRIM_MARGIN = 4;       // frames of rest kept before/after the active part of a sign
const WRIST_MAX = THREE.MathUtils.degToRad(95);
const SHOULDER_SHARE = 0.1;  // fraction of arm swing carried by the clavicle
// Natural relaxed finger curl (radians) for Thumb, Index, Middle, Ring, Little when no hand data.
const RELAXED_CURL = [[0.12, 0.18, 0.12], [0.22, 0.3, 0.2], [0.28, 0.36, 0.24], [0.34, 0.42, 0.28], [0.4, 0.48, 0.32]];
// Approximate facial expressions for emotion signs. Not validated by an ISL reviewer.
const SIGN_EXPRESSIONS = {
  happy: { happy: 0.45 }, sad: { sad: 0.55 }, angry: { angry: 0.5 }, sorry: { sad: 0.35 },
  beautiful: { happy: 0.3 }, ugly: { angry: 0.25 }, bad: { angry: 0.15, sad: 0.15 }, good: { happy: 0.2 },
  hello: { happy: 0.2 }, welcome: { happy: 0.25 }, "thank you": { happy: 0.25 }, "good morning": { happy: 0.25 },
  "you are perfect": { happy: 0.35 }, loud: { surprised: 0.25 }
};

const $ = id => document.getElementById(id);
const el = {
  video: $("video"), overlay: $("overlay"), avatar: $("avatar"), status: $("status"), countdown: $("countdown"),
  recBadge: $("recBadge"), trackInfo: $("trackInfo"), camBtn: $("camBtn"), recBtn: $("recBtn"), stopBtn: $("stopBtn"),
  wordInput: $("wordInput"), liveChk: $("liveChk"), textInput: $("textInput"), playBtn: $("playBtn"), haltBtn: $("haltBtn"),
  speed: $("speed"), speedVal: $("speedVal"), loopChk: $("loopChk"), modelInput: $("modelInput"), avatarLoading: $("avatarLoading"),
  resetViewBtn: $("resetViewBtn"), sequence: $("sequence"), caption: $("caption"), library: $("library"), preview: $("preview"),
  exportBtn: $("exportBtn"), importInput: $("importInput")
};
el.fullscreenBtn = $("fullscreenBtn");
el.fullscreenMicBtn = $("fullscreenMicBtn");
el.exitFullscreenBtn = $("exitFullscreenBtn");
const octx = el.overlay.getContext("2d");

const state = {
  models: null, stream: null, lastVT: -1, lastTs: 0, liveFrame: null, miss: { left: 0, right: 0 }, filters: {}, liveHand: {}, loneSide: null,
  recording: false, rec: [], recStart: 0, recWord: "", recorder: null, chunks: [],
  playing: false, timeline: null, playT: 0, lastNow: 0, activeSeg: -1, library: new Map(), vrm: null, rest: null, view: null,
  expr: null
};
const life = { time: 0, nextBlink: 1.2, blinkT: -1, doubleBlink: false };

const setStatus = (msg, kind = "") => {
  el.status.textContent = msg;
  el.status.className = `status ${kind}`;
};
const clamp01 = v => Math.min(1, Math.max(0, v));
const r4 = v => Math.round(v * 10000) / 10000;
const sleep = ms => new Promise(res => setTimeout(res, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);
const normalizeKey = s => s.toLocaleLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const add = (a, b) => a.map((v, i) => r4(v + b[i]));
const mirror = p => [r4(-p.x), r4(-p.y), r4(-p.z)];
const V = a => new THREE.Vector3(a[0], a[1], a[2]);
const I = () => new THREE.Quaternion();

const IDLE_BODY = (() => {
  const ls = [0.18, 0.45, 0];
  const rs = [-0.18, 0.45, 0];
  const le = add(ls, [0.04, -0.27, -0.01]);
  const re = add(rs, [-0.04, -0.27, -0.01]);
  return { ls, rs, le, re, lw: add(le, [0.01, -0.25, 0.04]), rw: add(re, [-0.01, -0.25, 0.04]), lh: [0.1, 0, 0], rh: [-0.1, 0, 0] };
})();
const IDLE = { t: 0, body: IDLE_BODY, left: null, right: null, hw: { left: 0, right: 0 }, head: [0, 0, 0, 1], face: Object.fromEntries(FACE_KEYS.map(k => [k, 0])) };

/* ---------- Motion clean-up ----------
 * The bundled tracks come from MediaPipe on ordinary video. They contain hand-tracking
 * dropouts, synthetic "arm hanging down" frames wherever the elbow/wrist was occluded,
 * single-frame hand flips and landmark jitter. Played raw, those show up as fingers
 * snapping open/closed and arms teleporting. prepareSign() repairs each track once:
 * occluded arm sections are bridged (or eased from rest at the clip edges), short hand
 * gaps are interpolated with a smooth presence weight, spikes are removed, everything is
 * smoothed with a zero-phase Gaussian, and idle lead-in/out is trimmed. */
const sub3 = (a, b) => a.map((v, i) => v - b[i]);
const add3 = (a, b) => a.map((v, i) => v + b[i]);
const chunk3 = row => Array.from({ length: row.length / 3 }, (_, i) => row.slice(i * 3, i * 3 + 3));
const smooth01 = x => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const ARM_IDLE = Object.fromEntries(Object.entries(SIDES).map(([side, c]) => [side, [...sub3(IDLE_BODY[c.e], IDLE_BODY[c.s]), ...sub3(IDLE_BODY[c.w], IDLE_BODY[c.s])]]));
const armOffsets = (b, c) => [...sub3(b[c.e], b[c.s]), ...sub3(b[c.w], b[c.s])];
// buildFrame() substitutes ARM_IDLE when the elbow/wrist is not visible; treat those frames as missing.
const isFallbackArm = (b, side) => armOffsets(b, SIDES[side]).every((v, i) => Math.abs(v - ARM_IDLE[side][i]) < 0.002);

const smoothRows = (rows, sigma) => {
  const r = Math.ceil(sigma * 2.5);
  const kernel = Array.from({ length: r * 2 + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)));
  const total = kernel.reduce((a, b) => a + b, 0);
  const n = rows.length;
  return rows.map((row, i) => {
    const out = new Array(row.length).fill(0);
    kernel.forEach((w, j) => {
      const src = rows[Math.min(n - 1, Math.max(0, i + j - r))];
      for (let c = 0; c < out.length; c++) out[c] += src[c] * w / total;
    });
    return out;
  });
};

// Fill null rows: interior gaps are interpolated, edges come from edgeFn. Returns null if nothing is present.
const fillRows = (rows, edgeFn, maxBridge = Infinity) => {
  const present = rows.map((r, i) => (r ? i : -1)).filter(i => i >= 0);
  if (!present.length) return null;
  const out = rows.slice();
  const weight = rows.map(r => (r ? 1 : 0));
  present.slice(0, -1).forEach((a, k) => {
    const b = present[k + 1];
    for (let i = a + 1; i < b; i++) {
      const t = (i - a) / (b - a);
      out[i] = rows[a].map((v, c) => v + (rows[b][c] - v) * t);
      weight[i] = b - a - 1 <= maxBridge ? 1 : 0;
    }
  });
  const first = present[0];
  const last = present.at(-1);
  for (let i = 0; i < first; i++) out[i] = edgeFn(i, first, rows[first]);
  for (let i = last + 1; i < rows.length; i++) out[i] = edgeFn(i, last, rows[last]);
  return { rows: out, weight };
};

// Drop single-frame hand flips (a hand whose direction disagrees with both agreeing neighbours).
const handDir = row => V(row.slice(27, 30)).sub(V(row.slice(0, 3))).normalize();
const despikeHands = rows => rows.map((row, i) => {
  const prev = rows[i - 1];
  const next = rows[i + 1];
  if (!row || !prev || !next) return row;
  const d = handDir(row);
  const dp = handDir(prev);
  const dn = handDir(next);
  return dp.angleTo(dn) < 0.45 && d.angleTo(dp) > 0.9 && d.angleTo(dn) > 0.9 ? null : row;
});

// Drop brief, isolated hand detections. In one-handed signs the resting hand is often "seen" for a
// few frames (usually the other hand mislabelled, or noise); following those makes the idle hand
// whip round and back. A hand tracked for too little of the sign is ignored entirely.
const MIN_HAND_RUN = 6;        // frames a detection must persist to count
const MIN_HAND_SHARE = 0.12;   // fraction of the sign a hand must be tracked for to be used at all
const HAND_RUN_GAP = 3;       // detections this close together count as one continuous run
const dropBriefHands = rows => {
  const out = rows.map(() => null);
  const idx = rows.map((r, i) => (r ? i : -1)).filter(i => i >= 0);
  const groups = [];
  idx.forEach(i => (groups.length && i - groups.at(-1)[1] - 1 <= HAND_RUN_GAP ? (groups.at(-1)[1] = i) : groups.push([i, i])));
  groups.forEach(([a, b]) => {
    const seen = rows.slice(a, b + 1).filter(Boolean).length;
    if (seen >= MIN_HAND_RUN) for (let k = a; k <= b; k++) out[k] = rows[k];
  });
  return out.filter(Boolean).length >= rows.length * MIN_HAND_SHARE ? out : rows.map(() => null);
};

const prepared = new WeakMap();
const prepareSign = sign => {
  if (prepared.has(sign)) return prepared.get(sign);
  const src = sign.frames;
  const core = smoothRows(src.map(f => [...f.body.ls, ...f.body.rs, ...f.body.lh, ...f.body.rh]), 1.2);
  const arms = Object.fromEntries(Object.keys(SIDES).map(side => {
    const idle = ARM_IDLE[side];
    const rows = src.map(f => (isFallbackArm(f.body, side) ? null : armOffsets(f.body, SIDES[side])));
    const easeFromRest = (i, anchor, val) => {
      const s = smooth01(1 - Math.abs(i - anchor) / ARM_RAMP);
      return idle.map((v, k) => v + (val[k] - v) * s);
    };
    const filled = fillRows(rows, easeFromRest);
    return [side, smoothRows(filled ? filled.rows : rows.map(() => idle), 1.2)];
  }));
  const hands = Object.fromEntries(Object.keys(SIDES).map(side => {
    const rows = dropBriefHands(despikeHands(src.map(f => (f[side] ? f[side].flat() : null))));
    const filled = fillRows(rows, (i, anchor, val) => val, HAND_GAP_MAX);
    return [side, filled && {
      rows: smoothRows(filled.rows, 1.7),
      w: smoothRows(filled.weight.map(v => [v]), 2).map(r => clamp01(r[0]))
    }];
  }));
  const face = smoothRows(src.map(f => FACE_KEYS.map(k => f.face?.[k] ?? 0)), 1.0);
  const headRows = src.map(f => f.head ?? [0, 0, 0, 1]);
  headRows.forEach((q, i) => { if (i && q.reduce((s, v, j) => s + v * headRows[i - 1][j], 0) < 0) headRows[i] = q.map(v => -v); });
  const head = smoothRows(headRows, 1.5);

  // Trim the resting lead-in/out so consecutive signs flow instead of pausing at rest.
  const wristTravel = (i, ref) => Math.max(...Object.keys(SIDES).map(s => Math.hypot(...sub3(arms[s][i].slice(3), arms[s][ref].slice(3)))));
  const n = src.length;
  const firstActive = src.findIndex((_, i) => wristTravel(i, 0) > ACTIVE_EPS);
  const lastActive = n - 1 - [...src].reverse().findIndex((_, j) => wristTravel(n - 1 - j, n - 1) > ACTIVE_EPS);
  let start = firstActive < 0 ? 0 : Math.max(0, firstActive - TRIM_MARGIN);
  let end = firstActive < 0 ? n - 1 : Math.min(n - 1, lastActive + TRIM_MARGIN);
  if (end - start < 8) { start = 0; end = n - 1; }

  const frames = [];
  for (let i = start; i <= end; i++) {
    const [ls, rs, lh, rh] = [0, 3, 6, 9].map(o => core[i].slice(o, o + 3));
    const body = { ls, rs, lh, rh };
    Object.entries(SIDES).forEach(([side, c]) => {
      const s = body[c.s];
      body[c.e] = add3(s, arms[side][i].slice(0, 3));
      body[c.w] = add3(s, arms[side][i].slice(3, 6));
    });
    const len = Math.hypot(...head[i]) || 1;
    frames.push({
      t: src[i].t - src[start].t,
      body,
      left: hands.left ? chunk3(hands.left.rows[i]) : null,
      right: hands.right ? chunk3(hands.right.rows[i]) : null,
      hw: { left: hands.left?.w[i] ?? 0, right: hands.right?.w[i] ?? 0 },
      head: head[i].map(v => v / len),
      face: Object.fromEntries(FACE_KEYS.map((k, j) => [k, face[i][j]]))
    });
  }
  prepared.set(sign, frames);
  return frames;
};

const oneEuro = (minCutoff, beta) => {
  const s = { x: null, dx: 0, t: 0 };
  const alpha = (cutoff, dt) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));
  return (x, t) => {
    const dt = Math.max((t - s.t) / 1000, 1e-3);
    const dx = s.x === null ? 0 : (x - s.x) / dt;
    const edx = s.dx + alpha(1, dt) * (dx - s.dx);
    const out = s.x === null ? x : s.x + alpha(minCutoff + beta * Math.abs(edx), dt) * (x - s.x);
    Object.assign(s, { x: out, dx: edx, t });
    return out;
  };
};
const filterLandmarks = (name, lms, t, minCutoff, beta) => {
  const bank = (state.filters[name] = state.filters[name] ?? []);
  return lms.map((p, i) => {
    const f = (bank[i] = bank[i] ?? { x: oneEuro(minCutoff, beta), y: oneEuro(minCutoff, beta), z: oneEuro(minCutoff, beta) });
    return { ...p, x: f.x(p.x, t), y: f.y(p.y, t), z: f.z(p.z, t) };
  });
};
const resetFilter = name => { state.filters[name] = []; };

const db = await new Promise((res, rej) => {
  const req = indexedDB.open("texttosign-3d", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("signs", { keyPath: "word" });
  req.onsuccess = () => res(req.result);
  req.onerror = () => rej(req.error);
});
const tx = (mode, fn) => new Promise((res, rej) => {
  const t = db.transaction("signs", mode);
  const req = fn(t.objectStore("signs"));
  t.oncomplete = () => res(req?.result);
  t.onerror = () => rej(t.error);
});
const dbPut = sign => tx("readwrite", s => s.put(sign));
const dbAll = () => tx("readonly", s => s.getAll());
const dbDelete = word => tx("readwrite", s => s.delete(word));

/* Bundled signs come from a small index (sign-index.json); each sign's motion lives in its own
 * file under signs/ and is fetched only when it is first played. IndexedDB holds only the
 * signs the user recorded or imported (created > 0), which override bundled ones. */
const loadLibrary = async () => {
  const all = await dbAll();
  // Earlier versions copied every bundled sign into IndexedDB; remove those copies.
  await Promise.all(all.filter(s => !s.created).map(s => dbDelete(s.word)));
  const library = new Map();
  try {
    const response = await fetch("/voice-demo/sign-index.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("The included ISL sign index could not be loaded.");
    const index = await response.json();
    (index.version === FORMAT ? index.signs ?? [] : []).forEach(e => library.set(e.word, {
      v: FORMAT, word: e.word, file: e.file, duration: e.duration, frameCount: e.frames, bundled: true
    }));
  } catch (error) {
    console.error(error);
    setStatus("The included signs could not be loaded. Try refreshing the demo.", "err");
  }
  all.filter(s => s.created && s.v === FORMAT).forEach(s => library.set(s.word, s));
  state.library = library;
  document.querySelectorAll("[data-sign-count]").forEach(n => { n.textContent = String(library.size); });
  renderLibrary();
};

const ensureFrames = signs => Promise.all(signs.filter(s => !s.frames && s.file).map(async s => {
  const response = await fetch(`/voice-demo/signs/${encodeURIComponent(s.file)}`);
  if (!response.ok) throw new Error(`The sign "${s.word}" could not be loaded.`);
  s.frames = (await response.json()).frames;
}));

const renderLibrary = () => {
  const items = [...state.library.values()].sort((a, b) => (a.word.length === 1) - (b.word.length === 1) || a.word.localeCompare(b.word));
  el.library.innerHTML = items.length
    ? items.map(s => `<li>
        <span class="word">${esc(s.word)}</span>
        <span class="meta">${s.word.length === 1 ? "letter" : s.bundled ? "included sign" : "your sign"} · ${(s.duration / 1000).toFixed(1)}s · ${s.frameCount ?? s.frames?.length ?? 0}f</span>
        <button data-action="play" data-word="${esc(s.word)}">Play</button>
        ${s.video ? `<button data-action="video" data-word="${esc(s.word)}">Video</button>` : ""}
        ${s.bundled ? "" : `<button data-action="delete" data-word="${esc(s.word)}">Delete</button>`}
      </li>`).join("")
    : `<li class="empty">No signs yet. Start the camera, type a word and press "Record sign".</li>`;
};

const libraryActions = {
  play: word => playItems([{ label: word, sign: state.library.get(word) }]),
  video: word => {
    URL.revokeObjectURL(el.preview.src);
    el.preview.src = URL.createObjectURL(state.library.get(word).video);
    el.preview.play();
  },
  delete: async word => {
    await dbDelete(word);
    await loadLibrary();  // an included sign with the same word becomes available again
    setStatus(`Deleted "${word}"`);
  }
};
el.library.addEventListener("click", e => libraryActions[e.target.dataset.action]?.(e.target.dataset.word));

const renderer = new THREE.WebGLRenderer({ canvas: el.avatar, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
camera.position.set(0, 1.2, 2.4);
const controls = new OrbitControls(camera, el.avatar);
controls.enableDamping = true;
controls.minDistance = 0.4;
controls.maxDistance = 6;
scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 1.4));
const key = new THREE.DirectionalLight(0xffffff, 1.8);
key.position.set(0.6, 2, 2.5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xbfd0ff, 0.9);
rim.position.set(-1.5, 2, -1.5);
scene.add(rim);
const clock = new THREE.Clock();
const loader = new GLTFLoader();
loader.register(parser => new VRMLoaderPlugin(parser));

const resizeAvatar = () => {
  const w = el.avatar.clientWidth;
  const h = el.avatar.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resizeAvatar);
// The canvas also resizes with its container (iframe layout, full screen); avoid a stretched render.
new ResizeObserver(resizeAvatar).observe(el.avatar);
resizeAvatar();

const node = name => state.vrm?.humanoid.getNormalizedBoneNode(name) ?? null;
const worldPos = name => node(name)?.getWorldPosition(new THREE.Vector3()) ?? null;
const restDir = (a, b) => {
  const pa = worldPos(a);
  const pb = worldPos(b);
  return pa && pb ? pb.sub(pa).normalize() : null;
};

const captureRest = () => {
  state.vrm.scene.updateMatrixWorld(true);
  const side = s => {
    const fingers = FINGERS.map(([f, segs]) => {
      const names = segs.map(seg => `${s}${f}${seg}`);
      const d0 = restDir(names[0], names[1]);
      const d1 = restDir(names[1], names[2]);
      return { names, dirs: [d0, d1, d1] };
    });
    const handS = (worldPos(`${s}IndexProximal`) ?? new THREE.Vector3(0, 0, 0.02)).sub(worldPos(`${s}LittleProximal`) ?? new THREE.Vector3()).normalize();
    const handF = restDir(`${s}Hand`, `${s}MiddleProximal`);
    // Curl axis: the knuckle line, signed so a positive rotation bends the fingers toward the palm (palms face down in the rest T-pose).
    const curlAxis = handS.clone();
    handF.clone().applyAxisAngle(curlAxis, 0.3).y > handF.y && curlAxis.negate();
    return {
      upper: restDir(`${s}UpperArm`, `${s}LowerArm`),
      lower: restDir(`${s}LowerArm`, `${s}Hand`),
      handF,
      handS,
      fingers,
      curlAxis,
      relaxed: RELAXED_CURL.map(angles => angles.map(a => new THREE.Quaternion().setFromAxisAngle(curlAxis, a))),
      shoulderPos: worldPos(`${s}UpperArm`),
      lenUpper: worldPos(`${s}UpperArm`).distanceTo(worldPos(`${s}LowerArm`)),
      lenFore: worldPos(`${s}LowerArm`).distanceTo(worldPos(`${s}Hand`)),
      lenHand: worldPos(`${s}Hand`).distanceTo(worldPos(`${s}MiddleDistal`) ?? worldPos(`${s}MiddleProximal`)) + 0.025
    };
  };
  state.rest = {
    sceneQ: state.vrm.scene.getWorldQuaternion(new THREE.Quaternion()),
    hasChest: !!node("chest"),
    left: side("left"),
    right: side("right")
  };
};

const frameCamera = () => {
  const head = worldPos("head");
  const hips = worldPos("hips");
  const torso = head.y - hips.y;
  // Frame the full signing space: just above the hair down to the lap, where many signs are made.
  const top = head.y + torso * 0.62;
  const bottom = hips.y - torso * 0.5;
  const centerY = (top + bottom) / 2;
  const fitH = (top - bottom) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const fitW = fitH / Math.min(camera.aspect, 1);
  const distance = Math.max(fitH, fitW * 0.85);
  state.view = { pos: new THREE.Vector3(0, centerY, distance), target: new THREE.Vector3(0, centerY, 0) };
  resetView();
};
const resetView = () => {
  state.view && camera.position.copy(state.view.pos);
  state.view && controls.target.copy(state.view.target);
  controls.update();
};

const loadAvatar = async url => {
  el.avatarLoading.textContent = "Loading avatar…";
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm;
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.removeUnnecessaryJoints(gltf.scene);
  VRMUtils.rotateVRM0(vrm);
  vrm.scene.traverse(o => {
    o.frustumCulled = false;
  });
  const old = state.vrm;
  old && scene.remove(old.scene);
  old && VRMUtils.deepDispose(old.scene);
  scene.add(vrm.scene);
  state.vrm = vrm;
  // Eyes follow the viewer's camera for natural eye contact.
  vrm.lookAt && (vrm.lookAt.target = camera);
  vrm.update(0);
  captureRest();
  state.collider = buildBodyCollider(vrm);
  frameCamera();
  el.avatarLoading.textContent = "";
};

const basisQuat = (a, b) => {
  const x = a.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, b).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
};
// Orient a bone so restA -> a, using b to fix the twist. When a and b become nearly parallel
// (e.g. a straight elbow) the twist reference is ill-defined, so fade continuously to a pure
// swing instead of switching abruptly (the old hard switch made the upper arm spin/pop).
const alignFrame = (restA, restB, a, b) => {
  const an = a.clone().normalize();
  const swing = new THREE.Quaternion().setFromUnitVectors(restA, an);
  const w = smooth01((new THREE.Vector3().crossVectors(an, b.clone().normalize()).length() - 0.06) / 0.24);
  return w > 0 ? swing.slerp(basisQuat(a, b).multiply(basisQuat(restA, restB).invert()), w) : swing;
};
const clampAngle = (q, max) => {
  const c = q.w < 0 ? new THREE.Quaternion(-q.x, -q.y, -q.z, -q.w) : q.clone();
  const angle = 2 * Math.acos(Math.min(1, c.w));
  return angle > max ? I().slerp(c, max / angle) : c;
};
const AXIS_X = new THREE.Vector3(1, 0, 0);
const idleHead = () => {
  const t = life.time;
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(
    0.016 * Math.sin(t * 0.53) + 0.008 * Math.sin(t * 1.31),
    0.026 * Math.sin(t * 0.37) + 0.01 * Math.sin(t * 0.91),
    0.01 * Math.sin(t * 0.29)
  ));
};
const swingTo = (parent, rest, target) => new THREE.Quaternion()
  .setFromUnitVectors(rest.clone().applyQuaternion(parent).normalize(), target.clone().normalize())
  .multiply(parent);
const relative = (parent, child) => parent.clone().invert().multiply(child);
const twistAbout = (q, axis) => {
  const p = axis.clone().multiplyScalar(axis.dot(new THREE.Vector3(q.x, q.y, q.z)));
  return new THREE.Quaternion(p.x, p.y, p.z, q.w).normalize();
};
// Make a finger joint anatomically possible: strip twist about the bone, then either keep only
// the bend about the knuckle line (hinge joints) or cap the total swing (knuckles).
const limitFinger = (q, boneDir, curlAxis, lim) => {
  const c = q.w < 0 ? new THREE.Quaternion(-q.x, -q.y, -q.z, -q.w) : q.clone();
  const swing = c.multiply(twistAbout(c, boneDir).invert());
  if (lim.swing !== undefined) return clampAngle(swing, lim.swing);
  const angle = 2 * Math.atan2(curlAxis.dot(new THREE.Vector3(swing.x, swing.y, swing.z)), swing.w);
  return new THREE.Quaternion().setFromAxisAngle(curlAxis, THREE.MathUtils.clamp(angle, lim.min, lim.max));
};

/* ---------- Body collision ----------
 * The motion comes from real signers with different proportions (often seated), so on this
 * avatar the raw arm directions can put hands inside the hips, thighs, chest or face.
 * buildBodyCollider() measures the avatar's actual torso/hips/thighs/head surface from its
 * skinned mesh as a stack of elliptical cross-sections; solveArm() then pushes the elbow,
 * forearm, wrist, palm and fingertips out of it every frame. */
const TORSO_GROUPS = new Set(["hips", "spine", "chest", "upperChest", "neck", "head", "leftUpperLeg", "rightUpperLeg"]);
const HUMAN_BONES = ["hips", "spine", "chest", "upperChest", "neck", "head", "jaw", "leftEye", "rightEye",
  ...["Shoulder", "UpperArm", "LowerArm", "Hand", "UpperLeg", "LowerLeg", "Foot", "Toes"].flatMap(b => [`left${b}`, `right${b}`])];
const SLICE = 0.015;
const buildBodyCollider = vrm => {
  vrm.scene.updateMatrixWorld(true);
  const rawToHuman = new Map(HUMAN_BONES.map(n => [vrm.humanoid.getRawBoneNode(n), n]).filter(([nodeObj]) => nodeObj));
  const groupOf = new Map();
  const group = bone => {
    if (!groupOf.has(bone)) {
      let n = bone;
      while (n && !rawToHuman.has(n)) n = n.parent;
      groupOf.set(bone, n ? rawToHuman.get(n) : null);
    }
    return groupOf.get(bone);
  };
  // Skin plus clothing is the solid surface (VRoid deletes skin hidden under clothes). Hair and
  // facial detail meshes are excluded; sleeves drop out because they are weighted to arm bones.
  const meshes = [];
  const materialName = o => [o.material].flat()[0]?.name ?? "";  // MToon meshes carry [material, outline]
  vrm.scene.traverse(o => o.isSkinnedMesh && !/hair|eye|brow|mouth/i.test(materialName(o)) && meshes.push(o));
  const pts = [];
  const v = new THREE.Vector3();
  meshes.forEach(o => {
    const { position, skinIndex, skinWeight } = o.geometry.attributes;
    if (!skinIndex || !skinWeight) return;
    for (let i = 0; i < position.count; i++) {
      let best = 0;
      for (let k = 1; k < 4; k++) skinWeight.getComponent(i, k) > skinWeight.getComponent(i, best) && (best = k);
      if (!TORSO_GROUPS.has(group(o.skeleton.bones[skinIndex.getComponent(i, best)]))) continue;
      o.getVertexPosition(i, v);
      pts.push(v.clone().applyMatrix4(o.matrixWorld));
    }
  });
  if (!pts.length) return null;
  const y0 = Math.min(...pts.map(p => p.y));
  const raw = [];
  pts.forEach(p => {
    const i = Math.floor((p.y - y0) / SLICE);
    const s = (raw[i] = raw[i] ?? { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity });
    s.x0 = Math.min(s.x0, p.x); s.x1 = Math.max(s.x1, p.x); s.z0 = Math.min(s.z0, p.z); s.z1 = Math.max(s.z1, p.z);
  });
  // Conservative: each slice covers its neighbours so there are no thin gaps between slices.
  const slices = Array.from(raw, (_, i) => {
    const near = [raw[i - 1], raw[i], raw[i + 1]].filter(Boolean);
    if (!raw[i] || !near.length) return null;
    const x0 = Math.min(...near.map(s => s.x0)), x1 = Math.max(...near.map(s => s.x1));
    const z0 = Math.min(...near.map(s => s.z0)), z1 = Math.max(...near.map(s => s.z1));
    return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, ax: (x1 - x0) / 2, az: (z1 - z0) / 2 };
  });
  return { y0, slices, pivot: worldPos("spine") ?? worldPos("hips") };
};

// Vector that moves point p (radius r) out of the body, or null if it is clear.
const bodyPush = (p, r, torsoQ) => {
  const C = state.collider;
  if (!C) return null;
  const upper = p.y > C.pivot.y;
  const inv = upper ? torsoQ.clone().invert() : null;
  const local = upper ? p.clone().sub(C.pivot).applyQuaternion(inv).add(C.pivot) : p.clone();
  const s = C.slices[Math.floor((local.y - C.y0) / SLICE)];
  if (!s) return null;
  const dx = local.x - s.cx;
  const dz = local.z - s.cz;
  const k = Math.hypot(dx / (s.ax + r), dz / (s.az + r));
  if (k >= 1) return null;
  // Radial projection to the (inflated) surface; a point at the very centre goes forward.
  const out = k < 1e-4
    ? new THREE.Vector3(s.cx, local.y, s.cz + s.az + r)
    : new THREE.Vector3(s.cx + dx / k, local.y, s.cz + dz / k);
  const push = out.sub(local);
  return upper ? push.applyQuaternion(torsoQ) : push;
};
const largestPush = (checks, torsoQ) => checks.reduce((best, [p, r]) => {
  const push = bodyPush(p, r, torsoQ);
  return push && (!best || push.lengthSq() > best.lengthSq()) ? push : best;
}, null);

// Keep the arm chain outside the body while preserving the intended direction as closely as possible.
const resolveArmCollision = (rest, chestQ, upperDir, foreDir, handDir) => {
  const C = state.collider;
  if (!C) return;
  const S = rest.shoulderPos.clone().sub(C.pivot).applyQuaternion(chestQ).add(C.pivot);
  const W = S.clone().addScaledVector(upperDir, rest.lenUpper).addScaledVector(foreDir, rest.lenFore);
  for (let it = 0; it < 4; it++) {
    const E = S.clone().addScaledVector(upperDir, rest.lenUpper);
    const push = bodyPush(E, 0.04, chestQ);
    if (!push) break;
    upperDir.copy(E.add(push.multiplyScalar(1.1)).sub(S).normalize());
  }
  const E = S.clone().addScaledVector(upperDir, rest.lenUpper);
  for (let it = 0; it < 6; it++) {
    foreDir.copy(W.clone().sub(E).normalize());
    W.copy(E).addScaledVector(foreDir, rest.lenFore);
    const push = largestPush([
      [W, 0.04],
      [E.clone().lerp(W, 0.5), 0.04],
      [W.clone().addScaledVector(handDir, rest.lenHand * 0.45), 0.04],
      [W.clone().addScaledVector(handDir, rest.lenHand), 0.015]
    ], chestQ);
    if (!push) break;
    W.add(push.multiplyScalar(1.15));
  }
  foreDir.copy(W.sub(E).normalize());
};

const solveArm = (out, side, frame, chestQ) => {
  const cfg = SIDES[side];
  const rest = state.rest[side];
  const b = frame.body;
  const upperDir = V(b[cfg.e]).sub(V(b[cfg.s])).normalize();
  const foreDir = V(b[cfg.w]).sub(V(b[cfg.e])).normalize();
  {
    const h = frame[cfg.hand];
    const w = h ? clamp01(frame.hw?.[cfg.hand] ?? 1) : 0;
    const handDir = w > 0.001 ? foreDir.clone().lerp(V(h[9]).sub(V(h[0])).normalize(), w).normalize() : foreDir.clone();
    resolveArmCollision(rest, chestQ, upperDir, foreDir, handDir);
  }
  // Clavicle follows a small share of the arm swing, so shoulders lift/drop naturally.
  const inChest = upperDir.clone().applyQuaternion(chestQ.clone().invert());
  const shoulderLocal = I().slerp(new THREE.Quaternion().setFromUnitVectors(rest.upper, inChest), SHOULDER_SHARE);
  const shoulderQ = chestQ.clone().multiply(shoulderLocal);
  const upperQ = alignFrame(rest.upper, new THREE.Vector3(0, 0, 1), upperDir, foreDir);
  const lowerQ = swingTo(upperQ, rest.lower, foreDir);
  const hand = frame[cfg.hand];
  // Hand-tracking confidence: 1 = use tracked hand, 0 = relaxed hand following the forearm.
  const hw = hand ? clamp01(frame.hw?.[cfg.hand] ?? 1) : 0;
  const tracked = hw > 0.001
    ? alignFrame(rest.handF, rest.handS, V(hand[9]).sub(V(hand[0])), V(hand[5]).sub(V(hand[17])))
    : null;
  const handRel = clampAngle(relative(lowerQ, tracked ? lowerQ.clone().slerp(tracked, hw) : lowerQ), WRIST_MAX);
  const handQ = lowerQ.clone().multiply(handRel);
  const halfTwist = I().slerp(twistAbout(handRel, rest.lower), 0.5);
  const lowerFinal = lowerQ.clone().multiply(halfTwist);
  out[`${side}Shoulder`] = shoulderLocal;
  out[`${side}UpperArm`] = relative(shoulderQ, upperQ);
  out[`${side}LowerArm`] = relative(upperQ, lowerFinal);
  out[`${side}Hand`] = relative(lowerFinal, handQ);
  rest.fingers.forEach((finger, fi) => {
    const idx = FINGERS[fi][2];
    let parent = handQ;
    finger.names.forEach((name, si) => {
      let local = rest.relaxed[fi][si];
      if (tracked && finger.dirs[si]) {
        const segQ = swingTo(parent, finger.dirs[si], V(hand[idx[si + 1]]).sub(V(hand[idx[si]])));
        const limits = FINGER_LIMITS[fi === 0 ? "thumb" : "finger"][si];
        local = local.clone().slerp(limitFinger(relative(parent, segQ), finger.dirs[si], rest.curlAxis, limits), hw);
      }
      out[name] = local;
      parent = parent.clone().multiply(local);
    });
  });
};

const solvePose = frame => {
  const b = frame.body;
  const across = V(b.ls).sub(V(b.rs));
  const up = V(b.ls).add(V(b.rs)).multiplyScalar(0.5).sub(V(b.lh).add(V(b.rh)).multiplyScalar(0.5));
  const torso = I().slerp(alignFrame(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), across, up), 0.85);
  const spineQ = state.rest.hasChest ? I().slerp(torso, 0.5) : torso.clone();
  // Subtle breathing on the chest; arms are solved relative to it so hand positions stay exact.
  const chestQ = torso.clone().multiply(new THREE.Quaternion().setFromAxisAngle(AXIS_X, Math.sin(life.time * Math.PI * 2 / 4.2) * 0.012));
  const headQ = idleHead().multiply(new THREE.Quaternion(...frame.head).normalize());
  const neckQ = chestQ.clone().slerp(headQ, 0.4);
  const out = {
    hips: I(),
    spine: spineQ,
    chest: relative(spineQ, chestQ),
    upperChest: I(),
    neck: relative(chestQ, neckQ),
    head: relative(neckQ, headQ)
  };
  solveArm(out, "left", frame, chestQ);
  solveArm(out, "right", frame, chestQ);
  return out;
};

const FINGER_BONE = /(Thumb|Index|Middle|Ring|Little)/;
const applyPose = (frame, dt, tau) => {
  const rel = solvePose(frame);
  const S = state.rest.sceneQ;
  const Si = S.clone().invert();
  const ease = t => 1 - Math.exp(-dt / Math.max(tau, t));
  const aBody = ease(tau);
  const aHand = ease(HAND_TAU);
  const aFinger = ease(FINGER_TAU);
  Object.entries(rel).forEach(([name, q]) => {
    const n = node(name);
    if (!n) return;
    const a = FINGER_BONE.test(name) ? aFinger : /Hand$/.test(name) ? aHand : aBody;
    n.quaternion.slerp(Si.clone().multiply(q).multiply(S), a);
  });
};

// Natural blinking every 2–6 s (occasionally a double blink); the motion data has no eye data.
const proceduralBlink = dt => {
  if (life.blinkT < 0 && life.time >= life.nextBlink) life.blinkT = 0;
  if (life.blinkT < 0) return 0;
  life.blinkT += dt;
  const close = 0.06;
  const open = 0.11;
  const v = life.blinkT < close ? life.blinkT / close : 1 - (life.blinkT - close) / open;
  if (life.blinkT >= close + open) {
    life.blinkT = -1;
    life.doubleBlink = !life.doubleBlink && Math.random() < 0.15;
    life.nextBlink = life.time + (life.doubleBlink ? 0.12 : 2 + Math.random() * 4);
  }
  return clamp01(v);
};

const applyFace = (face, dt) => {
  const em = state.vrm?.expressionManager;
  if (!em) return;
  const alpha = 1 - Math.exp(-dt / FACE_TAU);
  const emo = (state.playing && state.expr) || {};
  const avg = (a, b) => ((face[a] ?? 0) + (face[b] ?? 0)) / 2;
  const target = {
    aa: clamp01((face.jawOpen ?? 0) * 1.7),
    oh: clamp01((face.mouthFunnel ?? 0) * 1.6),
    ou: clamp01((face.mouthPucker ?? 0) * 1.4),
    ee: clamp01(avg("mouthStretchLeft", "mouthStretchRight") * 2.2),
    happy: clamp01(avg("mouthSmileLeft", "mouthSmileRight") * 1.2 + (emo.happy ?? 0)),
    sad: clamp01(emo.sad ?? 0),
    surprised: clamp01((face.browInnerUp ?? 0) * 0.9 + avg("eyeWideLeft", "eyeWideRight") * 0.8 + (emo.surprised ?? 0)),
    angry: clamp01(avg("browDownLeft", "browDownRight") * 1.6 + (emo.angry ?? 0))
  };
  Object.entries(target).forEach(([name, v]) => {
    const cur = em.getValue(name) ?? 0;
    em.getExpression(name) && em.setValue(name, cur + (v - cur) * alpha);
  });
  const blink = proceduralBlink(dt);
  em.getExpression("blinkLeft") && em.setValue("blinkLeft", Math.max(blink, clamp01((face.eyeBlinkRight ?? 0) * 1.35 - 0.1)));
  em.getExpression("blinkRight") && em.setValue("blinkRight", Math.max(blink, clamp01((face.eyeBlinkLeft ?? 0) * 1.35 - 0.1)));
};

const applyFrame = (frame, dt, tau) => {
  state.rest && applyPose(frame, dt, tau);
  applyFace(frame.face ?? IDLE.face, dt);
};

const createModel = (fs, Cls, path, extra) => {
  const opts = delegate => ({ baseOptions: { modelAssetPath: path, delegate }, runningMode: "VIDEO", ...extra });
  return Cls.createFromOptions(fs, opts("GPU")).catch(() => Cls.createFromOptions(fs, opts("CPU")));
};

const loadModels = async () => {
  const { FilesetResolver, PoseLandmarker, HandLandmarker, FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const fs = await FilesetResolver.forVisionTasks(WASM);
  const [pose, hand, face] = await Promise.all([
    createModel(fs, PoseLandmarker, MODELS.pose, { numPoses: 1, minPoseDetectionConfidence: 0.6, minPosePresenceConfidence: 0.6, minTrackingConfidence: 0.6 }),
    createModel(fs, HandLandmarker, MODELS.hand, { numHands: 2, minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6 }),
    createModel(fs, FaceLandmarker, MODELS.face, { numFaces: 1, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true })
  ]);
  state.models = { pose, hand, face };
};

const startCamera = async () => {
  if (!state.models) {
    setStatus("Loading camera tracking models…");
    await loadModels();
  }
  state.stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: "user" }, audio: false });
  el.video.srcObject = state.stream;
  await el.video.play();
  el.overlay.width = el.video.videoWidth;
  el.overlay.height = el.video.videoHeight;
  el.camBtn.disabled = true;
  el.camBtn.textContent = "Camera on";
  el.recBtn.disabled = false;
  setStatus("Camera ready. Type a word and record it.", "ok");
};

const hold = (key, val) => {
  state.miss[key] = val ? 0 : state.miss[key] + 1;
  return val ?? (state.miss[key] < HOLD_FRAMES ? state.liveFrame?.[key] ?? null : null);
};

// Decide which detected hand is the user's right/left by its distance to each pose wrist.
// With a single hand near the body's midline that guess can flip frame to frame, which used to
// throw the landmarks onto the avatar's other hand and spin it. Keep the previous side unless the
// evidence clearly points the other way.
const SIDE_MARGIN = 0.004;   // squared normalised distance needed to switch a lone hand's side
const splitHands = (hands2d, pose2d) => {
  const scored = hands2d
    .map((h, i) => ({ i, s: dist2(h[0], pose2d[16]) - dist2(h[0], pose2d[15]) }))
    .sort((a, b) => a.s - b.s);
  if (scored.length > 1) return (state.loneSide = null), { userRight: scored[0].i, userLeft: scored[1].i };
  if (!scored.length) return (state.loneSide = null), { userRight: -1, userLeft: -1 };
  const { i, s } = scored[0];
  const side = state.loneSide && Math.abs(s) < SIDE_MARGIN ? state.loneSide : s < 0 ? "right" : "left";
  state.loneSide = side;
  return side === "right" ? { userRight: i, userLeft: -1 } : { userRight: -1, userLeft: i };
};

// Live hands fade in/out instead of snapping, and must be seen for a few frames before they count.
const HAND_ON_FRAMES = 3;
const HAND_FADE = 0.2;       // weight change per camera frame (about 5 frames to fully blend)
const liveHandWeight = (key, present) => {
  const st = (state.liveHand[key] = state.liveHand[key] ?? { seen: 0, w: 0 });
  st.seen = present ? st.seen + 1 : 0;
  const target = st.seen >= HAND_ON_FRAMES ? 1 : 0;
  st.w = clamp01(st.w + Math.sign(target - st.w) * Math.min(HAND_FADE, Math.abs(target - st.w)));
  return st.w;
};

const headQuat = (fr, t) => {
  const data = fr.facialTransformationMatrixes?.[0]?.data;
  const q = data ? new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().fromArray(data)) : null;
  const sign = q && q.w < 0 ? -1 : 1;
  const f = q ? filterLandmarks("head", [{ x: q.x * sign, y: -q.y * sign, z: -q.z * sign }, { x: q.w * sign, y: 0, z: 0 }], t, 1.5, 0.3) : null;
  return f ? new THREE.Quaternion(f[0].x, f[0].y, f[0].z, f[1].x).normalize().toArray().map(r4) : state.liveFrame?.head ?? [0, 0, 0, 1];
};

const buildFrame = (pr, hr, fr, t) => {
  const pose2d = pr.landmarks[0];
  const pw = filterLandmarks("pose", pr.worldLandmarks[0], t, 1.2, 0.5);
  const vis = i => pose2d[i].visibility ?? 1;
  const armPts = side => {
    const c = SIDES[side];
    const ok = Math.min(vis(c.elbow), vis(c.wrist)) > VIS_MIN;
    const s = mirror(pw[c.shoulder]);
    const e = ok ? mirror(pw[c.elbow]) : add(s, [c.sign * 0.04, -0.27, -0.01]);
    const w = ok ? mirror(pw[c.wrist]) : add(e, [c.sign * 0.01, -0.25, 0.04]);
    return { [c.s]: s, [c.e]: e, [c.w]: w };
  };
  const body = { ...armPts("left"), ...armPts("right"), lh: mirror(pw[24]), rh: mirror(pw[23]) };
  const { userRight, userLeft } = splitHands(hr.landmarks ?? [], pose2d);
  const world = hr.worldLandmarks ?? [];
  userRight < 0 && resetFilter("handA");
  userLeft < 0 && resetFilter("handB");
  const left = userRight >= 0 ? filterLandmarks("handA", world[userRight], t, 1.6, 1.0).map(mirror) : null;
  const right = userLeft >= 0 ? filterLandmarks("handB", world[userLeft], t, 1.6, 1.0).map(mirror) : null;
  const cats = fr.faceBlendshapes?.[0]?.categories ?? [];
  const face = Object.fromEntries(FACE_KEYS.map(k => [k, r4(cats.find(c => c.categoryName === k)?.score ?? 0)]));
  const L = hold("left", left);
  const R = hold("right", right);
  return { body, left: L, right: R, hw: { left: liveHandWeight("left", !!left), right: liveHandWeight("right", !!right) }, head: headQuat(fr, t), face };
};

const drawOverlay = (pr, hr, fr) => {
  const w = el.overlay.width;
  const h = el.overlay.height;
  octx.clearRect(0, 0, w, h);
  const line = (pts, links, color, width) => {
    octx.strokeStyle = color;
    octx.lineWidth = width;
    links.forEach(([a, b]) => {
      octx.beginPath();
      octx.moveTo(pts[a].x * w, pts[a].y * h);
      octx.lineTo(pts[b].x * w, pts[b].y * h);
      octx.stroke();
    });
  };
  const dots = (pts, color, r) => {
    octx.fillStyle = color;
    pts.forEach(p => {
      octx.beginPath();
      octx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
      octx.fill();
    });
  };
  const lm = pr.landmarks?.[0];
  lm && line(lm, POSE_LINKS, "rgba(79,124,255,.9)", 4);
  (hr.landmarks ?? []).forEach(hand => {
    line(hand, HAND_LINKS, "rgba(60,207,145,.95)", 3);
    dots(hand, "#fff", 3.5);
  });
  const face = fr.faceLandmarks?.[0];
  face && dots(face.filter((_, i) => i % 6 === 0), "rgba(255,200,120,.7)", 1.4);
  const split = lm ? splitHands(hr.landmarks ?? [], lm) : { userLeft: -1, userRight: -1 };
  const flags = { Body: !!lm, "L hand": split.userLeft >= 0, "R hand": split.userRight >= 0, Face: !!face };
  el.trackInfo.innerHTML = Object.entries(flags).map(([k, v]) => `<span class="${v ? "on" : ""}">${k}</span>`).join("");
};

const detect = now => {
  state.lastVT = el.video.currentTime;
  const ts = Math.max(Math.round(now), state.lastTs + 1);
  state.lastTs = ts;
  const pr = state.models.pose.detectForVideo(el.video, ts);
  const hr = state.models.hand.detectForVideo(el.video, ts);
  const fr = state.models.face.detectForVideo(el.video, ts);
  drawOverlay(pr, hr, fr);
  const has = pr.landmarks?.length > 0 && pr.worldLandmarks?.length > 0;
  const frame = has ? buildFrame(pr, hr, fr, now) : null;
  state.liveFrame = frame ?? state.liveFrame;
  state.recording && frame && state.rec.push({ ...frame, t: Math.round(now - state.recStart) });
};

// Weighted sum of structurally identical values (numbers, arrays, objects).
const mixVals = (vals, w) => typeof vals[1] === "number"
  ? vals.reduce((s, v, i) => s + (v ?? 0) * w[i], 0)
  : Array.isArray(vals[1])
    ? vals[1].map((_, i) => mixVals(vals.map(v => v[i]), w))
    : Object.fromEntries(Object.keys(vals[1]).map(k => [k, mixVals(vals.map(v => v[k]), w)]));
// Uniform Catmull-Rom basis: C1-continuous motion through the ~30 fps keyframes.
const catmull = t => {
  const t2 = t * t;
  const t3 = t2 * t;
  return [0.5 * (-t + 2 * t2 - t3), 0.5 * (2 - 5 * t2 + 3 * t3), 0.5 * (t + 4 * t2 - 3 * t3), 0.5 * (t3 - t2)];
};
const blendFrames = (fs, w) => {
  const hand = h => {
    const fallback = [fs[1][h], fs[2][h], fs[0][h], fs[3][h]].find(Boolean);
    return fallback ? mixVals(fs.map(f => f[h] ?? fallback), w) : null;
  };
  const hw = mixVals(fs.map(f => f.hw ?? { left: f.left ? 1 : 0, right: f.right ? 1 : 0 }), w);
  const head = mixVals(fs.map(f => f.head), w);
  const len = Math.hypot(...head) || 1;
  return {
    body: mixVals(fs.map(f => f.body), w),
    left: hand("left"),
    right: hand("right"),
    hw: { left: clamp01(hw.left), right: clamp01(hw.right) },
    head: head.map(v => v / len),
    face: mixVals(fs.map(f => f.face ?? IDLE.face), w)
  };
};

const findIndex = (frames, t) => {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    frames[m].t <= t ? (lo = m) : (hi = m - 1);
  }
  return lo;
};

const sampleTimeline = (tl, t) => {
  const F = tl.frames;
  const i = findIndex(F, t);
  const a = F[i];
  const b = F[Math.min(i + 1, F.length - 1)];
  const span = b.t - a.t;
  const k = span > 0 ? clamp01((t - a.t) / span) : 0;
  if (a === b || a.seg !== b.seg) {
    // Transition between signs (or to/from rest): smootherstep ease, zero velocity at both ends.
    const s = k * k * k * (k * (k * 6 - 15) + 10);
    return blendFrames([a, a, b, b], [0, 1 - s, s, 0]);
  }
  const p0 = i > 0 && F[i - 1].seg === a.seg ? F[i - 1] : a;
  const p3 = i + 2 < F.length && F[i + 2].seg === b.seg ? F[i + 2] : b;
  return blendFrames([p0, a, b, p3], catmull(k));
};

const buildTimeline = items => {
  const frames = [{ ...IDLE, t: 0, seg: -1 }];
  const segments = [];
  let offset = GAP_MS;
  items.forEach((item, si) => {
    if (item.text) {
      // Word without a sign: hold a neutral pose while its caption is shown, keeping sentence order.
      frames.push({ ...IDLE, t: offset, seg: si }, { ...IDLE, t: offset + TEXT_MS, seg: si });
      segments.push({ start: offset, end: offset + TEXT_MS, label: item.label, text: true, expr: null });
      offset += TEXT_MS + GAP_MS;
      return;
    }
    const src = prepareSign(item.sign);
    const dur = src.at(-1).t;
    src.forEach(f => frames.push({ ...f, t: offset + f.t, seg: si }));
    segments.push({ start: offset, end: offset + dur, label: item.label, expr: SIGN_EXPRESSIONS[item.sign.word] ?? null });
    offset += dur + GAP_MS;
  });
  frames.push({ ...IDLE, t: offset, seg: -2 });
  return { frames, segments, duration: offset };
};

const renderSequence = items => {
  el.sequence.innerHTML = items.map((it, i) => it.text
    ? `<span class="chip missing" data-seg="${i}" title="No sign in the library yet; shown as a caption">${esc(it.label)}</span>`
    : `<span class="chip ${it.spelled ? "spelled" : ""}" data-seg="${i}">${esc(it.chip ?? it.label)}</span>`).join("");
};

const highlightSegment = idx => {
  state.activeSeg = idx;
  [...el.sequence.querySelectorAll("[data-seg]")].forEach(c => c.classList.toggle("active", Number(c.dataset.seg) === idx));
  const seg = state.timeline?.segments[idx];
  el.caption.textContent = seg?.label ?? "";
  el.caption.classList.toggle("unsigned", !!seg?.text);
};

const playItems = async items => {
  const signs = [...new Set(items.filter(i => i.sign).map(i => i.sign))];
  if (!signs.length) return setStatus("Nothing to play. Record signs first.", "err");
  try {
    signs.some(s => !s.frames) && setStatus("Loading signs…");
    await ensureFrames(signs);
  } catch (error) {
    return setStatus(error.message, "err");
  }
  const valid = items.filter(i => i.text || i.sign?.frames?.length > 1);
  valid.some(i => i.sign) ? beginPlayback(valid) : setStatus("Nothing to play. Record signs first.", "err");
};

const beginPlayback = items => {
  notifyParent({ type: "playing", words: items.filter(i => i.sign).map(i => i.sign.word) });
  state.timeline = buildTimeline(items);
  state.playT = 0;
  state.lastNow = performance.now();
  state.playing = true;
  state.activeSeg = -1;
  setStatus(`Signing ${items.filter(i => i.sign).length} sign(s)…`, "ok");
};

const stopPlayback = () => {
  state.playing && notifyParent({ type: "ended" });
  state.playing = false;
  highlightSegment(-1);
};

const playbackFrame = now => {
  const dt = now - state.lastNow;
  state.lastNow = now;
  state.playT += dt * Number(el.speed.value);
  const tl = state.timeline;
  const t = Math.min(state.playT, tl.duration);
  const seg = tl.segments.findIndex(s => t >= s.start && t <= s.end);
  seg !== state.activeSeg && seg >= 0 && highlightSegment(seg);
  state.expr = seg >= 0 ? tl.segments[seg].expr : null;
  const frame = sampleTimeline(tl, t);
  state.playT >= tl.duration && (el.loopChk.checked ? (state.playT = 0) : stopPlayback());
  return frame;
};

const planText = text => {
  const plan = planSentence(text, w => state.library.has(w));
  const items = plan.items.map(it => it.kind === "text"
    ? { label: it.label, text: true }
    : { label: it.kind === "spell" ? it.label : it.word, chip: it.label, sign: state.library.get(it.word), spelled: it.kind === "spell" });
  return { items, unsigned: plan.unsigned, notes: plan.notes };
};

const translate = async () => {
  const { items, unsigned, notes } = planText(el.textInput.value);
  renderSequence(items);
  if (!items.some(i => i.sign)) return setStatus(unsigned.length ? `No signs in the library yet for: ${unsigned.join(", ")}.` : "Type or say a phrase first.", "err");
  await playItems(items);
  if (!state.playing) return;
  const warnings = [
    unsigned.length && `Shown as captions (no sign yet): ${unsigned.join(", ")}.`,
    notes.includes("negation") && "This phrase contains a negation that cannot be signed yet; check the meaning."
  ].filter(Boolean);
  warnings.length && setStatus(warnings.join(" "), "err");
};

const countdown = async () => {
  for (const n of [3, 2, 1]) {
    el.countdown.textContent = n;
    await sleep(1000);
  }
  el.countdown.textContent = "";
};

const startRecording = async () => {
  const word = normalizeKey(el.wordInput.value);
  return word ? beginRecording(word) : setStatus("Type the word or letter you are about to sign.", "err");
};

const beginRecording = async word => {
  el.recBtn.disabled = true;
  stopPlayback();
  await countdown();
  const mime = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find(m => MediaRecorder.isTypeSupported(m)) ?? "";
  state.chunks = [];
  state.recorder = new MediaRecorder(state.stream, mime ? { mimeType: mime } : {});
  state.recorder.ondataavailable = e => e.data.size && state.chunks.push(e.data);
  state.recorder.start(200);
  state.rec = [];
  state.recWord = word;
  state.recStart = performance.now();
  state.recording = true;
  el.recBadge.classList.add("on");
  el.stopBtn.disabled = false;
  setStatus(`Recording "${word}"… press Stop & save when done.`);
};

const stopRecording = () => {
  state.recording = false;
  el.recBadge.classList.remove("on");
  el.stopBtn.disabled = true;
  el.recBtn.disabled = false;
  const frames = state.rec;
  const word = state.recWord;
  const recorder = state.recorder;
  recorder.onstop = () => finishRecording(word, frames, new Blob(state.chunks, { type: recorder.mimeType || "video/webm" }));
  recorder.stop();
};

const finishRecording = async (word, frames, video) => frames.length >= 5
  ? saveSign(word, frames, video)
  : setStatus("Recording too short or no body detected. Try again.", "err");

const saveSign = async (word, frames, video) => {
  const t0 = frames[0].t;
  const clean = frames.map(f => ({ ...f, t: f.t - t0 }));
  const sign = { v: FORMAT, word, frames: clean, duration: clean.at(-1).t, video, created: Date.now() };
  await dbPut(sign);
  state.library.set(word, sign);
  renderLibrary();
  el.wordInput.value = "";
  setStatus(`Saved "${word}" (${clean.length} frames).`, "ok");
  playItems([{ label: word, sign }]);
};

const exportLibrary = () => {
  // Included signs are already published; export the user's own recordings and imports.
  const data = [...state.library.values()].filter(s => !s.bundled && s.frames).map(({ word, frames, duration, created }) => ({ word, frames, duration, created }));
  const blob = new Blob([JSON.stringify({ version: FORMAT, signs: data })], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sign-library.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

const importLibrary = async file => {
  const parsed = JSON.parse(await file.text());
  const signs = (parsed.version === FORMAT ? parsed.signs ?? [] : []).filter(s => s.word && s.frames?.length > 1);
  await Promise.all(signs.map(s => dbPut({ ...s, v: FORMAT, word: normalizeKey(s.word), created: s.created || Date.now(), video: state.library.get(normalizeKey(s.word))?.video ?? null })));
  await loadLibrary();
  setStatus(`Imported ${signs.length} sign(s).`, signs.length ? "ok" : "err");
};

const loop = now => {
  const dt = Math.min(clock.getDelta(), 0.1);
  life.time += dt;
  const ready = state.models && state.stream && el.video.readyState >= 2 && el.video.currentTime !== state.lastVT;
  ready && detect(now);
  const frame = state.playing ? playbackFrame(now) : (el.liveChk.checked && state.liveFrame) || IDLE;
  state.vrm && applyFrame(frame, dt, state.playing ? PLAY_TAU : LIVE_TAU);
  state.vrm?.update(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};

el.camBtn.addEventListener("click", () => startCamera().catch(e => setStatus(`Camera error: ${e.message}`, "err")));
el.recBtn.addEventListener("click", () => startRecording().catch(e => setStatus(`Record error: ${e.message}`, "err")));
el.stopBtn.addEventListener("click", stopRecording);
el.playBtn.addEventListener("click", translate);
el.textInput.addEventListener("keydown", e => e.key === "Enter" && translate());
el.wordInput.addEventListener("keydown", e => e.key === "Enter" && !el.recBtn.disabled && startRecording());
el.haltBtn.addEventListener("click", stopPlayback);
el.resetViewBtn.addEventListener("click", resetView);
const avatarStage = el.avatar.closest(".avatar-stage");
const fullscreenMicBtn = $("fullscreenMicBtn");
const exitFullscreenBtn = $("exitFullscreenBtn");
el.fullscreenBtn.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement === avatarStage) await document.exitFullscreen();
    else if (avatarStage?.requestFullscreen) await avatarStage.requestFullscreen();
    else setStatus("Full-screen mode is not supported by this browser.", "err");
  } catch (error) {
    setStatus(`Could not open full screen: ${error.message}`, "err");
  }
});
document.addEventListener("fullscreenchange", () => {
  const isFullscreen = document.fullscreenElement === avatarStage;
  el.fullscreenBtn.setAttribute("aria-pressed", String(isFullscreen));
  el.fullscreenBtn.querySelector("span").textContent = isFullscreen ? "Exit full screen" : "Full screen";
  resizeAvatar();
  resetView();
});
exitFullscreenBtn.addEventListener("click", () => document.fullscreenElement && document.exitFullscreen());
el.speed.addEventListener("input", () => { el.speedVal.textContent = `${Number(el.speed.value).toFixed(2)}×`; });
el.exportBtn.addEventListener("click", exportLibrary);
el.importInput.addEventListener("change", e => {
  const file = e.target.files[0];
  file && importLibrary(file).catch(err => setStatus(`Import failed: ${err.message}`, "err"));
  e.target.value = "";
});
el.modelInput.addEventListener("change", e => {
  const file = e.target.files[0];
  file && loadAvatar(URL.createObjectURL(file)).then(() => setStatus(`Avatar "${file.name}" loaded.`, "ok")).catch(err => setStatus(`Avatar load failed: ${err.message}`, "err"));
  e.target.value = "";
});

// Embed API: a same-origin parent page (?embed=1) can ask the avatar to play signs.
//   parent -> avatar: { type: "signsense-play", text?: "good morning", word?: "hello", speed?: 0.5 } | { type: "signsense-stop" }
//   avatar -> parent: { source: "signsense-avatar", type: "ready" | "playing" | "ended" | "error", ... }
function notifyParent(message) {
  parent !== window && parent.postMessage({ source: "signsense-avatar", ...message }, location.origin);
}
window.addEventListener("message", event => {
  if (event.origin !== location.origin || event.source !== parent) return;
  const { type, word, text, speed } = event.data ?? {};
  if (type === "signsense-stop") return stopPlayback();
  // The parent may have missed the one-off "ready" message (e.g. it attached its listener late), so it can ask again.
  if (type === "signsense-ping") return state.vrm && notifyParent({ type: "ready", count: state.library.size });
  if (type !== "signsense-play") return;
  if (Number.isFinite(speed)) {
    el.speed.value = String(Math.min(2, Math.max(0.25, speed)));
    el.speedVal.textContent = `${Number(el.speed.value).toFixed(2)}×`;
  }
  const sign = word && state.library.get(word);
  const items = sign ? [{ label: word, sign }] : planText(String(text ?? word ?? "")).items;
  items.some(i => i.sign) ? playItems(items) : notifyParent({ type: "error", message: "No sign for that word yet." });
});

await loadLibrary();
requestAnimationFrame(loop);
loadAvatar(DEFAULT_AVATAR).catch(e => {
  el.avatarLoading.textContent = "Avatar failed to load";
  setStatus(`Avatar load failed: ${e.message}`, "err");
}).then(() => {
  if (state.vrm) {
    notifyParent({ type: "ready", count: state.library.size });
    el.camBtn.disabled = false;
    setStatus(SpeechRecognition ? "Avatar ready. Speak or type a phrase." : "Avatar ready. Speech recognition is unavailable; type a phrase.", "ok");
  }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const listenBtn = $("listenBtn");
const stopListenBtn = $("stopListenBtn");
const speechLang = $("speechLang");
let recognition = null;
let isListening = false;
let checkedLocalLanguage = "";
let localSpeechAvailable = false;
const updateMicrophoneControls = listening => {
  isListening = listening;
  listenBtn.disabled = listening || !recognition;
  stopListenBtn.disabled = !listening;
  fullscreenMicBtn.disabled = !recognition;
  fullscreenMicBtn.classList.toggle("listening", listening);
  fullscreenMicBtn.setAttribute("aria-pressed", String(listening));
  fullscreenMicBtn.querySelector("span").textContent = listening ? "Stop microphone" : "Turn on microphone";
};
const startListening = async () => {
  if (!recognition || isListening) return;
  recognition.lang = speechLang.value;
  const language = speechLang.value;
  if (checkedLocalLanguage !== language) {
    checkedLocalLanguage = language;
    localSpeechAvailable = false;
    if (typeof SpeechRecognition.available === "function" && "processLocally" in recognition) {
      try {
        setStatus("Checking on-device speech recognition…");
        let localLanguage = language;
        let availability = await SpeechRecognition.available({ langs: [localLanguage], processLocally: true, quality: "command" });
        if (availability === "unavailable" && language === "en-IN") {
          localLanguage = "en-US";
          availability = await SpeechRecognition.available({ langs: [localLanguage], processLocally: true, quality: "command" });
          if (availability !== "unavailable") {
            speechLang.value = localLanguage;
            setStatus("Using on-device English (US); English (India) is not available in this browser.");
          }
        }
        if (availability === "downloadable" || availability === "downloading") {
          setStatus("Preparing on-device speech recognition…");
          localSpeechAvailable = await SpeechRecognition.install({ langs: [localLanguage], quality: "command" });
        } else {
          localSpeechAvailable = availability === "available";
        }
        if (localSpeechAvailable) recognition.lang = localLanguage;
      } catch (error) {
        console.info("On-device speech recognition is unavailable; trying the browser speech service.", error);
      }
    }
  }
  try {
    if ("processLocally" in recognition) recognition.processLocally = localSpeechAvailable;
    recognition.start();
  } catch (error) {
    setStatus(`Could not start speech recognition: ${error.message}`, "err");
  }
};
const stopListening = () => {
  if (recognition && isListening) recognition.stop();
};

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => {
    updateMicrophoneControls(true);
    setStatus("Listening… speak a short phrase.");
  };
  recognition.onresult = event => {
    let finalTranscript = "";
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const part = event.results[i][0]?.transcript ?? "";
      event.results[i].isFinal ? finalTranscript += part : interimTranscript += part;
    }
    if (interimTranscript) setStatus(`Hearing: “${interimTranscript.trim()}”`);
    if (finalTranscript.trim()) {
      el.textInput.value = finalTranscript.trim();
      translate();
    }
  };
  recognition.onerror = event => {
    const messages = {
      "not-allowed": "Microphone access was blocked. Allow microphone access and try again.",
      "no-speech": "No speech was detected. Try speaking a little closer to the microphone.",
      "network": "The browser speech service could not connect. Check your internet connection, try a browser with on-device speech support, or type a phrase instead.",
      "language-not-supported": "On-device speech recognition does not support this language in your browser. Choose another speech language or type a phrase."
    };
    setStatus(messages[event.error] ?? `Speech recognition error: ${event.error}.`, "err");
  };
  recognition.onend = () => {
    updateMicrophoneControls(false);
  };
  listenBtn.addEventListener("click", startListening);
  stopListenBtn.addEventListener("click", stopListening);
  fullscreenMicBtn.addEventListener("click", () => isListening ? stopListening() : startListening());
} else {
  listenBtn.disabled = true;
  stopListenBtn.disabled = true;
  fullscreenMicBtn.disabled = true;
  fullscreenMicBtn.title = "Speech recognition is not supported in this browser.";
}
