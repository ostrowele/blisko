export const uid=()=>crypto.randomUUID();
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function addDays(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dateKey(d)}
export function effectiveDate(d=new Date()){const copy=new Date(d);if(copy.getHours()<4)copy.setDate(copy.getDate()-1);return dateKey(copy)}
export function timePosition(time){const [h,m]=time.split(':').map(Number);return ((h+20)%24)+m/60}
export function clockNow(){return new Date().toTimeString().slice(0,5)}
export function eventStamp(key,time){return new Date(`${Number(time.slice(0,2))<4?addDays(key,1):key}T${time}:00`).toISOString()}
export const SYMPTOMS=[['Koncentracja','Rozkojarzenie','Prokrastynacja','Impulsywność','Hiperfokus'],['Nastrój / lęk','Obniżony nastrój','Lęk','Drażliwość','Anhedonia','Ruminacje'],['Ciało','Kołatanie serca','Ból w klatce piersiowej','Zawroty głowy'],['Trawienie','Nudności','Uczucie sytości','Zaparcia','Biegunka'],['Alergie','Kichanie','Katar','Zatkany nos','Świąd oczu'],['Sen','Senność dzienna','Wybudzenia nocne']];
export function freshData(){return {app:'blisko',version:1,rev:0,settings:{theme:'system'},symptoms:SYMPTOMS.flatMap(([group,...names])=>names.map(name=>({id:uid(),name,group}))),meds:[],activities:['Spacer','Bieganie','Trening','Czytanie','Alkohol','Zdarzenie stresowe','Podróż'].map(name=>({id:uid(),name})),drinks:[{id:'water',name:'Woda',ml:250},{id:'coffee',name:'Kawa',ml:200},{id:'tea',name:'Herbata',ml:200}],habits:[],days:{}}}
export function emptyDay(){return {events:[],journal:{},checks:{}}}
export function dayOf(data,key){return data.days[key]??emptyDay()}
export function ensureDay(data,key){return data.days[key]??=emptyDay()}
export function weekStart(key){const n=new Date(key+'T12:00:00').getDay();return addDays(key,-((n+6)%7))}
export function habitDue(h,key){if(h.startDate>key||(h.endDate&&key>=h.endDate))return false;return h.mode!=='days'||h.weekdays.includes(new Date(key+'T12:00:00').getDay())}
export function habitCount(data,h,key){if(h.mode==='weekly'){const start=weekStart(key);return Array.from({length:7},(_,i)=>dayOf(data,addDays(start,i)).checks[h.id]?.filter(Boolean).length||0).reduce((a,b)=>a+b,0)}return dayOf(data,key).checks[h.id]?.filter(Boolean).length||0}
export function average(values){const vals=values.filter(x=>typeof x==='number'&&Number.isFinite(x));return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
export function aggregate(data,end,range){return Array.from({length:range},(_,i)=>{const date=addDays(end,i-range+1),d=dayOf(data,date),m=d.events.filter(e=>e.type==='mood');return {date,mood:average(m.map(e=>e.mood)),energy:average(m.map(e=>e.energy)),productivity:average(m.map(e=>e.productivity)),count:m.length,water:d.events.filter(e=>e.type==='drink'&&e.ref==='water').reduce((s,e)=>s+e.ml,0),symptoms:d.events.filter(e=>e.type==='symptom').length,dayRating:d.journal.rating??null}})}
export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&dateKey(new Date(s+'T12:00:00'))===s}
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
const string=(x,max=20000)=>typeof x==='string'&&x.length<=max;
const number=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
export function validateBackup(input){
 if(!input||input.app!=='blisko'||input.version!==1||!input.days||typeof input.days!=='object'||Array.isArray(input.days))throw Error('To nie jest kopia aplikacji Blisko w obsługiwanej wersji.');
 for(const list of ['symptoms','meds','activities','drinks','habits']){
  if(!Array.isArray(input[list])||input[list].length>5000)throw Error('Nieprawidłowa lista: '+list);
  const ids=new Set();for(const x of input[list]){if(!x||!safeId(x.id)||!string(x.name,200)||!x.name.trim()||ids.has(x.id))throw Error('Nieprawidłowa pozycja: '+list);ids.add(x.id);}
 }
 for(const h of input.habits)if(!['daily','days','weekly'].includes(h.mode)||!Number.isInteger(h.target)||!number(h.target,1,20)||!Array.isArray(h.weekdays)||h.weekdays.some(n=>!Number.isInteger(n)||!number(n,0,6))||!validDate(h.startDate)||(h.endDate&&!validDate(h.endDate))||!Array.isArray(h.slots)||h.slots.length>20||h.slots.some(s=>!string(s,100)))throw Error('Nieprawidłowy harmonogram nawyku.');
 for(const [key,d] of Object.entries(input.days)){
  if(!validDate(key)||!d||!Array.isArray(d.events)||!d.journal||typeof d.journal!=='object'||Array.isArray(d.journal)||!d.checks||typeof d.checks!=='object'||Array.isArray(d.checks))throw Error('Nieprawidłowy zapis dnia.');
  const ids=new Set();for(const e of d.events){
   if(!e||!safeId(e.id)||ids.has(e.id)||!['mood','drink','symptom','med','activity','sleep','bowel','note'].includes(e.type)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time))throw Error('Nieprawidłowy wpis.');ids.add(e.id);
   for(const k of ['mood','energy','productivity'])if(e[k]!=null&&!number(e[k],1,10))throw Error('Nieprawidłowa skala.');
   if(e.type==='drink'&&!number(e.ml,1,10000))throw Error('Nieprawidłowa ilość napoju.');
   if(e.type==='symptom'&&!number(e.severity,1,3))throw Error('Nieprawidłowe nasilenie.');
   for(const k of ['name','note','dose','ref','quality','stool'])if(e[k]!=null&&!string(e[k]))throw Error('Nieprawidłowy opis wpisu.');
  }
  for(const [k,v] of Object.entries(d.journal)){
   if(k==='photo'){if(!string(v,5000000)||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v))throw Error('Nieprawidłowe zdjęcie.');}
   else if(k==='rating'){if(!number(v,1,10))throw Error('Nieprawidłowa ocena dnia.');}
   else if(Array.isArray(v)){if(v.length>30||v.some(x=>!string(x,200)))throw Error('Nieprawidłowe wybory.');}
   else if(!string(v))throw Error('Nieprawidłowa refleksja.');
  }
  for(const [id,checks] of Object.entries(d.checks))if(!safeId(id))throw Error('Nieprawidłowy identyfikator nawyku.');else if(!Array.isArray(checks)||checks.length>30||checks.some(x=>typeof x!=='boolean'))throw Error('Nieprawidłowa historia nawyku.');
 }
 for(const d of input.drinks)if(!number(d.ml,1,10000))throw Error('Nieprawidłowa porcja napoju.');
 if(!input.settings||!['system','light','dark'].includes(input.settings.theme))throw Error('Nieprawidłowy motyw.');
 return structuredClone(input);
}
