---
name: video-editor
description: Gunakan saat membuat atau mengedit video pendek vertikal di video-system, dari brief dan storyboard sampai render dan QA; memilih gaya, template, konteks atau efek; menganalisis video referensi; atau mengkurasi motion yang terasa kaku dan generik.
metadata:
  version: "0.7"
---

# Skill: video-editor

Skill ini hanya pintu masuk. Aturan ada di modul (konteks/gaya/template/tokens) — jangan menyalin aturan ke sini.

> Sumber utama: `pipeline/skill/SKILL.md`. Salinan aktif untuk Codex: `.Codex/skills/video-editor/SKILL.md`.
> Ubah sumber utama → naikkan versi → salin ulang → catat di `arsip/CHANGELOG.md`.

## Urutan baca (wajib, sebelum mengerjakan apa pun)
1. `INDEX.md` — petakan nama pendek yang disebut pengguna ke file.
2. `proyek/<id>/manifest.json` — gaya, template, konteks, versi, aset.
3. Gaya → token yang dirujuk frontmatter gaya.
4. Konteks yang tercantum di manifest (atau di frontmatter gaya bila manifest kosong).
5. Template.
6. Modul efek yang disebut pengguna / dipakai beat-sheet (`efek/`) — baca bagian "Di pipeline ini" untuk resepnya.
7. `proyek/<id>/brief.md`, `naskah.md`, `beat-sheet.json`.

Semua perintah dijalankan dengan `.venv\Scripts\python pipeline/scripts/video.py …` (bukan Python global).
Cara cepat: `video.py status <proyek>` menampilkan semua file ter-resolve.
Bila pengguna bertanya "file apa saja yang sudah kamu baca", jawab dengan daftar path di atas.

