"""Data-driven project adapter: beat-sheet + manifest -> editable HyperFrames HTML."""
from pathlib import Path
import json, html
from illustrations import illustration
P=Path(__file__).parent; H=P/'hyperframes'
m=json.loads((P/'manifest.json').read_text(encoding='utf-8')); data=json.loads((P/'beat-sheet.json').read_text(encoding='utf-8')); beats=data['beats']
words=json.loads((P/'cache/words.json').read_text(encoding='utf-8'))['kata']
esc=html.escape
c=m['palette']; D=m['duration']
css='''
@font-face{font-family:'Franklin Heavy';src:url('assets/FRAHV.TTF')}@font-face{font-family:'DM Serif';src:url('assets/DMSerifDisplay-Regular.ttf')}
*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:GREEN;color:PAPER;font-family:'Franklin Heavy',sans-serif}
#root{position:relative;width:1080px;height:1920px;overflow:hidden}.scene{position:absolute;inset:0;opacity:0;background:GREEN;overflow:hidden}.scene:first-child{opacity:1}
.scene:before{content:'';position:absolute;inset:0;opacity:.075;background-image:repeating-linear-gradient(0deg,PAPER 0 1px,transparent 1px 64px),repeating-linear-gradient(90deg,PAPER 0 1px,transparent 1px 64px)}
.scene-content{width:100%;height:100%;padding:254px 120px 400px 68px;display:flex;flex-direction:column;gap:24px;position:relative}
.eyebrow{font-size:28px;letter-spacing:5px;line-height:1.1}.title{font-size:92px;line-height:.98;letter-spacing:-3px;margin:0;max-width:890px}.emphasis{font-family:'DM Serif',serif;color:YELLOW;font-size:126px;line-height:1.05;max-width:890px}
.frame{position:absolute;left:178px;top:580px;width:690px;height:730px;padding:16px 16px 46px;background:PAPER;box-shadow:14px 18px 0 rgba(21,39,31,.45);transform:rotate(-2deg);overflow:hidden}
.frame:after{content:'';position:absolute;width:130px;height:32px;background:YELLOW;left:278px;top:-4px;opacity:.85;transform:rotate(3deg)}
.frame video{width:100%;height:100%;object-fit:cover;object-position:50% 59%}.split .frame{top:915px;left:252px;width:540px;height:405px;padding:12px 12px 28px;transform:rotate(2deg)}.split .frame video{object-position:50% 62%}.split .title{font-size:82px}.split .emphasis{font-size:112px}
.graphic{position:absolute;left:94px;top:620px;width:840px;height:640px}.split .graphic{top:555px;height:330px}.graphic svg{width:100%;height:100%;overflow:visible}.graphic text{font-family:'Franklin Heavy',sans-serif;fill:INK}.paper-label{fill:PAPER}.svg-label{font-size:33px;letter-spacing:1px}.svg-large{font-size:58px}
.caption{position:absolute;left:68px;top:1370px;width:892px;min-height:130px;display:flex;align-items:center;justify-content:center;text-align:center;z-index:70;color:PAPER;font-size:54px;line-height:1.12;letter-spacing:-.7px;padding:16px 20px;background:INK;border-left:7px solid YELLOW}.caption span{display:inline}.caption p{margin:0;max-width:840px}.caption .word{display:inline-block;margin-right:11px}.caption .word:last-child{margin-right:0}
.wipe{position:absolute;inset:0;background:PAPER;z-index:90;transform:translateX(-1080px);border-right:22px solid YELLOW}.footer{position:absolute;left:70px;bottom:310px;font-size:25px;letter-spacing:5px;color:PAPER;opacity:.65}.portrait .small-mark{position:absolute;top:1240px;left:800px;width:100px;height:70px}
'''
for key in ['green','paper','yellow','ink']: css=css.replace(key.upper(),c[key])
css += '.caption{z-index:100;display:block;padding-top:25px}.caption .words{display:block;max-width:840px}.portrait .emphasis{font-size:112px}#scene-step .emphasis{font-size:92px}.opening-label{position:absolute;left:70px;top:1620px;font-size:25px;letter-spacing:5px;z-index:1}'
if data.get('version')=='r2':
    css+='''
    .title,.split .title{font-size:58px;letter-spacing:-1px;line-height:1.1;max-width:880px}.scene-content{padding-top:265px}.eyebrow,.emphasis{display:none}
    .frame,.split .frame{padding:0;background:none;box-shadow:none;transform:none;overflow:visible;left:250px;top:550px;width:690px;height:780px}
    .frame:after{display:none}.frame video,.split .frame video{position:relative;z-index:2;object-fit:contain;object-position:center bottom;width:100%;height:100%}
    .frame:before{content:'';position:absolute;inset:140px 20px 5px;border-radius:50% 50% 4px 4px;background:#D6CDB5;opacity:.14}
    .graphic,.split .graphic{left:80px;top:415px;width:880px;height:880px}
    .split .graphic{top:345px;height:560px}.split .frame{left:490px;top:840px;width:435px;height:490px}
    #graphic-hook{left:80px;top:440px;width:360px;height:340px}#frame-hook{left:250px;top:550px}
    #frame-honest{left:65px;top:670px;width:570px;height:645px}#graphic-honest{left:530px;top:435px;width:410px;height:580px}
    #frame-load{left:75px;top:850px;width:425px;height:480px}#frame-load:before{background:#E8BF47;opacity:.12}
    #graphic-pause{left:80px;top:350px;width:800px;height:570px}#frame-pause{left:490px}
    #graphic-step{left:70px;top:425px;width:490px;height:650px}#frame-step{left:440px;top:755px;width:510px;height:575px}
    #frame-step:before{border-radius:160px 0 0 0;background:#E8BF47;opacity:.12}.graphic text{font-family:'Franklin Heavy',sans-serif}
    '''
