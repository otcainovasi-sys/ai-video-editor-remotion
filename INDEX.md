# INDEX — Video System

Buku acuan: nama pendek / ID → file. **Agen selalu membaca file ini dulu.**
Kalau pengguna menyebut nama pendek ("gaya glass-tech", "konteks 02", "template explainer"), cari file-nya di sini.
Versi hanya disebut bila butuh versi lama; tanpa versi = versi aktif terbaru.

Status: `draft` (belum teruji) · `stabil` (teruji, ada bukti uji) · `usang` (dipindah ke arsip/, tidak dihapus)
Validasi otomatis: `python pipeline/scripts/video.py cek`

## Tokens (nilai mentah)
| ID | Nama pendek | File | Versi | Status |
|---|---|---|---|---|
| TK00 | platform | tokens/TOKEN_00_platform_v0.4.json | 0.4 | draft |
| TK01 | glass-tech | tokens/TOKEN_01_glass-tech_v0.3.json | 0.3 | draft |
| TK02 | bold-kinetic | tokens/TOKEN_02_bold-kinetic_v0.3.json | 0.3 | draft |
| TK03 | apple-glass | tokens/TOKEN_03_apple-glass_v0.3.json | 0.3 | draft |
| TK04 | kaca-gelap | tokens/TOKEN_04_kaca-gelap_v0.3.json | 0.3 | draft |
| TK05 | arang-lime | tokens/TOKEN_05_arang-lime_v0.3.json | 0.3 | draft |
| TK06 | rts-modern | tokens/TOKEN_06_rts-modern_v0.3.json | 0.3 | draft |
| TK07 | paper-motion | tokens/TOKEN_07_paper-motion_v0.3.json | 0.3 | draft |
| TK08 | minimalism | tokens/TOKEN_08_minimalism_v0.3.json | 0.3 | draft |
| TK09 | retro-brutalism | tokens/TOKEN_09_retro-brutalism_v0.3.json | 0.3 | draft |
| TK10 | kertas-tipografi | tokens/TOKEN_10_kertas-tipografi_v0.3.json | 0.3 | draft |
| TK11 | kolase-kertas | tokens/TOKEN_11_kolase-kertas_v0.3.json | 0.3 | draft |
| TK12 | doodle-art | tokens/TOKEN_12_doodle-art_v0.3.json | 0.3 | draft |
| TK13 | sketch-art | tokens/TOKEN_13_sketch-art_v0.3.json | 0.3 | draft |
| TK14 | coffee-lofi | tokens/TOKEN_14_coffee-lofi_v0.3.json | 0.3 | draft |

## Konteks (aturan teknis universal)
| ID | Nama pendek | File | Versi | Status |
|---|---|---|---|---|
| K00 | zona-aman | konteks/KONTEKS_00_zona-aman_v0.2.md | 0.2 | draft |
| K01 | caption | konteks/KONTEKS_01_caption_v0.2.md | 0.2 | draft |
| K02 | depth-typography | konteks/KONTEKS_02_depth-typography_v0.2.md | 0.2 | draft |
| K03 | parallax-push | konteks/KONTEKS_03_parallax-push_v0.1.md | 0.1 | draft |
| K04 | ingest | konteks/KONTEKS_04_ingest_v0.1.md | 0.1 | draft |
| K05 | gerak | konteks/KONTEKS_05_gerak_v0.2.md | 0.2 | draft |
| K06 | audio | konteks/KONTEKS_06_audio_v0.1.md | 0.1 | draft |
| K07 | ekspor | konteks/KONTEKS_07_ekspor_v0.1.md | 0.1 | draft |
| K08 | sound-design | konteks/KONTEKS_08_sound-design_v0.1.md | 0.1 | draft |
| K09 | koreografi | konteks/KONTEKS_09_koreografi_v0.2.md | 0.2 | draft |
| K10 | menyatu | konteks/KONTEKS_10_menyatu_v0.1.md | 0.1 | draft |

## Gaya (tokens + konteks)
Contoh visual tiap gaya: `video.py katalog` → [gaya/katalog/katalog.png](gaya/katalog/katalog.png).

