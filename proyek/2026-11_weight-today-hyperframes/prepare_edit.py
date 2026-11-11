from pathlib import Path
import json
P=Path(__file__).parent
if (P/'manifest.json').exists():
    raise SystemExit('Project already exists. Edit its data files; do not overwrite reviewed words or choreography.')
def save(name,data): (P/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
speech=json.loads((P/'cache/source-speech.json').read_text(encoding='utf-8'))
save('cache/words.json',speech)
scenes=[
 ('hook',0,4.15,'portrait','Some days feel','heavy.','Beban dikenalkan lewat kata heavy turun dan frame merespons sedikit; wajah menjadi pusat emosi.'),
 ('load',4.15,12.8,'split','So much to','carry.','Tiga lembar responsibilities, expectations, future mendarat pada baki; baki turun bertahap. Talent tetap terlihat.'),
 ('honest',12.8,18.55,'portrait','Trying to stay','strong.','Kembali ke talent dalam bingkai besar. Garis tegak kuat berubah menjadi dua garis pendek saat exhausted; tahan ekspresi.'),
 ('release',18.55,23.1,'full','Not everything.','Not today.','Tumpukan kartu membuka ruang; satu lembar TODAY maju, lembar lain bergeser terpisah. Bukan daftar tugas baru.'),
 ('pause',23.1,26.55,'split','Take a','break.','Dua batang pause menapak; garis terburu-buru berhenti di depan simbol. Gerak melambat mengikuti slow down.'),
 ('tired',26.55,30.95,'full','Tired ≠','weak.','Kartu TIRED dan WEAK dipisahkan garis tidak sama dengan yang tergambar; penguatan makna tanpa klaim energi kuantitatif.'),
 ('rest',30.95,35.25,'split','A break ≠','giving up.','Jalur terputus oleh tempat istirahat lalu berlanjut; penanda berhenti sebentar, bukan jatuh keluar jalur.'),
 ('today',35.25,42.05,'full','One day.','At a time.','Lembar TODAY berada di depan; TOMORROW lebih jauh. Penanda kembali fokus pada TODAY; caption segmen ini perlu konfirmasi transkrip.'),
 ('step',42.05,46.566,'portrait','One step.','That’s enough.','Tiga batu pijakan sederhana; hanya pijakan pertama menerima penanda. Cutback ke wajah, tahan akhir tanpa CTA tambahan.')]
beats=[]
for i,(id,s,e,layout,title,emphasis,action) in enumerate(scenes):
    beats.append(dict(id=id,mulai=s,selesai=e,layout=layout,title=title,emphasis=emphasis,action=action,hero=round(min(e-.5,s+1.65),2),fungsi='hook' if i==0 else 'ajakan' if i==8 else 'konteks',transition='paper-cover' if i else None))
save('beat-sheet.json',{'version':'r1','caption':{'language':'en','max_words':5,'font_size':54},'beats':beats})
save('manifest.json',{'proyek':P.name,'judul':'WEIGHT TODAY','status':'storyboard-draft','engine':'hyperframes','engine_version':'0.9.33','persetujuan':None,'duration':46.566,'width':1080,'height':1920,'fps':30,'aset':{'rekaman':'aset/rekaman/take1.mp4'},'palette':{'green':'#213F32','paper':'#F3EDDC','yellow':'#E8BF47','brown':'#946448','ink':'#15271F'},'fonts':{'sans':'Franklin Heavy','serif':'DM Serif'},'safe':{'left':60,'right':120,'top':250,'bottom':400},'modules':['G11@0.5 (adapted)','T02@0.2 (source narration retained)','K00@0.2','K01@0.2','K05@0.2','K09@0.2','K11@0.1','K12@0.1','K13@0.1','K14@0.1'],'audio':{'source_retained':True,'target_lufs':-14,'true_peak':-2,'music':'none in r1; preserve source while checking speech'},'transcript_review':{'corrected':False,'uncertain':'35.31–41.09: You [don’t?] have to carry tomorrow’s [weight?]'}})
(P/'naskah.md').write_text('# Transkrip mesin — belum dikoreksi pengguna\n\n'+ '\n\n'.join(f"{s['s']:.2f}–{s['e']:.2f}: {s['text'].strip()}" for s in speech['segments'])+'\n\nPERIKSA 35.31–41.09: transkrip mesin kemungkinan keliru pada negasi dan weight. Jangan kunci caption final tanpa verifikasi.\n',encoding='utf-8')
