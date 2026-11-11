"""Local multilingual transcription; never mark machine words as user-corrected."""
import os
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[2]
os.environ['HF_HOME'] = str(ROOT / '.sementara/hf')
os.environ['TEMP'] = os.environ['TMP'] = str(ROOT / '.sementara')
from faster_whisper import WhisperModel
model = WhisperModel('small', device='cpu', compute_type='int8', local_files_only=True, cpu_threads=6)
base = Path('D:/KERJAAN/CONTENT CREATOR/NAZARVERSE')
for name, file in [('source','WEIGHT TODAY.mp4'), ('ref1','Referensi video.mp4'), ('ref2','referensi video 2.mp4')]:
    out = Path(__file__).parent / 'cache' / (name + '-speech.json')
    if out.exists():
        continue
    segments, info = model.transcribe(str(base / file), word_timestamps=True, vad_filter=True)
    data = {'language':info.language, 'probability':info.language_probability, 'segments':[], 'kata':[]}
    for s in segments:
        data['segments'].append({'s':s.start, 'e':s.end, 'text':s.text})
        data['kata'].extend({'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3),'p':round(w.probability,3)} for w in s.words or [])
        print(name, round(s.start,2), s.text, flush=True)
    data['_meta'] = {'backend':'faster-whisper','model':'small','dikoreksi':False,'timestamp_per_kata':True}
    out.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
segments, _ = model.transcribe(str(Path(__file__).parent/'cache/verify-line.wav'), language='en', word_timestamps=True, vad_filter=False, beam_size=8, condition_on_previous_text=False)
verification=[]
for s in segments:
    verification.extend({'w':w.word.strip(),'s':round(w.start+34,3),'e':round(w.end+34,3),'p':round(w.probability,3)} for w in s.words or [])
    print('VERIFY',s.text,flush=True)
(Path(__file__).parent/'cache/verify-line.json').write_text(json.dumps(verification,indent=2),encoding='utf-8')