| ID | Nama pendek | Ciri pengenal | File | Versi | Status | Tokens | Konteks | Contoh |
|---|---|---|---|---|---|---|---|---|
| G01 | glass-tech | kaca gelap biru, cyan, presisi | gaya/GAYA_01_glass-tech_v0.6.md | 0.6 | draft | TK00, TK01 | K00, K01, K02, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/glass-tech.png) |
| G02 | bold-kinetic | teks menghentak, kuning, cepat | gaya/GAYA_02_bold-kinetic_v0.6.md | 0.6 | draft | TK00, TK02 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/bold-kinetic.png) |
| G03 | apple-glass | kaca terang, biru sistem, halus | gaya/GAYA_03_apple-glass_v0.5.md | 0.5 | draft | TK00, TK03 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/apple-glass.png) |
| G04 | kaca-gelap | kaca berasap, amber, pelan | gaya/GAYA_04_kaca-gelap_v0.5.md | 0.5 | draft | TK00, TK04 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/kaca-gelap.png) |
| G05 | arang-lime | arang, lime, geser cepat | gaya/GAYA_05_arang-lime_v0.5.md | 0.5 | draft | TK00, TK05 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/arang-lime.png) |
| G06 | rts-modern | HUD taktis, mono, neon hijau | gaya/GAYA_06_rts-modern_v0.5.md | 0.5 | draft | TK00, TK06 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/rts-modern.png) |
| G07 | paper-motion | kertas krem, memantul, ramah | gaya/GAYA_07_paper-motion_v0.5.md | 0.5 | draft | TK00, TK07 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/paper-motion.png) |
| G08 | minimalism | putih lapang, satu aksen, fade pelan | gaya/GAYA_08_minimalism_v0.5.md | 0.5 | draft | TK00, TK08 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/minimalism.png) |
| G09 | retro-brutalism | bayangan keras, garis hitam, potong patah | gaya/GAYA_09_retro-brutalism_v0.5.md | 0.5 | draft | TK00, TK09 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/retro-brutalism.png) |
| G10 | kertas-tipografi | serif editorial, gading, merah tua | gaya/GAYA_10_kertas-tipografi_v0.5.md | 0.5 | draft | TK00, TK10 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/kertas-tipografi.png) |
| G11 | kolase-kertas | kolase zine, slab serif, jatuh | gaya/GAYA_11_kolase-kertas_v0.5.md | 0.5 | draft | TK00, TK11 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/kolase-kertas.png) |
| G12 | doodle-art | tulisan tangan, garis spidol, memantul | gaya/GAYA_12_doodle-art_v0.5.md | 0.5 | draft | TK00, TK12 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/doodle-art.png) |
| G13 | sketch-art | pensil grafit, garis tipis, biru pensil | gaya/GAYA_13_sketch-art_v0.5.md | 0.5 | draft | TK00, TK13 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/sketch-art.png) |
| G14 | coffee-lofi | cokelat kopi, karamel, santai | gaya/GAYA_14_coffee-lofi_v0.5.md | 0.5 | draft | TK00, TK14 | K00, K01, K03, K04, K05, K06, K07, K08, K09 | [png](gaya/katalog/coffee-lofi.png) |

## Template (struktur cerita)
| ID | Nama pendek | File | Versi | Status | Durasi | Rasio |
|---|---|---|---|---|---|---|
| T01 | explainer | template/TEMPLATE_01_explainer_v0.2.md | 0.2 | draft | 60–90 s | 556 |
| T02 | hook-problem-solution | template/TEMPLATE_02_hook-problem-solution_v0.2.md | 0.2 | draft | 30–45 s | 556 |

## Efek (pola motion per beat — dipakai lewat `"efek": "<nama>"` di beat-sheet)
Dukungan: semua `native` (Remotion atau render.py); klip AI/AE dari Prompt modul tetap bisa dipakai sebagai `broll` + `file`.
Panduan umum & perbandingan dengan aturan sistem: [efek/README.md](efek/README.md).
**Pratinjau tiap efek:** `efek/pratinjau/<efek>.gif` · `.png` — buat ulang: `video.py pratinjau-efek [efek]` (dipakai katalog web Vorta lewat `build_katalog.py`).

