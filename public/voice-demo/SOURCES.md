# Demo motion sources

## Amrita SLR- Real Time ISL Dataset

Renjith Sasidharan, Manazhy Rashmi, Krishnaraj S Nair, Heera Krishna N S, Karunya Muraleedharan, Nachiketh Gupta Bellamkonda, Suraneni Manideep Rao, Sohit Avvari, Poojari Bhanu Prakash, and Davala Tejeswara Rao. *Amrita SLR- Real Time ISL Dataset*, version 1, 2025. DOI: [10.17632/dtg9s785v8.1](https://doi.org/10.17632/dtg9s785v8.1). Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Changes made: selected labeled video examples were processed with MediaPipe pose and hand tracking and converted to motion keyframes for the SignSense VRM avatar. At playback, tracking gaps and occluded arm frames are interpolated, single-frame hand-tracking errors are removed, motion is smoothed, and resting lead-in/lead-out is trimmed. The original videos are not redistributed by this demo. The dataset is attributed here in accordance with CC BY 4.0. The license does not imply endorsement by the authors or Amrita Vishwa Vidyapeetham.

## INCLUDE: A Large Scale Dataset for Indian Sign Language Recognition

Advaith Sridhar, Rohith Gandhi Ganesan, Pratyush Kumar, and Mitesh Khapra (AI4Bharat). *INCLUDE: A Large Scale Dataset for Indian Sign Language Recognition.* Proceedings of the 28th ACM International Conference on Multimedia, 2020. DOI: [10.1145/3394171.3413528](https://doi.org/10.1145/3394171.3413528). Dataset: [zenodo.org/records/4010759](https://zenodo.org/records/4010759). Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The videos were signed by Deaf students from St. Louis School for the Deaf, Adyar, Chennai.

Changes made: for each word label, several recordings were tracked with MediaPipe pose and hand tracking, and the recording with the best tracking coverage was converted to motion keyframes for the SignSense VRM avatar. The same playback clean-up described above applies. The source videos are not redistributed by the avatar demo. The dataset is attributed here in accordance with CC BY 4.0. The license does not imply endorsement by the authors or AI4Bharat.

The eight motions loud, quiet, happy, sad, beautiful, ugly, deaf, and blind were originally added as "SignSense-provided clips". Their source videos (in `public/SignVideos/`) are INCLUDE recordings from the Adjectives category, so they are attributed to INCLUDE here.

## Scope

These are isolated word and phrase motion examples, not a trained general-purpose sign-language translation model. The demo arranges known signs with simple ISL word-order rules (time first, question words last) and shows words without a sign as captions. INCLUDE was recorded in Chennai, and ISL varies regionally. ISL grammar, regional variation, non-manual markers, context, and signer variation require review by Deaf ISL users and qualified language experts before real-world use. These motions have not been independently validated by a fluent ISL reviewer.