## Alur
| Tahap | Yang kamu kerjakan | Perintah |
|---|---|---|
| Pilih preset | tunjukkan PRATINJAU dulu (preset/pratinjau/<preset>.mp4|gif|png; buat dengan `video.py pratinjau`); preset = gaya × koreografi (`video.py preset`); pilih koreografi menurut ISI (bukti-sosial, kata-prompt, tutorial-langkah, mitos-fakta, minimal-quote) dan gaya menurut suasana; tampilkan daftar per gaya; tunjukkan contoh visual gaya (gaya/katalog/<gaya>.png); bantu memilih sesuai isi & suasana video; preset ber-aset → sebutkan klip/grafis yang harus dibuat. Nama preset = `<gaya>-<format>` | `video.py preset` / `video.py preset <gaya>` / `video.py preset <p>` |
| Aset buatan | bila ada `aset/PERLU.md`: pastikan semua file ada & sesuai spesifikasi sebelum render (render gagal bila belum) | — |
| Varian | preset = gaya × koreografi ber-SLOT: generator memilih perangkat per fungsi yang cocok gaya (efek khas gaya ≥ 2, K09.6). Tunjukkan pilihan beberapa seed, biarkan pengguna memilih; pratinjau varian: `pratinjau <p> --seed N` | `video.py varian <p> --n 5` |
| Proyek baru | buat folder + manifest + beat-sheet hasil rakit (seed tercatat di manifest) | `video.py baru <nama> --preset <p> [--seed N]` atau `--gaya <g> --template <t>` |
| Naskah | tulis `naskah.md` mengikuti "Aturan naskah" template | — |
| Ingest | rough cut (`aset.potong`), crop, color, audio −14 LUFS | `video.py ingest <proyek>` |
| Transkrip | timestamp per kata → minta pengguna koreksi `cache/words.json`, set `dikoreksi: true` | `video.py transkrip <proyek>` |
| Pasang | beat-sheet preset (detik contoh) → anchor kata di transkrip + posisi menghindari wajah; tiap beat dapat `_ucapan` & `_kata_kunci` | `video.py wajah <proyek>` lalu `video.py pasang <proyek>` |
| Beat-sheet | GANTI teks contoh perangkat dengan isi dari `_ucapan` tiap beat (judul, angka, item, anggapan). Jangan biarkan teks contoh preset. Waktu tetap anchor `{"kata": …}` | — |
| Efek Remotion | efek ber-`dukungan: native` + frontmatter `remotion` → elemen `{"tipe": "remotion", "efek": …}`; overlay dirender & di-cache otomatis saat render/still (mis. `prompt-ui` untuk kotak prompt mengetik) | — |
| Perangkat motion | bingkai, hiasan kata *kunci*, efek judul (E31), font (≤ 2 keluarga), transisi & reveal mengikuti `motif` token gaya otomatis — jangan meniru gaya lain. Rotoscope: teks depth ditata otomatis DI ATAS kepala & tidak boleh bertumpuk (K02.3/K02.6) — tulis ≤ 2 kata pendek. Grafis penjelas: lower-third (nama/peran), langkah (2–4 langkah), sebelum-sesudah, callout (butuh titik x/y), linimasa. Pengguna boleh menyebut efek dengan nama Inggris (liquid glass, snap zoom, dolly zoom, magazine cover, b-roll overlay, paper cutout, studio reveal, zoom portal, headline storm, growth curve, frame escape, checklist pop) — `resolve` memetakannya lewat `alias`. Pilih perangkat yang **terkait isi** kalimat, bukan pola yang sama tiap beat: `info` (kartu ikon dekat bagian tubuh/objek), `chip` (benar/salah/langkah), `prompt-ui`, `penghitung` (angka/bukti sosial), `terminal` (perintah/proses), `coret` (membantah), `timeline` (alur editing), `grid-variasi` (hasil berlipat), `form-ganti` (kustomisasi), `partikel` (reveal), `transisi` blur-zoom (pindah bagian), kartu, depth. Jangan ulang perangkat yang sama di beat berurutan | — |
| Koreografi | saat menyesuaikan beat-sheet dari koreografi: pertahankan perangkat berbeda tiap bagian + field `fungsi` (K09); perangkat besar di atas wajah → pakai `latar` (cutaway); `opasitas` panel bila latar video terang | — |
| Musik | video tanpa suara → `aset.musik` (`bawaan:pulsa/lembut/lofi` atau file); loudness akhir dikunci otomatis | — |
| Suara | biarkan SFX otomatis (K08); `"sfx": false` hanya bila sengaja diam. Cek dengan headphone (K08.5–6) | — |
| Efek kamera & cutaway | E01–E17 native: cutaway Remotion (orbit, couch-wall, ui-world, headline-wall, paper-cut) masuk sebagai broll otomatis; `tipe: kamera` (digital-zoom, vertigo, phone-mockup, pull-back-reveal, frame-break, green-screen) mengolah rekaman. Klip AI tetap bisa (`broll` + `file`, Prompt di modul efek) | — |
| Referensi | video contoh dari pengguna → analisis shot/peristiwa, gerak, area teks, wajah → tebakan slot + draf koreografi; TINJAU kontak.png bersama pengguna sebelum membuat koreografi baru | `video.py referensi <video> --nama <n>` |
| **Storyboard** | WAJIB sebelum render penuh: tunjukkan out/storyboard.html ke pengguna (timeline, timestamp, thumbnail, pra-QA). Perbaiki pra-QA GAGAL di beat-sheet dulu. `semua`/`render` menolak render penuh bila beat-sheet saat ini belum disetujui (revisi beat-sheet = storyboard & persetujuan ulang) | `video.py storyboard <proyek> --buka` |
| Persetujuan | hanya setelah pengguna menyetujui storyboard — jangan setujui atas nama pengguna | `video.py setuju <proyek>` |
| Review cepat | PNG frame tertentu | `video.py still <proyek> 1.5,8,20` |
| Roto | bila ada `depth`, overlay `belakang`, atau kamera frame-break/vertigo/green-screen | `video.py roto <proyek>` |
| Render → ekspor → QA | QA menulis juga laporan perangkat per beat (efek, waktu, luas layar, % wajah tertutup) + kontak-sheet — tunjukkan `out/kontak.png` ke pengguna | `video.py semua <proyek>` (laporan saja: `video.py laporan <proyek>`) |
| Arsip | setelah QA LULUS + checklist manual dicentang | `video.py arsip <proyek>` |

