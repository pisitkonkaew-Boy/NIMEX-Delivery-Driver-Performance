/* Reads the monthly NIMEX026001 (trip report) and NIMEX06006 (revenue/cost per trip) workbooks and builds one month of data.
   Runs in the browser (admin page) and in Node (tests). Public part = totals only (no names). Admin part = per-driver rows. */
(function(root){
'use strict';
const PFX=/^(นางสาว|นาย|นาง|คุณ|น\.ส\.|นส\.)+/;
const sp=s=>String(s==null?'':s).replace(/\s+/g,' ').trim();
const normKey=s=>String(s==null?'':s).replace(/\s+/g,'').replace(PFX,'');
const DATE=/^\d{2}\/\d{2}\/\d{4}$/;
const num=v=>{const n=typeof v==='number'?v:parseFloat(v);return Number.isFinite(n)?n:0};
const rd=v=>Math.abs(v-Math.round(v))>1e-9?Math.round(v*100)/100:Math.round(v);
/* DC -> region (same map as the AB/CC cost dashboard) */
const DC_REGION={"150  DC เชียงใหม่":"เหนือบน","151  DC ลำพูน":"เหนือบน","152  DC ลำปาง":"เหนือบน","153  DC อุตรดิตถ์":"เหนือกลาง","154  DC แพร่":"เหนือกลาง","155  DC น่าน":"เหนือกลาง","156  DC พะเยา":"เหนือบน","157  DC เชียงราย":"เหนือบน","158  DC แม่ฮ่องสอน":"เหนือบน","159  DC ฝาง":"เหนือบน","160  DC นครสวรรค์":"เหนือล่าง","162  DC กำแพงเพชร":"เหนือล่าง","163  DC ตาก":"เหนือล่าง","164  DC สุโขทัย":"เหนือกลาง","165  DC พิษณุโลก":"เหนือกลาง","166  DC พิจิตร":"เหนือล่าง","167  DC เพชรบูรณ์":"เหนือกลาง","168  DC วิเชียรบุรี":"เหนือกลาง","170  DC ชัยนาท":"เหนือล่าง","171  DC แม่สาย":"เหนือบน","230  DC โคราช":"อีสานล่าง","231  DC บุรีรัมย์":"อีสานล่าง","232  DC สุรินทร์":"อีสานล่าง","233  DC ศรีสะเกษ":"อีสานล่าง","234  DC อุบลราชธานี":"อีสานล่าง","235  DC ยโสธร":"อีสานกลาง","236  DC ชัยภูมิ":"อีสานกลาง","237  DC อำนาจเจริญ":"อีสานล่าง","240  DC ขอนแก่น":"อีสานกลาง","241  DC อุดรธานี":"อีสานบน","242  DC เลย":"อีสานบน","243  DC หนองคาย":"อีสานบน","244  DC มหาสารคาม":"อีสานกลาง","245  DC ร้อยเอ็ด":"อีสานกลาง","246  DC กาฬสินธุ์":"อีสานกลาง","247  DC สกลนคร":"อีสานบน","248  DC นครพนม":"อีสานบน","249  DC มุกดาหาร":"อีสานกลาง","250  DC พล":"อีสานกลาง","251  DC ปากช่อง":"อีสานล่าง","252  DC กันทรลักษ์":"อีสานล่าง","320  DC ชลบุรี":"ตะวันออก","321  DC ระยอง":"ตะวันออก","322  DC จันทบุรี":"ตะวันออก","323  DC พัทยา":"ตะวันออก","325  DC ปราจีนบุรี":"ตะวันออก","328  DC อรัญประเทศ":"ตะวันออก","476  DC ชะอำ":"ตะวันตก","477  DC ประจวบคีรีขันธ์":"ใต้บน","480  DC ทุ่งสง":"ใต้ล่าง","481  DC นครศรีธรรมราช":"ใต้ล่าง","482  DC พังงา":"ใต้บน","483  DC ภูเก็ต":"ใต้บน","484  DC สุราษฎร์":"ใต้บน","486  DC ชุมพร":"ใต้บน","487  DC กระบี่":"ใต้บน","490  DC หาดใหญ่":"ใต้ล่าง","493  DC พัทลุง":"ใต้ล่าง","610  DC พุทธมณฑลสาย 3":"BKK","615  DC ลพบุรี":"กลาง","618  DC สระบุรี":"กลาง","621  DC รังสิต":"BKK","624  DC ฉะเชิงเทรา":"ตะวันออก","631  DC อยุธยา":"กลาง","670  DC ราชบุรี":"ตะวันตก","671  DC กาญจนบุรี":"ตะวันตก","672  DC สุพรรณบุรี":"กลาง","673  DC นครปฐม":"ตะวันตก","674  DC สมุทรสาคร":"ตะวันตก","680  DC สุวรรณภูมิ":"BKK","690  DC พระราม 9":"BKK","691  CDC บางนา":"BKK","801  DC คลังลำพูน":"เหนือบน"};
const REGION=(()=>{const o={};for(const k in DC_REGION)o[sp(k)]=DC_REGION[k];return o})();
const FIELDS=['tD','bills','billsOK','pcs','pcsOK','drops','dropsOK','failC','failE','pBk','pDp','pVip','pOnly','pDrops','km','rev','revOK','cTot','cBef','cAft','cWage','cPick','fine','bd','bc','od','oc','fcD','fcC'];
const F6=['จำนวนบิลของแห้ง','รายได้ค่าขนส่ง (แห้ง)_1','ต้นทุนขนส่งของแห้ง','จำนวนบิลของเย็น','รายได้ค่าขนส่ง (เย็น)_1','ต้นทุนขนส่งของเย็น','จำนวนบิลเข้ารับของแห้ง','รายได้ค่าขนส่งที่เข้ารับ (แห้ง)','ต้นทุนเข้ารับของแห้ง','จำนวนบิลเข้ารับของเย็น','รายได้ค่าขนส่งที่เข้ารับ (เย็น)','ต้นทุนเข้ารับของเย็น'];
const F8=[1,2,4,5,7,8,10,11].map(i=>F6[i]);   // dRa dCa dRc dCc rRa rCa rRc rCc  (revenue/cost only)
const EF=['hasb','bd','bc','od','oc','fcD','fcC'];

function detect(rows){
  const h=(rows[4]||[]).map(x=>String(x==null?'':x).trim());
  if(h.includes('ชื่อ พขร.')&&h.includes('รหัสประเภทรถ'))return'06006';
  let n=0;for(let i=7;i<Math.min(rows.length,60);i++){const r=rows[i];if(r&&r.length>=90&&DATE.test(String(r[2]||'').trim()))n++}
  return n>0?'026001':null}
function dateParts(s){const[d,m,y]=String(s).trim().split('/').map(Number);return{d,m,y:y-543}}
function colNames(hdr){const seen={},names=[];hdr.forEach((h,j)=>{h=String(h==null?'':h).trim()||('c'+j);if(h in seen){seen[h]++;h=h+'_'+seen[h]}else seen[h]=0;names.push(h)});return names}

function rows26(rows){const out=[];for(let i=7;i<rows.length;i++){const r=rows[i];if(r&&DATE.test(String(r[2]==null?'':r[2]).trim()))out.push(r)}return out}
function rows06(rows){const names=colNames(rows[4]||[]),ix={};names.forEach((n,j)=>ix[n]=j);const out=[];
  for(let i=5;i<rows.length;i++){const r=rows[i];if(r&&r[2]&&DATE.test(String(r[3]==null?'':r[3]).trim()))out.push(r)}return{ix,rows:out}}

/* month key 'YYYY-MM' (CE) of the dates in a list of rows */
function monthOf(list,col){const c={};list.forEach(r=>{const p=dateParts(r[col]);const k=p.y+'-'+String(p.m).padStart(2,'0');c[k]=(c[k]||0)+1});const ks=Object.keys(c).sort((a,b)=>c[b]-c[a]);return{main:ks[0]||null,all:c}}

function build(r26,r06,opt){
  opt=opt||{};
  const a=r26?rows26(r26):[],b=r06?rows06(r06):{ix:{},rows:[]};
  const mo26=a.length?monthOf(a,2):null,mo06=b.rows.length?monthOf(b.rows,3):null;
  const month=(opt.month)||(mo26&&mo26.main)||(mo06&&mo06.main);
  if(!month)throw new Error('ไม่พบวันที่ในไฟล์');
  const[Y,Mo]=month.split('-').map(Number),n=new Date(Date.UTC(Y,Mo,0)).getUTCDate();
  const warn=[];
  if(mo26&&mo06&&mo26.main!==mo06.main)warn.push('เดือนของ 026001 ('+mo26.main+') ไม่ตรงกับ 06006 ('+mo06.main+')');
  [mo26,mo06].forEach(mo=>{if(mo&&Object.keys(mo.all).length>1)warn.push('มีวันที่ข้ามเดือนในไฟล์: '+Object.keys(mo.all).join(', ')+' (ใช้เฉพาะเดือน '+month+')')});
  const inMonth=(s)=>{const p=dateParts(s);return p.y===Y&&p.m===Mo};
  const dayOf=s=>dateParts(s).d-1;
  const dcSet=new Set();
  /* ---- 026001 ---- */
  const E=new Map(),H=new Map(),DRV=new Map(),keys=[],kidx=new Map(),nameCnt=new Map(),dcCnt=new Map();let t26=0,badSkip=0;
  for(const r of a){if(!inMonth(r[2])){badSkip++;continue}t26++;
    const d=dayOf(r[2]),grp=String(r[15]==null?'':r[15]).startsWith('01')?0:1,key=normKey(r[9]),dc=sp(r[17]);dcSet.add(dc);
    const bd=num(r[18]),bc=num(r[19]),od=num(r[21]),oc=num(r[22]),fc=num(r[37]),fe=num(r[38]);
    const ud=bd-od,uc=bc-oc,U=ud+uc,fcD=U>0?fc*ud/U:0,fcC=fc-fcD;
    const ek=d+'|'+dc+'|'+grp;let e=E.get(ek);if(!e){e={d,dc,grp,v:[0,0,0,0,0,0,0]};E.set(ek,e)}
    e.v[0]+=(bd+bc)>0?1:0;e.v[1]+=bd;e.v[2]+=bc;e.v[3]+=od;e.v[4]+=oc;e.v[5]+=fcD;e.v[6]+=fcC;
    if(!kidx.has(key)){kidx.set(key,keys.length);keys.push(key)}
    H.set(kidx.get(key)+'|'+dc+'|'+grp+'|'+d,[kidx.get(key),dc,grp,d]);
    const nm=sp(r[9]);let nc=nameCnt.get(key);if(!nc){nc=new Map();nameCnt.set(key,nc)}nc.set(nm,(nc.get(nm)||0)+1);
    let dcn=dcCnt.get(key);if(!dcn){dcn=new Map();dcCnt.set(key,dcn)}dcn.set(dc,(dcn.get(dc)||0)+1);
    const t12=String(r[12]==null?'':r[12]);
    const f={tD:t12==='จัดรถกระจาย+เข้ารับ'?1:0,bills:num(r[20]),billsOK:num(r[23]),pcs:num(r[26]),pcsOK:num(r[29]),drops:num(r[32]),dropsOK:num(r[35]),failC:fc,failE:fe,
      pBk:t12==='จัดรถเข้ารับ Booking'?1:0,pDp:t12==='จัดรถเข้ารับ Droppoint'?1:0,pVip:t12.includes('เครดิต')?1:0,pOnly:t12==='จัดรถเข้ารับอย่างเดียว'?1:0,
      pDrops:num(r[97]),km:num(r[43]),rev:num(r[46]),revOK:num(r[49]),cTot:num(r[52]),cBef:num(r[68]),cAft:num(r[77]),cWage:num(r[79]),cPick:num(r[65]),fine:num(r[78]),
      bd,bc,od,oc,fcD,fcC};
    const dk=key+'|'+d;let o=DRV.get(dk);if(!o){o={key,d,v:new Array(FIELDS.length).fill(0)};DRV.set(dk,o)}
    FIELDS.forEach((k,i)=>{o.v[i]+=f[k]})}
  /* ---- 06006 ---- */
  const C=new Map(),D6=new Map();let t06=0;const ix=b.ix;
  const need=['ชื่อ พขร.','DC','รหัสประเภทรถ','วันที่ใบรายการ',...F6];
  if(b.rows.length)need.forEach(c=>{if(!(c in ix))throw new Error('06006: ไม่พบคอลัมน์ "'+c+'"')});
  for(const r of b.rows){if(!inMonth(r[ix['วันที่ใบรายการ']]))continue;t06++;
    const d=dayOf(r[ix['วันที่ใบรายการ']]),grp=String(r[ix['รหัสประเภทรถ']]==null?'':r[ix['รหัสประเภทรถ']]).trim().startsWith('01')?0:1,dc=sp(r[ix['DC']]),key=normKey(r[ix['ชื่อ พขร.']]);dcSet.add(dc);
    const v=F6.map(c=>num(r[ix[c]]));
    const ck=d+'|'+dc+'|'+grp;let c=C.get(ck);if(!c){c={d,dc,grp,v:new Array(12).fill(0)};C.set(ck,c)}v.forEach((x,i)=>c.v[i]+=x);
    const dk=key+'|'+d;let o=D6.get(dk);if(!o){o={key,d,v:new Array(8).fill(0)};D6.set(dk,o)}
    [1,2,4,5,7,8,10,11].forEach((j,i)=>o.v[i]+=v[j])}
  const dcs=[...dcSet].sort(),dci=new Map(dcs.map((d,i)=>[d,i]));
  const sorted=m=>[...m.values()].sort((x,y)=>x.d-y.d||dci.get(x.dc)-dci.get(y.dc)||x.grp-y.grp);
  const pubC=sorted(C).map(x=>[x.d,dci.get(x.dc),x.grp,...x.v.map(rd)]);
  const pubE=sorted(E).map(x=>[x.d,dci.get(x.dc),x.grp,...x.v.map(rd)]);
  const pubH=[...H.values()].map(h=>[h[0],dci.get(h[1]),h[2],h[3]]).sort((x,y)=>x[3]-y[3]||x[0]-y[0]);
  const drv={};keys.forEach(k=>{const nm=[...nameCnt.get(k)].sort((p,q)=>q[1]-p[1])[0][0],dc=[...dcCnt.get(k)].sort((p,q)=>q[1]-p[1])[0][0];drv[k]={n:nm,dc,r:[]}});
  [...DRV.values()].sort((x,y)=>x.d-y.d).forEach(o=>drv[o.key].r.push([o.d,...o.v.map(rd)]));
  const d6={};[...D6.values()].sort((x,y)=>x.d-y.d).forEach(o=>{(d6[o.key]=d6[o.key]||[]).push([o.d,...o.v.map(rd)])});
  const seen=new Set([...DRV.values()].map(o=>o.d));
  const pub={v:1,m:month,y:Y,mo:Mo,n,dcs:dcs.map(d=>({n:d,r:REGION[d]||'อื่นๆ'})),C:pubC,E:pubE,H:pubH,nk:keys.length,
    days26:[...new Set([...DRV.values()].map(o=>o.d+1))].sort((x,y)=>x-y),days06:[...new Set([...D6.values()].map(o=>o.d+1))].sort((x,y)=>x-y),
    src:{t26,t06,f26:opt.f26||'',f6:opt.f6||'',at:new Date().toISOString().slice(0,10)}};
  const adm={v:1,m:month,drv,d6};
  const unknownDc=dcs.filter(d=>!REGION[d]);
  return{month,pub,adm,warn,stat:{t26,t06,drivers:keys.length,dcs:dcs.length,unknownDc,skipped:badSkip,days26:pub.days26.length,days06:pub.days06.length}}}
const api={sp,normKey,detect,build,FIELDS,F6,F8,EF,DC_REGION,REGION};
if(typeof module!=='undefined')module.exports=api;else root.NXP=api;
})(typeof window!=='undefined'?window:globalThis);