| ID | Nama pendek | File | Versi | Status | Durasi | Dukungan |
|---|---|---|---|---|---|---|
| E01 | orbit | efek/EFEK_01_orbit_v0.2.md | 0.2 | draft | 3–5 s | native (Remotion) |
| E02 | couch-wall | efek/EFEK_02_couch-wall_v0.2.md | 0.2 | draft | narasi | native (Remotion) |
| E03 | ui-world | efek/EFEK_03_ui-world_v0.2.md | 0.2 | draft | 4–6 s | native (Remotion) |
| E04 | frame-break | efek/EFEK_04_frame-break_v0.2.md | 0.2 | draft | 1,5–3 s | native (render.py) |
| E05 | digital-zoom | efek/EFEK_05_digital-zoom_v0.2.md | 0.2 | draft | 1–2 s | native (render.py) |
| E06 | phone-mockup | efek/EFEK_06_phone-mockup_v0.2.md | 0.2 | draft | 3–6 s | native (render.py) |
| E07 | checklist | efek/EFEK_07_checklist_v0.3.md | 0.3 | draft | 0,6–1 s/item | native (Remotion) |
| E08 | headline-wall | efek/EFEK_08_headline-wall_v0.2.md | 0.2 | draft | 3–5 s | native (Remotion) |
| E09 | zoom-through-cut | efek/EFEK_09_zoom-through-cut_v0.2.md | 0.2 | draft | 0,6–1,2 s | native (render.py) |
| E10 | chart-grow | efek/EFEK_10_chart-grow_v0.2.md | 0.2 | draft | 3–6 s | native (Remotion) |
| E11 | pull-back-reveal | efek/EFEK_11_pull-back-reveal_v0.2.md | 0.2 | draft | 3–5 s | native (render.py) |
| E12 | green-screen | efek/EFEK_12_green-screen_v0.2.md | 0.2 | draft | narasi | native (render.py) |
| E13 | paper-cut | efek/EFEK_13_paper-cut_v0.2.md | 0.2 | draft | 3–5 s | native (Remotion) |
| E14 | doodle-boil | efek/EFEK_14_doodle-boil_v0.2.md | 0.2 | draft | narasi | native (Remotion) |
| E15 | vertigo | efek/EFEK_15_vertigo_v0.2.md | 0.2 | draft | 2–4 s | native (render.py) |
| E16 | cover-story | efek/EFEK_16_cover-story_v0.2.md | 0.2 | draft | 3–4 s | native (Remotion) |
| E17 | glass-type | efek/EFEK_17_glass-type_v0.2.md | 0.2 | draft | 2–4 s | native (Remotion) |
| E18 | prompt-ui | efek/EFEK_18_prompt-ui_v0.1.md | 0.1 | draft | ikut panjang teks | native (Remotion) |
| E19 | penghitung | efek/EFEK_19_penghitung_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E20 | terminal | efek/EFEK_20_terminal_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E21 | coret | efek/EFEK_21_coret_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E22 | timeline | efek/EFEK_22_timeline_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E23 | grid-variasi | efek/EFEK_23_grid-variasi_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E24 | form-ganti | efek/EFEK_24_form-ganti_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E25 | partikel | efek/EFEK_25_partikel_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E26 | blur-zoom | efek/EFEK_26_blur-zoom_v0.2.md | 0.2 | draft | 0,5 s | native (render.py, tipe transisi) |
| E27 | aksen-gaya | efek/EFEK_27_aksen-gaya_v0.1.md | 0.1 | draft | 1.2–1.8 s | native (Remotion) |
| E28 | whip | efek/EFEK_28_whip_v0.1.md | 0.1 | draft | transisi | native (render.py, tipe transisi) |
| E29 | glitch | efek/EFEK_29_glitch_v0.1.md | 0.1 | draft | transisi | native (render.py, tipe transisi) |
| E30 | celup | efek/EFEK_30_celup_v0.1.md | 0.1 | draft | transisi | native (render.py, tipe transisi) |
| E31 | judul-gaya | efek/EFEK_31_judul-gaya_v0.1.md | 0.1 | draft | ikut judul | native (Remotion, otomatis untuk judul) |
| E32 | lower-third | efek/EFEK_32_lower-third_v0.1.md | 0.1 | draft | 2.5–5 s | native (Remotion) |
| E33 | langkah | efek/EFEK_33_langkah_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E34 | sebelum-sesudah | efek/EFEK_34_sebelum-sesudah_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E35 | callout | efek/EFEK_35_callout_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E36 | linimasa | efek/EFEK_36_linimasa_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E37 | liquid-glass | efek/EFEK_37_liquid-glass_v0.1.md | 0.1 | draft | 2–6 s | native (Remotion) |
| E38 | frame-escape | efek/EFEK_38_frame-escape_v0.1.md | 0.1 | draft | 2.5–5 s | native (render.py) |
| E39 | snap-zoom | efek/EFEK_39_snap-zoom_v0.1.md | 0.1 | draft | 0.8–2.5 s | native (render.py) |
| E40 | checklist-pop | efek/EFEK_40_checklist-pop_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E41 | headline-storm | efek/EFEK_41_headline-storm_v0.1.md | 0.1 | draft | 3–5 s | native (Remotion) |
| E42 | zoom-portal | efek/EFEK_42_zoom-portal_v0.1.md | 0.1 | draft | transisi | native (render.py) |
| E43 | growth-curve | efek/EFEK_43_growth-curve_v0.1.md | 0.1 | draft | ikut jadwal | native (Remotion) |
| E44 | studio-reveal | efek/EFEK_44_studio-reveal_v0.1.md | 0.1 | draft | 3–6 s | native (render.py + Remotion) |
| E45 | broll-overlay | efek/EFEK_45_broll-overlay_v0.1.md | 0.1 | draft | ikut jadwal | native (render.py) |
| E46 | paper-cutout | efek/EFEK_46_paper-cutout_v0.1.md | 0.1 | draft | 2–6 s | native (render.py) |
| E47 | layer-explosion | efek/EFEK_47_layer-explosion_v0.1.md | 0.1 | draft | 3–6 s | native (Remotion) |
| E48 | validasi-badge | efek/EFEK_48_validasi-badge_v0.1.md | 0.1 | draft | 1.5–4 s | native (Remotion) |
| E49 | chat-window | efek/EFEK_49_chat-window_v0.1.md | 0.1 | draft | 2.5–6 s | native (Remotion) |
| E50 | split-explainer | efek/EFEK_50_split-explainer_v0.1.md | 0.1 | draft | 3–8 s | native (Remotion) |
| E51 | kinetik-kata | efek/EFEK_51_kinetik-kata_v0.1.md | 0.1 | draft | ikut ucapan | native (Remotion) |
| E52 | lintasan | efek/EFEK_52_lintasan_v0.1.md | 0.1 | draft | 3.2–6 s | native (Remotion) |
| E53 | dua-linimasa | efek/EFEK_53_dua-linimasa_v0.1.md | 0.1 | draft | 3.4–6 s | native (Remotion) |
| E54 | bab-baru | efek/EFEK_54_bab-baru_v0.1.md | 0.1 | draft | 3.6–7 s | native (Remotion) |
| E55 | zoom-potong | efek/EFEK_55_zoom-potong_v0.1.md | 0.1 | draft | per kalimat | native (otomatis) |

