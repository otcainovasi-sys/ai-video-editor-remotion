# WEIGHT TODAY — Field notes on resilience

## R2 — approved scope of revision
User requested smooth rotoscope, premium composition variation, and more native graphic assets than headline text. The new visual priority is illustrated mechanisms, talent cutouts and complete spoken captions. Headlines become short 58 px labels; the earlier 92–144 px title treatment below is superseded for R2. No room/furniture should remain visible. Source-resolution limitations still apply.

Portraits vary: direct cutout with an inset weight sculpture, left-aligned intimate portrait with rope metaphor, small companion cutout beside an illustration, and right-aligned closing portrait with stepping stones. Full graphic passages use backpack, resilient plant, path/bench and calendar. Assets consist of independently animated SVG components, with tactile restrained gradients on metal/fabric. Cream surfaces remain warm; no neon or glass.

Matte workflow: continuous RVM foreground/alpha; pipeline BiRefNet portrait masks anchor clean boundaries; bidirectional optical flow propagates guidance between anchors. Soft edge support limits RVM background leakage. No hard uniform cutout blur; inspect light and dark backplates and adjacent frames. This is a project adapter and does not change the shared roto backend.

## Style Prompt
Kolase editorial yang hangat dan dewasa: kertas gading, bidang hijau hutan, label kuning, foto talent berbingkai. Mengambil tata susun tak simetris dan frame bersusun dari referensi kedua, serta penjelasan visual yang berkembang dan cutback dari referensi pertama. Rasa reflektif, tegas, pribadi; bukan tutorial kantor atau UI teknologi. Bentuk dan mekanisme mengikuti ucapan setelah transkripsi.

## Colors
- #213F32: kanvas hijau gelap dan teks di kertas.
- #F3EDDC: kertas, teks utama di hijau.
- #E8BF47: penanda kata penting dan fokus aksi.
- #946448: detail kertas cokelat, bukan teks kecil di hijau.
- #15271F: bayangan dan tinta gelap.

## Typography
Franklin Gothic Heavy untuk judul/caption tegas; DM Serif Display untuk satu kata editorial pada momen reflektif. Font lokal dari pipeline/fonts, disalin ke aset proyek. Judul 92–144 px; caption 54 px; label 28–32 px. Maksimal dua keluarga.

## Motion
Frame kertas punya berat: gerak 0.45–0.8 s, rotasi kecil mereda. Sorot kata 0.12–0.22 s. Ilustrasi mempunyai aksi dan respons, bukan hanya ikon fade. Transisi cover kertas atau reveal bidang 0.4–0.6 s; hold tenang untuk kalimat pribadi. Tanpa gerakan berulang dekoratif.

## Composition
Area informasi x=60–960, y=250–1520 mengikuti TOKEN_00. Caption punya lajur sendiri di luar frame talent. Frame membatasi pembesaran sumber dan mempertahankan wajah. Variasi full graphic / split / cutback dirancang berdasarkan narasi. Isi, waktu dan parameter disimpan di beat-sheet.json dan manifest.json; generator menghasilkan komposisi.

## What NOT to Do
- Tidak membawa logo instansi atau palet OTCA.
- Tidak menggunakan neon, glass, glow, bintang dekoratif berlebihan, atau spring pada semua elemen.
- Tidak menutupi wajah/tubuh talent dengan caption.
- Tidak mengarang klaim, angka, CTA, atau mengganti isi ucapan.
- Tidak menyebut still sebagai bukti keluwesan motion atau hasil final.
