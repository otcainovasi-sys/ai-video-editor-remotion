"""Approved R2: restrained action SFX and two-pass delivery loudness."""
from pathlib import Path
import sys,json,hashlib,datetime,subprocess,wave
import numpy as np
P=Path(__file__).parent; ROOT=P.parents[1]
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
import sfx
from sistem import loudnorm_2pass,ukur_loudness
C=P/'cache'; O=P/'out'; SR=48000; D=46.566
m=json.loads((P/'manifest.json').read_text(encoding='utf-8'))
m['persetujuan']={'beat_sheet_sha':hashlib.sha256((P/'beat-sheet.json').read_bytes()).hexdigest(),'composition_sha':hashlib.sha256((P/'hyperframes/index.html').read_bytes()).hexdigest(),'waktu':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat(),'user_message':'ya jalankan render final','storyboard':'out/storyboard-r2.html','revision':'r2'}
m['status']='rendering';m['roto']['approval']='R2 storyboard and final render explicitly approved by user'
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
bus=np.zeros((round(D*SR),2));events=[]
def add(x,t,peak,label):
    x=x/max(np.max(np.abs(x)),1e-9)*10**(peak/20);i=round(t*SR)
    bus[i:i+len(x)]+=x[:len(bus)-i];events.append(dict(time=t,peak_dbfs=peak,label=label))
for k,t in enumerate([5.15,7.05,8.75]):add(sfx._ketuk(k+1),t,-27,'weight contact')
add(sfx._whoosh(1,.65,.45),19.15,-34,'soft bag movement')
add(sfx._ketuk(2),43.35,-29,'single closing step')
with wave.open(str(C/'sfx-r2.wav'),'wb') as w:
    w.setparams((2,2,SR,0,'NONE','not compressed'));w.writeframes((np.clip(bus,-1,1)*32767).astype('<i2').tobytes())
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(P/'aset/rekaman/take1.mp4'),'-i',str(C/'sfx-r2.wav'),'-filter_complex',f'[0:a]aresample=48000,apad,atrim=duration={D}[v];[v][1:a]amix=inputs=2:normalize=0:duration=first,afade=t=in:d=0.015,afade=t=out:st=46.45:d=0.116[a]','-map','[a]','-c:a','pcm_s24le',str(C/'mix-r2.wav')]
subprocess.run(cmd,check=True)
measurement=loudnorm_2pass(C/'mix-r2.wav',C/'master-r2.wav',-14,-2.5,11)
report={'events':events,'pre_normalization':measurement,'master':ukur_loudness(C/'master-r2.wav'),'music':'none; original narration retained'}
(O/'audio-r2.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
