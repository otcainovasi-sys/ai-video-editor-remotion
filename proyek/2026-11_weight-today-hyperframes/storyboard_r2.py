from pathlib import Path
import json,html,hashlib,shutil
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;O=P/'out';ROOT=P.parents[1]
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
d=read(P/'beat-sheet.json');m=read(P/'manifest.json');sp=read(P/'cache/words.json');r=read(O/'hyperframes-check-r2.json')
frames=read(O/'snapshots-r2.json')['frames'][:9]
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/FRAHV.TTF'),18)
sheet=Image.new('RGB',(990,1896),'#15271F');dr=ImageDraw.Draw(sheet)
cards=[]
for i,(b,f) in enumerate(zip(d['beats'],frames)):
    im=Image.open(f['path']).convert('RGB');im.thumbnail((318,565));x=12+i%3*330;y=36+i//3*632;sheet.paste(im,(x,y));dr.text((x,y-25),f"{i+1:02d} | {f['time']:g}s",font=font,fill='#F3EDDC')
    src=Path(f['path']).relative_to(O).as_posix();text=' '.join(w['w'] for w in sp['kata'] if b['mulai']<=w['s']<b['selesai'])
    cards.append(f'<article><a href="{src}"><img src="{src}" alt="Scene {i+1}"></a><div><small>{b["mulai"]:.2f}–{b["selesai"]:.2f}s · {b["layout"]}</small><h2>{html.escape(b["label"])}</h2><p>{html.escape(b["action"])}</p><blockquote>{html.escape(text)}</blockquote></div></article>')
sheet.save(O/'storyboard-r2-contact.jpg',quality=93)
counts={k:{'errors':v.get('errorCount',0),'warnings':v.get('warningCount',0)} for k,v in r.items() if isinstance(v,dict) and 'findings' in v}
errors=sum(v['errors'] for v in counts.values());warnings=sum(v['warnings'] for v in counts.values())
proof=''.join(f'<a href="roto-r2/final-edge-{t}.png"><img src="roto-r2/final-edge-{t}.png" alt="Mask {t}s"></a>' for t in ['16','24.7','44.4'])
doc='''<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WEIGHT TODAY — R2</title><style>
*{box-sizing:border-box}body{margin:0;background:#15271f;color:#f3eddc;font:17px/1.6 system-ui}main{max-width:1260px;margin:auto;padding:40px 24px}header{max-width:900px;margin-bottom:35px}h1{font-size:clamp(34px,5vw,68px);line-height:1.1}a{color:#e8bf47}.tag{display:inline-block;background:#e8bf47;color:#15271f;padding:8px 15px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}article{background:#213f32}article img{width:100%;display:block}article>div{padding:20px}h2{font-size:26px;line-height:1.2}small{color:#bfc9bc}blockquote{margin:20px 0;border-left:3px solid #e8bf47;padding-left:12px;font-size:15px}.panel{padding:26px;background:#213f32;margin-top:30px}.proof img{width:100%;max-width:720px;margin:10px 0}video{width:100%;max-width:480px}li{margin-bottom:8px}@media(max-width:850px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:540px){.grid{grid-template-columns:1fr}}
</style></head><body><main><header><span class="tag">R2 · ROTOSCOPE + GRAPHICS FIRST</span><h1>Lebih banyak cerita melalui gerak.</h1><p>46,57 detik · HyperFrames · 1080×1920 · subtitle mengikuti suara asli.</p><p>Latar ruangan diganti dengan cutout talent. Ilustrasi native mengambil porsi utama: beban, timbangan, tali, tas, bangku/jam, tanaman, jalur, kalender dan batu pijakan. Judul dipangkas menjadi label singkat.</p><p><a href="storyboard-r2-contact.jpg">9 frame ringkas</a> · <a href="qa-storyboard-r2.md">QA R2</a> · <a href="analisis.md">Analisis referensi</a></p></header><section class="grid">'''+''.join(cards)+'''</section><section class="panel"><h2>Close-up mask</h2><p>Hasil di atas latar gelap dan terang. Dua model dipakai: RVM untuk informasi temporal/foreground dan BiRefNet portrait sebagai panduan tepi. Pelacakan gerak dua arah menghubungkan frame panduan. Artefak kecil furnitur yang semula ikut di atas rambut menjadi sasaran koreksi.</p><div class="proof">'''+proof+'''</div><p>Detail rambut tetap dibatasi sumber 478×850. Inspeksi frame dan uji alpha bukan jaminan sempurna pada semua playback.</p></section><section class="panel"><h2>Uji gerak mask</h2><video controls preload="metadata" src="roto-r2/mask-proof.mp4"></video><p>Cuplikan uji mask, bukan render final video. Tanpa audio dan tanpa grafis final.</p></section><section class="panel"><h2>QA & tahap berikutnya</h2><p>HyperFrames: '''+str(errors)+' error, '+str(warnings)+''' warning. Laporan menyimpan hasil terperinci dan batas verifikasi. Mask, komposisi, subtitle, aset, dan fase gerak ditinjau melalui frame; tinjauan playback artistik dan mix audio final masih diperlukan.</p><p>Storyboard R2 menggantikan arah R1. Persetujuan sebelumnya mencakup pembuatan rotoscope dan revisi grafis; persetujuan final desain R2 belum dicatat. Render penuh belum dijalankan.</p><p>Suara asli dipertahankan. Rencana bunyi: ketuk ringan saat beban menyentuh mangkuk, kain saat tas dibuka, dan satu langkah di penutup; bukan bunyi pada setiap objek. Belum dicampur.</p></section></main></body></html>'''
(O/'storyboard-r2.html').write_text(doc,encoding='utf-8');shutil.copy2(O/'storyboard-r2.html',O/'storyboard.html')
qa=f'''# WEIGHT TODAY — QA storyboard R2

Status: untuk tinjauan pengguna; bukan QA final MP4. Engine HyperFrames. Desain final belum disetujui.
Hash komposisi: {hashlib.sha256((P/'hyperframes/index.html').read_bytes()).hexdigest()}.

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
Pemeriksaan HyperFrames: {json.dumps(counts,ensure_ascii=False)}. Bukti hyperframes-check-r2.json.
Alpha: sumber diproses tiap frame dengan recurrent state kontinu; tidak menginterpolasi setiap n frame sebagai pengganti segmentasi. Panduan portrait dilacak optical flow maju/mundur; support edge dilatasi 1 px + sigma .55. Foreground menggunakan estimasi RVM untuk mengurangi sisa warna latar. Asset output lossless VP9 alpha 478×540 dengan crop ruang kosong, 30 fps.
Tidak ada QA ekspor final karena final belum dirender. Target tetap H.264/AAC/bt709, −14 LUFS, −2 dBTP.

## Referensi teknis
- https://github.com/PeterL1n/RobustVideoMatting/blob/master/documentation/inference.md
- pipeline/scripts/roto.py (backend rembg/BiRefNet portrait yang sudah tersedia)
- K02@0.2 tepi mask; K00/K01/K05/K09@0.2; K11–K14@0.1; HyperFrames 0.9.33.

## Upgrade berikutnya
Kurasi timing kontak beban dan jeda bangku pada playback, serta pasang hanya SFX yang membantu aksi. Persetujuan storyboard tetap pengguna.
'''
(O/'qa-storyboard-r2.md').write_text(qa,encoding='utf-8');shutil.copy2(O/'qa-storyboard-r2.md',O/'qa-storyboard.md')
print('R2 storyboard ready',errors,warnings)
