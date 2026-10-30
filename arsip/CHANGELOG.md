# CHANGELOG

Format: "## YYYY-MM-DD" lalu per perubahan: modul@versi — apa, kenapa, video pemicu.
Versi lama dipindah ke `arsip/<lapisan>/` dengan nama file tetap (mis. arsip/konteks/KONTEKS_00_zona-aman_v0.1.md).

## 2026-10-24
- Kerangka awal video-system dibuat (semua modul v0.1, status draft).
- Restrukturisasi: pola nama `JENIS_NN_nama_vX.Y`, ID (TK/K/G/T), INDEX.md sebagai buku acuan.
- tokens: + TOKEN_00_platform (zona aman 250/400/60/120 px, −14 LUFS, preset ekspor, ambang QA).
  glass-tech & bold-kinetic diisi nilai default — **file guideline asli belum dipecah ke sini**.
- konteks: K00–K03 diisi; + K04 ingest, K05 gerak, K06 audio, K07 ekspor (dari workflow produksi).
- template: frontmatter `durasi`, `hook_maks`, `beat_wajib` agar bisa dicek QA.
- pipeline: manifest.json + beat-sheet.json per proyek; skrip ingest, transkrip, roto, render, ekspor, qa, arsip,
  video (CLI). crop.py digabung ke ingest.py. Skill diganti nama → video-editor.
- Uji: proyek sintetis (video tes 1920×1080@25, words manual, mask eksternal) lulus 27/27 cek otomatis.
  Temuan saat uji: judul tanpa latar di atas video terang gagal K01.4 → tambah opsi `latar: "panel"`/`stroke`;
  tag bt709 hilang di ekspor → tambah `setparams`.
- pipeline: venv proyek `.venv/` (whisperx 3.8.6, mediapipe 1.1.1, torch 2.8 CPU). roto.py pindah ke MediaPipe Tasks
  ImageSegmenter (mp.solutions dihapus di 1.x). Diuji: WhisperX base/en pada ucapan TTS → 33 kata ber-timestamp,
  1 salah tanda baca (bukti K01.2 perlu); roto 131 frame; render/ekspor/QA jalan di numpy 2 + OpenCV 5.
- efek: lapisan baru `efek/` (E01–E17) dari pustaka "Motion Design Templates & Context Library" pengguna.
  Diberi nama "efek" (bukan template/gaya) karena berupa pola motion per beat. Isi asli dipertahankan + frontmatter
  (durasi, stagger, dukungan), resep pipeline, aturan QA ENN.1–.4. Dukungan: 7 sebagian, 10 eksternal, 0 native.
  Panduan umum sumber (safe area 5–8%, easing 0.65/0/0.35/1, fps 24/60) tidak menimpa token — lihat efek/README.md.
- remotion: Remotion 4.0.538 dipasang lokal di `remotion/` (Node 20, tidak global) untuk arsitektur hibrid
  Python + Remotion. Composition `Uji` membaca TOKEN_00 + TOKEN_01 langsung; uji still PNG & render ProRes 4444
  (yuva444p12le, 1080×1920@30) berhasil.
- integrasi Python ↔ Remotion: elemen beat-sheet `tipe: remotion`; `remotion_jembatan.py` merender Composition
  via node CLI → overlay ProRes 4444 di cache/remotion/ (hash props + src). render.py mengkomposit overlay
  (+ backdrop blur Python), mengukur bbox dari alpha ≥ 50% & kontras dari latar efektif → QA tetap berlaku.
  Props membawa token gabungan proyek → gaya (glass-tech/bold-kinetic) berganti tanpa ubah kode TSX.
  `video.py cek` memastikan Composition yang dirujuk modul efek terdaftar di Root.tsx.
- pipeline: `storyboard.py` + perintah `storyboard`/`setuju`. Storyboard HTML: timeline (beat, elemen, kamera,
  caption, SFX), thumbnail di frame tampil-penuh tiap elemen (mesin render yang sama, termasuk overlay Remotion),
  transkrip per beat dengan kata anchor, tabel elemen (waktu, durasi, anchor, efek) dan pra-QA per elemen.
  Pra-QA = qa.evaluasi() pada layout pratinjau, melewati aturan yang butuh file render (K02.1, K06.1–2, K07.1–2).
  `setuju` mencatat sha beat-sheet; berubah → persetujuan batal; `semua` memberi peringatan bila belum disetujui.
  Uji (17 s, 7 elemen): storyboard 10,8 s vs render penuh ±3,5 menit; pra-QA menemukan kegagalan yang sama
  dengan QA penuh (K01.4, K01.5, E05.1, template).
- efek: checklist 0.1 → 0.2 (arsip/efek/EFEK_07_checklist_v0.1.md): dukungan sebagian → native via Composition
  `Checklist` (centang tergambar 0,3 s + bounce, stagger, `sfx_item`). Uji: overlay 142 frame 40 s (cache 3,8 s);
  bbox [60,250,960,651] di zona aman; K01.4 menemukan teks aksen 3,76:1 di atas panel kaca 62% pada latar
  sangat terang → pertimbangkan menaikkan `warna.panel-opasitas` glass-tech.
- pipeline: field `efek` di beat-sheet (divalidasi saat load), diteruskan ke layout.json; QA memuat modul efek yang
  dipakai (cek_efek); modul_terpakai mencatat efek. Uji: E05.1 menangkap push digital-zoom 3,08 s (> 2 s);
  E01.2 memvalidasi klip broll orbit; nama efek salah ketik ditolak.
