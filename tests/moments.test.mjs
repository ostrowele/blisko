import assert from 'node:assert/strict';
import {freshData,ensureDay,validateBackup} from '../dist/core.js';
import {photosOf,allPhotos,weeklySummary} from '../dist/moments.js';
const data=freshData(),src='data:image/jpeg;base64,AAAA';
ensureDay(data,'2026-09-20').journal.photo=src;
assert.equal(photosOf(data.days['2026-09-20'].journal)[0].id,'legacy-photo');
assert.equal(data.days['2026-09-20'].journal.photos,undefined);
const monday=ensureDay(data,'2026-09-21');monday.journal.photos=[{id:'p1',src,caption:'Wspomnienie'},{id:'p2',src,caption:''}];
monday.events=[{id:'a',type:'mood',time:'12:00',mood:2},{id:'b',type:'mood',time:'14:00',mood:4},{id:'s1',type:'symptom',ref:'s',name:'Objaw',time:'12:00',severity:2},{id:'s2',type:'symptom',ref:'s',name:'Objaw',time:'14:00',severity:2}];
ensureDay(data,'2026-09-22').events=[{id:'c',type:'mood',time:'12:00',mood:9}];
data.habits=[{id:'h',name:'Codziennie',mode:'daily',target:2,weekdays:[],slots:[],startDate:'2026-09-21'},{id:'w',name:'Tygodniowo',mode:'weekly',target:3,weekdays:[],slots:[],startDate:'2026-09-21'}];monday.checks={h:[true,false],w:[true]};
data.medSets=[{id:'set',name:'Poranek',items:[{ref:'removed-med',name:'Lek',dose:'1'}]}];
const summary=weeklySummary(data,'2026-09-23','2026-09-23');
assert.equal(summary.start,'2026-09-21');assert.equal(summary.end,'2026-09-27');assert.equal(summary.partial,true);assert.equal(summary.dates.length,3);assert.equal(summary.metrics.mood.value,6);assert.equal(summary.metrics.mood.days,2);assert.equal(summary.metrics.energy.value,null);assert.equal(summary.symptoms[0].days,1);assert.equal(summary.habits[0].target,6);assert.equal(summary.habits[1].target,3);assert.equal(summary.photos.length,2);assert.equal(allPhotos(data).length,3);
assert.equal(weeklySummary(data,'2026-01-01','2026-01-04').start,'2025-12-29');
assert.equal(weeklySummary(data,'2026-09-20','2026-09-23').partial,false);
assert.deepEqual(validateBackup(data),data);
for(const mutate of [d=>d.days['2026-09-21'].journal.photos.push({id:'p1',src,caption:''}),d=>d.days['2026-09-21'].journal.photos[0].src='javascript:alert(1)',d=>d.medSets[0].items.push(d.medSets[0].items[0]),d=>d.medSets[0].items[0].dose=5]){const bad=structuredClone(data);mutate(bad);assert.throws(()=>validateBackup(bad));}
console.log('PASS: legacy and multi-photo backups, captions, set validation, Monday/Sunday and year boundary, incomplete weeks, equal daily weights, unique symptom days, habit targets.');
