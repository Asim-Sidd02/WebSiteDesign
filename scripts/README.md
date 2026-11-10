# Preparing the demo ISL motion library

`prepare-isl-motion-library.py` converts selected Amrita SLR videos into the landmark tracks used by the demo avatar. This is motion retargeting, not model training or sentence translation.

1. Download version 1 of the [Amrita SLR- Real Time ISL Dataset](https://data.mendeley.com/datasets/dtg9s785v8/1) and review its [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/).
2. Extract the downloaded archive. It contains a nested `Amrita SLR Dataset.zip`; pass that nested archive to the script.
3. Install compatible `mediapipe` and `opencv-python` packages in Python, then run:

   ```powershell
   python scripts/prepare-isl-motion-library.py "C:\path\to\Amrita SLR Dataset.zip" --samples-manifest scripts/amrita-samples-v1.json
   ```

The script prefers up to three recordings from the `0403` signer when available, scores body and hand tracking coverage, and keeps the best eligible track. If those samples fail, it checks alternate signer recordings. The checked-in manifest pins the 49 selected samples so results can be regenerated consistently. Frame times are based on each source clip's actual frame rate. It preserves the eight existing SignSense motion tracks and writes the combined library to `public/voice-demo/sign-library.json`. Source videos are not copied into the website; attribution and processing notes are in `public/voice-demo/SOURCES.md`.

The generated motions are prototypes. The script does not validate the linguistic meaning, regional variant, grammar, or facial/non-manual markers. Have a Deaf ISL reviewer validate each motion and phrase before describing the demo as accurate or using it for communication.
