# WEIGHT TODAY — HyperFrames R2

R2 adds user-requested rotoscope and a graphics-first composition. Read `out/storyboard-r2.html` and `out/qa-storyboard-r2.md` for the current revision. R1 comparison is retained under `out/r1` and in `beat-sheet-r1.json`. R2 storyboard and final render were explicitly approved by the user: “ya jalankan render final”.

Rotoscope assets: `roto_talent.py` runs continuous RVM and caches alpha; `compare_portrait.py` uses the existing pipeline rembg/BiRefNet portrait backend for anchor masks; `refine_matte.py` propagates these with bidirectional optical flow, constrains alpha, and encodes cropped VP9 alpha. `mask_proof.py` creates a short silent dark/light-backplate QA clip. These are intermediate assets, not the final edited video.

New native assets live in `illustrations.py`; their per-component choreography remains in `beat-sheet.json`. `revise_r2.py` is one-time migration, not the normal build command. Use `storyboard_r2.py` for R2 reports after screenshots/check; the original `make_storyboard.py` is R1-only.

Current stage: rendered. Delivery: `out/WEIGHT-TODAY-FINAL.mp4`. Technical QA and sampled actual-export visual review are recorded in `out/qa-final-r2.json`; full real-time artistic playback/headphone review remains unverified.

- Review: `out/storyboard.html`, `out/storyboard-contact.jpg`, `out/analisis.md`, `out/qa-storyboard.md`.
- Source of timing, headings, choreography: `beat-sheet.json`; output/identity: `manifest.json`; words: `cache/words.json`.
- Composition: `hyperframes/index.html`, generated using `build_composition.py`. Local fonts/GSAP/media in `hyperframes/assets`.
- Engine: HyperFrames 0.9.33. No Remotion invocation. Analysis still uses existing `video.py referensi`; final production needs the HyperFrames adapter rather than the existing Remotion renderer.

From repository root:

```powershell
.venv/Scripts/python proyek/2026-11_weight-today-hyperframes/build_composition.py
& proyek/2026-11_weight-today-hyperframes/hf.ps1 check proyek/2026-11_weight-today-hyperframes/hyperframes --samples 12
& proyek/2026-11_weight-today-hyperframes/hf.ps1 snapshot proyek/2026-11_weight-today-hyperframes/hyperframes --at '3.5,8.8,16,21,24.7,29.5,33.6,39.6,44.4'
```

`hf.ps1` points to the installed cached CLI and Chrome; all cache/temp paths are on D:. If npm cache is removed, reinstall the pinned version and update this path. `prepare_edit.py` is bootstrap only and refuses an existing project. `extract_motion.cjs` was used once to move reviewed choreography into beat-sheet data; do not run it to undo user edits.

Read QA before rendering. Still review does not verify artistic playback, final mix, or word-level timing of the inserted “don’t”. Do not mark these passed automatically. Source media/cache images are local artifacts; back them up with the project folder.

Finalization: after approved HyperFrames render, run `final_audio.py`, `final_export.py`, then `finish_delivery.py`. These scripts retain the approved picture and original narration. Generated media stays local and is excluded from Git.
