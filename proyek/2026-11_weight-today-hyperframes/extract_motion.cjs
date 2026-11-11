// One-time extraction of the reviewed R1 choreography into the project data contract.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'hyperframes/index.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const motion=[];
const timeline=Object.fromEntries(['from','to','set'].map(method=>[method,(target,vars,at)=>{if(!target.startsWith('#w-'))motion.push({method,target,vars,at});return timeline;}]));
vm.runInNewContext(scripts.at(-1)[1],{window:{},gsap:{timeline:()=>timeline}});
const p=path.join(__dirname,'beat-sheet.json');
const data=JSON.parse(fs.readFileSync(p,'utf8'));
data.motion=motion;
data.graphic_labels=['RESPONSIBILITIES','EXPECTATIONS','THE FUTURE','TODAY','TIRED','WEAK','TOMORROW'];
fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');
console.log('Stored '+motion.length+' scene/transition actions in beat-sheet.json');
