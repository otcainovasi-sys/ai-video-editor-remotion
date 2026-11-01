# Aturan Kerja — Video System

Aturan tetap dari Zar untuk setiap sesi (Claude Code di laptop maupun sesi cloud).
Ringkasannya ada di `CLAUDE.md`; file ini detailnya. Bila bertentangan dengan permintaan Zar di percakapan, permintaan Zar yang menang.

## 1. Alur edit terkunci (disetujui Zar, 2026-10-28)

1. **Desain (boleh di cloud):** transkripsi, konsep, hook 3 detik, naskah/beat-sheet, lalu **storyboard** — still per adegan + VO, timing, SFX, musik (`video.py storyboard <proyek> --buka`).
2. **Persetujuan storyboard dari Zar.** Tunggu. Revisi beat-sheet = storyboard & persetujuan ulang.
3. **Produksi di laptop:** bangun/port komposisi ke repo ini (modul yang bisa dipakai ulang, bukan kode sekali pakai). Tanpa pratinjau Studio dan tanpa render pratinjau di cloud (§7).
4. **Render final sekali** di laptop setelah storyboard disetujui → `video.py semua <proyek>`.
5. **QA:** `out/qa-report.md` harus **LULUS** (kode K00–K10), tunjukkan `out/kontak.png`.
6. **Commit** ke repo ini. Repo `video-system` adalah sumber kebenaran tunggal: pekerjaan yang hanya ada di cloud harus masuk ke repo.

Larangan: tidak ada render final sebelum storyboard disetujui.

## 2. Ekspor

- Satu file saja per proyek: `proyek/<proyek>/out/<proyek>.mp4`, dipakai untuk Reels/TikTok/Shorts.
- 1080x1920 (9:16), H.264, AAC, tag warna bt709 (K07.2).
- Loudness −14 LUFS terintegrasi, plafon true-peak master −2 dBTP (K06.2, agar lolos setelah encode AAC).

## 3. File sementara

- Semua file sementara (Remotion, Chrome, ffmpeg, tempfile) di `<repo>/.sementara` (D:). Override dengan env `VIDEO_TEMP` — tetap di D:.
- Uji manual & salinan proyek juga di D:, mis. `.sementara\uji`. Jangan memakai C: atau `%TEMP%` (drive C: cepat penuh).
- Hapus cache besar yang tidak dipakai lagi setelah proyek selesai (tanya Zar dulu untuk arsip).

## 4. Git & sesi paralel

- Beberapa sesi bisa mengubah file yang sama bersamaan (mis. proyek lain sedang diedit).
- Stage hanya hunk milik pekerjaan Anda: `git add -p <file>` atau path spesifik. Jangan `git add -A`/`git add .`, `git stash`, `git checkout -- <file>`, atau `git reset --hard`.
- Commit lokal dengan pesan jelas berawalan area (`pipeline:`, `remotion:`, `modul:`, `proyek:`, `docs:`). Push ke `origin master` hanya setelah Zar setuju.

## 5. Klien OTCA (konsultan studi ke Jerman, audiens orang tua)

- Warna: hitam #000 dominan; Solid Gold #CB9D31; Gradient Gold #CB9D31 → #FDF1A4 → #B3822C; putih #FFF.
- Font Montserrat (ExtraBold judul; Bold/SemiBold/Medium isi).
- Pola: garis gradien emas tebal 7, persegi gradien emas; desain tetap dominan hitam.
- Logo 235x72 di atas untuk Reels/Story; varian logo glow untuk pemakaian besar.
- **Split layout talking-head:** separuh atas frame 9:16 (dari tengah ke atas) = motion graphics/ilustrasi yang merepresentasikan apa yang diucapkan talent (ikon/adegan, bukan teks), sinkron ke timestamp kata; talent di separuh bawah.
- Sumber Remotion OTCA versi cloud: `hasil/otca-video-remotion-src.zip` (file proyek). Port menjadi modul repo sebelum dipakai lagi; video OTCA yang sudah jadi tidak di-render ulang.

## 6. Roadmap premium — diterapkan per video

Item 1–3, 6, 8 sudah ada di pipeline. Di setiap edit baru, terapkan:

| # | Item | Praktiknya |
|---|---|---|
| 4 | Bahasa gerak per gaya | Easing, durasi, dan overshoot mengikuti token gaya + K05; jangan campur karakter gerak antar-gaya. |
| 5 | Match cut | Sambung adegan lewat bentuk/posisi/warna yang sama (shape match cut), bukan potong polos. |
| 7 | Hook visual 1–2 detik pertama | Gerakan/visual terkuat di detik pertama, sebelum kalimat pertama selesai. |
| 9 | Review gerak frame-by-frame | Periksa transisi & reveal di Studio per frame sebelum render final (tidak ada pop, kedip, atau tabrakan zona aman). |
| 10 | Modul pustaka adegan | Adegan yang bagus disimpan sebagai modul pakai-ulang (daftar di `INDEX.md`), bukan ditulis ulang tiap video. |

