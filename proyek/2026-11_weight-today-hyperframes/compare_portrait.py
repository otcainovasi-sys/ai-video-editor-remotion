import os,sys,time
from pathlib import Path
P=Path(__file__).parent;ROOT=P.parents[1]
os.environ['U2NET_HOME']=str(ROOT/'.sementara/u2net');os.environ['OMP_NUM_THREADS']='4'
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'.sementara')
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from roto import _Rembg
import cv2,numpy as np
from PIL import Image
seg=_Rembg('birefnet-portrait');cap=cv2.VideoCapture(str(P/'aset/rekaman/take1.mp4'))
for t in [0,4,8,12,16,18.53,23.1,26.53,30.95,34,42.05,44.4,46.53]:
    if (P/f'cache/roto-r2/biref-{t:g}.png').exists():continue
    cap.set(cv2.CAP_PROP_POS_FRAMES,min(int(cap.get(cv2.CAP_PROP_FRAME_COUNT))-1,round(t*30)));ok,bgr=cap.read();rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
    start=time.perf_counter();mask=seg(rgb);print(t,time.perf_counter()-start,flush=True)
    Image.fromarray(np.uint8(mask*255)).save(P/f'cache/roto-r2/biref-{t:g}.png')
    comp=np.uint8(rgb*mask[:,:,None]+np.array([243,237,220])*(1-mask[:,:,None]))
    Image.fromarray(comp).crop((90,290,390,640)).resize((600,700)).save(P/f'out/roto-r2/biref-edge-{t:g}.png')
