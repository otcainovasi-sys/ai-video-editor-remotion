from pathlib import Path
import json
P=Path(__file__).parent
p=P/'cache/words.json';d=json.loads(p.read_text(encoding='utf-8'))
if not any(w['w']=="don't" and 35<w['s']<36 for w in d['kata']):
    for i,w in enumerate(d['kata']):
        if w['w']=='You' and 35<w['s']<36:
            old_end=w['e'];w['e']=35.43
            d['kata'].insert(i+1,{'w':"don't",'s':35.43,'e':old_end,'p':None,'timing_note':'Estimated subdivision of ASR token; text confirmed by user.'})
            break
for w in d['kata']:
    if 37<w['s']<37.8 and w['w']=='weak':w['w']='weight'
for s in d['segments']:
    if 35<s['s']<36:s['text']="You don't have to carry tomorrow's weight when you're still trying to get through today."
d['_meta']['user_confirmed_segments']=[{'start':35.31,'end':41.09,'text':"You don't have to carry tomorrow's weight when you're still trying to get through today.",'timing_verified':False}]
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
m=json.loads((P/'manifest.json').read_text(encoding='utf-8'));m['transcript_review']={'corrected':False,'confirmed_segment':'35.31–41.09 text confirmed by user; inserted word timing estimated, requires playback review'}
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
(P/'naskah.md').write_text('# Transkrip kerja\n\n'+'\n\n'.join(f"{s['s']:.2f}–{s['e']:.2f}: {s['text'].strip()}" for s in d['segments'])+'\n\nKalimat 35.31–41.09 dikonfirmasi pengguna pada chat ini. Waktu kata tambahan don’t berupa pembagian interval ASR dan belum diuji playback. Segmen lain masih hasil transkripsi otomatis.\n',encoding='utf-8')
