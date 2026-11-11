"""Bidirectional motion propagation of portrait reference mattes, constrained by temporal RVM alpha."""
from pathlib import Path
import cv2,numpy as np,subprocess,json,time
from PIL import Image
P=Path(__file__).parent;C=P/'cache/roto-r2';Q=P/'out/roto-r2'
cv2.setNumThreads(3)
cap=cv2.VideoCapture(str(P/'aset/rekaman/take1.mp4'));fps=30.;W,H=478,850
grays=[]
while True:
    ok,bgr=cap.read()
    if not ok:break
    grays.append(cv2.resize(cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY),(239,425)))
cap.release();N=len(grays)
anchors={min(N-1,round(float(p.stem.split('-')[1])*fps)):cv2.imread(str(p),0)/255. for p in C.glob('biref-*.png')}
assert 0 in anchors and N-1 in anchors, 'Need first and last anchor'
guidedir=C/'guidance';guidedir.mkdir(exist_ok=True)
dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
xx,yy=np.meshgrid(np.arange(W,dtype=np.float32),np.arange(H,dtype=np.float32))
def warp(mask,prev,cur):
    flow=dis.calc(grays[cur],grays[prev],None)
    flow=cv2.resize(flow,(W,H))*2
    return cv2.remap(mask.astype(np.float32),xx+flow[:,:,0],yy+flow[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
keys=sorted(anchors)
for a,b in zip(keys,keys[1:]):
    fwd=[anchors[a].astype(np.float32)]
    for i in range(a+1,b+1):fwd.append(warp(fwd[-1],i-1,i))
    back=anchors[b].astype(np.float32)
    for i in range(b,a-1,-1):
        if i<b:back=warp(back,i+1,i)
        t=(i-a)/(b-a);mix=fwd[i-a]*(1-t)+back*t
        cv2.imwrite(str(guidedir/f'{i:06d}.png'),np.uint8(np.clip(mix*255,0,255)))
    print('guided',a,b,flush=True)
dec=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-i',str(C/'talent-rvm-raw.webm'),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE)
dest=P/'hyperframes/assets/talent-r2.webm'
enc=subprocess.Popen(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s','478x850','-r','30','-i','pipe:0','-vf','crop=478:540:0:270','-an','-c:v','libvpx-vp9','-lossless','1','-pix_fmt','yuva420p','-auto-alt-ref','0','-row-mt','1','-threads','4','-metadata:s:v:0','alpha_mode=1',str(dest)],stdin=subprocess.PIPE)
samples={round(t*30):t for t in [3.5,8.8,16,24.7,33.6,44.4]}
for i in range(N):
    buf=dec.stdout.read(W*H*4)
    if len(buf)!=W*H*4:raise RuntimeError(f'Alpha decode failed at {i}')
    rgba=np.frombuffer(buf,np.uint8).reshape(H,W,4).copy()
    guide=cv2.imread(str(guidedir/f'{i:06d}.png'),0)
    support=cv2.GaussianBlur(cv2.dilate((guide>115).astype(np.uint8)*255,np.ones((3,3),np.uint8)),(3,3),.55)
    rgba[:,:,3]=np.minimum(rgba[:,:,3],support)
    enc.stdin.write(rgba.tobytes())
    if i in samples:
        t=samples[i];Image.fromarray(rgba).save(C/f'refined-{t:g}.png')
        al=rgba[:,:,3:4]/255.;comps=[]
        for bg in [(33,63,50),(243,237,220)]:
            rgb=np.uint8(rgba[:,:,:3]*al+np.array(bg)*(1-al));comps.append(Image.fromarray(rgb))
        sh=Image.new('RGB',(956,850));sh.paste(comps[0],(0,0));sh.paste(comps[1],(478,0));sh.save(Q/f'final-{t:g}.jpg',quality=95)
        edge=Image.new('RGB',(720,420))
        for j,im in enumerate(comps):edge.paste(im.crop((90,290,390,640)).resize((360,420)),(360*j,0))
        edge.save(Q/f'final-edge-{t:g}.png')
    if i%240==0:print('encode',i,N,flush=True)
enc.stdin.close();dec.stdout.close();assert dec.wait()==0 and enc.wait()==0
(C/'refinement.json').write_text(json.dumps({'frames':N,'anchor_frames':keys,'flow':'OpenCV DIS medium bidirectional','guidance':'BiRefNet portrait from existing pipeline rembg backend','alpha':'RVM continuous, min with feathered guided support','support_dilate_px':1,'support_sigma':.55,'crop':[0,270,478,540],'output':str(dest)},indent=2))
print('REFINED',dest,flush=True)