## Koreografi (urutan perangkat motion per fungsi isi — dipakai preset; aturan ritme K09)
Preset = gaya × koreografi. Koreografi menentukan perangkat tiap bagian (+ `fungsi`), template, kebutuhan footage, musik.

| ID | Nama pendek | Label | Template | Footage | Variasi min | File | Versi | Status |
|---|---|---|---|---|---|---|---|---|
| KR01 | bukti-sosial | Bukti Sosial · Motion Graphics 35–40 s | hook-problem-solution | tidak (musik bawaan) | 6 | koreografi/KOREO_01_bukti-sosial_v0.3.json | 0.3 | draft |
| KR02 | kata-prompt | Kata Prompt · Talking Head 30–40 s | hook-problem-solution | ya | 5 | koreografi/KOREO_02_kata-prompt_v0.3.json | 0.3 | draft |
| KR03 | tutorial-langkah | Tutorial Langkah · Talking Head 60–75 s | explainer | ya | 6 | koreografi/KOREO_03_tutorial-langkah_v0.3.json | 0.3 | draft |
| KR04 | mitos-fakta | Mitos vs Fakta · Talking Head 35–40 s | hook-problem-solution | ya | 5 | koreografi/KOREO_04_mitos-fakta_v0.3.json | 0.3 | draft |
| KR05 | minimal-quote | Minimal Quote · Talking Head 30–40 s | hook-problem-solution | ya | 4 | koreografi/KOREO_05_minimal-quote_v0.3.json | 0.3 | draft |

