from pathlib import Path
import json,subprocess
import numpy as np
from scipy.signal import correlate,correlation_lags
P=Path(__file__).parent;O=P/'out'
q=json.loads((O/'qa-final-r2.json').read_text())
def envelope(path):
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-vn','-ac','1','-ar','8000','-f','f32le','-'],capture_output=True,check=True).stdout
    a=np.frombuffer(raw,dtype='<f4');a=a[:len(a)//80*80]
    return np.sqrt(np.mean(a.reshape(-1,80)**2,axis=1))
a=envelope(P/'aset/rekaman/take1.mp4');b=envelope(O/'WEIGHT-TODAY-FINAL.mp4');lags=[]
for lo,hi in [(1,12),(34,46)]:
    x=a[lo*100:hi*100];y=b[lo*100:hi*100];x=x-x.mean();y=y-y.mean()
    c=correlate(y,x);ls=correlation_lags(len(y),len(x));valid=np.abs(ls)<=50
    lag=int(ls[valid][np.argmax(c[valid])])*10;lags.append({'segment':[lo,hi],'lag_ms':lag})
q['audio_envelope_alignment']=lags
q['visual_review']={'contact_sheet':'final-contact.jpg','motion_phases':'final-motion-phases.jpg','boundaries':'final-boundaries.jpg','observations':'Actual export samples match approved R2. Mask shows no cabinet in reviewed frames; caption lane remains separate from talent; calendar moves without covering title; weights and pan move together. Cream full-frame transition is intentional.','not_verified':'Full real-time artistic playback and headphone listening; precise phoneme-level timing of confirmed don’t remains estimated.'}
(O/'qa-final-r2.json').write_text(json.dumps(q,indent=2),encoding='utf-8')
m=json.loads((P/'manifest.json').read_text(encoding='utf-8'));m['status']='rendered';m['final']={'file':'out/WEIGHT-TODAY-FINAL.mp4','sha256':q['sha256'],'technical_qa':'passed','manual_playback_qa':'not_fully_verified','report':'out/qa-final-r2.json'}
m['audio'].update({'music':'none','sfx':'5 restrained action accents; see out/audio-r2.json','measured_lufs':q['audio']['lufs'],'measured_true_peak':q['audio']['true_peak']})
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=P/'README.md';s=p.read_text(encoding='utf-8').replace('No full final render is authorized by the rotoscope revision alone.','R2 storyboard and final render were explicitly approved by the user: “ya jalankan render final”.').replace('Current stage: storyboard/edit composition, waiting for user design approval. No final MP4 has been rendered. User confirmed the corrected sentence at 35–41 s, not the design.','Current stage: rendered. Delivery: `out/WEIGHT-TODAY-FINAL.mp4`. Technical QA and sampled actual-export visual review are recorded in `out/qa-final-r2.json`; full real-time artistic playback/headphone review remains unverified.')
s+='\nFinalization: after approved HyperFrames render, run `final_audio.py`, `final_export.py`, then `finish_delivery.py`. These scripts retain the approved picture and original narration. Generated media stays local and is excluded from Git.\n';p.write_text(s,encoding='utf-8')
(O/'qa-final-r2.md').write_text(f'''# WEIGHT TODAY — hasil R2

Persetujuan pengguna: “ya jalankan render final”. Video dibuat dengan HyperFrames 0.9.33, tanpa Remotion.

Ekspor: 1080×1920, 30 fps, 1397 frame, 46.566667 detik, H.264/yuv420p, AAC 48 kHz, BT.709, faststart. Ukuran {q['bytes']} byte. Decode seluruh file tanpa error.

Audio final: {q['audio']['lufs']} LUFS; true peak {q['audio']['true_peak']} dBTP. Suara asli + lima aksen ringan; tanpa musik tambahan. Korelasi envelope audio sumber/hasil (resolusi 10 ms): {lags}. Ini memeriksa offset/drift, bukan menggantikan pemeriksaan setiap kata dengan mendengarkan.

Visual: ditinjau dari frame ekspor aktual pada final-contact.jpg, final-motion-phases.jpg, final-boundaries.jpg. Talent transparan, caption punya jalur terpisah, kalender tidak menutup judul. Fase objek timbangan, tas, kalender, langkah dan batas transisi diperiksa. Wipe gading merupakan bagian desain yang disetujui.

Batas verifikasi: playback artistik real-time penuh, headphone listening dan ketepatan fonem “don’t” belum diverifikasi sepenuhnya. Detail rambut dibatasi sumber 478×850. Tidak mengklaim semua frame mask sempurna.

SHA256: {q['sha256']}
''',encoding='utf-8')
print(json.dumps(lags))
