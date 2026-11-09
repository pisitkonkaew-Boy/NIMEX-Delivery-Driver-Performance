/* Data layer: talks to the Apps Script web app and merges the monthly records into one DATA object for the page. */
(function(root){
'use strict';
const FIELDS=['tD','bills','billsOK','pcs','pcsOK','drops','dropsOK','failC','failE','pBk','pDp','pVip','pOnly','pDrops','km','rev','revOK','cTot','cBef','cAft','cWage','cPick','fine','bd','bc','od','oc','fcD','fcC'];
const getKey=()=>{try{return sessionStorage.getItem('nimex-key')}catch(e){return null}};
async function api(body){const r=await fetch(root.FLEET_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({},body,{key:getKey()}))});const j=await r.json();if(!j.ok)throw new Error(j.error||'failed');return j}
const put=(k,data)=>api({a:'put',k,data});
const del=k=>api({a:'del',k});
/* pub = {key:obj} from GET, adm = {key:obj} from admin POST (or null for the public) */
function build(pub,adm){
  const keys=Object.keys(pub||{}).filter(k=>/^pub:\d{4}-\d{2}$/.test(k)).sort(),mons=keys.map(k=>pub[k]);
  const out={meta:{d0:null,nd:0,months:[],f:FIELDS},dcs:[],C:[],E:[],H:[],drv:{},d6:{}};
  if(!mons.length)return out;
  const D0=Date.UTC(mons[0].y,mons[0].mo-1,1),dci=new Map();let kbase=0;
  out.meta.d0=new Date(D0).toISOString().slice(0,10);
  mons.forEach(M=>{const a=Math.round((Date.UTC(M.y,M.mo-1,1)-D0)/864e5);
    out.meta.months.push({y:M.y,m:M.mo,a,n:M.n,key:M.m,src:M.src,days26:M.days26,days06:M.days06});
    const map=M.dcs.map(d=>{let i=dci.get(d.n);if(i===undefined){i=out.dcs.length;dci.set(d.n,i);out.dcs.push({n:d.n,r:d.r})}return i});
    M.C.forEach(r=>out.C.push([r[0]+a,map[r[1]],r[2],...r.slice(3)]));
    M.E.forEach(r=>out.E.push([r[0]+a,map[r[1]],r[2],...r.slice(3)]));
    M.H.forEach(r=>out.H.push([r[0]+kbase,map[r[1]],r[2],r[3]+a]));
    kbase+=M.nk;
    const A=adm&&adm['adm:'+M.m];
    if(A){for(const k in A.drv){const s=A.drv[k];let o=out.drv[k];if(!o)o=out.drv[k]={n:s.n,dc:s.dc,r:[]};o.dc=s.dc;o.n=s.n;s.r.forEach(r=>o.r.push([r[0]+a,...r.slice(1)]))}
      for(const k in A.d6){(out.d6[k]=out.d6[k]||[]);A.d6[k].forEach(r=>out.d6[k].push([r[0]+a,...r.slice(1)]))}}});
  const last=out.meta.months[out.meta.months.length-1];out.meta.nd=last.a+last.n;
  return out}
function tfetch(url,opt,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(url,Object.assign({signal:c.signal},opt||{})).finally(()=>clearTimeout(t))}
async function loadPublic(){let r;try{r=await tfetch(root.FLEET_API+(root.FLEET_API.includes('?')?'&':'?')+'v='+(root.FLEET_V||1),null,60000)}catch(e){throw new Error(e&&e.name==='AbortError'?'timeout (เกิน 60 วินาที)':'เชื่อมต่อ Apps Script ไม่ได้ (ตรวจว่า Deploy เป็น Anyone และ URL ถูกต้อง): '+(e&&e.message))}
  const tx=await r.text();let j;try{j=JSON.parse(tx)}catch(e){throw new Error('Apps Script ตอบกลับไม่ใช่ข้อมูล JSON (อาจเป็นหน้า login/ข้อผิดพลาดของ Google): '+tx.slice(0,120).replace(/\s+/g,' '))}
  if(!j.ok)throw new Error('Apps Script แจ้งผิดพลาด: '+(j.error||'unknown'));return j.keys||{}}
async function loadAdmin(){const j=await api({a:'admin'});return j.keys||{}}
root.NXS={api,put,del,build,loadPublic,loadAdmin,FIELDS,getKey};
})(window);
