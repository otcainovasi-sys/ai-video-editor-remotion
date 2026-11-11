# QA storyboard WEIGHT TODAY — R1

Status: SIAP DITINJAU. Bukan QA final video. Persetujuan pengguna: belum diberikan.
Engine: HyperFrames 0.9.33. Komposisi SHA256: ab6acd10b90b06503ffaaa790c15e182fd27db53cce0a3f4d57348b4ea0dcbc7.

## 1. Brief
- SESUAI: sumber WEIGHT TODAY disalin tanpa mengubah original; ketiga video dianalisis. Bukti analisis.md, cache/*-speech.json, referensi/weight-today-*.
- SESUAI: engine HyperFrames, GSAP dan SVG/CSS. Tidak ada impor atau render Remotion.
- SESUAI: ucapan Inggris dipertahankan. Koreksi “You don’t have to carry tomorrow’s weight...” berasal dari konfirmasi pengguna, bukan asumsi agen.
- BELUM TERVERIFIKASI: seluruh transkrip belum direview pengguna. Timestamp don’t adalah estimasi pembagian interval ASR 35.31–35.59; wajib playback sebelum final.

## 2. Brand
- SESUAI dengan usulan DESIGN.md: hijau #213F32, gading #F3EDDC, kuning #E8BF47; Franklin Heavy + DM Serif. Font lokal dimuat (2 font pada snapshot log).
- BELUM TERVERIFIKASI terhadap guideline NAZARVERSE resmi; tidak ada dokumen brand tersedia. Tidak mengklaim brand compliance final.
- Thumbnail empat brand tidak berlaku: proyek personal NAZARVERSE, bukan OTCA/Info Jerman/Jepang Koey/Ciao Manda.

## 3. Artistik dan gerak
- SESUAI pada still: hierarki judul/caption, wajah bebas teks, variasi split/full/portrait. Bukti stills-r1 frame 00–08, opening-r1 frame01.
- SESUAI pada fase posisi: tiga kartu bertambah (5.2/6.8/8.8 s), fokus tomorrow → today (37.6/39.6/40.5 s). Perubahan posisi teramati, tidak diklaim sebagai bukti keluwesan.
- Revisi yang selesai: encoding karakter Unicode, judul akhir yang sempat bertabrakan, pemenggalan kata to/weak, caption kini di atas transisi dan tidak kehilangan kontras.
- BELUM TERVERIFIKASI: bobot/ritme/keluwesan transisi, kualitas suara dan sinkron SFX lewat playback. SFX baru berupa rencana; belum dicampur.

## 4. Teknis
- SESUAI pada HyperFrames check: lint/runtime/layout/motion/contrast/craft/audio seluruhnya 0 error dan 0 warning. Bukti hyperframes-check.json dan check.log. Ini pemeriksaan runtime, bukan pengukuran loudness final.
- SESUAI pada still: caption full frame dan split memakai lajur terpisah; frasa panjang maksimal 2 baris (29.5 dan 37.6 s). Tidak ada mask/roto; tepi bingkai disengaja.
- Sumber 478×850 membatasi detail. Target 1080×1920, 30 fps; frame sumber tidak diklaim menjadi detail 1080p asli.
- BELUM TERVERIFIKASI: H.264/AAC/bt709 dan loudness −14 LUFS/−2 dBTP karena final belum dirender.

## Modul
G11 kolase-kertas@0.5 sebagai fondasi struktur dengan override proyek; T02@0.2 sebagai alur, tanpa penulisan ulang narasi. K00/K01/K05/K09@0.2, K11/K12/K13/K14@0.1. Semua aturan engine Remotion diganti sesuai instruksi terbaru pengguna. Pipeline generik render.py tidak dipakai untuk storyboard ini; adapter proyek menggunakan HyperFrames check/snapshot.

## Langkah produksi setelah persetujuan
Kunci hash storyboard yang disetujui; verifikasi timing kata koreksi melalui playback; kurasi gerak dan pasang SFX terpilih; render HyperFrames; normalisasi dan encode ekspor standar; QA teknis dan artistik sebelum penyerahan. Jangan memakai video.py setuju untuk mengesahkan format HyperFrames yang belum didukung renderer lama.
Ide upgrade: sinkronkan empat aksen kertas dengan ucapan dan haluskan jeda gerak setelah beban terakhir.