def svg(content,view='0 0 840 640'):
    return f'<svg viewBox="{view}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{content}</svg>'
def rect(x,y,w,h,fill=None,extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill or c["paper"]}" {extra}/>'
def txt(x,y,t,cl='svg-label',extra=''):
    return f'<text x="{x}" y="{y}" class="{cl}" {extra}>{esc(t)}</text>'
def graphic(id):
    if id=='load':
        out=f'<g id="load-tray">{rect(110,245,620,17,c["yellow"])}<path d="M185 262 L185 290 M655 262 L655 290" stroke="{c["paper"]}" stroke-width="12"/></g>'
        for i,(t,x,y,w) in enumerate([('RESPONSIBILITIES',65,23,480),('EXPECTATIONS',250,100,440),('THE FUTURE',135,174,420)]):
            out+=f'<g id="load-card-{i}">{rect(x,y,w,68)}{txt(x+24,y+46,t)}</g>'
        return svg(out,'0 0 840 330')
    if id=='release':
        return svg(f'<g id="release-back">{rect(185,100,485,330,c["brown"])}{rect(130,65,485,330,c["yellow"])}</g><g id="release-today">{rect(76,210,570,310)}{txt(120,300,"TODAY","svg-large")}<path d="M120 365 H520 M120 415 H430" stroke="{c["green"]}" stroke-width="10"/></g><g id="release-space"><path d="M685 270 V510" stroke="{c["yellow"]}" stroke-width="10" stroke-dasharray="15 18"/></g>')
    if id=='pause':
        return svg(f'<path id="pause-line" d="M50 170 H325" stroke="{c["yellow"]}" stroke-width="12"/><g id="pause-bars">{rect(370,40,65,235)}{rect(480,40,65,235)}</g><path d="M600 170 H770" stroke="{c["paper"]}" stroke-width="7" stroke-dasharray="10 14"/>','0 0 840 330')
    if id=='tired':
        return svg(f'<g id="tired-left">{rect(25,120,340,280)}{txt(72,282,"TIRED","svg-large")}</g><g id="tired-right">{rect(475,120,340,280)}{txt(520,282,"WEAK","svg-large")}</g><g id="tired-sign" stroke="{c["yellow"]}" stroke-width="15"><path d="M382 220 H460 M382 275 H460"/><path id="tired-slash" d="M450 190 L390 308"/></g><path id="tired-rule" d="M70 470 H760" stroke="{c["yellow"]}" stroke-width="6"/>')
    if id=='rest':
        return svg(f'<path id="rest-route" d="M40 220 H325 Q380 220 380 160 Q380 100 450 100 H785" fill="none" stroke="{c["paper"]}" stroke-width="12"/><g id="rest-seat">{rect(270,155,140,22,c["yellow"])}{rect(285,177,12,73,c["yellow"])}{rect(384,177,12,73,c["yellow"])}</g><circle id="rest-dot" cx="70" cy="220" r="24" fill="{c["yellow"]}"/>','0 0 840 330')
    if id=='today':
        tomorrow=txt(340,135,'TOMORROW','svg-label','style="fill:#F3EDDC"')
        return svg(f'<g id="tomorrow-card">{rect(300,45,490,280,c["brown"])}{tomorrow}</g><g id="today-card">{rect(52,250,550,320)}{txt(100,345,"TODAY","svg-large")}<path d="M100 410 H470 M100 460 H385" stroke="{c["green"]}" stroke-width="10"/></g><circle id="today-dot" cx="725" cy="235" r="26" fill="{c["yellow"]}"/>')
    return ''