- skill@0.1: dipasang ke `.claude/skills/video-editor/` (salinan dari pipeline/skill/SKILL.md) agar terbaca Claude Code.
- preset@0.1 (lapisan baru `preset/`, ID PR): 6 resep siap pilih — tips-kinetic, explainer-glass, explainer-depth,
  explainer-kinetic, tips-glass, teks-kinetic. Isi: gaya + template + efek + setelan manifest + beat-sheet awal.
  `video.py baru <nama> --preset <p>`, `video.py preset [nama]`; `video.py cek` memvalidasi preset (gaya_cocok,
  beat_wajib, efek, depth↔K02, remotion, aturan tanpa rekaman). manifest + field `preset`; terpakai.json mencatatnya.
  Uji: 6 preset → proyek → beat.muat OK; teks-kinetic dirender penuh → QA LULUS (17 lulus, 0 gagal).
- preset@0.1: + 4 preset kombinasi efek — produk-glass (orbit, glass-type, ui-world, phone-mockup, digital-zoom,
  checklist), sorotan-kinetic (cover-story, headline-wall, zoom-through-cut, vertigo), data-glass (pull-back-reveal,
  glass-type, chart-grow, checklist), cerita-kinetic (frame-break, zoom-through-cut, doodle-boil, chart-grow,
  headline-wall). Field `aset` → `baru` menulis aset/PERLU.md (spesifikasi + Prompt dari modul efek).
  Uji sorotan-kinetic (rekaman & aset sintetis): render pertama GAGAL K00.1/K00.2/K01.4/K03.5 — gambar 9:16 penuh
  keluar zona aman, foto ditumpuk judul, teks di atas video tanpa stroke. Diperbaiki: gambar diberi `rasio` + `lebar`
  yang muat zona, cover-story disusun judul–foto–sumber tanpa tumpuk, `stroke`/`panel` pada teks di atas video.
  Render ulang: 28 lulus, 1 gagal (K01.1 — audio sintetis tanpa transkrip; dengan rekaman asli diisi tahap transkrip).
  Koreksi yang sama (stroke) diterapkan ke tips-kinetic & explainer-kinetic tanpa naik versi: draft hari ini, belum
  dipakai proyek. `video.py cek` + aturan: aset = file beat_sheet, gambar muat zona aman, teks di atas video ber-stroke/panel.
  Keputusan pengguna: explainer-kinetic tetap memakai digital-zoom walau `gaya_cocok`-nya hanya glass-tech (info cek dibiarkan).
- gaya: + 12 gaya (G03–G14, token TK03–TK14, v0.1): apple-glass, kaca-gelap, arang-lime, rts-modern (HUD game strategi
  modern, dikonfirmasi pengguna), paper-motion, minimalism, retro-brutalism, kertas-tipografi, kolase-kertas, doodle-art, sketch-art,
  coffee-lofi. Tiap gaya: font lokal berbeda, palet, bentuk panel (kaca/solid/bergaris/bayangan keras), karakter gerak,
  caption, SFX. Frontmatter baru `ciri` & `teks_di_video`. glass-tech & bold-kinetic → v0.2 (hanya tambah ciri/teks_di_video).
- template explainer & hook-problem-solution → v0.2: `gaya_cocok` memuat 14 gaya.
- preset: pola nama `<gaya>-<format>` + field `label`, `format` (dicek `video.py cek`). PR01–PR10 → v0.2 dengan nama baru
  (v0.1 di arsip/preset/, nama lama tetap bisa di-resolve). + PR11–PR22: satu preset per gaya baru.
