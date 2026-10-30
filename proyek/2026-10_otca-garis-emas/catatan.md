# Catatan — 2026-10_otca-garis-emas

- Sumber: `CONTOH VIDEO.MOV` (4K portrait 2160×3840, 58,7 s) — rekaman yang sama dengan `2026-10_otca-sertifikat-jerman`
  dan `-v3`. Salin ke `aset/rekaman/take1.mov` (footage tidak di-commit).
- Layout baru **panggung** (L02): `pipeline/scripts/panggung.py` + `remotion/src/panggung/` (PanggungReel, pustaka pg-*).
  Dibangun di thread edit ini atas persetujuan storyboard Zar (pengecualian aturan §7 "modul vs edit dipisah").
- Storyboard disetujui 2026-10-30 (chat): https://claude.ai/artifact/1JPE6HfDcXcRJAVxp4JqJW — still = komposit
  footage asli + mask GrabCut, koordinat grafis di panggung.json/Adegan.tsx sama dengan still itu.
- Musik: bawaan `pulsa` (96 BPM), ducking transkrip −9 dB. Tidak ada file musik dari klien.
- Timing kata storyboard diambil dari caption video v3 (OCR); render memakai transkrip whisperx. Cek ejaan anchor di
  `cache/words.json`: hati-hati, sehari-harinya, perkuliahan, dicapai, digunakan, terpakai, "jerman" ke-5 = kata terakhir.
  Bila whisperx memecah/menggabung kata lain, sesuaikan anchor di panggung.json (panggung.py cek menunjukkan yang gagal).
- Mask: MediaPipe → `panggung.haluskan_mask` (histogram Lab+tekstur di pita tepi, GrabCut berbenih, guided filter,
  EMA di piksel diam, dekontaminasi warna). Diuji di 12 frame (0,6–57,8 s): tanpa serpih batu/halo di latar gelap & terang.

## Perintah (laptop, .venv)
```
.venv\Scripts\python pipeline/scripts/video.py ingest 2026-10_otca-garis-emas
.venv\Scripts\python pipeline/scripts/video.py transkrip 2026-10_otca-garis-emas   # koreksi cache/words.json, dikoreksi: true
.venv\Scripts\python pipeline/scripts/musik.py                                       # sekali: musik bawaan (pulsa)
.venv\Scripts\python pipeline/scripts/panggung.py cek 2026-10_otca-garis-emas
.venv\Scripts\python pipeline/scripts/panggung.py siapkan 2026-10_otca-garis-emas   # ±20 menit: mask halus + talent.webm + latar.mp4
.venv\Scripts\python pipeline/scripts/video.py render 2026-10_otca-garis-emas
.venv\Scripts\python pipeline/scripts/video.py qa 2026-10_otca-garis-emas
```
