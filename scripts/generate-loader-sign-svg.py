"""Generate a lightweight animated SVG from the site's recorded ISL hello motion."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/voice-demo/signs/hello.json"
OUTPUT = ROOT / "public/isl-loader-hello.svg"
WIDTH, HEIGHT = 360, 280
ARM_SCALE_X, ARM_SCALE_Y = 220, 220
HAND_SCALE = 620
LINKS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20),
]


def arm_point(point):
    return (180 + point[0] * ARM_SCALE_X, 226 - point[1] * ARM_SCALE_Y)


def svg_points(points):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def key_times(frames):
    start, end = frames[0]["t"], frames[-1]["t"]
    span = max(1, end - start)
    return ";".join(f"{(f['t'] - start) / span:.4f}" for f in frames)


def animate_points(frames, selector, fallback):
    values = []
    for frame in frames:
        values.append(svg_points(selector(frame)))
    return f'<animate attributeName="points" dur="{frames[-1]["t"] / 1000:.3f}s" values="{";".join(values)}" keyTimes="{key_times(frames)}" calcMode="linear" repeatCount="indefinite" />'


def main():
    sign = json.loads(SOURCE.read_text(encoding="utf-8"))
    frames = sign["frames"]
    active = next((frame.get("left") for frame in frames if frame.get("left")), None)
    side = "left" if active else "right"
    if not active:
        raise SystemExit("The hello sign track has no hand landmarks to animate.")
    active_frames = [frame for frame in frames if frame["t"] <= 1600]
    previous_hand = active
    for frame in active_frames:
        if frame.get(side):
            previous_hand = frame[side]
        frame["_loader_hand"] = previous_hand
        frame["_loader_anchor"] = frame["body"]["lw" if side == "left" else "rw"]

    arm_frames = active_frames
    arm_name = "ls" if side == "left" else "rs"
    elbow_name = "le" if side == "left" else "re"
    wrist_name = "lw" if side == "left" else "rw"
    opposing = "right" if side == "left" else "left"

    pieces = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 280" role="img" aria-labelledby="title desc">',
        '<title id="title">Indian Sign Language hello motion</title>',
        '<desc id="desc">A line-art avatar repeats the recorded Indian Sign Language greeting motion used in the SignSense demo.</desc>',
        '<metadata>Motion keyframes derived from the hello sample in Amrita SLR- Real Time ISL Dataset, DOI 10.17632/dtg9s785v8.1, CC BY 4.0. Converted to an animated line-art SVG for the SignSense loading screen.</metadata>',
        '<defs><linearGradient id="torso" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eeeefe"/><stop offset="1" stop-color="#d9d8ff"/></linearGradient><linearGradient id="signing-arm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2f2fe4"/><stop offset="1" stop-color="#7774ff"/></linearGradient></defs>',
        '<style>.motion-track{stroke:url(#signing-arm);stroke-width:17;fill:none;stroke-linecap:round;stroke-linejoin:round}.hand-track{stroke:#3432d6;stroke-width:8;fill:none;stroke-linecap:round;stroke-linejoin:round}.avatar-guide{stroke:#c1c0ff;stroke-width:12;fill:none;stroke-linecap:round;stroke-linejoin:round}.hand-palm{fill:#8582ff;fill-opacity:.2;stroke:#514cff;stroke-width:5}.face{fill:#2f2fe4}.motion-track animate,.hand-track animate,.hand-track animateTransform,.hand-track animate{display:inline}@media(prefers-reduced-motion:reduce){.motion-track animate,.hand-track animate,.hand-track animateTransform{display:none}}</style>',
        '<rect x="9" y="9" width="342" height="262" rx="30" fill="#f4f3ff" stroke="#e4e3ff" stroke-width="1.5"/>',
        '<circle cx="180" cy="52" r="23" fill="#fff" stroke="#2f2fe4" stroke-width="3.5"/>',
        '<circle cx="172" cy="50" r="2" class="face"/><circle cx="188" cy="50" r="2" class="face"/><path d="M173 59q7 6 14 0" fill="none" stroke="#2f2fe4" stroke-width="2.2" stroke-linecap="round"/>',
        '<path d="M170 75v15m20-15v15" stroke="#2f2fe4" stroke-width="6" stroke-linecap="round"/>',
        '<path d="M180 88c-21 0-35 7-42 19l-7 72c16 13 32 20 49 20s33-7 49-20l-7-72c-7-12-21-19-42-19Z" fill="url(#torso)" stroke="#8c8cff" stroke-width="3"/>',
        '<path d="M180 97v83" stroke="#fff" stroke-width="3" opacity=".9" stroke-linecap="round"/>',
    ]

    # Keep the non-signing arm quiet; animate the source signer's active arm.
    opposing_s = "rs" if opposing == "right" else "ls"
    opposing_e = "re" if opposing == "right" else "le"
    opposing_w = "rw" if opposing == "right" else "lw"
    steady_body = frames[0]["body"]
    pieces.append(f'<polyline class="avatar-guide" points="{svg_points([arm_point(steady_body[opposing_s]), arm_point(steady_body[opposing_e]), arm_point(steady_body[opposing_w])])}"/>')

    first_body = arm_frames[0]["body"]
    arm_base = [arm_point(first_body[arm_name]), arm_point(first_body[elbow_name]), arm_point(first_body[wrist_name])]
    arm_values = []
    for frame in arm_frames:
        body = frame["body"]
        arm_values.append(svg_points([arm_point(body[arm_name]), arm_point(body[elbow_name]), arm_point(body[wrist_name])]))
    pieces.append(f'<polyline class="motion-track" points="{svg_points(arm_base)}"><animate attributeName="points" dur="{arm_frames[-1]["t"] / 1000:.3f}s" values="{";".join(arm_values)}" keyTimes="{key_times(arm_frames)}" calcMode="linear" repeatCount="indefinite"/></polyline>')

    transforms = []
    for frame in arm_frames:
        x, y = arm_point(frame["_loader_anchor"])
        transforms.append((x, y))
    transform_values = ";".join(f"{x:.1f} {y:.1f}" for x, y in transforms)
    hand = active
    pieces.append(f'<g class="hand-track" transform="translate({transforms[0][0]:.1f} {transforms[0][1]:.1f})"><animateTransform attributeName="transform" type="translate" dur="{arm_frames[-1]["t"] / 1000:.3f}s" values="{transform_values}" keyTimes="{key_times(arm_frames)}" calcMode="linear" repeatCount="indefinite"/><polygon class="hand-palm" points="{svg_points([((hand[point][0]-hand[0][0])*HAND_SCALE,-(hand[point][1]-hand[0][1])*HAND_SCALE) for point in (0,5,9,13,17)])}"><animate attributeName="points" dur="{arm_frames[-1]["t"] / 1000:.3f}s" values="{";".join(svg_points([((frame["_loader_hand"][point][0]-frame["_loader_hand"][0][0])*HAND_SCALE,-(frame["_loader_hand"][point][1]-frame["_loader_hand"][0][1])*HAND_SCALE) for point in (0,5,9,13,17)]) for frame in arm_frames)}" keyTimes="{key_times(arm_frames)}" calcMode="linear" repeatCount="indefinite"/></polygon><circle cx="0" cy="0" r="5.5" fill="#2f2fe4"/>')
    for a, b in LINKS:
        pts = []
        for index in (a, b):
            point = hand[index]
            pts.append(((point[0] - hand[0][0]) * HAND_SCALE, -(point[1] - hand[0][1]) * HAND_SCALE))
        point_values = []
        for frame in arm_frames:
            landmarks = frame["_loader_hand"]
            segment = []
            for index in (a, b):
                point = landmarks[index]
                segment.append(((point[0] - landmarks[0][0]) * HAND_SCALE, -(point[1] - landmarks[0][1]) * HAND_SCALE))
            point_values.append(svg_points(segment))
        pieces.append(f'<polyline points="{svg_points(pts)}"><animate attributeName="points" dur="{arm_frames[-1]["t"] / 1000:.3f}s" values="{";".join(point_values)}" keyTimes="{key_times(arm_frames)}" calcMode="linear" repeatCount="indefinite"/></polyline>')
    pieces.append('</g>')
    pieces.append('<circle class="joint" cx="180" cy="43" r="2.5" opacity="0"/>')
    pieces.append('</svg>')
    OUTPUT.write_text("\n".join(pieces), encoding="utf-8")
    print(f"Wrote {OUTPUT} from {len(active_frames)} hello-sign motion frames.")


if __name__ == "__main__":
    main()
