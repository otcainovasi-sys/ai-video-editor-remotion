# Analisis tiga video

## Bahan dan metode
Ketiga berkas dibuka melalui ffprobe, pipeline `video.py referensi`, contact sheet yang ditinjau, dan transkripsi lokal faster-whisper small multilingual. Analisis pipeline tersimpan di `referensi/weight-today-source`, `referensi/weight-today-ref1`, `referensi/weight-today-ref2`. Transkrip lengkap di cache proyek. Angka segmen/face/text dari detektor adalah perkiraan; bukan bukti kualitas artistik.

## WEIGHT TODAY — sumber
46.566 detik, 478×850, 30 fps, H.264/AAC. Satu pengambilan talking head, tanpa caption atau potongan keras yang terdeteksi. Ruang kosong besar di atas kepala; wajah dan ekspresi lebih berguna daripada memperbesar keseluruhan footage. Narasi: beban → kelelahan → izin istirahat → cukup satu langkah. Pertahankan suara, urutan dan nada sumber, tanpa menambahkan CTA pemasaran. Kalimat 35.31–41.09 sudah dikonfirmasi pengguna; transkrip mesin salah pada negasi dan weight. Waktu kata tambahan belum diperiksa melalui playback.

## Referensi 1 — Referensi video.mp4
63.509 detik, 478×850, 30 fps. Detektor mencatat 18 segmen: 11 potongan keras dan 6 peristiwa. Contact sheet memperlihatkan:
- 0–5 s: sertifikat sebagai objek besar di atas talent, headline masalah dengan aksen kuning.
- 9.6–19.6 s: ilustrasi kantor polisi/surat dan alur pengajuan berkembang menjadi dua panel.
- 21.8–31.8 s: persyaratan dalam bingkai telepon.
- 34.4–44.4 s: koran lalu aplikasi ditampilkan di depan footage yang dikaburkan.
- 46–53.6 s: kalender/penghitung dilanjutkan dokumen hasil.
- 53.6–59.6 s: kembali ke talent.
Yang diterapkan: objek menjelaskan kalimat, perkembangan komposisi, jeda cutback. Tidak mengambil isi prosedur, logo instansi, palet korporat, atau UI aplikasi. Detektor wajah hanya mencatat 13%, padahal contact sheet jelas memuat talent; persentase ini tidak dipakai sebagai proporsi layout.

## Referensi 2 — referensi video 2.mp4
33.967 detik, 478×850, 30 fps. Delapan segmen terdeteksi, tujuh potongan keras. Contact sheet memperlihatkan:
- 0–10.8 s: papan hijau bergaris, potret berbingkai putih, salinan monokrom, label kertas cokelat/kuning.
- 10.8–14 s: potret membesar lalu kolase contoh hasil.
- 14.4–19.2 s: kartu tahap dan variasi skala talent.
- 19.2–23 s: potret kecil, prompt/UI, garis penghubung.
- 23–34 s: bingkai besar dengan label kuning pada frasa kunci.
Yang diterapkan: frame kertas, layering, hijau/gading/kuning, kata kunci menonjol, variasi skala. Gerak dibuat lebih tenang sesuai isi reflektif WEIGHT TODAY. Tidak menyalin promosi AI, logo, bintang dekoratif, atau CTA referensi.

## Keputusan edit R1
Sembilan adegan: hook portrait → beban split → cutback personal → ruang hari ini full → jeda split → tired/weak full → istirahat split → today/tomorrow full → penutup portrait. Caption Inggris mempertahankan suara asli, lajur khusus y=1370–1500. Tidak ada caption di wajah/tubuh talent. Grafis SVG/CSS dan animasi GSAP native HyperFrames; tidak memakai Remotion atau gambar AI sebagai pengganti gerak.

## Batas pemeriksaan
Analisis visual didasarkan pada rangkaian frame dan deteksi temporal, bukan penilaian playback bersuara. Transkrip referensi berbahasa Indonesia/dialek memiliki kesalahan ASR; hanya dipakai memahami topik, bukan disalin menjadi naskah baru. Keluwesan, sinkron kata tambahan, dan mix audio final belum terverifikasi. Guideline NAZARVERSE resmi tidak tersedia; identitas R1 adalah usulan berdasarkan referensi.
