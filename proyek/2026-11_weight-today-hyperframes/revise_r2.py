from pathlib import Path
import json,shutil
P=Path(__file__).parent
def read(n):return json.loads((P/n).read_text(encoding='utf-8'))
d=read('beat-sheet.json');m=read('manifest.json')
if d.get('version')=='r2':raise SystemExit('R2 already configured; edit data directly.')
archive=P/'out/r1';archive.mkdir(exist_ok=True)
for n in ['storyboard.html','qa-storyboard.md','storyboard-contact.jpg']:
    if (P/'out'/n).exists():shutil.copy2(P/'out'/n,archive/n)
shutil.copy2(P/'beat-sheet.json',P/'beat-sheet-r1.json')
labels=['Heavy days.','A lot to carry.','Still trying.','Make some space.','Take a break.','Tired is not weak.','Rest. Then continue.','Just today.','One step is enough.']
actions=[
'Beban logam menggantung dan turun; garis penahan merespons. Talent cutout besar di kanan, tanpa ruangan asli.',
'Beban datang bergiliran ke kedua mangkuk timbangan; batang miring lalu pulih sebagian. Talent cutout kecil mendampingi.',
'Tali tertarik oleh beban, melengkung dan mereda. Talent cutout asimetris memberi ruang pada ekspresi lelah.',
'Tas membuka tutup; dua beban dikeluarkan dan badan tas naik sedikit. Suara tetap berjalan di grafis penuh.',
'Bangku hadir sebagai tempat jeda. Jarum jam melambat; daun mengikuti gerak sisa kecil. Talent cutout menjadi pendamping.',
'Tanaman menekuk oleh hembusan dan pulih; akarnya tetap tertanam. Metafora lelah tanpa menyamakan lelah dengan lemah.',
'Sepasang jejak mengikuti jalur, berhenti di bangku, lalu melanjutkan. Grafis penuh tanpa headline panjang.',
'Lembar TOMORROW dibuka ke samping, memperlihatkan TODAY; satu area hari ini ditandai. Label singkat saja.',
'Satu pasang jejak mendarat di batu pertama; batu berikutnya tetap tenang. Cutout talent dan senyum menutup narasi.']
for b,l,ac in zip(d['beats'],labels,actions):b.update(label=l,action=ac)
d['beats'][6]['layout']='full';d['version']='r2';d['motion']=[]
def add(method,target,vars,at):d['motion'].append(dict(method=method,target=target,vars=vars,at=at))
for i,b in enumerate(d['beats']):
    id=b['id'];s=b['mulai'];t=s+.18
    add('from',f'#scene-{id} .title',dict(x=-18,opacity=0 if i else 1,duration=.45,ease='power3.out'),t)
    add('from',f'#graphic-{id}',dict(y=20,opacity=0,duration=.65,ease='sine.out'),t+.07)
    if b['layout']!='full':add('from',f'#frame-{id}',dict(y=35,opacity=0,duration=.8,ease='power2.out'),t+.12)
    if i:
        old=d['beats'][i-1]['id'];add('set','#wipe',dict(x=-1080),s-.26);add('to','#wipe',dict(x=0,duration=.26,ease='power3.inOut'),s-.26)
        add('set',f'#scene-{old}',dict(opacity=0),s);add('set',f'#scene-{id}',dict(opacity=1),s);add('to','#wipe',dict(x=1080,duration=.32,ease='power3.inOut'),s+.01)
add('from','#hook-weight',dict(y=-90,duration=1.1,ease='power3.out'),.45)
add('to','#hook-pressure',dict(scaleY=.65,transformOrigin='50% 50%',duration=.5,ease='sine.inOut'),1.35)
add('to','#hook-cable',dict(y=10,duration=.38,ease='power2.out'),1.3)
for sel,t in [('#scale-weight-a',4.6),('#scale-weight-b',6.5),('#scale-weight-c',8.2)]:add('from',sel,dict(y=-130,opacity=0,duration=.7,ease='power3.out'),t)
for at,angle in [(5.15,8),(7.05,13),(8.75,-4),(9.8,3)]:add('to','#scale-beam',dict(rotation=angle,svgOrigin='420 180',duration=.65,ease='sine.inOut'),at)
add('to','#rope',dict(attr={'d':'M120 90 Q420 360 720 90'},duration=1.2,ease='power2.inOut'),13.2)
add('to','#rope-weight',dict(y=85,duration=1.2,ease='power2.inOut'),13.2)
add('to','#rope-weight',dict(rotation=-4,transformOrigin='50% 0%',duration=.8,ease='sine.inOut'),15.2)
add('to','#rope-weight',dict(rotation=0,duration=.9,ease='sine.inOut'),16.1)
add('to','#bag-lid',dict(rotation=-115,svgOrigin='260 205',duration=.85,ease='power2.inOut'),19.1)
add('to','#bag-weight-a',dict(x=-180,y=-150,rotation=-12,duration=1.15,ease='power3.inOut'),19.65)
add('to','#bag-weight-b',dict(x=175,y=-110,rotation=15,duration=1.0,ease='power2.inOut'),20.3)
add('to','#bag-body',dict(y=-18,duration=.7,ease='sine.out'),20.95)
add('from','#pause-bench',dict(y=55,duration=.65,ease='power3.out'),23.5)
add('to','#clock-hand',dict(rotation=60,svgOrigin='625 135',duration=1.8,ease='power3.out'),23.6)
add('from','#pause-leaf',dict(rotation=-12,svgOrigin='200 385',duration=1.4,ease='sine.out'),23.7)
add('to','#plant-stem',dict(rotation=-12,svgOrigin='420 410',duration=.7,ease='power2.inOut'),27.0)
add('to','#plant-stem',dict(rotation=3,svgOrigin='420 410',duration=1.1,ease='sine.inOut'),27.8)
add('to','#plant-stem',dict(rotation=0,svgOrigin='420 410',duration=.75,ease='sine.out'),29)
add('from','#plant-wind',dict(x=-80,opacity=0,duration=.55,ease='power2.out'),26.9)
add('to','#rest-walker',dict(x=235,y=-180,duration=1.1,ease='power2.out'),31.2)
add('to','#rest-walker',dict(x=515,y=-350,duration=.95,ease='power2.inOut'),33.7)
add('to','#calendar-page',dict(rotation=-78,x=-135,y=-38,svgOrigin='200 145',duration=1.3,ease='power2.inOut'),36.8)
add('from','#calendar-focus',dict(scale=0,svgOrigin='420 350',duration=.6,ease='back.out(1.1)'),39)
add('from','#step-stones',dict(y=25,opacity=0,duration=.6,ease='power2.out'),42.35)
add('from','#step-mark',dict(y=-130,opacity=0,duration=.8,ease='power3.out'),42.7)
m.update(revision='r2',status='storyboard-revision',persetujuan=None)
m['roto']={'backend':'rvm-plus-portrait-guidance','source_crop':[0,270,478,540],'asset':'hyperframes/assets/talent-r2.webm','approval':'User authorized rotoscope and layout variation; final storyboard approval pending'}
m['direction']='Graphics first: short labels, native illustrated assets dominate, complete spoken captions retained.'
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
(P/'beat-sheet.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
print('R2 data ready')
