import {dayOf,addDays,weekStart,effectiveDate,average,habitDue} from './core.js';

// Read old single-photo entries without rewriting the user's diary.
export function photosOf(journal){
 return journal.photos??(journal.photo?[{id:'legacy-photo',src:journal.photo,caption:''}]:[]);
}
export function allPhotos(data){return Object.keys(data.days).sort().reverse().flatMap(date=>photosOf(dayOf(data,date).journal).map(photo=>({...photo,date})));}
export function weeklySummary(data,date,today=effectiveDate()){
 const start=weekStart(date),end=addDays(start,6),dates=Array.from({length:7},(_,i)=>addDays(start,i)).filter(d=>d<=today);
 const days=dates.map(date=>({date,...dayOf(data,date)}));
 const metrics=Object.fromEntries(['mood','energy','productivity'].map(key=>{const values=days.map(d=>average(d.events.filter(e=>e.type==='mood').map(e=>e[key])));return [key,{value:average(values),days:values.filter(v=>v!=null).length}]}));
 const frequency=type=>{const map=new Map();for(const d of days){const seen=new Set();for(const e of d.events.filter(e=>e.type===type)){const key=e.ref||e.name;if(seen.has(key))continue;seen.add(key);const item=map.get(key)||{name:e.name,days:0};item.days++;map.set(key,item);}}return [...map.values()].sort((a,b)=>b.days-a.days||a.name.localeCompare(b.name,'pl')).slice(0,5);};
 const habits=data.habits.filter(h=>dates.some(d=>habitDue(h,d))).map(h=>{const due=dates.filter(d=>habitDue(h,d)),done=due.reduce((n,d)=>n+(dayOf(data,d).checks[h.id]?.filter(Boolean).length||0),0);return {name:h.name,done,target:h.mode==='weekly'?h.target:due.length*h.target,weekly:h.mode==='weekly'};});
 return {start,end,dates,metrics,habits,partial:end>today,recorded:days.filter(d=>d.events.length||Object.keys(d.journal).length||Object.values(d.checks).some(c=>c.some(Boolean))).length,photos:allPhotos(data).filter(p=>dates.includes(p.date)),pleasant:days.flatMap(d=>[1,2,3].filter(n=>d.journal['pleasant'+n]).map(n=>({date:d.date,text:d.journal['pleasant'+n]}))),symptoms:frequency('symptom'),activities:frequency('activity')};
}