## Preset (resep siap pilih = gaya + template + efek + manifest + beat-sheet awal)
Pilih saat membuat proyek: `video.py baru <nama> --preset <nama-pendek>`. Lihat semua: `video.py preset` (per gaya: `video.py preset <gaya>`).
Preset hanya titik awal — setelah proyek dibuat, manifest & beat-sheet milik proyek dan bebas diubah.

**Pratinjau tiap preset:** `preset/pratinjau/<preset>.mp4` (dengan suara) · `.gif` · `.png` · `.kontak.png` (frame per beat + kotak perangkat) · `.json` (perangkat terpilih) — buat ulang: `video.py pratinjau [preset] [--seed N]`.
**Varian:** koreografi ber-slot → tiap preset bisa dirakit ulang dengan seed lain (`video.py varian <preset> --n 5`).
**Referensi:** analisis video contoh → `referensi/<nama>/` (`video.py referensi <video>`): segmen, gerak, teks, wajah, tebakan slot, draf koreografi.

**Pola nama: `<gaya>-<koreografi>`** — kata pertama = tampilan (katalog gaya), sisanya = koreografi (urutan perangkat). Dicek `video.py cek`.

| Format | Template | Isi |
|---|---|---|
| tips | hook-problem-solution | 30–45 s, satu masalah + satu jawaban |
| explainer | explainer | 60–90 s, 2–3 poin + ringkasan |
| teks | hook-problem-solution | tanpa footage, latar warna + musik |
| depth | explainer | explainer + teks raksasa di belakang subjek (roto) |
| produk · sorotan · data · cerita | — | kombinasi efek eksternal/sebagian; butuh aset buatan (aset/PERLU.md) |

