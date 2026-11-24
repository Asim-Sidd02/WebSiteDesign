# Preparing the demo ISL motion library

The demo avatar plays motion tracks extracted from licensed ISL video datasets with MediaPipe pose and hand tracking. This is motion retargeting, not model training or sentence translation.

The website loads `public/voice-demo/sign-index.json` (word list, durations, attribution). It fetches each sign's frames from `public/voice-demo/signs/<word>.json` only when that sign is first played, so the vocabulary can grow without slowing the page down.

## Python environment

MediaPipe's legacy `solutions` API needs Python 3.12 or earlier. With [uv](https://docs.astral.sh/uv/):

```powershell
uv venv --python 3.12 .venv-mp
uv pip install --python .venv-mp\Scripts\python.exe mediapipe==0.10.14 opencv-python numpy
```

## Step 1: base library (Amrita SLR + SignSense clips)

`prepare-isl-motion-library.py` converts selected Amrita SLR videos and writes `scripts/data/base-sign-library.json`. The base library is already checked in, so you only need this step to regenerate it.

1. Download version 1 of the [Amrita SLR- Real Time ISL Dataset](https://data.mendeley.com/datasets/dtg9s785v8/1) and review its [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/).
2. Extract the downloaded archive. It contains a nested `Amrita SLR Dataset.zip`; pass that nested archive to the script:

   ```powershell
   .venv-mp\Scripts\python.exe scripts/prepare-isl-motion-library.py "C:\path\to\Amrita SLR Dataset.zip" --samples-manifest scripts/amrita-samples-v1.json
   ```

The script prefers up to three recordings from the `0403` signer when available, scores body and hand tracking coverage, and keeps the best eligible track. If those samples fail, it checks alternate signer recordings. The checked-in manifest pins the 49 selected samples so results can be regenerated consistently. It preserves the eight existing SignSense motion tracks.

## Step 2: INCLUDE vocabulary and the website library

`prepare-include-motion-library.py` merges the base library with word signs from [INCLUDE](https://zenodo.org/records/4010759) (AI4Bharat; 263 ISL words, 4,287 videos, CC BY 4.0). It then writes the split library the website loads.

1. Download all 46 INCLUDE archives (56.8 GB) from Zenodo into one folder, for example `D:\datasets\INCLUDE`. Do not extract them; the script reads the zips directly.
2. Run:

   ```powershell
   .venv-mp\Scripts\python.exe scripts/prepare-include-motion-library.py D:\datasets\INCLUDE --workers 6
   ```

Each sign gets a `topic` (INCLUDE's category folder, or a hand-assigned topic for the base signs), which the Sign dictionary page at `/signs` uses for its filters.

For each label the script scores four recordings spread across the signers and keeps the clip with the best body and hand tracking coverage. Existing words are kept unless `--replace` is given. The index is saved after every sign, so you can stop an interrupted run and start it again. The INCLUDE label "I" is stored as `me`: ISL signs I and me the same way, and the key must not collide with the fingerspelled letter I.

Source videos are never copied into the website. Attribution and processing notes are in `public/voice-demo/SOURCES.md`.

### Recovering INCLUDE words that failed tracking

INCLUDE has 263 words but the library has fewer, because some labels had no recording that passed the tracking checks with 4 candidates. Existing words are skipped, so re-running with more candidates only retries the missing ones:

```powershell
.venv-mp\Scripts\python.exe scripts/prepare-include-motion-library.py D:\datasets\INCLUDE --candidates 12 --workers 6
```

The run ends by listing any labels that still failed.

## Step 3: whole signed sentences (ISL-CSLTR, ISLVT)

`prepare-sentence-motion-library.py` adds complete sentences signed by people. When a user types one of these sentences (casing, punctuation and contractions don't matter), the planner plays the real signed sentence as one motion instead of stitching words together. Sentences inside longer text are matched too.

| Dataset | Content | License |
|---|---|---|
| [ISL-CSLTR](https://data.mendeley.com/datasets/kcmpdxky7p/1) | 100 everyday sentences, 700 videos, 7 signers | CC BY 4.0 |
| [ISLVT](https://data.mendeley.com/datasets/98mzk82wbb/1) | 76 sentences, front and side views, professional signer | CC BY 4.0 |

1. Download and extract the dataset.
2. Check what the script finds before tracking anything:

   ```powershell
   .venv-mp\Scripts\python.exe scripts/prepare-sentence-motion-library.py D:\datasets\ISL-CSLTR --source isl-csltr --dry-run
   ```

   Sentence text is read from folder names. If the videos are not in folders named by sentence (ISLVT ships its sentences in a spreadsheet), save a CSV with the columns `file,sentence` and pass `--labels that.csv`. For ISLVT, add `--prefer front` to use only the front-view recordings.
3. Run it without `--dry-run`. Entries are stored with `kind: "sentence"` and topic `Sentences`, so they also appear in the Sign dictionary.
4. Add the dataset's attribution to `public/voice-demo/SOURCES.md` (the script already adds it to `sign-index.json`).

The sign counts shown on the website are read from `sign-index.json` when the site builds, so they update automatically.

Not usable here: CISLR (~4,700 words) and the Hugging Face ISL fingerspelling set are CC BY-NC (non-commercial only), and iSign is research-only. No openly licensed dataset currently provides a full A–Z fingerspelling alphabet as video (ISLAN is CC BY 4.0 but mostly still images), so unknown names are still shown as captions.

## Limitations

The generated motions are prototypes. The scripts do not validate the linguistic meaning, regional variant, grammar, or facial/non-manual markers. INCLUDE was recorded in Chennai, and ISL varies across India. Have a Deaf ISL reviewer validate each motion and phrase before describing the demo as accurate or using it for communication.