parts=[]; anim=[]
for i,b in enumerate(beats):
    id=b['id']; s=b['mulai']; e=b['selesai']; layout=b['layout']
    if data.get('version')=='r2':
        content=f'<section class="scene {layout}" id="scene-{id}" data-beat="{esc(id)}"><div class="scene-content"><h1 class="title">{esc(b["label"])}</h1></div>'
    else:content=f'<section class="scene {layout}" id="scene-{id}" data-beat="{esc(id)}"><div class="scene-content"><div class="eyebrow">{i+1:02d} / FIELD NOTES</div><h1 class="title">{esc(b["title"])}</h1><div class="emphasis">{esc(b["emphasis"])}</div></div>'
    if layout!='full':
        media='talent-r2.webm' if data.get('version')=='r2' else 'source.mp4'
        content+=f'<div class="frame" id="frame-{id}"><video class="clip" id="video-{id}" src="assets/{media}" muted playsinline data-start="{s}" data-duration="{min(e,46.533333)-s}" data-media-start="{s}" data-track-index="0"></video></div>'
    g=illustration(id,c) if data.get('version')=='r2' else graphic(id)
    if data.get('version')=='r2' and id=='load':
        # Parent the left weight to the balance assembly so its contact follows the pan.
        a=g.index('<g id="scale-weight-c">');z=g.index('</g></g></g>',a)+12
        weight_group=g[a:z];g=g[:a]+g[z:]
        boundary=g.index('</g><g id="scale-right">')
        g=g[:boundary]+weight_group+g[boundary:]
    if g: content+=f'<div class="graphic" id="graphic-{id}">{g}</div>'
    content+='</section>'; parts.append(content)
# Choreography is versioned in beat-sheet.json, separate from the renderer.
anim=['tl.'+a['method']+'('+json.dumps(a['target'])+','+json.dumps(a['vars'])+','+str(a['at'])+');' for a in data['motion']]
# Phrase captions have their own lane; source words are never silently rewritten.
groups=[]; group=[]
for j,w in enumerate(words):
    group.append(w); nxt=words[j+1] if j+1<len(words) else None
    if len(group)>=5 or w['w'].endswith(('.',',','?','!')) or (nxt and nxt['s']-w['e']>.22):
        groups.append(group);group=[]
if group:groups.append(group)
for k in range(len(groups)-1,0,-1):
    if len(groups[k])==1 and groups[k][0]['w'].strip('.,?!').lower() in ['to','up','weak']:
        groups[k-1].extend(groups.pop(k))
for k,g in enumerate(groups):
    s=g[0]['s']; end=min(D,g[-1]['e']+.14,groups[k+1][0]['s'] if k+1<len(groups) else D)
    spans=''.join(f'<span class="word" id="w-{k}-{j}">{esc(w["w"])}</span>' for j,w in enumerate(g))
    if k==len(groups)-1: end=D-.2
    parts.append(f'<div class="clip caption" id="caption-{k}" data-start="{s}" data-duration="{max(.3,end-s):.3f}" data-track-index="5"><span class="words">{spans}</span></div>')
    for j,w in enumerate(g):
        anim.append(f'tl.set("#w-{k}-{j}",{{color:"{c["yellow"]}"}},{w["s"]});')
        anim.append(f'tl.set("#w-{k}-{j}",{{color:"{c["paper"]}"}},{w["e"]});')
parts.append(f'<div class="opening-label" data-layout-ignore>WEIGHT TODAY</div><audio id="voice" src="assets/source.mp4" data-start="0" data-duration="{D}" data-track-index="9" data-volume="1"></audio><div class="wipe" id="wipe" data-layout-ignore></div>')
doc=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>WEIGHT TODAY · {data.get("version","r1").upper()}</title><script src="assets/gsap.min.js"></script><style>{css}</style></head><body><div id="root" data-composition-id="weight-today" data-start="0" data-duration="{D}" data-width="1080" data-height="1920">'+''.join(parts)+'</div><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});\n'+'\n'.join(anim)+'\nwindow.__timelines["weight-today"]=tl;</script></body></html>'
(H/'index.html').write_text(doc,encoding='utf-8')
print(f'Built {len(beats)} scenes, {len(groups)} caption groups: {H / "index.html"}')

