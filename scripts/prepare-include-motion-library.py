"""Add INCLUDE (AI4Bharat) ISL word signs to the avatar motion library.

INCLUDE: A Large Scale Dataset for Indian Sign Language Recognition (Sridhar, Ganesan,
Kumar, Khapra; ACM Multimedia 2020; DOI 10.1145/3394171.3413528). 263 word signs,
4,287 videos, CC BY 4.0: https://zenodo.org/records/4010759

For every label the script tracks a few recordings with MediaPipe pose + hands (the same
extractor as prepare-isl-motion-library.py), keeps the clip with the best tracking
coverage, and writes the split library the demo loads lazily:

    public/voice-demo/sign-index.json      word list, durations, attribution
    public/voice-demo/signs/<slug>.json    motion frames for one sign

Existing signs (the Amrita + SignSense base library) are preserved unless --replace is
given. Source videos are never copied into the website.

Usage (Python 3.12 with mediapipe==0.10.14, opencv-python, numpy):
    python scripts/prepare-include-motion-library.py D:/datasets/INCLUDE --workers 6
"""
from __future__ import annotations

import argparse
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
FORMAT = 3

INCLUDE_SOURCE = {
    "name": "INCLUDE: A Large Scale Dataset for Indian Sign Language Recognition",
    "authors": "Advaith Sridhar, Rohith Gandhi Ganesan, Pratyush Kumar, and Mitesh Khapra (AI4Bharat)",
    "doi": "10.1145/3394171.3413528",
    "url": "https://zenodo.org/records/4010759",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "changes": "Selected recordings were converted to pose and hand landmark motion tracks with MediaPipe and retargeted to the SignSense VRM avatar. Source videos are not redistributed here.",
}
# INCLUDE label -> library word. "I" is stored as "me" (same ISL sign, and it must not collide with the letter I).
LABEL_FIX = {"i": "me", "you (plural)": "you all", "you(plural)": "you all", "alright": "alright"}


# Topics for the base (Amrita + SignSense) signs, using INCLUDE's category names where they fit.
BASE_TOPICS = {
    "Greetings": ["hello", "good morning", "welcome", "thank you", "sorry", "you are perfect"],
    "Days and time": ["afternoon", "evening", "night", "today", "tomorrow", "yesterday"],
    "Adjectives": ["angry", "bad", "beautiful", "blind", "deaf", "good", "happy", "loud", "quiet", "sad", "ugly"],
    "Animals": ["bird", "cat", "cow", "dog", "fish"],
    "Colours": ["black", "grey"],
    "People": ["boy", "brother", "father", "friend", "girl", "mother", "student", "teacher"],
    "Actions": ["drink", "eat", "help", "sit", "sleep", "stand", "stop", "study", "work", "write"],
    "Body": ["hand", "nose", "teeth"],
    "Seasons": ["monsoon"],
    "Everyday": ["music", "name", "power", "ring", "umbrella"],
}
BASE_TOPIC = {word: topic for topic, words in BASE_TOPICS.items() for word in words}


def topic_of(member: str) -> str:
    """INCLUDE groups recordings by category folder: "Days_and_Time/3. Today/x.MOV" -> "Days and time"."""
    return PurePosixPath(member).parts[0].replace("_", " ").capitalize()


