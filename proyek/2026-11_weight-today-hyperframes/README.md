# WEIGHT TODAY — HyperFrames R1

Current stage: storyboard/edit composition, waiting for user design approval. No final MP4 has been rendered. User confirmed the corrected sentence at 35–41 s, not the design.

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
