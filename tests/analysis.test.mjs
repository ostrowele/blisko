import assert from 'node:assert/strict';
import {freshData,ensureDay,addDays,validateBackup,eventStamp} from '../dist/core.js';
import {ranked,spearman,dailyMeasures,compareDays,numericRelations,beforeAfter,presence} from '../dist/analysis.js';

assert.deepEqual(ranked([20,10,20,30]),[2.5,1,2.5,4]);
assert.equal(spearman([[1,3],[2,2],[3,1]]),-1);
assert.equal(spearman([[1,1],[2,2],[2,2],[3,3]]),1);
assert.equal(spearman([[1,2],[1,3]]),null);
assert.equal(spearman([[null,8],[1,1],[2,2]]),1);
const data=freshData(),med={type:'med',ref:'med-a'},sym={type:'symptom',ref:'sym-a'};
for(let i=0;i<12;i++){
 const date=addDays('2026-08-01',i),day=ensureDay(data,date);day.reviewed={med:true,symptom:true};
 day.events=[{id:'m-'+i,type:'mood',time:'09:00',mood:i<6?8:4,energy:i<6?6:2}];
 if(i<6)day.events.push({id:'drug-'+i,type:'med',ref:'med-a',name:'Lek A',time:'08:00',dose:'1'});
 if(i<3)day.events.push({id:'sym-'+i,type:'symptom',ref:'sym-a',name:'Objaw A',time:'15:00',severity:2});
 day.journal.rating=1;day.journal.dayEnergy='niska';
}
const c=compareDays(data,'2026-08-12',12,med,'mood');assert.equal(c.a,8);assert.equal(c.b,4);assert.equal(c.difference,4);assert.equal(c.ready,true);assert.equal(c.withFactor.length,6);
assert.equal(dailyMeasures(data,'2026-08-01').energy,6);assert.equal(dailyMeasures(data,'2026-08-01').dayEnergy,1);assert.equal(dailyMeasures(data,'2026-08-01').water,null);
const s=compareDays(data,'2026-08-12',12,med,sym);assert.equal(s.a,.5);assert.equal(s.b,0);
delete data.days['2026-08-12'].reviewed.med;assert.equal(presence(data,'2026-08-12',med),null);
const sparse=compareDays(data,'2026-08-12',12,med,'mood');assert.equal(sparse.withoutFactor.length,5);assert.equal(sparse.excluded,1);
delete data.days['2026-08-11'].reviewed.med;assert.equal(compareDays(data,'2026-08-12',12,med,'mood').ready,false);
assert.equal(compareDays(data,'2026-08-12',12,med,'mood',1).withFactor.length,6);
const rel=numericRelations(data,'2026-08-12',12,'mood');assert.equal(rel.find(r=>r.key==='energy').rho,1);assert.equal(rel.find(r=>r.key==='rating').ready,false);
assert.equal(numericRelations(data,'2026-08-12',7,'mood').find(r=>r.key==='energy').ready,false);
const temporal=freshData();
for(let i=0;i<6;i++){const date=addDays('2026-09-01',i),d=ensureDay(temporal,date);d.events=[{id:'b'+i,type:'mood',time:'23:00',mood:4},{id:'x'+i,type:'med',ref:'med-a',time:'23:30'},{id:'a'+i,type:'mood',time:'00:30',mood:6}];}
const t=beforeAfter(temporal,'2026-09-06',6,med,'mood');assert.equal(t.pairs.length,6);assert.equal(t.difference,2);assert.equal(t.ready,true);
temporal.days['2026-09-01'].events.push({id:'extra',type:'med',ref:'med-a',time:'23:45'});assert.equal(beforeAfter(temporal,'2026-09-06',6,med,'mood').pairs.length,5);
// Across the 04:00 journal boundary, nearest measurements remain in real chronological order.
const boundary=freshData();ensureDay(boundary,'2026-09-01').events=[{id:'b',type:'mood',time:'03:00',mood:3},{id:'x',type:'med',ref:'med-a',time:'03:30'}];ensureDay(boundary,'2026-09-02').events=[{id:'a',type:'mood',time:'04:30',mood:7}];assert.equal(beforeAfter(boundary,'2026-09-01',1,med,'mood').difference,4);
assert.doesNotThrow(()=>validateBackup(data));const bad=structuredClone(data);bad.days['2026-08-01'].reviewed.med='yes';assert.throws(()=>validateBackup(bad));
console.log('PASS: tied ranks, constant series, sparse data, confirmed absence, lagged groups, thresholds, symptoms, before/after and 04:00 boundary, backward-compatible backup.');