def load_extractor():
    spec = importlib.util.spec_from_file_location("isl_prep", HERE / "prepare-isl-motion-library.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def label_of(member: str) -> str | None:
    parts = [p for p in PurePosixPath(member).parts[:-1] if p.lower() != "extra"]  # "5. Beautiful/Extra/x.MOV"
    if not parts or PurePosixPath(member).suffix.lower() not in VIDEO_EXT:
        return None
    raw = re.sub(r"^\s*\d+\s*\.\s*", "", parts[-1]).strip().lower()
    raw = re.sub(r"\s+", " ", raw)
    return LABEL_FIX.get(raw, raw) or None


def slug(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-") or "sign"


def compact(frames):
    """Round to millimetres and drop face/head blocks that MediaPipe pose+hands never fill."""
    r3 = lambda v: [round(x, 3) for x in v]
    out = []
    for f in frames:
        out.append({
            "t": f["t"],
            "body": {k: r3(v) for k, v in f["body"].items()},
            "left": [r3(p) for p in f["left"]] if f["left"] else None,
            "right": [r3(p) for p in f["right"]] if f["right"] else None,
        })
    return out


def process_label(task):
    """Worker: score candidate recordings for one label and return the best track."""
    label, members = task
    import mediapipe as mp
    extractor = load_extractor()
    best = (None, None, -1.0)
    for zip_path, member in members:
        try:
            with zipfile.ZipFile(zip_path) as archive:
                data = archive.read(member)
            # Fresh trackers per clip so tracking state never leaks between recordings.
            with mp.solutions.pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True,
                                        min_detection_confidence=0.55, min_tracking_confidence=0.55) as pose, \
                 mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=2, model_complexity=1,
                                          min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
                frames, score = extractor.extract_candidate(data, pose, hands)
        except Exception as error:  # noqa: BLE001 - report and continue with the next clip
            print(f"SKIP {label}: {member}: {error}", flush=True)
            continue
        if frames is not None and score > best[2]:
            best = (member, frames, score)
    return label, best


def pick_candidates(members, count):
    """Spread picks across the sorted list (recordings are grouped by signer/session)."""
    members = sorted(members, key=lambda m: m[1])
    if len(members) <= count:
        return members
    step = len(members) / count
    return [members[int(i * step)] for i in range(count)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset_dir", type=Path, help="Folder containing the INCLUDE *_NofM.zip archives")
    parser.add_argument("--base", type=Path, default=ROOT / "scripts/data/base-sign-library.json",
                        help="Existing single-file library to merge (Amrita + SignSense signs)")
    parser.add_argument("--out", type=Path, default=ROOT / "public/voice-demo")
    parser.add_argument("--candidates", type=int, default=4, help="Recordings scored per label")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--only", nargs="*", help="Process only these labels")
    parser.add_argument("--replace", action="store_true", help="Let INCLUDE motions replace existing signs with the same word")
    args = parser.parse_args()

    by_label: dict[str, list[tuple[str, str]]] = {}
    zips = sorted(args.dataset_dir.glob("*.zip"))
    if not zips:
        raise SystemExit(f"No .zip archives in {args.dataset_dir}")
    for zip_path in zips:
        try:
            with zipfile.ZipFile(zip_path) as archive:
                for member in archive.namelist():
                    label = label_of(member)
                    if label:
                        by_label.setdefault(label, []).append((str(zip_path), member))
        except zipfile.BadZipFile:
            print(f"WARN skipping unreadable archive {zip_path.name} (incomplete download?)")
    print(f"Found {len(by_label)} labels in {len(zips)} archives")

    index_path = args.out / "sign-index.json"
    signs_dir = args.out / "signs"
    signs_dir.mkdir(parents=True, exist_ok=True)
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {"version": FORMAT, "sources": [], "signs": []}
    entries = {e["word"]: e for e in index["signs"]}

    # Seed from the base single-file library the first time (Amrita + SignSense signs).
    if args.base.exists():
        base = json.loads(args.base.read_text(encoding="utf-8"))
        for source in base.get("sources", []):
            if source["name"] not in {s["name"] for s in index["sources"]}:
                index["sources"].append(source)
        for sign in base.get("signs", []):
            if sign["word"] in entries:
                continue
            file = f"{slug(sign['word'])}.json"
            (signs_dir / file).write_text(json.dumps({"word": sign["word"], "frames": compact(sign["frames"])}, separators=(",", ":")), encoding="utf-8")
            entries[sign["word"]] = {"word": sign["word"], "file": file, "duration": sign["frames"][-1]["t"],
                                     "frames": len(sign["frames"]), "source": sign.get("source", "SignSense"),
                                     "topic": BASE_TOPIC.get(sign["word"], "Everyday")}
    for entry in entries.values():
        entry.setdefault("topic", BASE_TOPIC.get(entry["word"], "Everyday"))
    if INCLUDE_SOURCE["name"] not in {s["name"] for s in index["sources"]}:
        index["sources"].append(INCLUDE_SOURCE)

    todo = [
        (label, pick_candidates(members, args.candidates))
        for label, members in sorted(by_label.items())
        if (not args.only or label in args.only) and (args.replace or label not in entries)
    ]
    print(f"Tracking {len(todo)} labels with {args.workers} workers...", flush=True)
    started = time.time()
    failures = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(process_label, task) for task in todo]
        for done, future in enumerate(as_completed(futures), 1):
            label, (member, frames, score) = future.result()
            if frames is None:
                failures.append(label)
                print(f"[{done}/{len(todo)}] MISS {label}: no clip passed tracking checks", flush=True)
                continue
            file = f"{slug(label)}.json"
            (signs_dir / file).write_text(json.dumps({"word": label, "frames": compact(frames)}, separators=(",", ":")), encoding="utf-8")
            entries[label] = {"word": label, "file": file, "duration": frames[-1]["t"], "frames": len(frames),
                              "source": "INCLUDE (AI4Bharat), CC BY 4.0", "topic": topic_of(member), "sourceVideo": PurePosixPath(member).as_posix()}
            print(f"[{done}/{len(todo)}] OK {label}: {len(frames)} frames, score {score:.2f}", flush=True)
            # Write the index as we go so a long run can be interrupted and resumed.
            index["signs"] = sorted(entries.values(), key=lambda e: e["word"])
            index_path.write_text(json.dumps(index, indent=1), encoding="utf-8")

    index["signs"] = sorted(entries.values(), key=lambda e: e["word"])
    index_path.write_text(json.dumps(index, indent=1), encoding="utf-8")
    print(f"Index now has {len(entries)} signs. Elapsed {time.time() - started:.0f}s")
    if failures:
        print("Labels without a usable recording:", ", ".join(sorted(failures)))


if __name__ == "__main__":
    main()