Ide yang sudah disetujui untuk edit berikutnya: musik latar dengan auto-ducking, shape match cut, parallax 2.5D + sapuan cahaya emas pada ikon utama, hook visual lebih kuat di 1 detik pertama, modul adegan pakai-ulang.

Setiap kali menyerahkan hasil, akhiri dengan daftar singkat ide upgrade ("jangan pernah merasa puas").

## 7. Hemat token (disetujui Zar 2026-10-28)

- Balasan chat gaya caveman: singkat, kata kecil. Kode, naskah, dan storyboard tetap kualitas penuh.
- Storyboard/naskah/rencana disimpan di file, chat cukup link.
- Baca file seperlunya (grep/head); log render cukup ringkasan error + hasil QA.
- Revisi dikumpulkan jadi satu putaran, bukan banyak render kecil.
- Tanpa preview Studio; pakai ulang modul adegan.
- Matikan dengan "stop caveman".

Tambahan (disetujui Zar 2026-10-29):

- **Modul vs edit dipisah:** membangun/upgrade modul di thread tersendiri; thread edit video hanya memakai ulang modul yang ada.
- **Tanpa render pratinjau di cloud:** storyboard = still per adegan; render sekali di laptop setelah storyboard disetujui.
- **Satu thread per video:** tutup setelah selesai; revisi digabung satu putaran.
- **Brief lengkap di awal:** footage, transkrip/naskah, tujuan, brand, durasi, CTA — agar tidak bolak-balik tanya.
- **Level effort diatur Zar sendiri;** Claude tidak mengubahnya.
- **Baca log/file seminimal mungkin:** grep/tail bagian yang perlu saja.
- Ditolak: template adegan (adegan tiap video selalu berbeda).

## 8. Kebebasan kreatif & upgrade terus (aturan tetap Zar, 2026-10-28)

- Setiap edit **boleh bebas memakai ulang dan meremix** semua efek, preset, template, gaya, dan modul adegan yang sudah ada di `video-system` (lihat `INDEX.md`, `efek/`, katalog) — kombinasikan agar tiap video bervariasi, tidak monoton.
- **Kebebasan penuh dalam desain motion di Remotion**: komposisi, transisi, tipografi kinetik, partikel, cahaya, parallax, dll. Tetap ikuti skill `remotion-best-practices` + kontrak proyek (token gaya, K05 gerak, K09 koreografi, zona aman).
- **Selalu tingkatkan kualitas** dibanding video sebelumnya: tiap video minimal satu peningkatan nyata (efek baru, transisi lebih halus, hook lebih kuat), lalu simpan yang bagus sebagai modul pakai-ulang (item 10).
- Standar hasil: **profesional, premium, sinematik — tidak pernah terlihat generik/template AI** (hindari gradien ungu default, animasi fade/slide polos seragam, teks tengah tanpa hierarki, stok ikon generik).
- **Variasi layout per video (Zar, 2026-11-01):** jangan split terus sepanjang video. Selipkan beberapa **adegan full animasi** (motion graphics menutup seluruh frame selama beberapa detik, talent tidak tampak, suara tetap jalan) dan **cutback** (kembali ke talent full frame / split, mis. untuk penekanan atau reaksi). Ritme contoh: split → full animasi di kalimat kunci → cutback ke talent → split. Rencanakan di storyboard.
- Batasan yang tetap berlaku: brand klien (mis. OTCA §5), alur storyboard → persetujuan (§1), spesifikasi ekspor (§2), dan QA LULUS.

## 9. Penyimpanan footage & hasil (aturan tetap Zar, 2026-10-28)

Berlaku untuk video **baru** saja. File OTCA yang sudah ada tetap di folder file proyek (jangan dipindah).

- **Penyimpanan utama = laptop:** `video-system\proyek\<proyek>\` menyimpan footage mentah, aset, dan hasil (`out/<proyek>.mp4`).
- **Folder file proyek (cloud) = transit saja:** dipakai untuk upload footage saat laptop mati dan untuk berbagi hasil ke HP. Setelah laptop menyala, **pindahkan** file transit ke `proyek\<proyek>\` lalu bersihkan salinan transit (tanya Zar sebelum menghapus).
- **Backup:** sarankan Zar mem-backup `proyek\` secara berkala ke Google Drive atau disk eksternal (folder ini di-`.gitignore`, tidak ikut git).
- File sementara tetap mengikuti §3 (`.sementara`, D:).

## 10. Mask talent & subtitle (aturan tetap Zar, 2026-10-29)

- **Mask talent harus bersih:** tepi hijab/rambut/bahu tanpa tepi kasar, halo, atau sisa latar. Cek still close-up tepi mask sebelum mengirim storyboard.
- **Subtitle/caption tidak pernah menutupi wajah atau sosok manusia** (talent maupun figur di grafis). Cek posisi caption vs kotak wajah/orang per adegan; geser caption bila bertabrakan.
