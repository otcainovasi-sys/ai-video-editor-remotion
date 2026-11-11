from pathlib import Path
import re,xml.etree.ElementTree as ET
from collections import Counter
P=Path(__file__).parent
s=(P/'hyperframes/index.html').read_text(encoding='utf-8')
svgs=re.findall(r'<svg\b[\s\S]*?</svg>',s)
for svg in svgs:ET.fromstring(svg)
ids=re.findall(r'\bid="([^"]+)"',s)
dupes=[id for id,n in Counter(ids).items() if n>1]
assert not dupes,dupes
print(len(svgs),'valid native SVGs;',len(ids),'unique IDs')
