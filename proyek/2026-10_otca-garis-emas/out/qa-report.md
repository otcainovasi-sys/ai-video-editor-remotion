# QA — 2026-10_otca-garis-emas (layout panggung)

**Status: GAGAL**

File: `out/2026-10_otca-garis-emas.mp4` · dicek 2026-10-30 10:56

| ID | Aturan | Status | Detail |
|---|---|---|---|
| K07.2 | H.264, resolusi format, pix_fmt, tag bt709, AAC | LULUS | h264 1080x1920 yuv420p ('bt709', 'bt709', 'bt709') audio aac |
| FPS | fps = format.fps | LULUS | 30.00 |
| K06.1 | loudness terintegrasi = audio.lufs ± toleransi | LULUS | -14.2 LUFS |
| K06.2 | true peak ≤ audio.true-peak | LULUS | -1.9 dBTP |
| DUR | durasi = rekaman (±0,1 s) | LULUS | 58.67 s vs rekaman 58.67 s |
| SINK | audio & video sama panjang (±0,1 s) | LULUS | audio 58.67 s |
| K01.cps | caption ≤ qa.karakter-per-detik-maks | GAGAL | terpadat 32.4 cps (“jangan hanya”), batas 23 |
| §10 | caption tidak menutupi wajah (dagu di atas caption) | LULUS | aman di semua halaman caption |
| HOOK | frame 0 sudah berisi visual (#7) | LULUS | stddev luminans 75.9 |
| HOOK.1s | gerak 0→0,5 s cukup kuat (#7) | LULUS | beda rata-rata 30.5 |
| STRUKTUR | panggung.json valid (modul, transisi, kamera, anchor, urutan) | LULUS | proyek/2026-10_otca-garis-emas: panggung 9 adegan, match cut garis 8/8 |
| MATCH | ≥1 match cut bentuk antar-adegan (#5) | LULUS | 8/8 potongan garis emas |
| KETUKAN | potongan di ketukan + denyut grafis | LULUS | 96.0 BPM, 8/8 potongan di-snap |
| K08.6 | musik di-duck di bawah ucapan | LULUS | transkrip -9 dB |

K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.

## Checklist manual (dicentang Zar)
- [ ] §10 mask: putar 1:1 di tepi hijab kiri/kanan (latar gelap) — tanpa serpih batu, halo, atau kedip tepi.
- [ ] #9 transisi garis emas frame demi frame: tanpa pop/kedip; garis meluncur mulus antar-adegan.
- [ ] Orbit (adegan 5): ikon depan lewat di dada/bahu, tidak pernah di wajah.
- [ ] K00 zona aman: logo, pil 'Link di bio', label A1–C2 & Dengar/Bicara/Tulis/Baca di dalam margin 108/315 px.
- [ ] K07.3 tonton di HP: keterbacaan caption pil emas, sinkron bibir.
- [ ] K08.5–6 headphone: SFX & ducking musik pulsa (naik di jeda, tidak memompa di tengah kalimat).
