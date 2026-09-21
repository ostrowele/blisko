import {addDays,dayOf,average,eventStamp} from './core.js';

export const CATEGORY_LABELS={med:'Leki',symptom:'Objawy',drink:'Napoje',activity:'Zdarzenia'};
export const MEASURES={mood:'Nastrój',energy:'Energia',productivity:'Produktywność',sleepHours:'Długość snu (h)',sleepQuality:'Jakość snu (1–3)',stress:'Stres (1–3)',heart:'Lekkość serca (1–3)',dayEnergy:'Energia wieczorem (1–3)',rating:'Ocena dnia',water:'Zapisana woda (ml)'};
const isNum=n=>typeof n==='number'&&Number.isFinite(n);
export function ranked(values){
 const ordered=values.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v),ranks=[];
 for(let i=0;i<ordered.length;){let j=i+1;while(j<ordered.length&&ordered[j].v===ordered[i].v)j++;const rank=(i+j+1)/2;for(let k=i;k<j;k++)ranks[ordered[k].i]=rank;i=j;}return ranks;
}
export function spearman(pairs){
 const clean=pairs.filter(p=>isNum(p[0])&&isNum(p[1]));if(clean.length<2)return null;
 const x=ranked(clean.map(p=>p[0])),y=ranked(clean.map(p=>p[1])),mx=average(x),my=average(y);
 let xy=0,xx=0,yy=0;for(let i=0;i<x.length;i++){const a=x[i]-mx,b=y[i]-my;xy+=a*b;xx+=a*a;yy+=b*b;}
 return xx&&yy?Math.max(-1,Math.min(1,xy/Math.sqrt(xx*yy))):null;
}
export function dailyMeasures(data,date){
 const d=dayOf(data,date),j=d.journal,m=d.events.filter(e=>e.type==='mood'),sleep=d.events.find(e=>e.type==='sleep'),water=d.events.filter(e=>e.type==='drink'&&e.ref==='water');
 return {date,mood:average(m.map(e=>e.mood)),energy:average(m.map(e=>e.energy)),productivity:average(m.map(e=>e.productivity)),sleepHours:isNum(sleep?.hours)?sleep.hours:null,sleepQuality:({słaby:1,normalny:2,głęboki:3})[sleep?.quality]??null,stress:({niski:1,średni:2,wysoki:3})[j.stress]??null,heart:({ciężkie:1,normalne:2,lekkie:3})[j.heart]??null,dayEnergy:({niska:1,średnia:2,wysoka:3})[j.dayEnergy]??null,rating:isNum(j.rating)?j.rating:null,water:water.length||d.reviewed?.drink?water.reduce((s,e)=>s+e.ml,0):null};
}
export function rangeRows(data,end,range){return Array.from({length:range},(_,i)=>dailyMeasures(data,addDays(end,i-range+1)));}
export function recordedFactors(data){
 const factors=new Map();for(const date of Object.keys(data.days).sort())for(const e of data.days[date].events)if(CATEGORY_LABELS[e.type]&&e.ref)factors.set(e.type+':'+e.ref,{key:e.type+':'+e.ref,type:e.type,ref:e.ref,name:e.name||e.ref});
 return [...factors.values()].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name,'pl'));
}
// Absence is known only after the user explicitly reviewed the whole category.
export function presence(data,date,factor){const d=dayOf(data,date);if(d.events.some(e=>e.type===factor.type&&e.ref===factor.ref))return 1;return d.reviewed?.[factor.type]===true?0:null;}
export function compareDays(data,end,range,factor,outcome,lag=0){
 const rows=rangeRows(data,end,range),withFactor=[],withoutFactor=[];let excluded=0;
 for(const row of rows){const x=presence(data,addDays(row.date,-lag),factor);const y=typeof outcome==='string'?row[outcome]:presence(data,row.date,outcome);
  if(x==null||!isNum(y)){excluded++;continue}(x?withFactor:withoutFactor).push({date:row.date,value:y});
 }
 const a=average(withFactor.map(r=>r.value)),b=average(withoutFactor.map(r=>r.value));
 return {withFactor,withoutFactor,excluded,a,b,difference:a==null||b==null?null:a-b,ready:withFactor.length>=5&&withoutFactor.length>=5};
}
export function numericRelations(data,end,range,outcome){
 const rows=rangeRows(data,end,range);return Object.keys(MEASURES).filter(k=>k!==outcome).map(key=>{const pairs=rows.filter(r=>isNum(r[key])&&isNum(r[outcome]));const rho=spearman(pairs.map(r=>[r[key],r[outcome]]));return {key,n:pairs.length,rho,ready:pairs.length>=10&&rho!=null,pairs};});
}
function epoch(date,event){const saved=Date.parse(event.timestamp);return Number.isFinite(saved)?saved:Date.parse(eventStamp(date,event.time));}
export function beforeAfter(data,end,range,factor,measure){
 if(!['mood','energy','productivity'].includes(measure))return {pairs:[],ready:false,before:null,after:null,difference:null};
 const start=addDays(end,1-range),moods=[],events=[];
 // Include boundary measurements, but only exposure days inside the selected range.
 for(const date of Object.keys(data.days).filter(d=>d>=addDays(start,-1)&&d<=addDays(end,1)).sort())for(const e of data.days[date].events){const at=epoch(date,e);if(!Number.isFinite(at))continue;if(e.type==='mood'&&isNum(e[measure]))moods.push({at,value:e[measure]});if(e.type===factor.type&&e.ref===factor.ref)events.push({at,date});}
 moods.sort((a,b)=>a.at-b.at);events.sort((a,b)=>a.at-b.at);const seen=new Set(),pairs=[],window=3*3600000;
 for(const event of events){if(event.date<start||event.date>end||seen.has(event.date))continue;seen.add(event.date);
  const before=moods.filter(m=>m.at<event.at&&event.at-m.at<=window).at(-1),after=moods.find(m=>m.at>event.at&&m.at-event.at<=window);
  if(!before||!after||events.some(e=>e!==event&&e.at>=before.at&&e.at<=after.at))continue;
  pairs.push({date:event.date,before:before.value,after:after.value,difference:after.value-before.value});
 }
 return {pairs,ready:pairs.length>=5,before:average(pairs.map(p=>p.before)),after:average(pairs.map(p=>p.after)),difference:average(pairs.map(p=>p.difference))};
}
