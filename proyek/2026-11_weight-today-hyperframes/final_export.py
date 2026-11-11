"""Mux approved HyperFrames picture, validate export, and create actual-export QA sheets."""
from pathlib import Path
import json,subprocess,sys,hashlib
import cv2
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;O=P/'out';ROOT=P.parents[1]
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from sistem import ukur_loudness
source=O/'weight-today-r2-picture.mp4';dest=O/'WEIGHT-TODAY-FINAL.mp4'
def run(args):return subprocess.run(args,check=True,capture_output=True,text=True,encoding='utf-8',errors='replace')
run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(source),'-i',str(P/'cache/master-r2.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart','-t','46.566',str(dest)])
probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(dest)]).stdout)
decode=run(['ffmpeg','-v','error','-i',str(dest),'-f','null','-'])
audio=ukur_loudness(dest)
video=next(s for s in probe['streams'] if s['codec_type']=='video');au=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert video['width']==1080 and video['height']==1920 and video['avg_frame_rate']=='30/1'
assert video['codec_name']=='h264' and au['codec_name']=='aac'
assert abs(float(probe['format']['duration'])-46.566)<.1
assert -14.6<=audio['lufs']<=-13.4 and audio['true_peak']<=-2
cap=cv2.VideoCapture(str(dest));font=ImageFont.truetype(str(ROOT/'pipeline/fonts/FRAHV.TTF'),18)
def sheet(times,name,cols=3,w=270):
    h=round(w*1920/1080);rows=(len(times)+cols-1)//cols
    canvas=Image.new('RGB',(cols*w,rows*(h+28)),'#15271f');draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read();assert ok,t
        im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));im.thumbnail((w,h))
        x=i%cols*w;y=i//cols*(h+28);canvas.paste(im,(x,y+28));draw.text((x+8,y+3),f'{t:.2f}s',font=font,fill='white')
    canvas.save(O/name,quality=94)
sheet([3.5,8.8,16,21,24.7,29.5,33.6,39.6,44.4],'final-contact.jpg')
sheet([4.6,4.9,5.3,19.1,19.6,20.2,36.8,37.4,38.1,42.7,43.1,43.5],'final-motion-phases.jpg')
sheet([.033,.5,4.1,12.8,23.1,35.25,42.05,45.5,46.5],'final-boundaries.jpg')
cap.release()
report={'file':str(dest.resolve()),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'duration':probe['format']['duration'],'bytes':dest.stat().st_size,'video':{k:video.get(k) for k in ['codec_name','width','height','pix_fmt','avg_frame_rate','nb_frames','color_space','color_transfer','color_primaries']},'audio':audio,'decode_errors':decode.stderr,'stream_probe':probe,'limitations':['Sampled frame review is not a full real-time artistic playback or headphone listening review.','Fine hair detail is constrained by the 478x850 source.']}
(O/'qa-final-r2.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='stream_probe'},indent=2))
