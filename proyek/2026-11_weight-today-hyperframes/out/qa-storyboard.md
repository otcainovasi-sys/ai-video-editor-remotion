# WEIGHT TODAY — QA storyboard R2

Status: untuk tinjauan pengguna; bukan QA final MP4. Engine HyperFrames. Desain final belum disetujui.
Hash komposisi: 77ada15ae250b9b63fefcde43360df1056785e228eb35255910313f956f6e41b.

## Brief
- SESUAI: pengguna meminta mask halus tanpa ruangan, layout bervariasi, dan lebih banyak aset motion daripada tulisan. R2 memakai cutout serta 9 ilustrasi SVG yang terdiri dari komponen; judul hanya label pendek. Caption lengkap tetap mengikuti sumber.
- SESUAI: tidak ada penggunaan Remotion. HTML/CSS/SVG/GSAP, video alpha VP9.
- SESUAI: koreksi narasi detik 35–41 dipertahankan dari konfirmasi pengguna.

## Brand / visual
- Palet hijau/gading/kuning mengikuti arah referensi, tidak diklaim guideline resmi NAZARVERSE.
- Potret tanpa bingkai, asimetris kiri, pendamping kecil, dan penutup kanan; 4 adegan grafis penuh.
- Mask berbasis sumber; wajah tidak direkonstruksi/generatif. Sumber 478×850 membatasi rambut dan detail wajah.

## Artistik dan gerak
- Native asset: beban yang menggantung; timbangan yang merespons beban; tali yang melengkung; tas terbuka dan beban diangkat; bangku dengan jam melambat; tanaman menekuk/pulih; jejak berhenti/berlanjut; kalender membuka hari ini; satu langkah pada batu.
- Bukti still: snapshots-r2.json; lembar storyboard-r2-contact.jpg. Komponen grafis lebih dominan dari judul, subtitle punya ruang sendiri.
- Mask: sampel perbandingan awal MediaPipe/RVM/BiRefNet dan final-edge-*.png tersimpan di roto-r2/. RVM awal menyisakan furnitur kecil dekat rambut; diperbaiki dengan panduan portrait yang dilacak dua arah.
- BELUM TERVERIFIKASI sepenuhnya: keluwesan/ritme komposisi pada playback penuh, semua tepi mask setiap frame, sinkron kata don’t, mix dan SFX akhir. Cuplikan mask tanpa suara disediakan untuk review.

## Teknis
Pemeriksaan HyperFrames: {"lint": {"errors": 0, "warnings": 0}, "runtime": {"errors": 0, "warnings": 0}, "layout": {"errors": 0, "warnings": 0}, "motion": {"errors": 0, "warnings": 0}, "contrast": {"errors": 0, "warnings": 0}, "craft": {"errors": 0, "warnings": 0}, "audio": {"errors": 0, "warnings": 0}}. Bukti hyperframes-check-r2.json.
Alpha: sumber diproses tiap frame dengan recurrent state kontinu; tidak menginterpolasi setiap n frame sebagai pengganti segmentasi. Panduan portrait dilacak optical flow maju/mundur; support edge dilatasi 1 px + sigma .55. Foreground menggunakan estimasi RVM untuk mengurangi sisa warna latar. Asset output lossless VP9 alpha 478×540 dengan crop ruang kosong, 30 fps.
Tidak ada QA ekspor final karena final belum dirender. Target tetap H.264/AAC/bt709, −14 LUFS, −2 dBTP.

## Referensi teknis
- https://github.com/PeterL1n/RobustVideoMatting/blob/master/documentation/inference.md
- pipeline/scripts/roto.py (backend rembg/BiRefNet portrait yang sudah tersedia)
- K02@0.2 tepi mask; K00/K01/K05/K09@0.2; K11–K14@0.1; HyperFrames 0.9.33.

## Upgrade berikutnya
Kurasi timing kontak beban dan jeda bangku pada playback, serta pasang hanya SFX yang membantu aksi. Persetujuan storyboard tetap pengguna.
