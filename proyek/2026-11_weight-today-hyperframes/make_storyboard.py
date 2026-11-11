from pathlib import Path
import json,html,hashlib
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;O=P/'out'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
d=read(P/'beat-sheet.json');m=read(P/'manifest.json');speech=read(P/'cache/words.json');report=read(O/'hyperframes-check.json')
d['beats'][2]['action']='Cutback ke wajah dalam bingkai besar. Penekanan strong menjadi kontras dengan ucapan exhausted; beri ruang pada ekspresi, tanpa dekorasi yang mengalihkan perhatian.'
d['beats'][8]['action']='Kembali ke wajah dengan judul One step dan That’s enough. Tahan ekspresi serta caption akhir; tanpa CTA tambahan.'
for b in d['beats']:
    if b['id']=='today':b['action']='TODAY berada di depan, TOMORROW lebih jauh. Penanda bergerak dari hari esok menuju hari ini. Teks kalimat telah dikonfirmasi pengguna; waktu don’t perlu dicek pada playback.'
(P/'beat-sheet.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
frames=read(O/'snapshots-r1.json')['frames'][:9]
frames[0]['path']=str(O/'opening-r1/frame-01-at-3.5s.png')
font=ImageFont.truetype(str(P.parents[1]/'pipeline/fonts/FRAHV.TTF'),18)
sheet=Image.new('RGB',(990,1896),'#15271F');draw=ImageDraw.Draw(sheet)
for i,f in enumerate(frames):
    im=Image.open(f['path']).convert('RGB');im.thumbnail((318,565))
    x=12+(i%3)*330;y=36+(i//3)*632
    sheet.paste(im,(x,y));draw.text((x,y-25),f"{i+1:02d}  |  {f['time']:g}s",font=font,fill='#F3EDDC')
sheet.save(O/'storyboard-contact.jpg',quality=92)
cards=[]
for i,(b,f) in enumerate(zip(d['beats'],frames)):
    src=Path(f['path']).relative_to(O).as_posix()
    spoken=' '.join(w['w'] for w in speech['kata'] if b['mulai']<=w['s']<b['selesai'])
    audio='Suara asli; tanpa aksen tambahan pada kalimat personal.' if b['layout']=='portrait' else 'Suara asli; usulan ketuk kertas tipis saat aksi utama, belum dicampur.'
    cards.append(f'<article><a href="{src}"><img src="{src}" alt="Adegan {i+1}"></a><div class="copy"><small>{b["mulai"]:.2f}–{b["selesai"]:.2f} s · {b["layout"].upper()}</small><h2>{html.escape(b["title"]+" "+b["emphasis"])}</h2><p>{html.escape(b["action"])}</p><blockquote>{html.escape(spoken)}</blockquote><p class="note">{audio}</p></div></article>')
phase_names=['frame-10-at-5.2s.png','frame-11-at-6.8s.png','frame-01-at-8.8s.png','frame-13-at-37.6s.png','frame-07-at-39.6s.png','frame-14-at-40.5s.png']
phase=''.join(f'<a href="stills-r1/{n}"><img src="stills-r1/{n}" alt="Fase aksi"></a>' for n in phase_names)
doc='''<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WEIGHT TODAY — Storyboard R1</title><style>
*{box-sizing:border-box}body{margin:0;background:#15271f;color:#f3eddc;font:17px/1.55 system-ui,sans-serif}main{max-width:1260px;margin:auto;padding:42px 24px}header{max-width:920px;margin-bottom:36px}h1{font-size:clamp(36px,5vw,66px);line-height:1.05;margin:15px 0}a{color:#e8bf47}small,.note{opacity:.75}p{margin:12px 0}.badge{display:inline-block;background:#e8bf47;color:#15271f;padding:7px 12px;font-weight:750}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}article{background:#213f32;border:1px solid #52745d}article img{display:block;width:100%}.copy{padding:22px}h2{font-size:25px;line-height:1.15}blockquote{border-left:3px solid #e8bf47;margin:20px 0;padding-left:12px;font-size:15px}.phases{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.phases img{width:100%}.panel{margin:35px 0;padding:25px;background:#213f32}.note{font-size:14px}audio{width:100%;max-width:650px}li{margin-bottom:8px}@media(max-width:850px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.grid{grid-template-columns:1fr}.phases{grid-template-columns:repeat(2,1fr)}}
</style></head><body><main><header><span class="badge">R1 · MENUNGGU PERSETUJUAN STORYBOARD</span><h1>Some days feel heavy.</h1><p>WEIGHT TODAY · 46,57 detik · 1080×1920 · 30 fps · HyperFrames 0.9.33</p><p>Kolase hijau–gading dengan tipografi editorial. Bingkai talent dari referensi kedua dipadukan dengan grafis penjelas dan cutback dari referensi pertama. Semua gambar di bawah adalah still komposisi HyperFrames, bukan mockup.</p><p><a href="analisis.md">Analisis ketiga video</a> · <a href="qa-storyboard.md">QA dan batas verifikasi</a> · <a href="../naskah.md">Transkrip kerja</a> · <a href="storyboard-contact.jpg">Lembar ringkas 9 adegan</a></p></header><section class="grid">'''+''.join(cards)+'''</section><section class="panel"><h2>Perkembangan aksi</h2><p>Tiga fase beban bertambah, lalu tiga fase fokus kembali ke hari ini. Ini bukti posisi dan komposisi; keluwesan serta ritme belum dinilai lewat playback.</p><div class="phases">'''+phase+'''</div></section><section class="panel"><h2>Subtitle full dan split</h2><p>Full: adegan 6 pada 29,5 s memperlihatkan frasa panjang dua baris. Split: adegan 2 dan 5 memperlihatkan caption di lajur terpisah di bawah bingkai talent. Font, warna aktif, dan lajur tetap konsisten.</p><h2>Audio sumber</h2><audio controls preload="none" src="../hyperframes/assets/source.mp4"></audio><p class="note">Pemutar ini adalah audio sumber, bukan hasil mix. Musik tambahan belum dipasang. Usulan SFX ketuk kertas hanya pada empat aksen; kalimat personal dibiarkan tenang. Loudness final ditargetkan −14 LUFS / −2 dBTP setelah produksi disetujui.</p></section><section class="panel"><h2>Status QA</h2><p>Pemeriksaan HyperFrames: 0 error, 0 warning. Still seluruh adegan, caption panjang, dan fase aksi telah ditinjau. Brand resmi NAZARVERSE belum terverifikasi karena guideline tidak tersedia; palet ini usulan dari referensi.</p><p>Belum diverifikasi: playback artistik, sinkron kata tambahan “don’t”, mix/loudness dan encoding final. Tidak ada render final atau persetujuan otomatis.</p><h2>Untuk ditinjau</h2><p>Arah visual hijau–gading, framing talent, pilihan full/split, judul, dan makna ilustrasi. Konfirmasi kalimat 35–41 detik sudah dimasukkan. Persetujuan desain disampaikan di chat.</p></section></main></body></html>'''
(O/'storyboard.html').write_text(doc,encoding='utf-8')
sha=hashlib.sha256((P/'hyperframes/index.html').read_bytes()).hexdigest()
qa=f'''# QA storyboard WEIGHT TODAY — R1

Status: SIAP DITINJAU. Bukan QA final video. Persetujuan pengguna: belum diberikan.
Engine: HyperFrames 0.9.33. Komposisi SHA256: {sha}.

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
'''
(O/'qa-storyboard.md').write_text(qa,encoding='utf-8')
print('Storyboard, contact sheet and QA written.')