| ID | Nama pendek | Label | Template | Efek | Butuh | File | Versi | Status |
|---|---|---|---|---|---|---|---|---|
| **G01** | **glass-tech** | *kaca gelap biru, cyan, presisi* | | | | | | |
| PR23 | glass-tech-bukti-sosial | Glass Tech · Bukti Sosial · Motion Graphics 35–40 s | hook-problem-solution | penghitung, partikel, blur-zoom, coret, timeline, terminal, form-ganti, grid-variasi | remotion | preset/PRESET_23_glass-tech-bukti-sosial_v0.1.json | 0.1 | draft |
| PR24 | glass-tech-tutorial-langkah | Glass Tech · Tutorial Langkah · Talking Head 60–75 s | explainer | blur-zoom, terminal, timeline, checklist, partikel | rekaman, remotion | preset/PRESET_24_glass-tech-tutorial-langkah_v0.1.json | 0.1 | draft |
| **G02** | **bold-kinetic** | *teks menghentak, kuning, cepat* | | | | | | |
| PR25 | bold-kinetic-mitos-fakta | Bold Kinetic · Mitos vs Fakta · Talking Head 35–40 s | hook-problem-solution | blur-zoom, coret, penghitung, partikel | rekaman, remotion | preset/PRESET_25_bold-kinetic-mitos-fakta_v0.1.json | 0.1 | draft |
| PR26 | bold-kinetic-bukti-sosial | Bold Kinetic · Bukti Sosial · Motion Graphics 35–40 s | hook-problem-solution | penghitung, partikel, blur-zoom, coret, timeline, terminal, form-ganti, grid-variasi | remotion | preset/PRESET_26_bold-kinetic-bukti-sosial_v0.1.json | 0.1 | draft |
| **G03** | **apple-glass** | *kaca terang, biru sistem, halus* | | | | | | |
| PR27 | apple-glass-kata-prompt | Apple Glass · Kata Prompt · Talking Head 30–40 s | hook-problem-solution | prompt-ui, blur-zoom, coret, partikel | rekaman, remotion | preset/PRESET_27_apple-glass-kata-prompt_v0.1.json | 0.1 | draft |
| **G04** | **kaca-gelap** | *kaca berasap, amber, pelan* | | | | | | |
| PR28 | kaca-gelap-mitos-fakta | Kaca Gelap · Mitos vs Fakta · Talking Head 35–40 s | hook-problem-solution | blur-zoom, coret, penghitung, partikel | rekaman, remotion | preset/PRESET_28_kaca-gelap-mitos-fakta_v0.1.json | 0.1 | draft |
| **G05** | **arang-lime** | *arang, lime, geser cepat* | | | | | | |
| PR29 | arang-lime-tutorial-langkah | Arang Lime · Tutorial Langkah · Talking Head 60–75 s | explainer | blur-zoom, terminal, timeline, checklist, partikel | rekaman, remotion | preset/PRESET_29_arang-lime-tutorial-langkah_v0.1.json | 0.1 | draft |
| **G06** | **rts-modern** | *HUD taktis, mono, neon hijau* | | | | | | |
| PR30 | rts-modern-bukti-sosial | RTS Modern · Bukti Sosial · Motion Graphics 35–40 s | hook-problem-solution | penghitung, partikel, blur-zoom, coret, timeline, terminal, form-ganti, grid-variasi | remotion | preset/PRESET_30_rts-modern-bukti-sosial_v0.1.json | 0.1 | draft |
| **G07** | **paper-motion** | *kertas krem, memantul, ramah* | | | | | | |
| PR31 | paper-motion-tutorial-langkah | Paper Motion · Tutorial Langkah · Talking Head 60–75 s | explainer | blur-zoom, terminal, timeline, checklist, partikel | rekaman, remotion | preset/PRESET_31_paper-motion-tutorial-langkah_v0.1.json | 0.1 | draft |
| **G08** | **minimalism** | *putih lapang, satu aksen, fade pelan* | | | | | | |
| PR32 | minimalism-minimal-quote | Minimalism · Minimal Quote · Talking Head 30–40 s | hook-problem-solution | — | rekaman | preset/PRESET_32_minimalism-minimal-quote_v0.1.json | 0.1 | draft |
| **G09** | **retro-brutalism** | *bayangan keras, garis hitam, potong patah* | | | | | | |
| PR33 | retro-brutalism-mitos-fakta | Retro Brutalism · Mitos vs Fakta · Talking Head 35–40 s | hook-problem-solution | blur-zoom, coret, penghitung, partikel | rekaman, remotion | preset/PRESET_33_retro-brutalism-mitos-fakta_v0.1.json | 0.1 | draft |
| **G10** | **kertas-tipografi** | *serif editorial, gading, merah tua* | | | | | | |
| PR34 | kertas-tipografi-minimal-quote | Kertas & Tipografi · Minimal Quote · Talking Head 30–40 s | hook-problem-solution | — | rekaman | preset/PRESET_34_kertas-tipografi-minimal-quote_v0.1.json | 0.1 | draft |
| **G11** | **kolase-kertas** | *kolase zine, slab serif, jatuh* | | | | | | |
| PR35 | kolase-kertas-kata-prompt | Kolase Kertas · Kata Prompt · Talking Head 30–40 s | hook-problem-solution | prompt-ui, blur-zoom, coret, partikel | rekaman, remotion | preset/PRESET_35_kolase-kertas-kata-prompt_v0.1.json | 0.1 | draft |
| **G12** | **doodle-art** | *tulisan tangan, garis spidol, memantul* | | | | | | |
| PR36 | doodle-art-kata-prompt | Doodle Art · Kata Prompt · Talking Head 30–40 s | hook-problem-solution | prompt-ui, blur-zoom, coret, partikel | rekaman, remotion | preset/PRESET_36_doodle-art-kata-prompt_v0.1.json | 0.1 | draft |
| **G13** | **sketch-art** | *pensil grafit, garis tipis, biru pensil* | | | | | | |
| PR37 | sketch-art-tutorial-langkah | Sketch Art · Tutorial Langkah · Talking Head 60–75 s | explainer | blur-zoom, terminal, timeline, checklist, partikel | rekaman, remotion | preset/PRESET_37_sketch-art-tutorial-langkah_v0.1.json | 0.1 | draft |
| **G14** | **coffee-lofi** | *cokelat kopi, karamel, santai* | | | | | | |
| PR38 | coffee-lofi-minimal-quote | Coffee Lofi · Minimal Quote · Talking Head 30–40 s | hook-problem-solution | — | rekaman | preset/PRESET_38_coffee-lofi-minimal-quote_v0.1.json | 0.1 | draft |

Nama lama (v0.1, di `arsip/preset/`) tetap bisa di-resolve: tips-kinetic, explainer-glass, explainer-depth, explainer-kinetic,
tips-glass, teks-kinetic, produk-glass, sorotan-kinetic, data-glass, cerita-kinetic.
Semua efek E01–E30 native. Generator slot memilih efek per fungsi sesuai gaya (`gaya_cocok`), seed → varian: `video.py varian <preset>`.

