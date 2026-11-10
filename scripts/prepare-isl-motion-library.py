"""Extract a small, attributed avatar-motion library from licensed ISL clips.

Input is the nested ``Amrita SLR Dataset.zip`` from the CC BY 4.0 Amrita SLR
dataset. Only selected 0403 signer samples are read; source videos are not
copied into the website. Existing SignSense entries are preserved.

Requires: opencv-python, mediapipe, numpy
"""
from __future__ import annotations

import argparse
import json
import re
import tempfile
import time
import zipfile
from pathlib import Path, PurePosixPath

import cv2
import mediapipe as mp


FORMAT = 3
FACE_KEYS = [
    "jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthPucker",
    "mouthFunnel", "mouthStretchLeft", "mouthStretchRight", "browInnerUp",
    "browDownLeft", "browDownRight", "eyeBlinkLeft", "eyeBlinkRight",
    "eyeWideLeft", "eyeWideRight", "cheekPuff",
]
LABELS = {
    "1.bird": "bird", "2.black": "black", "3.cat": "cat", "4.cow": "cow",
    "5.dog": "dog", "6.fish": "fish", "7.goodmorning": "good morning",
    "8.grey": "grey", "9.hello": "hello", "10.youareperfect": "you are perfect",
    "11.monsoon": "monsoon", "12.afternoon": "afternoon", "13.angry": "angry",
    "14.bad": "bad", "15.boy": "boy", "16.eat": "eat", "17.friend": "friend",
    "18.drinking": "drink", "19.girl": "girl", "20.brother": "brother",
    "21.good": "good", "22.father": "father", "23.evening": "evening",
    "24.help": "help", "25.mother": "mother", "26.NAME": "name",
    "27.Night": "night", "28.Music": "music", "29.nose": "nose",
    "30.sleep": "sleep", "31.sit": "sit", "32.sorry": "sorry",
    "33.stand": "stand", "34.stop": "stop", "35.student": "student",
    "36.study": "study", "37.teacher": "teacher", "38.thankyou": "thank you",
    "39.today": "today", "40.tommorow": "tomorrow", "41.welcome": "welcome",
    "42.work": "work", "43.yesterday": "yesterday", "44.teeth": "teeth",
    "45.hand": "hand", "46.write": "write", "47.umberlla": "umbrella",
    "48.ring": "ring", "50.power": "power",
}
SIDES = {
    "left": {"shoulder": 12, "elbow": 14, "wrist": 16, "sign": 1},
    "right": {"shoulder": 11, "elbow": 13, "wrist": 15, "sign": -1},
}


def rounded(values):
    return [round(float(value), 4) for value in values]


def mirror(point):
    return rounded((-point.x, -point.y, -point.z))


def distance2(a, b):
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2


def extract_candidate(video_bytes: bytes, pose_model, hands_model):
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(video_bytes)
        video_path = Path(tmp.name)
    frames = []
    pose_hits = hand_hits = sampled = 0
    try:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            return None, 0.0
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        stride = max(1, round(fps / 25.0))
        frame_no = 0
        while True:
            ok, image = cap.read()
            if not ok:
                break
            if frame_no % stride:
                frame_no += 1
                continue
            timestamp = round(frame_no * 1000 / fps)
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pose = pose_model.process(rgb)
            hands = hands_model.process(rgb)
            sampled += 1
            if not pose.pose_world_landmarks or not pose.pose_landmarks:
                frame_no += 1
                continue

            pose_hits += 1
            normalized = pose.pose_landmarks.landmark
            world = pose.pose_world_landmarks.landmark
            body = {}
            for side, config in SIDES.items():
                shoulder, elbow, wrist = config["shoulder"], config["elbow"], config["wrist"]
                ok_arm = min(normalized[elbow].visibility, normalized[wrist].visibility) > 0.35
                s = mirror(world[shoulder])
                e = mirror(world[elbow]) if ok_arm else rounded((s[0] + config["sign"] * 0.04, s[1] - 0.27, s[2] - 0.01))
                w = mirror(world[wrist]) if ok_arm else rounded((e[0] + config["sign"] * 0.01, e[1] - 0.25, e[2] + 0.04))
                body[{"left": "ls", "right": "rs"}[side]] = s
                body[{"left": "le", "right": "re"}[side]] = e
                body[{"left": "lw", "right": "rw"}[side]] = w
            body["lh"] = mirror(world[24])
            body["rh"] = mirror(world[23])

            norm_hands = hands.multi_hand_landmarks or []
            world_hands = hands.multi_hand_world_landmarks or []
            user_right = user_left = -1
            if norm_hands:
                ranked = sorted(
                    ((i, distance2(hand.landmark[0], normalized[16]) - distance2(hand.landmark[0], normalized[15]))
                     for i, hand in enumerate(norm_hands)),
                    key=lambda row: row[1],
                )
                if len(ranked) > 1:
                    user_right, user_left = ranked[0][0], ranked[1][0]
                elif ranked[0][1] < 0:
                    user_right = ranked[0][0]
                else:
                    user_left = ranked[0][0]
            left = [mirror(p) for p in world_hands[user_right].landmark] if user_right >= 0 and user_right < len(world_hands) else None
            right = [mirror(p) for p in world_hands[user_left].landmark] if user_left >= 0 and user_left < len(world_hands) else None
            if left or right:
                hand_hits += 1
            frames.append({
                "t": timestamp,
                "body": body,
                "left": left,
                "right": right,
                "head": [0, 0, 0, 1],
                "face": {key: 0 for key in FACE_KEYS},
            })
            frame_no += 1
        cap.release()
    finally:
        video_path.unlink(missing_ok=True)

    pose_coverage = pose_hits / max(sampled, 1)
    hand_coverage = hand_hits / max(sampled, 1)
    score = 0.65 * pose_coverage + 0.35 * hand_coverage
    if len(frames) < 5 or pose_coverage < 0.6 or hand_coverage < 0.15:
        return None, score
    first_t = frames[0]["t"]
    for frame in frames:
        frame["t"] -= first_t
    return frames, score


