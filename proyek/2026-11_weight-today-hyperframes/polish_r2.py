from pathlib import Path
import json
P=Path(__file__).parent;p=P/'beat-sheet.json';d=json.loads(p.read_text(encoding='utf-8'))
for a in d['motion']:
    if a['target']=='#calendar-page':a['vars'].update(rotation=-8,x=-140,y=90,scale=.55)
if not any(a['target']=='#scale-left' for a in d['motion']):
    for a in list(d['motion']):
        if a['target']=='#scale-beam':
            for side,x in [('left',155),('right',685)]:
                v=dict(a['vars']);v.update(rotation=-v['rotation'],svgOrigin=f'{x} 180')
                d['motion'].append(dict(method='to',target=f'#scale-{side}',vars=v,at=a['at']))
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
f=P/'illustrations.py';s=f.read_text(encoding='utf-8')
s=s.replace('<path d="M420 145 V195" stroke="{paper}" stroke-width="6"/>','')
s=s.replace('y="260" font-size="37"','y="260" font-size="52"')
f.write_text(s,encoding='utf-8')