## Pipeline
| ID | Nama pendek | File | Versi | Status |
|---|---|---|---|---|
| S01 | video-editor (skill) | pipeline/skill/SKILL.md (aktif: .claude/skills/video-editor/SKILL.md) | 0.2 | draft |
| P01 | scripts | pipeline/scripts/ (`sistem.VERSI_SCRIPTS`) | 0.6 | draft |
| R01 | remotion | remotion/ (Remotion 4.0.538, React; membaca tokens/ yang sama) | 0.1 | draft |
| L01 | split-layout | pipeline/scripts/split.py + remotion/src/split/ (SplitReel; pustaka adegan: menara-sendiri, tujuan-pengorbanan, perisai-sunyi, siang-malam, timbangan-ragu, jalan-sendiri, puncak-fajar, kartu-akhir) — per proyek `split.json`; hook detik pertama, match cut iris, denyut ketukan, ducking transkrip (`ducking.py`), QA lewat `video.py cek/qa` | 0.2 | draft |
| L02 | panggung | pipeline/scripts/panggung.py + remotion/src/panggung/ (PanggungReel; pustaka adegan pg-portal, pg-sertifikat-kampus, pg-tangga, pg-ukur, pg-orbit, pg-coret, pg-seimbang, pg-kunci, pg-terbang) — per proyek `panggung.json`; frame penuh: latar bersih → grafis belakang → talent roto ber-alpha (mask halus) → grafis depan, kamera virtual + parallax, match cut garis emas, caption pil emas, QA caption vs wajah | 0.1 | draft |

## Proyek
| id | template | gaya | status |
|---|---|---|---|
| 2026-10_skill-vs-sertifikat | hook-problem-solution@0.1 | bold-kinetic@0.1 | brief |
| 2026-10_wa-2026-10-24 | hook-problem-solution@0.2 | glass-tech@0.2 | brief |
| 2026-10_demo-fase1 | hook-problem-solution@0.2 | glass-tech@0.3 | brief |
| 2026-10_demo-fase2 | hook-problem-solution@0.2 | glass-tech@0.3 | brief |
| 2026-10_demo-fase3 | hook-problem-solution@0.2 | kaca-gelap@0.3 | brief |
| 2026-10_otca-sertifikat-jerman | explainer@0.2 | glass-tech@0.5 | brief |
| 2026-10_we-fail-today | explainer@0.2 | glass-tech@0.6 | brief |
| 2026-10_life-isnt-a-race | hook-problem-solution@0.2 | kertas-tipografi@0.5 | selesai v2 |
| 2026-10_otca-garis-emas | explainer@0.2 | glass-tech@0.6 (+ brand OTCA, layout panggung L02) | disetujui |

## Aturan
1. Pola nama: `JENIS_NN_nama-pendek_vX.Y.ext`. Satu nama pendek = satu file aktif.
2. Ketergantungan hanya mengalir ke bawah: tokens → konteks → gaya → (template, efek, pipeline) → preset → proyek.
3. Naik versi: X.Y → X.(Y+1) untuk perubahan kecil; (X+1).0 bila aturan lama tidak lagi cocok.
   File versi lama dipindah ke `arsip/<lapisan>/` (nama file tetap), lalu catat di `arsip/CHANGELOG.md`.
4. `draft` → `stabil` hanya bila bagian "Bukti uji" di modul berisi frame/angka dari proyek nyata.
5. Muncul di ≥2 proyek → promosikan ke template/gaya/konteks. Langkah manual diulang ≥3 kali → jadikan skrip.
6. File/folder berawalan `_` adalah cetakan kosong, bukan modul aktif.
7. Skill diubah di `pipeline/skill/SKILL.md`, lalu disalin ulang ke `.claude/skills/video-editor/SKILL.md`.
8. Preset mengunci versi gaya/template. Gaya/template naik versi → `video.py cek` memberi info → naikkan versi preset bila resepnya ikut diperbarui.
   Kombinasi manual (gaya+template+efek) yang dipakai di ≥2 proyek → jadikan preset baru.
9. Nama preset = `<gaya>-<format>` + field `label` (nama tampilan). Gaya baru → tambah `ciri` & `teks_di_video` di frontmatter,
   jalankan `video.py katalog <gaya>`, daftarkan gaya di `gaya_cocok` template.