def natural_key(value):
    return [(1, int(part)) if part.isdigit() else (0, part.lower()) for part in re.split(r"(\d+)", value)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source_zip", type=Path, help="Path to the nested Amrita SLR Dataset.zip")
    parser.add_argument("--output", type=Path, default=Path("public/voice-demo/sign-library.json"))
    parser.add_argument("--only", nargs="*", help="Process only these output labels")
    parser.add_argument("--samples-manifest", type=Path, help="Use exact source clip paths from a JSON label-to-path map")
    args = parser.parse_args()
    if not args.source_zip.exists():
        raise SystemExit(f"Dataset archive not found: {args.source_zip}")

    output = args.output.resolve()
    existing = {}
    if output.exists():
        payload = json.loads(output.read_text(encoding="utf-8"))
        if payload.get("version") == FORMAT:
            existing = {item["word"]: item for item in payload.get("signs", []) if item.get("word")}
    sample_manifest = json.loads(args.samples_manifest.read_text(encoding="utf-8")) if args.samples_manifest else {}

    new_signs = {}
    failures = []
    started = time.time()
    with zipfile.ZipFile(args.source_zip) as archive, \
         mp.solutions.pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True,
                                min_detection_confidence=0.55, min_tracking_confidence=0.55) as pose_model, \
         mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=2, model_complexity=1,
                                  min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands_model:
        names = set(archive.namelist())
        for folder, label in LABELS.items():
            if args.only and label not in args.only:
                continue
            prefix = f"sign project/{folder}/"
            candidates = [
                name for name in names
                if name.startswith(prefix) and Path(name).suffix.lower() in {".mp4", ".mov", ".avi"}
            ]
            preferred = sorted([name for name in candidates if PurePosixPath(name).name.lower().startswith("0403")], key=natural_key)
            alternatives = sorted([name for name in candidates if name not in preferred], key=natural_key)
            if label in sample_manifest:
                chosen = sample_manifest[label]
                if chosen not in names:
                    raise SystemExit(f"Manifest path for {label!r} is not in the dataset: {chosen}")
                candidates = [chosen]
            else:
                candidates = preferred[:3] if preferred else alternatives[:3]
            best = None
            best_score = -1.0
            for name in candidates:
                try:
                    frames, score = extract_candidate(archive.read(name), pose_model, hands_model)
                except Exception as error:
                    print(f"SKIP {label}: {PurePosixPath(name).name}: {error}")
                    continue
                if frames is not None and score > best_score:
                    best, best_score = (name, frames), score
            if best is None:
                for name in alternatives[:15]:
                    try:
                        frames, score = extract_candidate(archive.read(name), pose_model, hands_model)
                    except Exception as error:
                        print(f"SKIP {label}: {PurePosixPath(name).name}: {error}")
                        continue
                    if frames is not None and score > best_score:
                        best, best_score = (name, frames), score
            if not best:
                failures.append(label)
                print(f"MISS {label}: no clip passed tracking quality checks")
                continue
            source, frames = best
            duration = frames[-1]["t"]
            new_signs[label] = {
                "v": FORMAT,
                "word": label,
                "frames": frames,
                "duration": duration,
                "created": 0,
                "video": None,
                "source": "Amrita SLR dataset, CC BY 4.0",
                "sourceVideo": source,
            }
            print(f"OK {label}: {len(frames)} frames, {duration} ms, track score {best_score:.2f} ({PurePosixPath(source).name})")

    existing.update(new_signs)
    result = {
        "version": FORMAT,
        "sources": [
            {
                "name": "Amrita SLR- Real Time ISL Dataset",
                "doi": "10.17632/dtg9s785v8.1",
                "authors": "Renjith Sasidharan, Manazhy Rashmi, Krishnaraj S Nair, Heera Krishna N S, Karunya Muraleedharan, Nachiketh Gupta Bellamkonda, Suraneni Manideep Rao, Sohit Avvari, Poojari Bhanu Prakash, and Davala Tejeswara Rao",
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "changes": "Selected signer videos were converted to pose and hand landmark motion tracks, smoothed by MediaPipe, and retargeted to the SignSense VRM avatar. Source videos are not redistributed here.",
            }
        ],
        "signs": sorted(existing.values(), key=lambda item: item["word"]),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(new_signs)} new motions + preserved {len(existing) - len(new_signs)} existing motions to {output}")
    print(f"Elapsed: {time.time() - started:.1f}s")
    if failures:
        print("Review missing labels:", ", ".join(failures))


if __name__ == "__main__":
    main()
