"""Temporal matting adapter for this HyperFrames edit; all caches stay on D:."""
import argparse,json,sys,time,subprocess
from pathlib import Path
import cv2,numpy as np,onnxruntime as ort
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;ROOT=P.parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--full',action='store_true');a=ap.parse_args()
out=P/'cache/roto-r2';out.mkdir(parents=True,exist_ok=True)
qa=P/'out/roto-r2';qa.mkdir(parents=True,exist_ok=True)
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
sess=ort.InferenceSession(str(ROOT/'.sementara/rvm_mobilenetv3_fp32.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
cap=cv2.VideoCapture(str(P/'aset/rekaman/take1.mp4'));fps=cap.get(cv2.CAP_PROP_FPS);n=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/FRAHV.TTF'),18)
def state():return [np.zeros((1,1,1,1),np.float32) for _ in range(4)]
def infer(rgb,rec):
    f,alpha,*rec=sess.run(None,dict(src=rgb.transpose(2,0,1)[None].astype(np.float32)/255,**{f'r{i+1}i':r for i,r in enumerate(rec)},downsample_ratio=np.array([.6],np.float32)))
    # Retain the model's soft alpha and decontaminated foreground; no hard threshold or frame-skipping.
    aa=np.clip((alpha[0,0]-.015)/.985,0,1)
    rgba=np.dstack((np.clip(f[0].transpose(1,2,0)*255,0,255).astype(np.uint8),np.round(aa*255).astype(np.uint8)))
    return rgba,rec
def composite(rgba,bg):
    al=rgba[:,:,3:4]/255.;return np.uint8(rgba[:,:,:3]*al+np.array(bg)*(1-al))
def sheet(rgb,rgba,t,mp=None):
    variants=[('SOURCE',rgb),('RVM / GREEN',composite(rgba,(33,63,50))),('RVM / CREAM',composite(rgba,(243,237,220))),('ALPHA',np.repeat(rgba[:,:,3:4],3,axis=2))]
    if mp is not None:
        m=np.uint8(np.clip(mp,0,1)*255);variants.insert(1,('MEDIAPIPE',composite(np.dstack((rgb,m)),(33,63,50))))
    canvas=Image.new('RGB',(len(variants)*300,565),'#15271F');dr=ImageDraw.Draw(canvas)
    for i,(label,im) in enumerate(variants):
        pic=Image.fromarray(im);pic.thumbnail((294,525));canvas.paste(pic,(i*300,35));dr.text((i*300+4,8),label,font=font,fill='white')
    canvas.save(qa/f'compare-{t:g}.jpg',quality=95)
    # Native-resolution edge crops on light and dark backgrounds expose halo and clipping.
    crop=Image.new('RGB',(720,420),'#15271F')
    for i,bg in enumerate([(33,63,50),(243,237,220)]):
        edge=Image.fromarray(composite(rgba,bg)).crop((90,290,390,640)).resize((360,420))
        crop.paste(edge,(i*360,0))
    crop.save(qa/f'edge-{t:g}.png')
if not a.full:
    sys.path.insert(0,str(ROOT/'pipeline/scripts'));from roto import _Mediapipe
    mp=_Mediapipe()
    for t in [3.5,16,24.7,33.6,44.4]:
        end=round(t*fps);start=max(0,end-25);cap.set(cv2.CAP_PROP_POS_FRAMES,start);rec=state()
        for k in range(start,end+1):
            ok,bgr=cap.read()
            if not ok:raise RuntimeError(k)
            rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB);rgba,rec=infer(rgb,rec)
        Image.fromarray(rgba).save(out/f'pilot-{t:g}.png');sheet(rgb,rgba,t,mp(rgb));print('pilot',t,flush=True)
else:
    rec=state();start=time.perf_counter();samples={round(t*fps):t for t in [3.5,16,24.7,33.6,44.4]}
    h=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT));w=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    target=P/'cache/roto-r2/talent-rvm-raw.webm'
    cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',f'{w}x{h}','-r',str(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-lossless','1','-auto-alt-ref','0','-row-mt','1','-threads','4','-metadata:s:v:0','alpha_mode=1',str(target)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    alpha_stats=[]
    for k in range(n):
        ok,bgr=cap.read()
        if not ok:raise RuntimeError(f'Incomplete source at {k}/{n}')
        rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB);rgba,rec=infer(rgb,rec)
        proc.stdin.write(rgba.tobytes())
        if k in samples:sheet(rgb,rgba,samples[k]);Image.fromarray(rgba).save(out/f'frame-{k:06d}.png')
        # Cache alpha only; raw source remains recoverable and foreground video is lossless VP9.
        cv2.imwrite(str(out/f'{k:06d}.png'),rgba[:,:,3])
        alpha_stats.append({'frame':k,'area':float((rgba[:,:,3]>.5*255).mean())})
        if k%120==0:print(f'{k}/{n} | {time.perf_counter()-start:.1f}s',flush=True)
    proc.stdin.close();code=proc.wait()
    if code:raise RuntimeError(f'VP9 encoder exit {code}')
    (out/'meta.json').write_text(json.dumps({'model':'RVM MobileNetV3 fp32','source':'https://github.com/PeterL1n/RobustVideoMatting','frames':n,'fps':fps,'downsample_ratio':.6,'recurrent_states':'continuous','skip_frames':False,'alpha_floor':.015,'foreground':'model estimated decontaminated RGB','output':str(target),'stats':alpha_stats},indent=2))
    print('COMPLETE',target,flush=True)
cap.release()
