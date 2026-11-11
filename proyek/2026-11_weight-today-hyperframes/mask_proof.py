from pathlib import Path
import subprocess,numpy as np
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;ROOT=P.parents[1];W,H=478,540
select="select='gte(t,15)*lt(t,17)+gte(t,23.7)*lt(t,25.7)+gte(t,43)*lt(t,45)'"
dec=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-i',str(P/'hyperframes/assets/talent-r2.webm'),'-vf',select,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s','956x590','-r','30','-i','pipe:0','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(P/'out/roto-r2/mask-proof.mp4')],stdin=subprocess.PIPE)
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/FRAHV.TTF'),22);n=0
while True:
    buf=dec.stdout.read(W*H*4)
    if not buf:break
    assert len(buf)==W*H*4
    a=np.frombuffer(buf,np.uint8).reshape(H,W,4);alpha=a[:,:,3:4]/255.
    image=Image.new('RGB',(956,590),'#15271F');draw=ImageDraw.Draw(image)
    draw.text((20,12),'MASK TEST / DARK',font=font,fill='#F3EDDC');draw.text((498,12),'MASK TEST / LIGHT',font=font,fill='#F3EDDC')
    for j,bg in enumerate([(33,63,50),(243,237,220)]):
        image.paste(Image.fromarray(np.uint8(a[:,:,:3]*alpha+np.array(bg)*(1-alpha))),(j*478,50))
    enc.stdin.write(np.asarray(image).tobytes());n+=1
enc.stdin.close();dec.stdout.close();assert dec.wait()==0 and enc.wait()==0
print('Mask test:',n,'frames',n/30,'seconds')