Referensi field beat-sheet & manifest: `pipeline/scripts/README.md`.

## Direksi kreatif dan pengembangan pustaka

Baca `panduan/DIREKSI_KREATIF_MOTION.md` saat merancang atau mengembangkan visual.
Pahami gaya/template/koreografi/efek yang relevan dan contoh implementasinya;
gunakan sebagai fondasi untuk dipakai ulang, digabung, dimodifikasi atau
dikembangkan. Rancang visual dan gerak sebagai satu kesatuan sesuai cerita
dan brand; kurasi hasil nyata dan revisi yang generik sebelum ditunjukkan.

## Motion native dan QA semua brand

Wajib baca `konteks/KONTEKS_14_motion-native-brand-qa_v0.1.md` sebelum merancang,
merevisi atau menilai motion/storyboard. Buat objek native dan aksi–reaksi
sesuai brand; QA brief, brand, artistik dan teknis dengan bukti per adegan.
Simpan `out/qa-storyboard.md`; status belum terverifikasi tidak boleh disebut
lulus. Persetujuan desain tetap keputusan pengguna.

## Kurasi gerak yang hidup

Untuk merancang atau mengulas motion grafis, baca
`konteks/KONTEKS_13_motion-hidup_v0.1.md` bersama K05/K09/K12.
Tentukan perilaku objek, pemicu dan respons, bobot, ritme serta kontinuitas.
Pola utama ikon masuk lalu diam harus dikurasi kembali bila tidak menjelaskan isi.
Gunakan referensi sebagai standar kualitas gerak; metafora tetap sesuai narasi.
Pisahkan bukti brand, QA teknis, dan artistik. Still/pixel delta tidak membuktikan
keluwesan; nyatakan batas verifikasi alat dan hormati izin render yang sudah ada.
Contoh prompt pengguna: `panduan/PROMPT_MOTION_HIDUP.md`.

## Subtitle pada komposisi campuran / full frame

Jika ada motion grafis layar penuh, wajib baca dan terapkan
`konteks/KONTEKS_11_caption-premium-full-frame_v0.1.md`. Subtitle harus dirancang
premium: boleh selaras dengan kapsul/panel split atau memakai tipografi editorial
lain yang sesuai brand. Jangan default ke teks kecil polos di bawah animasi.
Tunjukkan contoh full frame dan split beserta frasa terpanjang pada storyboard;
cek timing, keterbacaan, kontras, dan tabrakan grafis saat QA. Preferensi ini
berlaku pada pekerjaan berikutnya, bukan perintah render ulang video lama.

## Kewajiban QA
- Jangan menyerahkan video sebelum `out/qa-report.md` berstatus **LULUS**.
- Bila GAGAL: perbaiki beat-sheet/manifest (bukan kode, bukan token) lalu render ulang. Ubah token/konteks hanya
  bila aturannya memang salah — itu perubahan modul: naikkan versi + catat di `arsip/CHANGELOG.md`.
- Sampaikan checklist manual dari laporan QA kepada pengguna; jangan mencentangnya sendiri.
- Akhiri dengan ringkasan: modul + versi yang terpakai (dari `out/qa.json` → `modul`).

## Larangan
- Menulis timing/teks di kode render. Semua lewat `beat-sheet.json` dan `manifest.json`.
- Memakai angka mentah yang sudah ada di token (warna, ukuran, durasi, zona aman).
- Menimpa `cache/words.json` yang sudah `dikoreksi: true`.
- Memakai `--tanpa-setuju` tanpa keputusan eksplisit pengguna (pelewatan dicatat di manifest `render_tanpa_setuju`).
- Menghapus modul lama — pindahkan ke `arsip/`.