- video.py: `preset [gaya]` dikelompokkan per gaya (ciri + palet), `katalog [gaya]` → gaya/katalog/*.png + katalog.png.
  Uji per gaya (klip 13,5 s, latar gradien, render → ekspor → QA): 14/14 lulus aturan gaya & teks setelah koreksi:
  K05.4 motion blur wajib → rts-modern, minimalism, retro-brutalism, doodle-art, sketch-art aktif dengan ambang 30 px;
  K01.4 kontras aksen < 4,5 → aksen digelapkan: apple-glass #0A84FF→#0064C9 (+ kaca 0,68→0,8), paper-motion #E8553D→#C43017,
  retro-brutalism #FF4F00→#B83900, kolase-kertas #E83F6F→#BB1645, doodle-art #E86A00→#B55300. (Draft hari ini, tanpa naik versi.)
  Artefak uji diabaikan: T02.2 (klip pendek), K06.1 (tanpa suara). Catatan terbuka: K06.2 true peak −0,8 dB (> −1) pada klip
  SFX-saja tanpa suara untuk gaya ber-SFX whoosh (bold-kinetic, kaca-gelap, kertas-tipografi, sketch-art, coffee-lofi) —
  perlu dicek di preset tanpa footage (bold-kinetic-teks); dengan rekaman suara belum terlihat.
- scripts@0.2: render.py `MARGIN_TP_LOSSY` = 0,5 dB — master dinormalisasi ke true-peak token − 0,5 agar ekspor AAC
  tidak melewati K06.2 (terukur: master −1,0 → mp4 −0,9 dBTP). Pemicu: proyek 2026-10_wa-2026-10-24.

## 2026-10-25
- Fase 1 (referensi: Rotoscope.mp4 & reel motion graphics 64 s): suara + caption + 3 perangkat motion.
- scripts@0.3: sfx.py — pustaka 12 bunyi × varian (sintesis numpy, deterministik), bus SFX tunggal; render.py — SFX
  otomatis dari `sfx.peta` (varian bergilir, anti-tumpuk, puncak whoosh disejajarkan ke gerak), caption karaoke,
  elemen `info` (ikon Segoe Fluent + judul + sub) & `chip` (benar/salah/nomor/info), jadwal ketik prompt-ui.
- remotion: Composition PromptUI (label seri, lampiran, ketik + kursor, kirim, ciut jadi pil). efek: + E18 prompt-ui.
- tokens: platform v0.2 (sfx otomatis/peta/level, ketik, caption.mode); 14 token gaya v0.2 (mode caption: karaoke untuk
  gaya tenang/kertas/kaca, aktif untuk kinetik/HUD/brutal; peta bunyi khas gaya; level kelas diturunkan dari level-db).
- konteks: K01 v0.2 (K01.6 mendukung karaoke), + K08 sound-design (QA otomatis K08.1–K08.4).
- gaya: semua naik 1 versi (token v0.2, caption@0.2, sound-design@0.1). preset: naik 1 versi, gaya & template tanpa
  pin versi (selalu aktif; proyek tetap mengunci versi saat dibuat).
- Fase 2 (referensi reel motion graphics 64 s): pustaka perangkat UI + transisi.
- scripts@0.4: perangkat.py (jadwal + bunyi bersama untuk PromptUI, Penghitung, Terminal, Coret, Timeline, GridVariasi,
  FormGanti, Partikel); render.py elemen `transisi` (blur-zoom seluruh frame), opasitas panel per elemen remotion;
  sfx.py + bunyi kilau & gores; qa.py elemen dekoratif dikecualikan dari K00.2/K05.3; storyboard.py warna tipe info/chip/transisi
  (perbaikan: tipe fase 1 membuat storyboard error).
- remotion: lib/dasar.tsx (pakaiDasar, Jendela mock UI, palet dari token) + 7 Composition baru. efek: + E19–E26.
- tokens: platform v0.2 diperluas di tempat (aditif, dibuat kemarin): peta SFX perangkat, `perangkat.*`, `transisi.blur-zoom`.
- Audio tanpa suara: render.py `_kunci_loudness` (ukur ulang → koreksi gain + alimiter oversampling 4×) — SFX saja:
  −16,1 → −14,3 LUFS, TP −1,5; + musik.py musik latar bawaan (pulsa/lembut/lofi, loop 8 bar mulus) lewat `"bawaan:<nama>"`.
  demo-fase2 + musik pulsa: QA LULUS (−14,0 LUFS, TP −1,4).
- Fase 3 — koreografi: lapisan baru `koreografi/` (KR01 bukti-sosial, KR02 kata-prompt, KR03 tutorial-langkah,
  KR04 mitos-fakta, KR05 minimal-quote); K09 koreografi (ritme: tanpa perangkat berulang berurutan, variasi minimum,
  transisi, `fungsi`) — dicek `video.py cek` & QA; elemen `latar` (cutaway kaca buram); `opasitas` panel info/chip.
  platform token v0.3 (koreografi), semua gaya +1 versi (platform@0.3, koreografi@0.1).
  Preset: 22 preset kerangka-sama → arsip/preset/; 16 preset baru PR23–PR38 = gaya × koreografi (nama <gaya>-<koreografi>).
  Uji: 16 preset → proyek → beat.muat OK; demo-fase3 (kaca-gelap-mitos-fakta + footage WA): QA lulus kecuali K04.1 (sumber WA).
- scripts@0.5.
- CTA "Save this for later" dihapus dari beat-sheet proyek WA, demo-fase1, demo-fase3 (tidak ada di modul gaya/preset/koreografi);
  pengecualian caption untuk CTA itu ikut dilepas. Video keluaran lama belum dirender ulang.
- Rotoscope: `depth` + `gradien` (isian gradien warna token); koreografi bisa membawa `konteks_tambahan` (K02) ke proyek.
- koreografi v0.2 (5 modul): TODO → contoh isi nyata; CTA tanpa "save this"; kata-prompt + kata raksasa bergradien di
  belakang subjek (butuh roto) + kuis salah/benar di pita atas.
- video.py `pratinjau`: render contoh tiap preset 540×960 → preset/pratinjau/*.mp4|gif|png; render.py membaca ingest
  dengan skala ke resolusi keluaran (resolusi pratinjau).
- Review pratinjau → koreksi koreografi v0.2 di tempat (baru dibuat, belum dipakai proyek): CTA talking head ke pita atas
  (tabrakan dengan caption), hook mitos-fakta (chip atas, judul geser_y), tutorial-langkah 2 perangkat per beat panjang,
  bukti-sosial perangkat `geser_y` 150 (judul gaya besar 3–4 baris). Remotion: `geser_y` pada wadah perangkat UI.
  video.py pratinjau: frame PNG di tengah perangkat utama tiap beat. 16 pratinjau dirender ulang + preset/pratinjau/_semua.png.


## 2026-10-25 — revisi preset/gaya/efek: motif gaya, slot per fungsi, E01–E17 native, laporan & referensi (scripts v0.6)
- tokens: platform 0.3 → 0.4 (slot, kamera, transisi zoom-tembus/whip/glitch/celup/kertas/coretan, peta bunyi baru,
  koreografi.khas-min & tutup-wajah-maks); 14 token gaya 0.2 → 0.3 + blok `motif` (bingkai, aksen, tekstur, transisi,
  reveal, boil). Catatan: penambahan slot/kamera/transisi sempat ditulis ke platform v0.3 sebelum dinaikkan, jadi salinan
  arsip v0.3 ikut berisi kunci tambahan itu (hanya penambahan; perilaku proyek lama tidak berubah).
- gaya: G01/G02 0.4 → 0.5, G03–G14 0.3 → 0.4 (rujuk token baru + bagian "Motif"); rujukan konteks zona-aman@0.2 &
  koreografi@0.2 dikoreksi di tempat (gaya baru dibuat hari ini).
- konteks: K00 0.2 (K00.3 menutupi wajah → otomatis dari cache/wajah.json; K00.4 manual), K09 0.2 (slot per fungsi,
  K09.6 ≥ 2 efek khas gaya).
- efek: E01–E06, E08–E17 → v0.2 native (Remotion: Orbit, CouchWall, UIWorld, HeadlineWall, PaperCut sebagai klip cutaway
  → broll; ChartGrow, GlassType, CoverStory, DoodleBoil overlay; render.py: tipe kamera digital-zoom, phone-mockup,
  frame-break, pull-back-reveal, vertigo, green-screen; transisi zoom-tembus). gaya_cocok diisi untuk 14 gaya.
  E07 0.3 & E26 0.2 (gaya_cocok). Baru: E27 aksen-gaya, E28 whip, E29 glitch, E30 celup.
- koreografi 0.2 → 0.3: elemen `slot` (fungsi + isi generik) → generator slot.py memilih perangkat cocok gaya + seed.
- Remotion: lib/motif.tsx (11 bingkai, 7 hiasan kata, tekstur, boil), lib/latar.tsx, lib/font.ts (font dari file token),
  semua perangkat memakai bingkai motif; komposisi baru AksenGaya, Sapuan, ChartGrow, GlassType, CoverStory, DoodleBoil,
  HeadlineWall, Orbit, CouchWall, UIWorld, PaperCut.
- scripts 0.6: slot.py, pasang.py (anchor kata + hindari wajah), wajah.py, laporan.py (laporan perangkat + kontak-sheet),
  referensi.py (segmen potongan+peristiwa, gerak, teks, wajah, tebakan slot, draf koreografi); video.py varian/pasang/
  wajah/laporan/referensi, pratinjau --seed (+ .kontak.png, .json); render.py motif panel PIL & hiasan kata, kamera,
  transisi khas gaya, overlay `belakang`; qa K00.3, K09.6, mask kamera; skill 0.2.
- Uji ujung ke ujung (proyek uji sementara, dihapus) → perbaikan: pasang mempertahankan durasi elemen (rentang durasi efek),
  hook tidak melewati panjang contoh; K00.3 diukur per piksel alpha overlay di kotak wajah (depth & elemen di atas latar
  dikecualikan); cover-story scrim + teks terang + caption beat disembunyikan; bingkai ber-bayangan/rotasi diberi jarak
  zona; garis tergambar memakai koordinat piksel (dash + non-scaling-stroke rusak di Chrome); `video.py cek` menghitung
  jadwal perangkat untuk seed 0–2. Koreografi v0.3 dikoreksi di tempat (hari yang sama): kata-prompt hook 0–3,5 s, chip
  posisi atas, reveal CTA di samping (x 0,8 · y 0,36), bukti-sosial durasi_hitung 1,3. 16 pratinjau dirender ulang.
- BUG roto.py: frame rekaman dibaca tanpa skala ke resolusi keluaran → di pratinjau (540×960) mask acak dan teks depth
  tampil DI ATAS wajah, bukan di belakang. Diperbaiki (scale cover + crop, resolusi masuk kunci cache mask). Proyek
  1080×1920 dengan ingest 1080×1920 tidak terdampak. 5 pratinjau ber-depth (apple-glass/doodle-art/kolase-kertas
  kata-prompt, retro-brutalism-mitos-fakta, sketch-art-tutorial-langkah) masih memakai mask lama — perlu dirender ulang.
- Rotoscope di semua preset ber-rekaman: token gaya v0.3 + `motif.depth` (gradien · padat · garis tepi; dikoreksi di
  tempat, hari yang sama) dan bagian Motif gaya; render.py `depth` mengikuti corak gaya (field `corak`/`gradien` menimpa).
  Koreografi v0.3 (koreksi di tempat): tutorial-langkah (JERNIH, poin-1; slot kamera pindah ke ringkasan), mitos-fakta
  (KONSISTEN, solution), minimal-quote (MULAI, solution), kata-prompt tanpa paksaan gradien; konteks_tambahan
  depth-typography. bukti-sosial tanpa rekaman → tidak ada subjek, rotoscope tidak berlaku.

## 2026-10-25 — rotoscope terbaca, font profesional, efek teks & grafis penjelas (referensi pengguna)
- Rotoscope: render.py menata teks depth OTOMATIS di atas kepala (titik tertinggi kepala dari mask selama tampil; dasar
  huruf tertutup ≤ depth.tutup-maks 25 %), menghindari teks/panel lain yang tampil bersamaan, mengecil ≥ 60 % bila perlu,
  lalu MENGURUTKAN (tampil setelah elemen bentrok) atau dihilangkan — tidak pernah terpotong. Ukur huruf tertutup per frame.
  K02 → v0.2: K02.3 otomatis (tertutup rata-rata ≤ 30 %, puncak ≤ 45 %), K02.6 baru (depth tidak bertumpuk). Token platform
  + `depth` (koreksi di tempat). minimal-quote: kartu inti 20,5–24,4 s lalu MULAI 24,6–27,2 s.
- Font (referensi "Font untuk video talking head"): 9 font Google (Inter, Bebas Neue, Anton, Lilita One, Baloo 2, Bangers,
  Luckiest Guy, Playfair Display, DM Serif Display) di pipeline/fonts/ (+ lisensi/); dukungan variable font (sumbu wght)
  di PIL & Remotion. Pasangan ≤ 2 keluarga per gaya di token gaya v0.3 (koreksi di tempat) + bagian Tipografi gaya.
- Efek teks (referensi "Style effect profesional"): E31 judul-gaya (Remotion JudulGaya) — setiap `judul` memakai
  motif.judul gaya: masuk pop/masker/ketik/slam/stiker/neon/fade + hiasan neon/long-shadow/glitch/gradien; hiasan kata
  baru "kotak" (kotak highlight; bold-kinetic & arang-lime) di Remotion & PIL. Perbaikan: progres hiasan kata di luar
  penyedia konteks (PromptUI & judul) selalu 0.
- Grafis penjelas (referensi "Motion graphic penjelas"): E32 lower-third, E33 langkah, E34 sebelum-sesudah, E35 callout,
  E36 linimasa (remotion/src/compositions/Penjelas.tsx) + kandidat slot & isi contoh koreografi (koreksi di tempat).

## 2026-10-25 — audit pipeline: perbaikan bug, render paralel, render-server Remotion, test, git (scripts v0.6, tanpa ubah modul)
- transkrip.py — BUG: `--paksa` (juga `semua --paksa`) menimpa `words.json` yang sudah `dikoreksi: true` bila audio
  sama. Kini koreksi tidak pernah ditimpa; hasil baru selalu ke `words.baru.json`.
- remotion — `render-server.mjs`: satu proses Node per run (bundle webpack sekali, di-cache di `remotion/.bundle/<kunci>`,
  satu browser) menggantikan `remotion render` per overlay. Overlay kini **bt709 bertanda** (sebelumnya tanpa tanda →
  bergantung tebakan matriks ffmpeg). `@remotion/bundler`/`@remotion/renderer` dideklarasikan (4.0.538). Diuji: hasil
  server = hasil CLI (selisih maks 1–2/255, alpha identik); per overlay ±13 s vs 16–19 s (CLI). Sidik sumber kini
  memuat render-server.mjs → semua overlay ber-cache dirender ulang sekali pada render berikutnya.
- render.py — komposit paralel per rentang frame (`--pekerja N`, env `VIDEO_PEKERJA`, default ½ inti maks 4; video < 2 s
  per proses tetap berurutan). Potongan ProRes disambung tanpa encode ulang; statistik QA per frame digabung. Diuji pada
  proyek sintetis (testsrc + judul/chip/kartu/cta/push/transisi/digital-zoom/penghitung): 270/270 dan 900/900 frame
  identik (framemd5) & layout.json identik dengan render berurutan; 30 s video: 127,5 s → 69,9 s.
  Mask subjek di-cache per frame (depth + efek kamera tidak membaca/blur 2×). Seek pembaca −¼ frame (pencegahan
  pembulatan; di ffmpeg 9 seek lama terbukti juga eksak).
- sistem.baca_json — toleran BOM UTF-8 (JSON disimpan Notepad/PowerShell 5.1 sebelumnya gagal dimuat).
- requirements.txt diberi rentang versi teruji + `opencv-contrib-python` (yang memang terpasang & dibutuhkan mediapipe);
  `requirements.lock` = pip freeze .venv yang terbukti jalan.
- `pipeline/tests/` (unittest stdlib, 15 test): resolver, gabung token, BOM, parser teks, anchor waktu, regresi transkrip,
  gabung statistik paralel, seek frame. Jalankan: `.venv\Scripts\python -m unittest discover -s pipeline/tests`.
- git init; .gitignore: + `.remotion/` (Chrome), `remotion/.bundle/`, keluaran pratinjau (mp4/gif/png; .json tetap),
  `proyek/_pratinjau/`.

## 2026-10-25 — sisa audit: gerbang persetujuan, font tegas, render.py dipecah, ESLint Remotion (skill video-editor@0.3)
- skill video-editor 0.2 → 0.3 — storyboard kini **gerbang**: `video.py semua` dan `render.py` (render penuh; `still`
  tidak) menolak bila beat-sheet saat ini belum disetujui (`setuju`). `--tanpa-setuju` hanya atas keputusan pengguna,
  dicatat di manifest `render_tanpa_setuju`; larangan ditambahkan di SKILL. Catatan: kelima proyek yang ada belum
  pernah disetujui → render berikutnya perlu storyboard → setuju dulu.
- remotion lib/font.ts — file font token yang gagal dimuat saat render kini menghentikan render (`cancelRender`, pesan
  menyebut file); sebelumnya diam-diam memakai font cadangan (ukuran teks beda dari render.py/QA). Studio: peringatan.
- remotion_jembatan — kunci cache overlay memuat isi file font token (ganti file font bernama sama → overlay diperbarui).
- remotion lib/motif.tsx — tekstur noise (`motif.tekstur` grain/kertas) dari `background-image: url(data:svg)` → komponen
  `<LapisTekstur>` (SVG inline + pattern 240 px, filter sama). background-image tidak ditunggu Remotion (frame awal bisa
  tanpa tekstur). Diuji: selisih rata ±1/255 (fase noise), butir setara secara visual.
- remotion — ESLint 9 + `@remotion/eslint-plugin` 4.0.538 (`npm run lint`, lokal); lint & tsc bersih.
- render.py (2.134 baris) dipecah tanpa mengubah logika (pemindahan baris mekanis, diverifikasi baris-per-baris):
  render_dasar · render_teks · render_panel · mixin render_elemen/depth/perangkat/kamera/audio; render.py = orkestrator
  (±620 baris) dan tetap me-re-export nama lama.
- Harness regresi (proyek sintetis: caption, depth+mask, judul-gaya & sapuan Remotion, 4 transisi, 4 efek kamera,
  kartu/info/chip/cta/latar/gambar): setelah pemecahan, 360/360 frame, audio, dan layout.json identik dengan sebelum
  (berurutan & paralel). Test: 18 lulus.

## 2026-10-25 — perbaikan QA ditemukan di proyek 2026-10_otca-sertifikat-jerman (kode pipeline, tanpa ubah modul)
- render_depth — BUG: setelah teks depth ditata ulang di atas kepala, `bbox_teks` tetap posisi awal (y 0,30) → QA K00.1/K02.6
  bisa melaporkan tabrakan palsu (mis. depth × logo) atau melewatkan yang nyata. Kini ikut posisi baru.
- storyboard — elemen Remotion dekoratif yang memudar (partikel) disampel saat tampak (awal), bukan di `t_ukur` (akhir, sudah
  pudar → pra-QA K00.1 "tidak pernah tampil" palsu). Render penuh tidak berubah (mengukur tiap frame).

## 2026-10-26 — 10 efek baru (permintaan pengguna) + alias nama Inggris
- Baru: E37 liquid-glass (Remotion LiquidGlass + lensa refraksi render_pip._lensa), E38 frame-escape, E39 snap-zoom,
  E44 studio-reveal (+ Remotion StudioSet), E46 paper-cutout (kamera, render_kamera), E42 zoom-portal (transisi), E40
  checklist-pop (Checklist `pop`), E41 headline-storm (cutaway), E43 growth-curve, E45 broll-overlay (render_pip, PiP).
- Modul efek boleh membawa `param` (bawaan efek kamera/transisi), `props` (bawaan props Remotion), `slot` (fungsi yang
  dilayani → generator slot otomatis memakainya) dan `alias` (resolve efek menerima nama lain: "dolly zoom" → vertigo,
  "magazine cover" → cover-story, …). Alias ditambahkan di 13 modul lama (metadata saja, tanpa naik versi).
- slot.py: tabel kandidat = token + `slot` modul; transisi khas gaya (motif 2 : efek transisi ber-gaya 1, mis. zoom-portal);
  lookahead K09.1 (slot tidak memilih perangkat yang tetap ada di beat berikutnya).
- Tes baru pipeline/tests/test_efek.py (alias, sinkron mask roto, tabel slot, lookahead, lensa, paper-cutout, snap-zoom) —
  menangkap bug peta remap float64 di lensa.
- Perbaikan dari uji pratinjau: lib/dasar.tsx menerima durasi_masuk/keluar 0 (StudioSet gagal "inputRange [0,0]");
  laporan render tidak lagi menyerialkan kunci privat kamera (`_ov` Overlay); hero headline-storm lineHeight 1.1;
  contoh E40/E43 di posisi bawah agar pratinjau tidak menutupi wajah.

## 2026-10-26 — skill resmi Remotion + audit gerak (kode Remotion & pipeline; K05 0.2)
- Skill resmi Remotion (remotion-dev/skills, 12 skill, `.claude/skills/`, skills-lock.json) dipasang; CLAUDE.md mewajibkan
  `remotion-best-practices` saat mengubah `remotion/`. Aturan gabungan (skill + proyek) di remotion/README.md.
- Sinkron Python ↔ Remotion: perangkat Remotion dulu selalu masuk "naik + pudar" di semua gaya, sementara judul/kartu
  Python mengikuti `gerak.masuk-default` (pop/geser/turun/fade). Kini render_perangkat mengirim `masuk`/`keluar` dan
  `<Wadah>` memakai rumus Animator (render_dasar.py) yang sama → satu bahasa gerak per video; layout.json/QA mencatat
  gerak yang benar-benar terjadi. JudulGaya & LiquidGlass menganimasikan masuknya sendiri (`masukSendiri`) — sebelumnya
  terkena animasi masuk ganda. rec judul mencatat `motif.judul.masuk`.
- lib/dasar.tsx: `Wadah`/`SediaMotif` jadi komponen tingkat modul (dulu didefinisikan di dalam hook → seluruh isi
  perangkat dibongkar-pasang tiap frame; render lebih lambat). Pemanggil: `<Wadah wadah={wadah}>`.
- Gerak: garis progres E33 langkah tiba di tiap titik tepat pada jadwal Python (sama dengan bunyi langkah-titik);
  E02 couch-wall ganti isi dengan durasi/easing token (dulu 0,45 s linear); E13 paper-cut stop-motion ber-easing;
  23 animasi skala → perceptual-scale (`skalaPersepsi`); push-in E08 perceptual & ter-clamp.
- Gerak diam dibuang dari elemen UI: napas & kilau berulang LiquidGlass (kini satu kali lintas), lampu StudioSet &
  CouchWall, titik bingkai kaca, denyut Callout (kini 2 denyut lalu diam); daun CouchWall bergetar hanya bila `motif.boil`.
- konteks: K05 0.1 → 0.2 — K05.6 gerak diam (manual) + catatan masuk/keluar perangkat Remotion & perceptual-scale.
- gaya: G01/G02 0.5 → 0.6, G03–G14 0.4 → 0.5 (rujuk gerak@0.2; isi lain tidak berubah). Proyek lama tetap memakai versi
  gaya yang tercatat di manifestnya.

## 2026-10-27 — E51–E54 grafis reflektif (proyek "Life Isn't a Race")
- Baru (Remotion `compositions/Reflektif.tsx`, warna/font/hiasan dari token gaya):
  E51 kinetik-kata (KinetikKata — tipografi kinetik per kata, waktu dari cache/words.json), E52 lintasan (jalur lari
  bercabang ke tujuan berbeda), E53 dua-linimasa (linimasa mereka vs milikmu), E54 bab-baru (halaman buku berbalik 3D).
  ID E47–E50 sudah dipakai sesi lain (layer-explosion, validasi-badge, chat-window, split-explainer) → nomor 51–54.
- perangkat.py: spek boleh menulis `e["_props"]` (props Remotion hasil olahan) — render_perangkat menggabungkannya.
- render_depth.py: penataan teks depth memeriksa tepi atas KOTAK teks (bbox_teks, yang diukur QA K00.1), bukan puncak
  glyph — sebelumnya teks bisa lolos penataan tetapi keluar zona aman.
- Tes: test_efek.UjiKinetik (aksen lintas kata, sinkron ucapan, perapatan jadwal linimasa).

## 2026-10-28 — ekspor satu file
- ekspor.py: manifest `platform` berisi satu kunci → satu file `out/<proyek>.mp4` (Reels/TikTok/Shorts memakai file yang sama).
  Lebih dari satu kunci → tetap `<proyek>_<platform>.mp4`. QA K07 ikut path yang sama.
- proyek/_template-proyek: `platform` bawaan `["reels"]` (sebelumnya reels, tiktok, shorts).


## 2026-10-28 — motion blur Remotion, zoom potong (E55), caption tidak dobel dengan teks kinetik
- Baru E55 zoom-potong (native, otomatis): `zoom_potong.py` merencanakan bingkai rapat per kalimat (kalimat pendek digabung,
  berhenti saat cutaway/efek kamera/transisi/depth/PiP/push manual, sesudahnya mulai rapat); render `_zoom_potong` memasukkannya
  ke push dengan `potong: true` (gerak 0, berpusat di wajah). Aturan E55.5 (skala ≤ 1,15, di awal kata, tidak bertumpuk);
  K03 hanya untuk push bergerak. `efek_dipakai` mencantumkan E55 bila aktif & ada rekaman. Matikan: beat-sheet
  `"zoom_potong": {"aktif": false}`.
- K00.3/kontak-sheet: kotak wajah diperbesar seperti yang tampil saat push/zoom potong (wajah.kotak_di `push`,
  render_perangkat memakai `_skala_push`).
- Caption: selama teks kinetik (Spek `ganti_caption`, E51) kata yang dibawakannya dibuang dari caption; sisa tampil sampai
  teks kinetik masuk bila masih ≤ cps maks (K01.5).
- Motion blur Remotion: `lib/kabur.tsx` (Gaussian searah gerak, shutter 180°, aman untuk overlay ber-alpha — bukan
  CameraMotionBlur yang menumpuk salinan semi-transparan). Dipakai E51 (kata naik), E52 (pelari), E54 (halaman berbalik);
  Spek `blur_gerak` → layout `motion_blur.remotion` → detail K05.4.

## 2026-10-28 — folder sementara di drive data
- sistem.py: TEMP/TMP/TMPDIR dan `tempfile.tempdir` diarahkan ke `<repo>/.sementara` (env `VIDEO_TEMP` untuk memindahkan)
  sebelum proses apa pun berjalan, jadi Remotion, Chrome headless, ffmpeg dan tempfile Python tidak memenuhi drive C:.
  `.sementara/` di .gitignore.

## 2026-10-28 — sinkron ketukan musik & riser
- Baru `ketukan.py`: deteksi tempo/fase (spectral flux + autokorelasi; akurat ±1 BPM, fase ±20 ms pada klik & musik bawaan),
  pilihan fase grid, ofset musik, snap. `musik.BPM` untuk grid musik bawaan tanpa deteksi.
- `render_ketukan.py` (KetukanMixin): titik mulai musik dipilih agar ketukan jatuh di potongan berbobot, potongan dekat
  ketukan digeser ke ketukan (cutaway/transisi/kamera ≤ 0,16 s, reveal ≤ 0,1 s, ½ ketukan untuk < 100 BPM), elemen yang
  menempel ikut; riser berpuncak di potongan masuk cutaway besar. render_audio memutar musik dari ofset (`atrim`).
- QA: ketukan musik = titik sinkron sah (K05.5, K03.3); K06.3 melaporkan BPM, potongan di ketukan, dan riser.
- Uji proyek "Life Isn't a Race": 11/16 potongan & reveal di ketukan (sebelumnya acak), 3 riser, pra-QA LULUS.

## 2026-10-28 — grafis menyatu dengan rekaman (K10)
- Baru konteks K10 menyatu (K10.1–K10.3 otomatis, K10.4 manual). `sistem.KONTEKS_WAJIB`: Proyek selalu memuatnya, juga
  untuk gaya/manifest yang belum mencantumkannya (tanpa menaikkan versi 14 gaya).
- `menyatu.py` (fungsi murni) + `render_menyatu.py` (MenyatuMixin):
  - grain film di komposit akhir (setelah caption & transisi) → rekaman dan semua grafis berbutir sama; derau ditentukan
    nomor frame (berurutan = paralel);
  - grade rekaman, b-roll & PiP ke palet gaya (kurva per kanal: angkat, kontras S, suhu, split-tone bayangan/sorot ke
    warna token + saturasi); klip cutaway Remotion tidak di-grade. `manifest.warna.filter` tetap koreksi ingest;
  - arah cahaya dari asimetri terang kiri/kanan wajah (16 frame, cache/cahaya.json; cadangan bingkai) → `bayangan.offset`
    diputar menjauhi sisi terang sebelum sprite & props Remotion dibangun; bayangan efek kamera (`_tempel_kotak`) ikut;
    `bayangan.putar` + `remotion/src/lib/cahaya.ts` memutar long-shadow & bayangan stroke JudulGaya.
- Token: TOKEN_00 `grain`/`grade`/`cahaya` + `qa.grain-rasio-min`, `qa.grade-de-min`, `qa.grade-wajah-de-maks`; nilai khas
  per gaya (`grain`, `grade`) di TOKEN_01–14 (draft, tanpa naik versi). Beat-sheet menimpa: `"grain"`, `"grade"`,
  `"bayangan"` (`{"aktif": false}`, `{"kekuatan": …}`, `{"sudut": -25}`).
- QA: K10.1 derau bagian rata grafis/rekaman di master, K10.2 ΔE rata-rata & wajah, K10.3 arah bayangan; K10.1 dilewati
  di pra-QA storyboard. Tes: test_menyatu (grain, grade, cahaya, putar, cek QA).
- Uji salinan "Life Isn't a Race" (.sementara/uji): cahaya dari kanan (asimetri +0,32, keyakinan 1,0) → bayangan −40°
  ([0, 6] → [−4, 5]); derau grafis/rekaman 1,99 (sebelumnya grafis bersih); grade kertas-tipografi ΔE 3,2 (wajah 3,75).
  K10.1–K10.3 LULUS. Temuan di luar K10: K06.2 GAGAL di mp4 (master −1,5 dBTP → AAC −0,8) setelah campuran audio baru
  dari sinkron ketukan/riser — margin `MARGIN_TP_LOSSY` 0,5 dB tidak cukup.

## 2026-10-28 — true peak setelah ekspor (K06.2)
- render_audio `MARGIN_TP_LOSSY` 0,5 → 1,0 dB: plafon true-peak master −2 dBTP (token −1), loudness tetap −14 LUFS.
  Pemicu: uji "Life Isn't a Race" setelah sinkron ketukan/riser — master −1,5 dBTP menjadi −0,8 di mp4 (overshoot AAC
  +0,7 dB), K06.2 GAGAL.

## 2026-10-28 — teks kinetik tetap di zona aman saat keluar (K00.1)
- remotion KinetikKata (E51): frasa yang digantikan (naik 26 px + pudar) kini naik ke balik masker di tepi atas kotak
  elemen (clip-path hanya sisi atas), serasi dengan kata yang masuk dari balik masker. Sebelumnya elemen di posisi atas
  keluar 10–11 px dari zona aman saat animasi keluar (peringatan K00.1, uji "Life Isn't a Race"). Posisi teks tidak
  digeser: percobaan memberi ruang 26 px di atas frasa justru memindahkan kata aksen ke latar lain (K01.4 2,5 < 3).

## 2026-10-30 — layout panggung (L02) + mask halus, video pemicu: 2026-10_otca-garis-emas
- Baru L02 panggung (draft v0.1): `pipeline/scripts/panggung.py` + `remotion/src/panggung/` (PanggungReel, kamera.ts,
  IkonEmas.tsx, pustaka adegan pg-portal, pg-sertifikat-kampus, pg-tangga, pg-ukur, pg-orbit, pg-coret, pg-seimbang,
  pg-kunci, pg-terbang). Satu frame penuh: latar bersih (talent di-inpaint, plate menumpuk) → grafis belakang (oklusi
  kepala/bahu) → talent roto ber-alpha (VP9 webm, OffthreadVideo transparent) → grafis depan; kamera virtual per adegan
  (`potong`/`snap`/`halus`, punch-in, dorong pelan) dengan parallax per lapis; match cut "garis emas" (adegan menyempit
  jadi garis 7 px, meluncur ke y adegan baru); caption pil emas per adegan (`caption_y`); logo + end card glow.
  Pemicu: Zar minta edit "Contoh Video" OTCA dengan teknik berbeda dari v3 split (rotoscope, zoom, depth).
- Mask halus (`panggung.haluskan_mask`): histogram Bayes Lab+tekstur di pita tepi, GrabCut berbenih 540×960, guided filter,
  EMA hanya di piksel diam, dekontaminasi warna tepi — tanpa sklearn/scipy. Uji 12 frame rekaman OTCA dari mask yang
  sengaja dirusak (resolusi rendah + melebar): serpih batu di sisi hijab bersih, tanpa halo; ±0,7 s/frame.
- QA panggung: + §10 caption vs wajah otomatis (dagu dari geometri kepala mask × kamera) di samping K07.2/K06/K01.cps/HOOK/
  STRUKTUR/MATCH/KETUKAN/K08.6.
- split.py: `mix_audio(..., irama=None)` bisa dipakai ulang (panggung); file mix ditulis di samping `out` (perilaku split sama).
- video.py: `cek` memvalidasi panggung.json; `render`/`qa` proyek ber-panggung.json lewat panggung.py.
