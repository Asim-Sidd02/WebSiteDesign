"""Add whole signed SENTENCES to the avatar motion library.

Word-by-word signing can only approximate ISL grammar. These two CC BY 4.0 datasets contain
complete sentences signed by people, so when a user types one of them (or the same words with
different punctuation/casing), the avatar plays the real signed sentence as one motion:

  ISL-CSLTR  Elakkiya R. et al., "ISL-CSLTR: Indian Sign Language Dataset for Continuous Sign
             Language Translation and Recognition", Mendeley Data v1, 2021.
             DOI 10.17632/kcmpdxky7p.1  -- 100 sentences, 700 videos, 7 signers, CC BY 4.0
  ISLVT      "Indian Sign Language Video and Text dataset for sentences (ISLVT)", Mendeley Data v1.
             DOI 10.17632/98mzk82wbb.1  -- 76 sentences, front + side views, CC BY 4.0

The motion extraction is the same MediaPipe pose + hands tracking used for INCLUDE words
(prepare-isl-motion-library.py). For each sentence a few recordings are scored and the one
with the best tracking coverage is kept. Source videos are never copied into the website.

Sentence labels come from, in order:
  1. --labels CSV with columns  file,sentence  (file = video file name or path suffix), or
  2. the nearest folder name that reads like a sentence (generic folders such as
     "Signer 3", "Videos", "Sentence Level" or "Front" are skipped).
Always start with --dry-run and check the sentence list before tracking.

Usage (Python 3.12 with mediapipe==0.10.14, opencv-python, numpy):
    python scripts/prepare-sentence-motion-library.py D:/datasets/ISL-CSLTR --source isl-csltr --dry-run
    python scripts/prepare-sentence-motion-library.py D:/datasets/ISL-CSLTR --source isl-csltr --workers 6
    python scripts/prepare-sentence-motion-library.py D:/datasets/ISLVT --source islvt --labels islvt.csv --prefer front
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import json
import re
import time
import zipfile
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path, PurePosixPath

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

SOURCES = {
    "isl-csltr": {
        "name": "ISL-CSLTR: Indian Sign Language Dataset for Continuous Sign Language Translation and Recognition",
        "authors": "Elakkiya R, Natarajan B, et al. (SASTRA Deemed University)",
        "doi": "10.17632/kcmpdxky7p.1",
        "url": "https://data.mendeley.com/datasets/kcmpdxky7p/1",
        "license": "CC BY 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "changes": "Selected sentence recordings were converted to pose and hand landmark motion tracks with MediaPipe and retargeted to the SignSense VRM avatar. Source videos are not redistributed here.",
        "short": "ISL-CSLTR, CC BY 4.0",
    },
    "islvt": {
        "name": "Indian Sign Language Video and Text dataset for sentences (ISLVT)",
        "authors": "ISLVT dataset authors (Mendeley Data)",
        "doi": "10.17632/98mzk82wbb.1",
        "url": "https://data.mendeley.com/datasets/98mzk82wbb/1",
        "license": "CC BY 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "changes": "Selected sentence recordings were converted to pose and hand landmark motion tracks with MediaPipe and retargeted to the SignSense VRM avatar. Source videos are not redistributed here.",
        "short": "ISLVT, CC BY 4.0",
    },
}

# Folder names that never hold the sentence text itself.
GENERIC = re.compile(
    r"^(signer|person|user|subject|participant|p)\s*[-_]?\s*\d+$|^\d+$|^(videos?|sentences?|sentence[\s_-]*level|"
    r"word[\s_-]*level|data|dataset|isl[\s_-]*csltr.*|islvt.*|front|side|left|right|view.*|cam.*|raw|extra)$",
    re.I,
)

# Must mirror CONTRACTIONS / sentenceKey() in public/voice-demo/isl-planner.js.
CONTRACTIONS = [
    (r"\bcan't\b", "can not"), (r"\bwon't\b", "will not"), (r"\bshan't\b", "shall not"), (r"n't\b", " not"),
    (r"'re\b", " are"), (r"'m\b", " am"), (r"'ll\b", " will"), (r"'ve\b", " have"), (r"'d\b", " would"),
    (r"\b(it|that|what|who|where|when|why|how|he|she|there|here)'s\b", r"\1 is"), (r"\blet's\b", "let us"),
    (r"'s\b", ""), (r"'", ""),
]


def sentence_key(text: str) -> str:
    s = text.lower().replace("\u2018", "'").replace("\u2019", "'").replace("\u02bc", "'")
    for pattern, repl in CONTRACTIONS:
        s = re.sub(pattern, repl, s)
    s = re.sub(r"[^\w\s]|_", " ", s)
    return " ".join(s.split())


def load_module(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sentence_from_path(member: str) -> str | None:
    """Nearest parent folder (or the file stem) that reads like a sentence."""
    path = PurePosixPath(member)
    for part in [*reversed(path.parts[:-1]), path.stem]:
        name = re.sub(r"^\s*\d+\s*[.)_-]\s*", "", part).replace("_", " ").strip()
        if not name or GENERIC.match(name):
            continue
        if len(sentence_key(name).split()) >= 2:
            return name
    return None


def read_labels(csv_path: Path) -> dict[str, str]:
    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if not rows or not {"file", "sentence"} <= set(rows[0]):
        raise SystemExit(f"{csv_path} needs a header row with columns: file,sentence")
    return {r["file"].strip().replace("\\", "/").lower(): r["sentence"].strip() for r in rows if r["file"].strip() and r["sentence"].strip()}


def label_for(member: str, labels: dict[str, str] | None) -> str | None:
    if labels is not None:
        m = member.replace("\\", "/").lower()
        for key, sentence in labels.items():
            if m == key or m.endswith("/" + key) or PurePosixPath(m).name == key:
                return sentence
        return None
    return sentence_from_path(member)


def list_videos(root: Path):
    """Yield (container, member) pairs from a folder of videos and/or zip archives."""
    if root.is_file() and root.suffix.lower() == ".zip":
        archives, files = [root], []
    else:
        archives = sorted(root.rglob("*.zip"))
        files = [p for p in sorted(root.rglob("*")) if p.suffix.lower() in VIDEO_EXT]
    for p in files:
        yield None, str(p.relative_to(root).as_posix()), p
    for z in archives:
        try:
            with zipfile.ZipFile(z) as archive:
                for member in archive.namelist():
                    if PurePosixPath(member).suffix.lower() in VIDEO_EXT:
                        yield str(z), member, None
        except zipfile.BadZipFile:
            print(f"WARN skipping unreadable archive {z.name} (incomplete download?)")


def read_bytes(container, member, file_path) -> bytes:
    if file_path is not None:
        return Path(file_path).read_bytes()
    with zipfile.ZipFile(container) as archive:
        return archive.read(member)


def process_sentence(task):
    key, candidates = task
    import mediapipe as mp
    extractor = load_module("isl_prep", "prepare-isl-motion-library.py")
    best = (None, None, -1.0)
    for container, member, file_path in candidates:
        try:
            data = read_bytes(container, member, file_path)
            with mp.solutions.pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True,
                                        min_detection_confidence=0.55, min_tracking_confidence=0.55) as pose, \
                 mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=2, model_complexity=1,
                                          min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
                frames, score = extractor.extract_candidate(data, pose, hands)
        except Exception as error:  # noqa: BLE001 - report and try the next recording
            print(f"SKIP {key!r}: {member}: {error}", flush=True)
            continue
        if frames is not None and score > best[2]:
            best = (member, frames, score)
    return key, best


def file_slug(key: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", key).strip("-")[:48].rstrip("-")
    return f"s-{base}-{hashlib.sha1(key.encode()).hexdigest()[:6]}"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("dataset", type=Path, help="Dataset folder (videos and/or zip archives) or a single zip")
    parser.add_argument("--source", choices=sorted(SOURCES), required=True)
    parser.add_argument("--labels", type=Path, help="CSV with columns file,sentence (use when folders are not named by sentence)")
    parser.add_argument("--prefer", help="Only use recordings whose path contains this text, e.g. 'front' for ISLVT")
    parser.add_argument("--out", type=Path, default=ROOT / "public/voice-demo")
    parser.add_argument("--candidates", type=int, default=4, help="Recordings scored per sentence")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--replace", action="store_true", help="Re-track sentences already in the library")
    parser.add_argument("--dry-run", action="store_true", help="List the sentences found and exit")
    args = parser.parse_args()

    include = load_module("include_prep", "prepare-include-motion-library.py")
    source = SOURCES[args.source]
    labels = read_labels(args.labels) if args.labels else None

    groups: dict[str, dict] = {}
    unlabeled = 0
    for container, member, file_path in list_videos(args.dataset):
        if args.prefer and args.prefer.lower() not in member.lower():
            continue
        text = label_for(member, labels)
        key = sentence_key(text) if text else ""
        if len(key.split()) < 2:
            unlabeled += 1
            continue
        g = groups.setdefault(key, {"text": text, "items": []})
        g["items"].append((container, member, str(file_path) if file_path else None))

    print(f"Found {len(groups)} sentences ({sum(len(g['items']) for g in groups.values())} recordings); {unlabeled} videos had no sentence label")
    if args.dry_run or not groups:
        for key, g in sorted(groups.items()):
            print(f"  {len(g['items']):>3}x  {g['text']}")
        if unlabeled and not labels:
            print("Tip: if many videos are unlabeled, pass --labels file,sentence CSV.")
        return

    index_path = args.out / "sign-index.json"
    signs_dir = args.out / "signs"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    entries = {e["word"]: e for e in index["signs"]}
    if source["name"] not in {s["name"] for s in index["sources"]}:
        index["sources"].append({k: v for k, v in source.items() if k != "short"})

    todo = [(key, include.pick_candidates(g["items"], args.candidates))
            for key, g in sorted(groups.items()) if args.replace or key not in entries]
    print(f"Tracking {len(todo)} sentences with {args.workers} workers...", flush=True)
    started, failures = time.time(), []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(process_sentence, task) for task in todo]
        for done, future in enumerate(as_completed(futures), 1):
            key, (member, frames, score) = future.result()
            if frames is None:
                failures.append(groups[key]["text"])
                print(f"[{done}/{len(todo)}] MISS {key!r}", flush=True)
                continue
            file = f"{file_slug(key)}.json"
            (signs_dir / file).write_text(json.dumps({"word": key, "frames": include.compact(frames)}, separators=(",", ":")), encoding="utf-8")
            entries[key] = {"word": key, "label": groups[key]["text"], "kind": "sentence", "file": file,
                            "duration": frames[-1]["t"], "frames": len(frames), "source": source["short"],
                            "topic": "Sentences", "sourceVideo": PurePosixPath(member).as_posix()}
            print(f"[{done}/{len(todo)}] OK {key!r}: {len(frames)} frames, score {score:.2f}", flush=True)
            index["signs"] = sorted(entries.values(), key=lambda e: e["word"])
            index_path.write_text(json.dumps(index, indent=1), encoding="utf-8")

    index["signs"] = sorted(entries.values(), key=lambda e: e["word"])
    index_path.write_text(json.dumps(index, indent=1), encoding="utf-8")
    print(f"Index now has {len(entries)} entries. Elapsed {time.time() - started:.0f}s")
    if failures:
        print("Sentences without a usable recording:", "; ".join(sorted(failures)))


if __name__ == "__main__":
    main()
