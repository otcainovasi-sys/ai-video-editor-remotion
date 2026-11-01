# QA — 2026-11_not-good-enough (layout split)

**Status: LULUS**

File: `out/2026-11_not-good-enough.mp4` · dicek 2026-11-01 04:37

| ID | Aturan | Status | Detail |
|---|---|---|---|
| K07.2 | H.264, resolusi format, pix_fmt, tag bt709, AAC | LULUS | h264 1080x1920 yuv420p ('bt709', 'bt709', 'bt709') audio aac |
| FPS | fps = format.fps | LULUS | 30.00 |
| K06.1 | loudness terintegrasi = audio.lufs ± toleransi | LULUS | -14.3 LUFS |
| K06.2 | true peak ≤ audio.true-peak | LULUS | -1.9 dBTP |
| DUR | durasi = rekaman (±0,1 s) | LULUS | 56.30 s vs rekaman 56.33 s |
| SINK | audio & video sama panjang (±0,1 s) | LULUS | audio 56.33 s |
| K01.cps | caption ≤ qa.karakter-per-detik-maks | LULUS | terpadat 23.1 cps (“be willing”), batas 24 |
| HOOK | frame 0 panggung sudah berisi visual (roadmap #7) | LULUS | stddev luminans 26.2 |
| HOOK.1s | gerak panggung 0→0,5 s cukup kuat (roadmap #7) | LULUS | beda rata-rata 48.8 |
| STRUKTUR | split.json valid (modul, transisi, anchor, urutan adegan) | LULUS | proyek/2026-11_not-good-enough: split 10 adegan, match cut 3/9 potongan, hook aktif |
| MATCH | ≥1 match cut bentuk antar-adegan (roadmap #5) | LULUS | 3/9 potongan match/iris |
| KETUKAN | potongan di ketukan + denyut grafis | LULUS | 78.0 BPM, 0/9 potongan di-snap, denyut 1.0 |
| K08.6 | musik di-duck di bawah ucapan | LULUS | transkrip -9.0 dB, 1 segmen bicara |

K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.

## Checklist manual (dicentang Zar)
- [ ] K00 zona aman: grafis panggung tidak masuk area tombol kanan (120 px) & atas (250 px) di HP.
- [ ] K07.3 tonton di HP resolusi penuh: keterbacaan caption, sinkron bibir.
- [ ] K08.5–6 cek SFX & ducking musik dengan headphone (musik naik di jeda, tidak memompa di tengah kalimat).
- [ ] Denyut ketukan terasa halus (bukan kedip); iris/match cut terbaca sebagai satu gerak.
- [ ] G01.2 grafis tidak menutupi wajah talent; sambungan atas/bawah tidak terlihat terpotong.
