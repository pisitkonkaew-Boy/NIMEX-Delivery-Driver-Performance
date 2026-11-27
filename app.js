(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const pf=(v,d=1)=>Number.isFinite(v)?v.toFixed(d)+'%':'—';
const TH=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const DOWN=['อา','จ','อ','พ','พฤ','ศ','ส'];
const M=DATA.meta;
const FI={};M.f.forEach((f,i)=>FI[f]=i+1);
const PFX=/^(นางสาว|นาย|นาง|คุณ|น\.ส\.|นส\.)+/;
const normKey=s=>String(s||'').replace(/\s+/g,'').replace(PFX,'');
const D0=M.d0?Date.UTC(+M.d0.slice(0,4),+M.d0.slice(5,7)-1,+M.d0.slice(8,10)):0;
const dUTC=i=>new Date(D0+i*864e5),dowI=i=>dUTC(i).getUTCDay(),isoI=i=>dUTC(i).toISOString().slice(0,10),domI=i=>dUTC(i).getUTCDate();
const idxOfISO=s=>Math.round((Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10))-D0)/864e5);
const fdate=s=>{if(!s)return '—';const p=s.split('-');return (+p[2])+' '+TH[+p[1]]+' '+(+p[0]+543)};
const POS_OP='รถผู้ประกอบการ';
const POS_SHORT=p=>/รายวัน/.test(p)?'รายวัน':/รายเดือน/.test(p)?'รายเดือน':p;
const POS_CO=()=>POS_ALL.filter(p=>p!==POS_OP);
const POS_ALL=['พนักงานขับรถประจำสาขา (รายวัน)','พนักงานขับรถประจำสาขา (รายเดือน)','DC จ้างขับ','Outsource ANAR','Outsource MR','พนักงาน DC','รถผู้ประกอบการ'];
const GRP=['รถบริษัท','รถผู้ประกอบการ'];
const REGIONS=['BKK','กลาง','ตะวันออก','ตะวันตก','เหนือบน','เหนือกลาง','เหนือล่าง','อีสานบน','อีสานกลาง','อีสานล่าง','ใต้บน','ใต้ล่าง','อื่นๆ'];
const GCOL={A:'--gA',B:'--gB',C:'--gC',D:'--gD',F:'--gF'};
const KPIS=[['drive','อัตราการขึ้นขับ','≥'],['bills','ประสิทธิภาพ ทุกสาเหตุ','≥'],['billsC','ประสิทธิภาพ ตัดสาเหตุลูกค้า','≥'],['cost','ต้นทุนกระจาย','≤'],['pick','ต้นทุนเข้ารับ','≤']];
const MAIN4=KPIS;/* ชื่อเดิม แต่ตอนนี้มี 5 KPI */
const NE=9;/* E[0..6]=ตัวเลขจากรายงานเที่ยววิ่ง, E[7]=วันขับ (คนxวัน), E[8]=วันทำการ (คนxวัน) */
const PTS={A:4,B:3,C:2,D:1,F:0};
const CFG0={monthN:{},probDays:119,asOf:'2026-10-31',rateWeek:300,rateMonth:1000,minDays:6,monthMode:'month',monthMiss:0,viewerPages:['main','detail'],drop:{minD:35,tiers:[15,20,25,30,35],minP:15,rateP:10,osAdd:10},
 grades:{bills:{A:96,B:95,C:94,D:93},billsC:{A:100,B:99,C:98,D:97},cost:{A:23,B:24,C:25,D:26},pick:{A:4,B:5,C:6,D:7},drive:{A:100,B:95,C:90,D:85}},
 weights:{bills:20,billsC:20,cost:20,pick:20,drive:20},overall:{A:3.5,B:2.5,C:1.5,D:0.5}};
const S={view:'main',mode:'month',mi:M.months.length-1,wk:0,day:1,rk:'drive',veh:window.ADMIN?'all':'co',region:'',dc:'',q:'',sort:{},sel:null,roster:[],rosterReady:false,cfg:JSON.parse(JSON.stringify(CFG0)),canEdit:!!window.ADMIN,pos:'',prob:'',abn:false,setTab:'',msg:''};
function pal(){const s=getComputedStyle(document.documentElement),g=k=>s.getPropertyValue(k).trim();return{ink:g('--ink'),muted:g('--muted'),line:g('--line'),panel:g('--panel'),s:[g('--s1'),g('--s2'),g('--s3'),g('--s4'),g('--s5')],bad:g('--bad')}}
const FF='font-family="Prompt,sans-serif"';
function hbars({items,W=560,P,fmt,labelW=150,rh=30,max}){const H=items.length*rh+8,mx=max||Math.max(1e-9,...items.map(i=>i.v).filter(Number.isFinite)),ri=W-labelW-70,sc=v=>v/mx*ri;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" ${FF}>`;
  items.forEach((it,i)=>{const yy=i*rh+(rh-18)/2,v=Number.isFinite(it.v)?it.v:0,w=Math.max(2,sc(v));
    s+=`<g${it.act?` data-act="${esc(it.act)}" style="cursor:pointer"`:''} data-tip="${esc(it.tip||(it.l+': '+fmt(it.v)))}"><rect x="0" y="${i*rh}" width="${W}" height="${rh}" fill="transparent"/><text x="${labelW-8}" y="${yy+13}" text-anchor="end" font-size="13" fill="${P.ink}">${esc(it.l)}</text><rect x="${labelW}" y="${yy}" width="${w}" height="18" rx="4" fill="${it.c||P.s[0]}"/><text x="${labelW+w+6}" y="${yy+13}" font-size="13" fill="${P.ink}">${esc(fmt(it.v))}</text></g>`});
  return s+'</svg>'}
function donut({parts,center,sub,W=240,P,unit}){const R=W/2-6,r=R*.64,cx=W/2,cy=W/2,tot=parts.reduce((s,p)=>s+Math.max(0,p.v),0)||1;let a=-Math.PI/2,s=`<svg viewBox="0 0 ${W} ${W}" role="img" ${FF}>`;
  const act=parts.filter(p=>p.v>0);
  act.forEach(p=>{const f=p.v/tot;const full=act.length===1;const a2=a+f*Math.PI*2-(full?.0001:.02),l=(a2-a)>Math.PI?1:0,pt=(rr,t)=>`${(cx+rr*Math.cos(t)).toFixed(2)} ${(cy+rr*Math.sin(t)).toFixed(2)}`;
    s+=`<path d="M${pt(R,a)}A${R} ${R} 0 ${l} 1 ${pt(R,a2)}L${pt(r,a2)}A${r} ${r} 0 ${l} 0 ${pt(r,a)}Z" fill="${p.c}" data-tip="${esc(p.l+': '+nf(p.v)+' '+unit+' ('+pf(f*100)+')')}"/>`;a=a2+.02});
  return s+`<text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="26" font-weight="600" font-family="Prompt,sans-serif" fill="${P.ink}">${esc(center)}</text><text x="${cx}" y="${cy+24}" text-anchor="middle" font-size="13" fill="${P.muted}">${esc(sub)}</text></svg>`}
function vbars({items,W=560,H=240,P,fmt,color}){const m={l:44,r:10,t:22,b:42},iw=W-m.l-m.r,ih=H-m.t-m.b,mx=Math.max(1,...items.map(i=>i.v)),nm=Math.max(4,Math.ceil(mx*1.1/4)*4),bw=iw/items.length*.6,st=iw/items.length;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" ${FF}>`;
  for(let k=0;k<=4;k++){const v=nm*k/4,y=m.t+ih*(1-v/nm);s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}" stroke="${P.line}"/><text x="${m.l-6}" y="${y+4}" text-anchor="end" font-size="12" fill="${P.muted}">${esc(fmt(v))}</text>`}
  items.forEach((it,i)=>{const x=m.l+i*st+(st-bw)/2,h=Math.max(it.v>0?2:0,ih*it.v/nm),y=m.t+ih-h;
    s+=`<g data-tip="${esc(it.tip||(it.l+': '+fmt(it.v)))}"><rect x="${m.l+i*st}" y="${m.t}" width="${st}" height="${ih}" fill="transparent"/><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="${it.c||color||P.s[0]}"/><text x="${x+bw/2}" y="${y-5}" text-anchor="middle" font-size="12" fill="${P.ink}">${esc(fmt(it.v))}</text></g><text x="${x+bw/2}" y="${H-22}" text-anchor="middle" font-size="12" fill="${P.muted}">${esc(it.l)}</text>${it.l2?`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="${P.muted}">${esc(it.l2)}</text>`:''}`});
  return s+'</svg>'}

/* ---------- generic table ---------- */
function table({id,cols,rows,rowKey,foot}){const so=S.sort[id]||{};let rs=rows.slice();
  if(so.k){const c=cols.find(c=>c.k===so.k);if(c){const f=c.sv||c.get;rs.sort((a,b)=>{let x=f(a),y=f(b);const nx=x==null||Number.isNaN(x),ny=y==null||Number.isNaN(y);if(nx&&ny)return 0;if(nx)return 1;if(ny)return -1;return(typeof x==='string'?x.localeCompare(y,'th'):x-y)*(so.dir==='desc'?-1:1)})}}
  let h=`<div class="tw"><table class="t" data-id="${id}"><thead><tr>`+cols.map((c,i)=>`<th class="${c.l?'l':''}"><button type="button" data-act="sort:${id}:${c.k}">${esc(c.label)}${so.k===c.k?(so.dir==='desc'?' ▼':' ▲'):''}</button></th>`).join('')+'</tr></thead><tbody>';
  h+=rs.map(r=>{const k=rowKey(r);return `<tr data-act="row:${esc(k)}"${S.sel===k?' class="sel"':''}>`+cols.map((c,i)=>`<td class="${c.l?'l':''}">${c.fmt?c.fmt(r):esc(c.get(r))}</td>`).join('')+'</tr>'}).join('');
  if(foot)h+=foot(rs);
  return h+'</tbody></table></div>'+(rs.length?'':'<div class="empty">ไม่พบรายการตามตัวกรอง</div>')}
const searchMatch=(s)=>!S.q||String(s).toLowerCase().includes(S.q.toLowerCase());
function kpi({l,v,d,g,bar}){return `<div class="kpi" style="--bar:${bar||'var(--gold-l)'}">${g?`<span class="g">${g}</span>`:''}<div class="l">${l}</div><div class="v">${v}</div><div class="d">${d||''}</div></div>`}
function pageHead(eb,h,say){return `<div class="page-h"><p class="eyebrow">${eb}</p><h1>${h}</h1>${say?`<p class="say">${say}</p>`:''}</div>`}
/* ---------- calendar ---------- */
const parseDates=t=>String(t||'').split(/[\s,;]+/).filter(Boolean);
const ymKey=m=>m.y+'-'+String(m.m).padStart(2,'0');
const holN=ym=>Math.max(0,Math.floor(+((S.cfg.monthN||{})[ym])||0));
const isWorkI=()=>true;
let __ld=null;
/* วันสุดท้ายที่มีข้อมูลของแต่ละเดือน (ใช้ตัดวันทำการ ไม่นับวันที่ยังไม่มีข้อมูล) */
function lastDataI(i){if(!__ld||__ld.src!==DATA.H||__ld.n!==DATA.H.length){const mx=new Map();for(const r of DATA.H){const m=M.months.findIndex(x=>r[3]>=x.a&&r[3]<x.a+x.n);if(m>=0&&(!mx.has(m)||r[3]>mx.get(m)))mx.set(m,r[3])}__ld={src:DATA.H,n:DATA.H.length,mx}}
  const m=M.months.findIndex(x=>i>=x.a&&i<x.a+x.n);return m>=0&&__ld.mx.has(m)?__ld.mx.get(m):Infinity}
/* วันทำการของช่วง [a,b] (ภายในเดือนเดียว): วันที่มีข้อมูลถึงวันสุดท้ายของเดือนนั้น − วันหยุดปกติ 1 วัน/สัปดาห์ที่ครบ 7 วัน (1–7, 8–14, 15–21, 22–28) − จำนวนวันนักขัตของเดือน (หักเมื่อช่วงครอบคลุมทั้งเดือน)
   rr = พนักงาน (จำกัดตามวันเริ่ม/ออก/วันยกเว้น) */
function wdInfo(a,b,rr,nc){const mo=M.months.find(m=>a>=m.a&&a<m.a+m.n);if(!mo)return{den:0,days:new Set()};
  const hi=nc?b:Math.min(b,lastDataI(a)),days=new Set(),SK=rr?skipSet(rr):null;
  for(let i=a;i<=hi;i++){const iso=isoI(i);if(rr&&((rr.start&&iso<rr.start)||(rr.end&&iso>rr.end)||SK.has(iso)))continue;days.add(i)}
  let rest=0;for(let k=0;k<4;k++){let ok=true;for(let j=0;j<7;j++)if(!days.has(mo.a+k*7+j)){ok=false;break}if(ok)rest++}
  const whole=a<=mo.a&&hi>=mo.a+mo.n-1&&days.has(mo.a)&&days.has(mo.a+mo.n-1);
  return{den:Math.max(0,days.size-rest-(whole?holN(ymKey(mo)):0)),days,mo,rest,whole}}
function workDays(a,b){return wdInfo(a,b,null).den}
const MI=()=>M.months[S.mi];
function weeksOf(mi){const m=M.months[mi],out=[];let s=m.a;while(s<m.a+m.n){let e=s;while(e<m.a+m.n-1&&dowI(e)!==0)e++;out.push([s,e]);s=e+1}return out}
let __ov=null;
function withRange(r,fn){const o=__ov;__ov=r;try{return fn()}finally{__ov=o}}
function range(){if(__ov)return __ov;const m=MI();if(S.mode==='week'){const w=weeksOf(S.mi);return w[Math.min(S.wk,w.length-1)]}if(S.mode==='day'){const i=m.a+Math.min(S.day,m.n)-1;return[i,i]}return[m.a,m.a+m.n-1]}
const wkTxt=(a,b)=>dowI(b)===0&&b>a?`${domI(a)}–${domI(b)-1} จ–ส · รวมอา. ${domI(b)}`:`${domI(a)}–${domI(b)}`;
const mLabel=m=>TH[m.m]+' '+(m.y+543);
function prevRange(){if(S.mode==='month'){if(S.mi<=0)return null;const p=M.months[S.mi-1];return[p.a,p.a+p.n-1]}
  if(S.mode==='day'){const i=range()[0];return i>0?[i-1,i-1]:null}
  const w=weeksOf(S.mi),ix=Math.min(S.wk,w.length-1);if(ix>0)return w[ix-1];if(S.mi>0){const pw=weeksOf(S.mi-1);return pw[pw.length-1]}return null}
const prevName=()=>S.mode==='day'?'วันก่อนหน้า':S.mode==='week'?'สัปดาห์ก่อนหน้า':'เดือนก่อนหน้า';
const LOWK=k=>k==='cost'||k==='pick';
function dl(k,cur,prev){if(!Number.isFinite(cur)||!Number.isFinite(prev))return '<span class="dl na" title="ไม่มีข้อมูลช่วงก่อนหน้า">—</span>';
  const d=Math.round((cur-prev)*100)/100;if(d===0)return '<span class="dl na">0.00</span>';const good=LOWK(k)?d<0:d>0;
  return `<span class="dl ${good?'up':'dn'}" title="เทียบ${prevName()}: ${good?'ดีขึ้น':'แย่ลง'}">${d>0?'▲':'▼'} ${d>0?'+':'−'}${Math.abs(d).toFixed(2)}</span>`}
function periodLabel(){const m=MI(),[a,b]=range();if(S.mode==='week')return `สัปดาห์ที่ ${Math.min(S.wk,weeksOf(S.mi).length-1)+1} (${wkTxt(a,b)} ${TH[m.m]} ${m.y+543})`;if(S.mode==='day')return `วันที่ ${domI(a)} ${TH[m.m]} ${m.y+543} (${DOWN[dowI(a)]})`;return `ทั้งเดือน ${mLabel(m)} (1–${m.n})`}
/* ---------- aggregation: cost (06006) + delivery (026001) ---------- */
const Z=n=>new Array(n).fill(0);
const BYKEY=(a,b,kf)=>{const mp=new Map();const g=k=>{let o=mp.get(k);if(!o){o={C:Z(12),E:Z(NE)};mp.set(k,o)}return o};
  for(const r of DATA.C){if(r[0]<a||r[0]>b)continue;const k=kf(r);if(k==null)continue;const o=g(k);for(let i=0;i<12;i++)o.C[i]+=r[3+i]}
  for(const r of DATA.E){if(r[0]<a||r[0]>b)continue;const k=kf(r);if(k==null)continue;const o=g(k);for(let i=0;i<7;i++)o.E[i]+=r[3+i]}
  /* อัตราขึ้นขับ (รวม): ตัวตั้ง = วันที่มีเที่ยวของแต่ละคน (ไม่เกินวันทำการ) · ตัวหาร = จำนวนคนที่มีเที่ยวในเดือนนั้น x วันทำการของช่วง (ไม่แยกกลุ่มจ้างเพราะข้อมูลสาธารณะไม่มีชื่อ) */
  const mo=M.months.find(m=>a>=m.a&&a<m.a+m.n);if(mo){const wd=workDays(a,b),per=new Map();
    for(const r of DATA.H){if(r[3]<mo.a||r[3]>=mo.a+mo.n)continue;const k=kf(r);if(k==null)continue;let st=per.get(k);if(!st){st=new Map();per.set(k,st)}
      if(!st.has(r[0]))st.set(r[0],new Set());if(r[3]>=a&&r[3]<=b)st.get(r[0]).add(r[3])}
    per.forEach((st,k)=>{const o=g(k);st.forEach(ds=>{o.E[7]+=Math.min(ds.size,wd)});o.E[8]=st.size*wd})}
  return mp};
const EMPTY=()=>({C:Z(12),E:Z(NE)});
function kv(o,sc){const c=o.C,e=o.E,A=sc!=='cc',K=sc!=='ab';
  const bd=A?e[1]:0,bc=K?e[2]:0,od=A?e[3]:0,oc=K?e[4]:0,fd=A?e[5]:0,fk=K?e[6]:0;
  const dR=(A?c[1]:0)+(K?c[4]:0),dC=(A?c[2]:0)+(K?c[5]:0),rR=(A?c[7]:0)+(K?c[10]:0),rC=(A?c[8]:0)+(K?c[11]:0);
  const tb=bd+bc,tc=bd+bc-fd-fk,ok=od+oc;
  return{drive:(sc==='all'&&e[8]>0)?Math.min(100,e[7]/e[8]*100):NaN,bills:tb>0?ok/tb*100:NaN,billsC:tc>0?ok/tc*100:NaN,cost:dR>0?dC/dR*100:NaN,pick:rR>0?rC/rR*100:NaN,
   n:{drive:[e[7],e[8]],bills:[ok,tb],billsC:[ok,tc],cost:[dC,dR],pick:[rC,rR]}}}
function gradeOf(k,v){const g=S.cfg.grades[k];if(!g||!Number.isFinite(v))return null;const t=['A','B','C','D'].map(l=>g[l]===''||g[l]==null?NaN:+g[l]);if(t.every(Number.isNaN))return null;
  v=Math.round(v*100)/100;const low=k==='cost'||k==='pick';for(let i=0;i<4;i++){if(Number.isNaN(t[i]))continue;if(low?v<=t[i]:v>=t[i])return 'ABCD'[i]}return 'F'}
const gbadge=g=>g?`<span class="gr" style="background:var(${GCOL[g]})" title="เกรด ${g}">${g}</span>`:'';
function overallOf(m){let s=0,w=0,n=0;const ww=S.cfg.weights||{};for(const[k]of KPIS){const g=gradeOf(k,m[k]);if(!g)continue;const wt=+ww[k]||0;s+=PTS[g]*wt;w+=wt;n++}
  if(!w)return null;const sc=s/w,o=S.cfg.overall||{};return{sc,g:sc>=+o.A?'A':sc>=+o.B?'B':sc>=+o.C?'C':sc>=+o.D?'D':'F',n}}
const signed=(v,d=2)=>Number.isFinite(v)?(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(d)+' pt':'—';
/* headcount: distinct drivers with trips (026001) */
function headcount(a,b,kf){const mp=new Map();for(const r of DATA.H){if(r[3]<a||r[3]>b)continue;const k=kf(r);if(k==null)continue;let s=mp.get(k);if(!s){s=new Set();mp.set(k,s)}s.add(r[0])}return mp}
/* ---------- roster / people (company page, probation) ---------- */
function probInfo(r){const end=new Date((r.start||M.d0)+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+(+S.cfg.probDays||0));
  const e=end.toISOString().slice(0,10),left=Math.round((new Date(e+'T00:00:00Z')-new Date(S.cfg.asOf+'T00:00:00Z'))/864e5);return{end:e,left,on:left>=0}}
function personAgg(key,a,b,rr){const o=EMPTY(),x={found:false,days:0,wdDays:0,offDays:0,tD:0,bills:0,billsOK:0,failC:0,failE:0,pDays:0,fine:0};
  const dd=DATA.drv[key],endI=rr&&rr.end?idxOfISO(rr.end):Infinity;if(dd)for(const r of dd.r){const d=r[0];if(d<a||d>b||d>endI)continue;x.found=true;x.days++;
    x.tD+=r[FI.tD];x.bills+=r[FI.bills];x.billsOK+=r[FI.billsOK];x.failC+=r[FI.failC];x.failE+=r[FI.failE];x.fine+=r[FI.fine];
    if(r[FI.pBk]+r[FI.pDp]+r[FI.pVip]+r[FI.pOnly]>0)x.pDays++;
    const e=o.E;e[1]+=r[FI.bd];e[2]+=r[FI.bc];e[3]+=r[FI.od];e[4]+=r[FI.oc];e[5]+=r[FI.fcD];e[6]+=r[FI.fcC]}
  const d6=DATA.d6[key];if(d6)for(const r of d6){if(r[0]<a||r[0]>b||r[0]>endI)continue;const c=o.C;c[1]+=r[1];c[2]+=r[2];c[4]+=r[3];c[5]+=r[4];c[7]+=r[5];c[8]+=r[6];c[10]+=r[7];c[11]+=r[8]}
  /* อัตราขึ้นขับรายคน: วันที่มีใบรายการ ÷ วันทำการ (หยุดปกติสัปดาห์ละ 1 วัน หักนักขัตของเดือน) · ไม่เกิน 100% */
  {const wi=wdInfo(a,b,rr);let num=0;if(dd)new Set(dd.r.filter(q=>q[0]>=a&&q[0]<=b).map(q=>q[0])).forEach(d=>{if(wi.days.has(d))num++});
   const den=wi.den;num=Math.min(num,den);o.E[7]=num;o.E[8]=den;x.wdDays=num;x.den=den}
  x.o=o;return x}
function lastTrip(key){const dd=DATA.drv[key];if(!dd||!dd.r.length)return null;let m=-1;for(const r of dd.r)if(r[0]>m)m=r[0];return m<0?null:m}
const latestDay=()=>{const m=MI(),e=lastDataI(m.a);return Number.isFinite(e)?Math.min(m.n,e-m.a+1):m.n};
const dataEndTxt=()=>{const i=dataEndI();return `${domI(i)} ${TH[+isoI(i).slice(5,7)]} ${+isoI(i).slice(0,4)+543} (${DOWN[dowI(i)]})`};
function dataEndI(){for(let i=M.months.length-1;i>=0;i--){const v=lastDataI(M.months[i].a);if(Number.isFinite(v))return v}return M.months.length?M.months[M.months.length-1].a+M.months[M.months.length-1].n-1:0}
const STALE_DAYS=7;
function staleInfo(r){const li=lastTrip(r.match||normKey(r.name));if(li==null)return{last:null,gap:null,stale:false};const gap=dataEndI()-li;return{last:li,gap,stale:!r.end&&gap>STALE_DAYS}}
/* พนักงานที่มีเที่ยวอยู่ใต้ชื่อที่สะกดต่างในรายงาน: r.alias = [คีย์ชื่อในรายงาน] → รวมเที่ยวเข้าคีย์หลัก (r.match) */
function mergeAliases(){if(!DATA||!DATA.drv)return;S.roster.forEach(r=>{if(!Array.isArray(r.alias)||!r.alias.length)return;const k=r.match||normKey(r.name),main=DATA.drv[k];if(!main)return;
  r.alias.forEach(a=>{const v=DATA.drv[a];if(!v||a===k)return;main.r=main.r.concat(v.r);if(DATA.co&&DATA.co[a])DATA.co[k]=1;delete DATA.drv[a];if(DATA.co)delete DATA.co[a]})})}
/* ตรวจชื่อสะกดต่างจากรายงาน: ชื่อในรายชื่อกับชื่อในรายงานต่างกัน 1–2 ตัวอักษร (DC เดียวกัน หรือ ต่าง 1 ตัวอักษร) และชื่อในรายงานนั้นยังไม่ถูกผูกกับใคร · ผู้ดูแลกดยืนยันทีละคน */
const ed2=(a,b)=>{const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]};
function nameChecks(){const rk=new Set(S.roster.map(r=>r.match||normKey(r.name))),keys=Object.keys(DATA.drv),nz=x=>String(x||'').replace(/\s+/g,''),out=[];
  S.roster.forEach(r=>{const k=r.match||normKey(r.name),own=DATA.drv[k];keys.forEach(c=>{if(c===k||rk.has(c))return;const e=ed2(k,c);if(!e||e>2)return;const v=DATA.drv[c];if(!(nz(v.dc)===nz(r.branch)&&e<=2)&&e>1)return;if(!(nz(v.dc)===nz(r.branch)||e===1))return;
    out.push({r,key:c,cn:v.n,cdc:v.dc,sameDc:nz(v.dc)===nz(r.branch),own:own?own.r.length:0,ct:v.r.length,last:Math.max(...v.r.map(q=>q[0]))})})});
  return out}
async function nameFix(i,mode){const x=(S.nameList||[])[i];if(!x)return;const r=S.roster.find(y=>y.code===x.r.code);if(!r)return;if(x.own>0){r.alias=(r.alias||[]).concat(x.key).filter((v,i,a)=>a.indexOf(v)===i)}else{r.match=x.key}
  if(mode==='name'){if(!r.match)r.match=normKey(r.name);r.name=x.cn.replace(/\s+/g,' ').trim()}
  mergeAliases();
  try{await NXS.put('adm:roster',{list:S.roster});note('บันทึกแล้ว')}catch(e){note(errMsg(e))}render()}
async function nameAll(){if(!S.nmArm){S.nmArm=1;return render()}S.nmArm=0;const list=(S.nameList||[]).slice();
  for(const x of list){const r=S.roster.find(y=>y.code===x.r.code);if(!r)continue;if(x.own>0)r.alias=(r.alias||[]).concat(x.key).filter((v,i,a)=>a.indexOf(v)===i);else r.match=x.key}
  mergeAliases();try{await NXS.put('adm:roster',{list:S.roster});note('บันทึกแล้ว')}catch(e){note(errMsg(e))}render()}
function newNames(){const inR=new Set(S.roster.map(r=>r.match||normKey(r.name)));
  return Object.keys(DATA.drv||{}).filter(k=>!inR.has(k)&&(DATA.co||{})[k]).map(k=>{const d=DATA.drv[k],ds=d.r.map(q=>q[0]);return{key:k,name:d.n,dc:d.dc,n:ds.length,first:Math.min(...ds),last:Math.max(...ds)}}).sort((a,b)=>b.last-a.last||b.n-a.n)}
function monthHasTrips(key,mi){const m=M.months[mi],dd=DATA.drv[key];return !!dd&&dd.r.some(r=>r[0]>=m.a&&r[0]<m.a+m.n)}
const endedBefore=(r,a)=>!!(r.end&&r.end<isoI(a));
function rosterRows(){const[a,b]=range(),wd=workDays(a,b);
  return S.roster.filter(r=>r.pos!==POS_OP&&!endedBefore(r,a)).map(r=>{const key=r.match||normKey(r.name),x=personAgg(key,a,b,r),k=kv(x.o,'all'),m={drive:k.drive,bills:k.bills,billsC:k.billsC,cost:k.cost,pick:k.pick};
    return{r,key,x,m,p:probInfo(r),wd,abn:!monthHasTrips(key,S.mi),ov:null}}).map(q=>{q.ov=q.abn?null:overallOf(q.m);return q})}
function passPeople(q){const r=q.r;if(S.pos&&r.pos!==S.pos)return false;if(S.dc&&r.branch!==S.dc)return false;if(S.prob==='on'&&!q.p.on)return false;if(S.prob==='off'&&q.p.on)return false;return true}
/* ---------- diligence (นับจากเที่ยววิ่ง ไม่ใช้ตารางเข้างาน) ---------- */
function skipSet(r){return new Set(String(r.skip||'').split(/[\s,;]+/).filter(Boolean))}
function diligMonth(){return M.months[S.mi]}
function diligFor(r){
  const m=diligMonth();if(!m)return null;const dd=DATA.drv[r.match||normKey(r.name)],ND=m.n,cf=S.cfg;
  const trip=new Set(dd?dd.r.filter(x=>x[0]>=m.a&&x[0]<m.a+m.n).map(x=>x[0]-m.a+1):[]);
  const wi=wdInfo(m.a,m.a+ND-1,r),N=holN(ymKey(m)),kind=[];
  for(let d=1;d<=ND;d++)kind.push(!wi.days.has(m.a+d-1)?'-':trip.has(d)?'1':'0');
  /* รายสัปดาห์: ต้องขึ้นขับ minDays จาก 7 · เดือนที่มีนักขัต ลดเกณฑ์ได้ 1 สัปดาห์ (ลดตามจำนวนวันนักขัต) ให้สัปดาห์ที่ได้ประโยชน์ก่อน */
  /* รอบ/เดือนที่ข้อมูลยังไม่ครบ = "กำลังนับ" (ไม่นับเป็นขาด) แสดงโอกาสที่จะได้ถ้าที่เหลือขึ้นขับตามเกณฑ์ */
  const dayLast=lastDataI(m.a)-m.a+1,FU=wdInfo(m.a,m.a+ND-1,r,true);
  const MIN=+cf.minDays||6,wk=[];let weekly=0,potWeekly=0,lenUsed=!(N>0);
  for(let n=1;n<=4;n++){let c=0,len=0;for(let d=(n-1)*7+1;d<=n*7;d++)if(kind[d-1]==='1')c++;
    if(dayLast<n*7){const started=dayLast>=(n-1)*7+1;let rem=0;for(let d=Math.max(dayLast+1,(n-1)*7+1);d<=n*7;d++)if(FU.days.has(m.a+d-1))rem++;
      const can=FU.days.size>0&&c+rem>=MIN;if(can&&started)potWeekly+=+cf.rateWeek;else if(can&&!started)potWeekly+=0;
      wk.push({n:c,pay:0,ok:false,req:MIN,len:0,pend:1,started,can,rem,pot:can&&started?+cf.rateWeek:0});continue}
    let req=MIN,ok=c>=req;if(!ok&&!lenUsed&&c>=Math.max(1,MIN-N)){ok=true;lenUsed=true;len=1;req=Math.max(1,MIN-N)}
    wk.push({n:c,pay:ok?+cf.rateWeek:0,ok,req,len});if(ok)weekly+=+cf.rateWeek}
  let have=0,extra=0;kind.forEach((k,j)=>{if(k==='1'){have++;if(j>=28)extra++}});
  const mpend=dayLast<ND;let need=wi.den,miss=Math.max(0,need-have),full=need>0&&need-have<=(+cf.monthMiss||0),mult=cf.monthMode==='week'?wk.filter(w=>w.ok).length:1,monthly=full?(+cf.rateMonth)*mult:0,potMonthly=0,can=false;
  if(mpend){need=FU.den;const so=wi.days.size-have,allow=FU.days.size-FU.den+(+cf.monthMiss||0);miss=Math.max(0,so-allow);full=false;monthly=0;can=need>0&&so<=allow;
    potMonthly=can?(+cf.rateMonth)*(cf.monthMode==='week'?wk.filter(w=>w.ok||(w.pend&&w.started&&w.can)).length:1):0}
  return{kind,trip,ND,wk,weekly,need,have:Math.min(have,Math.max(need,have)),miss,full,monthly,total:weekly+monthly,extra,hol:N,rest:wi.rest,whole:wi.whole,mpend,wpend:wk.some(w=>w.pend),potWeekly,potMonthly,pot:potWeekly+potMonthly,canMonth:can,dayLast,needNow:wi.den}}
function diligRows(){return S.roster.filter(r=>/รายวัน/.test(r.pos)).map(r=>({r,d:diligFor(r)}))}
function passDilig(x){const r=x.r;if(S.dc&&r.branch!==S.dc)return false;return true}

/* ---------- views ---------- */
const GRPCOL=i=>i===0?'var(--s1)':'var(--s2)';
function kcard(k,lab,o,po){const A=kv(o,'all'),B=kv(o,'ab'),C=kv(o,'cc'),a=A[k],ab=B[k],cc=C[k],n=A.n[k],P=po?kv(po,'all'):null,PB=po?kv(po,'ab'):null,PC=po?kv(po,'cc'):null;
  const row=(l,v,cl,pv)=>`<div class="kr"><span class="${cl}">${l}</span><b>${pf(v,2)}</b>${gbadge(gradeOf(k,v))}${dl(k,v,pv)}</div>`;
  return `<div class="kc"><div class="kl">${lab}</div><div class="kv" title="${nf(n[0])} ÷ ${nf(n[1])}">${pf(a,2)}${gbadge(gradeOf(k,a))}</div><div class="kd">เทียบ${prevName()} <b>${dl(k,a,P?P[k]:NaN)}</b></div>${k==='drive'?'':row('AB (แห้ง)',ab,'ab',PB?PB[k]:NaN)+row('CC (เย็น)',cc,'cc',PC?PC[k]:NaN)}</div>`}
function noteMain(){return ''}
function statsHtml(rows){const T0=rows.reduce((s,r)=>s+r.n0,0),T1=rows.reduce((s,r)=>s+r.n1,0),v=S.veh;return `<div class="stats"><div class="stat"><b>${nf(rows.length)}</b><span>DC ที่มีข้อมูล</span></div>${v!=='op'?`<div class="stat"><b>${nf(T0)}</b><span>คนขับ รถบริษัท (รวมทุก DC)</span></div>`:''}${v!=='co'?`<div class="stat"><b>${nf(T1)}</b><span>คนขับ รถผู้ประกอบการ (รวมทุก DC)</span></div>`:''}${v==='all'?`<div class="stat"><b>${nf(T0+T1)}</b><span>รวมคนขับ</span></div>`:''}</div>`}
function todoBanner(){if(!window.ADMIN||!S.rosterReady)return'';let w=0,rs=0,nm=0;try{w=whyRows().filter(x=>!x.w).length;rs=Object.values(whyMap()).filter(x=>x&&x.reason==='ลาออก'&&!x.ok).length;nm=nameChecks().length}catch(e){}
  const it=[w?`<button class="btn" type="button" data-act="view:why">รอชี้แจง ${nf(w)} คน</button>`:'',rs?`<button class="btn" type="button" data-act="view:why">รอยืนยันวันลาออก ${nf(rs)} คน</button>`:'',nm?`<button class="btn" type="button" data-act="goroster">ชื่อสะกดต่างจากรายงาน ${nf(nm)} รายการ</button>`:''].filter(Boolean);
  return it.length?`<div class="warnbox"><b>รอผู้ดูแลดำเนินการ</b> ${it.join(' ')}</div>`:''}
function viewMain(){
  const[a,b]=range();
  const mp=BYKEY(a,b,r=>r[2]),pr=prevRange(),mpP=pr?BYKEY(pr[0],pr[1],r=>r[2]):null;
  let h=pageHead('NIM Express · SEAL Gold Chain','หน้าหลัก','ข้อมูลถึงวันที่ <b>'+dataEndTxt()+'</b>')+todoBanner()+statsHtml(detailRows().filter(r=>!S.region||r.rg===S.region));
  vg().forEach(g=>{const o=mp.get(g)||EMPTY();h+=`<div class="grp-h"><i style="background:${GRPCOL(g)}"></i><h2>${GRP[g]}</h2></div><div class="kcs">${MAIN4.map(([k,l])=>kcard(k,l,o,mpP?(mpP.get(g)||EMPTY()):null)).join('')}</div>`});
  h+=`<div class="card"><div class="sec-h"><h2>รายภาค</h2><div class="seg2" id="seg-rk">${MAIN4.map(([k,l])=>`<button type="button" data-act="rk:${k}" aria-pressed="${S.rk===k}">${l}</button>`).join('')}</div></div><div class="grid2">${vg().map(g=>`<div><div class="note">${GRP[g]}</div><div class="chart" id="ch-r${g}"></div></div>`).join('')}${vg().length===1?`<div><div class="note" id="dcw-n"></div><div class="chart" id="ch-dcw"></div></div>`:''}</div></div>`;
  h+=`<div class="card"><div class="sec-h"><h2>ตารางรายภาค</h2></div><div class="note">กดหัวคอลัมน์เพื่อเรียงลำดับ · ตัวเลขเล็กใต้ค่า = เทียบ${prevName()} (เขียว = ดีขึ้น แดง = แย่ลง)</div><div id="z-table"></div></div>`;
  return h}
function regionData(){const[a,b]=range(),mp=BYKEY(a,b,r=>DATA.dcs[r[1]].r+'|'+r[2]);const out={};REGIONS.forEach(rg=>{out[rg]=[mp.get(rg+'|0')||null,mp.get(rg+'|1')||null]});return out}
function mainCharts(){const P=pal(),rd=regionData(),pct=S.rk==='bills'||S.rk==='billsC'||S.rk==='drive';
  vg().forEach(g=>{const items=REGIONS.filter(rg=>rd[rg][g]).map(rg=>{const v=kv(rd[rg][g],'all')[S.rk];return{l:rg,v,tip:`${rg} · ${GRP[g]}\n${S.rk==='bills'||S.rk==='billsC'?'':''}${pf(v,2)}`}}).filter(i=>Number.isFinite(i.v));
    $('#ch-r'+g).innerHTML=items.length?hbars({items,P,fmt:v=>pf(v,2),labelW:90,max:pct?100:undefined}).replace(/fill="[^"]*" rx="4"/g,m=>m.replace(/fill="[^"]*"/,'fill="'+P.s[g]+'"')):'<div class="empty">ไม่มีข้อมูล</div>'})}
function mainDcw(){const g=vg()[0],P=pal(),lab=(MAIN4.find(x=>x[0]===S.rk)||[0,''])[1],low=S.rk==='cost'||S.rk==='pick',pct=S.rk==='bills'||S.rk==='billsC'||S.rk==='drive';
  const items=detailRows().filter(r=>!S.region||r.rg===S.region).map(r=>({l:r.dc.replace(/^\d+\s*/,''),v:r.k[S.rk]})).filter(i=>Number.isFinite(i.v)).sort((a,b)=>low?b.v-a.v:a.v-b.v).slice(0,10).map(i=>({l:i.l,v:i.v,tip:`${i.l}\n${pf(i.v,2)}`}));
  $('#dcw-n').textContent=`10 DC ที่${low?'สูงสุด':'ต่ำสุด'} · ${lab}`;
  $('#ch-dcw').innerHTML=items.length?hbars({items,P,fmt:v=>pf(v,2),labelW:150,max:pct?100:undefined}).replace(/fill="[^"]*" rx="4"/g,m=>m.replace(/fill="[^"]*"/,'fill="'+P.s[g]+'"')):'<div class="empty">ไม่มีข้อมูล</div>'}
function mainTable(){const rd=regionData(),pr=prevRange(),rdP=pr?withRange(pr,regionData):null;
  const mk=(rd,rg)=>{const a=rd[rg][0],b=rd[rg][1];if(S.veh==='co')return a;if(S.veh==='op')return b;if(!a&&!b)return null;const o=EMPTY();[a,b].forEach(x=>{if(!x)return;for(let i=0;i<12;i++)o.C[i]+=x.C[i];for(let i=0;i<NE;i++)o.E[i]+=x.E[i]});return o};
  const rows=REGIONS.map(rg=>{const o=mk(rd,rg);if(!o)return null;const po=rdP?mk(rdP,rg):null;return{rg,v:kv(o,'all'),pv:po?kv(po,'all'):null}}).filter(Boolean);
  const cols=[{k:'rg',label:'ภาค',l:1,get:r=>r.rg,fmt:r=>esc(r.rg)}];
  MAIN4.forEach(([k,lab])=>cols.push({k,label:lab,get:r=>r.v[k],fmt:r=>Number.isFinite(r.v[k])?pf(r.v[k],2)+gbadge(gradeOf(k,r.v[k]))+`<small class="dlr">${dl(k,r.v[k],r.pv?r.pv[k]:NaN)}</small>`:'—'}));
  return table({id:'main',cols,rows,rowKey:r=>r.rg})}
/* detail */
let __cd=null;
/* DC ที่เคยมีคนขับรถบริษัท (ทั้งช่วงข้อมูล) · DC ที่ไม่มีเลยจะถูกซ่อนจากรายการ DC ทุกหน้า (ยอดรวมภาคและทั้งหมดยังนับครบ) */
function coDcSet(){if(!__cd||__cd.src!==DATA.H||__cd.n!==DATA.H.length){const st=new Set();for(const r of DATA.H)if(r[2]===0)st.add(r[1]);__cd={src:DATA.H,n:DATA.H.length,st}}return __cd.st}
function detailRows(){const[a,b]=range(),mp=BYKEY(a,b,r=>r[1]+'|'+r[2]),hc=headcount(a,b,r=>r[1]+'|'+r[2]);
  return DATA.dcs.map((d,i)=>{const o=[mp.get(i+'|0')||EMPTY(),mp.get(i+'|1')||EMPTY()],all=EMPTY();[0,1].forEach(g=>{for(let j=0;j<12;j++)all.C[j]+=o[g].C[j];for(let j=0;j<NE;j++)all.E[j]+=o[g].E[j]});
    const sel=S.veh==='co'?o[0]:S.veh==='op'?o[1]:all;return{i,dc:d.n,rg:d.r,o,all,k:kv(sel,'all'),n0:(hc.get(i+'|0')||new Set()).size,n1:(hc.get(i+'|1')||new Set()).size,has:sel.E[1]+sel.E[2]+sel.C[1]+sel.C[4]>0}})
  .filter(r=>(r.has||r.n0+r.n1>0)&&(S.veh==='op'||coDcSet().has(r.i)))}
function passDetail(r){if(S.region&&r.rg!==S.region)return false;if(S.q&&!searchMatch(r.dc+' '+r.rg))return false;return true}
function viewDetail(){const rows=detailRows().filter(passDetail),T0=rows.reduce((s,r)=>s+r.n0,0),T1=rows.reduce((s,r)=>s+r.n1,0);
  let h=pageHead('NIM Express · SEAL Gold Chain','รายละเอียด DC',null)+noteMain();
  h+=statsHtml(rows);
  h+=`<div class="card"><div class="sec-h"><h2>ผลรายสาขา (DC)</h2></div><div class="tools"><input type="search" id="q" placeholder="ค้นหา DC หรือภาค" value="${esc(S.q)}" aria-label="ค้นหา"></div><div class="note">จำนวนคน = คนขับที่ไม่ซ้ำชื่อที่มีเที่ยววิ่งในช่วงที่เลือก (นับจากรายงาน) · กดแถวเพื่อดู AB / CC · ตัวเลขเล็กใต้ค่า = เทียบ${prevName()} (เขียว = ดีขึ้น แดง = แย่ลง)</div><div id="z-table"></div></div>`;
  return h}
function detailTable(){const rows=detailRows().filter(passDetail),pr=prevRange(),pm=new Map();if(pr)withRange(pr,detailRows).forEach(r=>pm.set(r.i,r));
  const cols=[{k:'dc',label:'DC',l:1,get:r=>r.dc,fmt:r=>esc(r.dc)},{k:'rg',label:'ภาค',l:1,get:r=>r.rg,fmt:r=>esc(r.rg)},...(S.veh!=='op'?[{k:'n0',label:'คน รถบริษัท',get:r=>r.n0,fmt:r=>nf(r.n0)}]:[]),...(S.veh!=='co'?[{k:'n1',label:'คน ผู้ประกอบการ',get:r=>r.n1,fmt:r=>nf(r.n1)}]:[])];
  MAIN4.forEach(([k,lab])=>cols.push({k,label:lab,get:r=>r.k[k],fmt:r=>pf(r.k[k],2)+gbadge(gradeOf(k,r.k[k]))+`<small class="dlr">${dl(k,r.k[k],pm.has(r.i)?pm.get(r.i).k[k]:NaN)}</small>`}));
  return table({id:'detail',cols,rows,rowKey:r=>String(r.i)})}
/* คนขับทั้งหมดใน DC: เฉพาะพนักงานในรายชื่อ (5 กลุ่มการจ้าง) */
function dcDrivers(dc){const[a,b]=range(),have=new Set(),out=[];
  S.roster.forEach(r=>{if(r.branch!==dc||!POS_ALL.includes(r.pos)||r.pos===POS_OP||endedBefore(r,a))return;const key=r.match||normKey(r.name);have.add(key);const x=personAgg(key,a,b,r),k=kv(x.o,'all'),m={drive:k.drive,bills:k.bills,billsC:k.billsC,cost:k.cost,pick:k.pick},abn=!monthHasTrips(key,S.mi);out.push({r,key,m,abn,ov:abn?null:overallOf(m),pos:r.pos,name:r.name,code:r.code})});
  return out}
function dcDriversHtml(dc){if(!S.roster.length&&!Object.keys(DATA.drv||{}).length)return '';
  const rows=dcDrivers(dc),pr=prevRange(),pm=pr?new Map(withRange(pr,()=>dcDrivers(dc)).map(q=>[q.key,q])):null;
  const pos=[...new Set(rows.map(q=>q.pos))],f=S.dcp||'',sk=S.dcs||'ov',q0=(S.dcq||'').trim().toLowerCase();
  let L=rows.filter(q=>(!f||q.pos===f)&&(!q0||(q.name+' '+q.code).toLowerCase().includes(q0)));
  const val=q=>sk==='ov'?(q.ov?q.ov.sc:NaN):q.m[sk];
  const low=sk==='cost'||sk==='pick';
  L.sort((x,y)=>{const a=val(x),b=val(y),fa=Number.isFinite(a),fb=Number.isFinite(b);if(fa!==fb)return fa?-1:1;if(!fa)return x.name.localeCompare(y.name,'th');return low?b-a:a-b});
  const th=(k,t)=>`<th class="pl" data-act="dcs:${k}" style="cursor:pointer">${t}${sk===k?' ▲':''}</th>`;
  const cell=(q,k)=>{const v=q.m[k],P=pm&&pm.get(q.key)&&!pm.get(q.key).abn?pm.get(q.key).m[k]:NaN;return q.abn?'<td>–</td>':`<td>${pf(v,2)}${gbadge(gradeOf(k,v))}<small class="dlr">${dl(k,v,P)}</small></td>`};
  return `<h3 style="margin:16px 0 4px">คนขับทั้งหมดใน DC นี้ (${nf(rows.length)} คน · มีเที่ยววิ่ง ${nf(rows.filter(q=>!q.abn).length)})</h3>
  <div class="note" style="text-align:left">เรียงจากแย่สุดก่อน · กดหัวคอลัมน์เพื่อเปลี่ยนการเรียง · กดชื่อเพื่อดูรายบุคคล · ผลต่างเทียบ${esc(prevName()||'ช่วงก่อนหน้า')}</div>
  <div class="seg2" style="margin:6px 0"><button data-act="dcp:" class="${f?'':'on'}">ทั้งหมด</button>${pos.map(p=>`<button data-act="dcp:${esc(p)}" class="${f===p?'on':''}">${esc(POS_SHORT?POS_SHORT(p):p)}</button>`).join('')}</div>
  <input id="dcq" class="search" placeholder="ค้นหาชื่อหรือรหัส" value="${esc(S.dcq||'')}" style="margin:4px 0 8px">
  <div class="tw"><table class="t dct"><thead><tr><th class="pl l">ชื่อ</th><th class="pl">กลุ่ม</th>${KPIS.map(([k,l])=>th(k,l.replace('ประสิทธิภาพ ',''))).join('')}${th('ov','คะแนน')}</tr></thead><tbody>`+
  (L.length?L.map(q=>`<tr${q.r?` data-act="dcrow:${esc(q.code)}"`:''}${q.abn?' style="opacity:.55"':''}><td class="l"><b>${esc(q.name)}</b><small class="abcc">${esc(q.code||'–')}</small></td><td>${esc(POS_SHORT?POS_SHORT(q.pos):q.pos)}</td>${KPIS.map(([k])=>cell(q,k)).join('')}<td>${q.ov?`<b>${q.ov.sc.toFixed(1)}</b>${gbadge(q.ov.g)}`:'<span class="note">ไม่มีเที่ยววิ่ง</span>'}</td></tr>`).join(''):'<tr><td colspan="8" class="note">ไม่พบคนขับ</td></tr>')+`</tbody></table></div>`}
function redoDC(){const sc=document.querySelector('.sheet'),t=sc?sc.scrollTop:0;sheetDC(S.dcI);const n=document.querySelector('.sheet');if(n)n.scrollTop=t}
function sheetDC(i){if(String(S.dcI)!==String(i)){S.dcp='';S.dcq='';S.dcs='ov'}const r=detailRows().find(x=>String(x.i)===String(i));if(!r)return;const pr=prevRange(),pRow=pr?withRange(pr,detailRows).find(x=>String(x.i)===String(i)):null;
  let h=`<h2>${esc(r.dc)}</h2><div class="chips"><span class="chip">${esc(r.rg)}</span><span class="chip">${esc(periodLabel())}</span></div><div class="stats">${S.veh!=='op'?`<div class="stat"><b>${nf(r.n0)}</b><span>คนขับ รถบริษัท</span></div>`:''}${S.veh!=='co'?`<div class="stat"><b>${nf(r.n1)}</b><span>คนขับ ผู้ประกอบการ</span></div>`:''}</div>`;
  [[0,'รถบริษัท'],[1,'รถผู้ประกอบการ']].filter(x=>vg().includes(x[0])).forEach(([g,t])=>{const o=r.o[g],A=kv(o,'ab'),B=kv(o,'cc'),T=kv(o,'all'),PT=pRow?kv(pRow.o[g],'all'):null,PA=pRow?kv(pRow.o[g],'ab'):null,PB=pRow?kv(pRow.o[g],'cc'):null;
    h+=`<h3 style="margin:12px 0 4px">${t}</h3><div class="tw"><table class="t"><thead><tr><th class="pl l">KPI</th><th class="pl">รวม</th><th class="pl">AB (แห้ง)</th><th class="pl">CC (เย็น)</th><th class="pl">เทียบ${prevName()} (รวม / AB / CC)</th></tr></thead><tbody>`+
    MAIN4.map(([k,l])=>`<tr><td class="l">${l}</td><td>${pf(T[k],2)}${gbadge(gradeOf(k,T[k]))}</td><td>${pf(A[k],2)}${gbadge(gradeOf(k,A[k]))}</td><td>${pf(B[k],2)}${gbadge(gradeOf(k,B[k]))}</td><td>${dl(k,T[k],PT?PT[k]:NaN)} ${k==='drive'?'':dl(k,A[k],PA?PA[k]:NaN)+' '+dl(k,B[k],PB?PB[k]:NaN)}</td></tr>`).join('')+`</tbody></table></div>`});
  if(window.ADMIN)h+=`<div style="margin:10px 0"><button class="btn" type="button" data-act="dcpng:${i}">ส่งออกรูป PNG ของ DC นี้</button> <span class="msg" id="dc-msg"></span></div>`;
  if(S.veh!=='op')h+=dcDriversHtml(r.dc);S.dcI=i;openSheet(h)}
/* company page */
function groupAgg(pos,rows){const mem=rows.filter(q=>q.r.pos===pos),act=mem.filter(q=>!q.abn),o=EMPTY();act.forEach(q=>{for(let i=0;i<12;i++)o.C[i]+=q.x.o.C[i];for(let i=0;i<NE;i++)o.E[i]+=q.x.o.E[i]});return{pos,mem,act,A:kv(o,'all'),B:kv(o,'ab'),C:kv(o,'cc')}}
function groupsTable(rows){
  const pr=prevRange(),prow=pr?withRange(pr,rosterRows):null,flt=rs=>rs.filter(q=>!S.dc||q.r.branch===S.dc);
  const G=POS_CO().map(p=>groupAgg(p,flt(rows))),GP=prow?POS_CO().map(p=>groupAgg(p,flt(prow))):null;
  const cell=(g,gi,k)=>{const P=GP?GP[gi]:null;return `<td><b>${pf(g.A[k],2)}</b>${gbadge(gradeOf(k,g.A[k]))}<small class="dlr">${dl(k,g.A[k],P?P.A[k]:NaN)}</small>${k==='drive'?'':`<small class="abcc">AB ${pf(g.B[k],2)} · CC ${pf(g.C[k],2)}</small>`}</td>`};
  return `<div class="card"><div class="sec-h"><h2>สรุปตามกลุ่มการจ้าง</h2></div><div class="note">กดแถวเพื่อกรองรายบุคคลด้านล่าง · AB = ของแห้ง, CC = ของเย็น · ตัวเลขเล็กใต้ค่า = เทียบ${prevName()} (เขียว = ดีขึ้น แดง = แย่ลง)</div><div class="tw"><table class="t grp"><thead><tr><th class="pl l">กลุ่มการจ้าง</th>${MAIN4.map(([k,l])=>`<th class="pl">${l}</th>`).join('')}</tr></thead><tbody>`+
  G.map((g,gi)=>`<tr data-act="pos:${esc(g.pos)}"${S.pos===g.pos?' class="sel"':''}><td class="l"><b>${esc(g.pos)}</b><small class="abcc">${nf(g.mem.length)} คน · มีเที่ยววิ่ง ${nf(g.act.length)}${g.mem.length-g.act.length?` · ผิดปกติ ${nf(g.mem.length-g.act.length)}`:''}</small></td>${MAIN4.map(([k])=>cell(g,gi,k)).join('')}</tr>`).join('')+`</tbody></table></div></div>`}
const noPriv=()=>!window.ADMIN&&!S.roster.length?`<div class="card empty">เซิร์ฟเวอร์ยังไม่ส่งข้อมูลรายบุคคลให้ผู้ชม · ผู้ดูแลต้องวางโค้ด Apps Script เวอร์ชันล่าสุด (ไฟล์ Code.gs.txt) แล้ว Deploy เป็น New version จากนั้นกด "บันทึกการตั้งค่า" ที่ ตั้งค่า → เงื่อนไขและเกณฑ์ อีกครั้ง</div>`:'';
function viewCompany(){if(noPriv())return noPriv();const rows=rosterRows(),m=MI();
  let h=pageHead('NIM Express · SEAL Gold Chain','รถบริษัท',null)+noteMain();
  if(!S.rosterReady)return h+'<div class="card empty">กำลังโหลดรายชื่อ…</div>';
  if(!S.roster.length)return h+`<div class="card empty">ยังไม่มีรายชื่อพนักงาน${S.canEdit?' · ไปที่ "ตั้งค่า" เพื่อเพิ่มรายชื่อ':''}</div>`;
  const abn=rows.filter(q=>q.abn&&passPeople(q));
  h+=groupsTable(rows);
  h+=`<div class="card"><div class="sec-h"><h2>${S.abn?'กลุ่มผิดปกติ — ไม่พบเที่ยววิ่งเลยใน '+esc(mLabel(m)):'รายบุคคล'}</h2><div class="seg2"><button type="button" data-act="abn:0" aria-pressed="${!S.abn}">ผลรายคน</button><button type="button" data-act="abn:1" aria-pressed="${S.abn}">ผิดปกติ (${nf(rows.filter(q=>q.abn).length)})</button></div></div>${S.pos?`<div class="chips"><span class="chip">กลุ่ม: ${esc(S.pos)}<button type="button" data-act="pos:" aria-label="ล้างตัวกรอง">×</button></span></div>`:''}<div class="tools"><input type="search" id="q" placeholder="ค้นหาชื่อ รหัส หรือ DC" value="${esc(S.q)}" aria-label="ค้นหา"></div>${S.abn?`<div class="note">คนกลุ่มนี้ไม่ถูกนำไปคำนวณผลใด ๆ — ตรวจชื่อที่ผูกกับรายงาน วันเริ่ม/วันสุดท้าย หรือตำแหน่งในหน้าตั้งค่า</div>`:`<div class="note">เกรดและคะแนนรวมตามเกณฑ์ในหน้าตั้งค่า · คะแนนรวมคิดจาก KPI ที่มีเกรด (ระบุ n/5) · คนที่ไม่มีต้นทุนกระจายหรือเข้ารับ ระบบเฉลี่ยน้ำหนักใหม่ให้เฉพาะ KPI ที่มี · ตัวเลขเล็กใต้ค่า = เทียบ${prevName()} (เขียว = ดีขึ้น แดง = แย่ลง)</div>`}<div id="z-table"></div></div>`;
  return h}
function companyTable(){const dmap=new Map(diligRows().map(x=>[x.r.code,x.d])),pmap=new Map(),pay=q=>{const c=q.r.code;if(!pmap.has(c))pmap.set(c,A_dropOf(q.r));return pmap.get(c)};const pr=prevRange(),pm=new Map();if(pr)withRange(pr,rosterRows).forEach(q=>pm.set(q.r.code,q));const rows=rosterRows().filter(passPeople).filter(q=>S.abn?q.abn:!q.abn).filter(q=>searchMatch(q.r.name+' '+q.r.code+' '+q.r.branch));
  const base=[{k:'n',label:'ชื่อ',l:1,get:q=>q.r.name,fmt:q=>esc(q.r.name)},{k:'c',label:'รหัส',l:1,get:q=>q.r.code,fmt:q=>esc(q.r.code)},{k:'dc',label:'DC',l:1,get:q=>q.r.branch,fmt:q=>esc(q.r.branch)},{k:'pos',label:'กลุ่มการจ้าง',l:1,get:q=>POS_SHORT(q.r.pos),fmt:q=>esc(POS_SHORT(q.r.pos))},{k:'sd',label:'วันเริ่มงาน',l:1,get:q=>q.r.start,fmt:q=>esc(fdate(q.r.start))}];
  if(S.abn)return table({id:'abn',cols:base.concat([{k:'mt',label:'ชื่อที่ใช้ผูกรายงาน',l:1,get:q=>q.key,fmt:q=>esc(q.key)}]),rows,rowKey:q=>q.r.code});
  const cols=[{k:'n',label:'พนักงาน',l:1,get:q=>q.r.name,fmt:q=>`<span class="pn"><b>${esc(q.r.name)}</b><small>${esc(q.r.code)} · ${esc(q.r.branch)} · ${esc(POS_SHORT(q.r.pos))}</small></span>`},{k:'pr',label:'ทดลองงาน',l:1,get:q=>q.p.left,fmt:q=>q.p.on?`<span class="tag gd">เหลือ ${q.p.left} วัน</span>`:'<span class="tag">พ้นแล้ว</span>'}];
  KPIS.forEach(([k,lab])=>cols.push({k:'k_'+k,label:lab,get:q=>q.m[k],fmt:q=>Number.isFinite(q.m[k])?pf(q.m[k],2)+gbadge(gradeOf(k,q.m[k]))+`<small class="dlr">${dl(k,q.m[k],pm.has(q.r.code)?pm.get(q.r.code).m[k]:NaN)}</small>`:'<span style="color:var(--muted)">—</span>'}));
  cols.push({k:'lt',label:'ขึ้นขับล่าสุด',get:q=>{const l=lastTrip(q.key);return l==null?-1:l},fmt:q=>{const t=staleInfo(q.r);const rs=q.r.end&&q.r.end<=isoI(dataEndI())?` <span class="tag" style="background:var(--muted);color:#fff" title="วันสิ้นสุด ${esc(q.r.end)}">ลาออก</span>`:'';return (t.last==null?'—':fdate(isoI(t.last)))+rs+(t.last!=null&&t.stale?` <span class="tag" style="background:var(--bad);color:#fff" title="ไม่มีเที่ยววิ่ง ${t.gap} วัน แต่ยังไม่ได้ใส่วันสิ้นสุด">หยุด ${t.gap} วัน</span>`:'')}},{k:'dy',label:'วันขึ้นขับ / วันทำการ',get:q=>q.x.found?q.x.wdDays:NaN,fmt:q=>q.x.found?nf(q.x.wdDays)+' / '+nf(q.x.den):'—'},{k:'dl',label:'เบี้ยขยัน (บาท/เดือน)',get:q=>dmap.has(q.r.code)?dmap.get(q.r.code).total:-1,fmt:q=>{const g=dmap.get(q.r.code);if(!g)return '<span style="color:var(--muted)">–</span>';const pt=g.pot>0?` <small style="color:var(--muted)">+ โอกาส ${nf(g.pot)}</small>`:'';return (g.total>0?`<b class="good">${nf(g.total)}</b>`:(g.pot>0?pendTag:'0'))+pt}},{k:'dp',label:'ค่าจุดดรอป (บาท/เดือน)',get:q=>{const d=pay(q);return d?d.pay:-1},fmt:q=>{const d=pay(q);return d?(d.pay>0?`<b class="good">${nf(d.pay)}</b>`:'0'):'<span style="color:var(--muted)">–</span>'}},{k:'ov',label:'คะแนนรวม',get:q=>q.ov?q.ov.sc:NaN,fmt:q=>q.ov?q.ov.sc.toFixed(2)+gbadge(q.ov.g)+`<span style="color:var(--muted);font-size:11px"> ${q.ov.n}/5</span>`:'—'});
  return table({id:'company',cols,rows,rowKey:q=>q.r.code})}
const A_dropOf=r=>DROP_POS(r.pos)&&S.veh!=='op'?dropFor(r):null;
function sheetPerson(code){const r=S.roster.find(x=>x.code===code);if(!r)return;const key=r.match||normKey(r.name),dd=DATA.drv[key],m=MI(),p=probInfo(r);
  let h=`<h2>${esc(r.name)}</h2><div class="chips"><span class="chip">${esc(r.code)}</span><span class="chip">${esc(r.branch)}</span><span class="chip">${esc(POS_SHORT(r.pos))}</span><span class="chip">เริ่ม ${esc(fdate(r.start))}</span>${p.on?`<span class="chip">ทดลองงาน เหลือ ${p.left} วัน</span>`:'<span class="chip">พ้นทดลองงานแล้ว</span>'}${(()=>{const t=staleInfo(r);return (t.last!=null?`<span class="chip">ขึ้นขับล่าสุด ${esc(fdate(isoI(t.last)))}</span>`:'')+(r.end?`<span class="chip">สิ้นสุด ${esc(fdate(r.end))}</span>`:'')+(t.stale?`<span class="chip" style="background:var(--bad);color:#fff">ไม่มีเที่ยววิ่ง ${t.gap} วัน · ตรวจว่าลาออกแล้วลืมใส่วันสิ้นสุดหรือไม่</span>`:'')})()}</div>`;
  if(!dd)return openSheet(h+'<div class="empty">ไม่พบเที่ยววิ่งของพนักงานคนนี้ในรายงาน (ตรวจชื่อที่ใช้จับคู่ในหน้าตั้งค่า)</div>');
  const[a,b]=[m.a,m.a+m.n-1],x=personAgg(key,a,b,r),k=kv(x.o,'all'),d6={};(DATA.d6[key]||[]).forEach(q=>d6[q[0]]=q);
  h+=`<div class="stats"><div class="stat"><b>${pf(k.drive,2)}<small style="font-size:13px"> (${nf(x.wdDays)} / ${nf(x.den)})</small></b><span>อัตราขึ้นขับ · วันขึ้นขับ / วันทำการ (${esc(mLabel(m))})</span></div><div class="stat"><b>${pf(k.bills,2)}</b><span>ส่งสำเร็จ ทุกสาเหตุ</span></div><div class="stat"><b>${pf(k.billsC,2)}</b><span>ตัดสาเหตุลูกค้า</span></div><div class="stat"><b>${pf(k.cost,2)} / ${pf(k.pick,2)}</b><span>ต้นทุนกระจาย / เข้ารับ</span></div></div>`;
  {const dl=diligRows().find(x=>x.r.code===r.code),dp=A_dropOf(r),mm=diligMonth();
   if(dl&&dl.d||dp)h+=`<div class="stats">${dl&&dl.d?`<div class="stat"><b>${nf(dl.d.total)}</b><span>เบี้ยขยัน (บาท) · ${esc(mLabel(mm))}${dl.d.pot>0?' · กำลังนับ มีโอกาสอีก '+nf(dl.d.pot):''}</span></div>`:''}${dp?`<div class="stat"><b>${nf(dp.pay)}</b><span>ค่าจุดดรอป (บาท) · ${esc(mLabel(mm))}</span></div>`:''}</div>`}
  {const d=diligFor(r),mm=diligMonth();if(d){const miss=[];d.kind.forEach((t,j)=>{if(t==='0'&&j+1<=d.dayLast)miss.push(j+1)});
   h+=`<div class="tw"><table class="heat"><thead><tr><th></th>${Array.from({length:d.ND},(_,i)=>`<th>${i+1}</th>`).join('')}</tr></thead><tbody><tr><td>${esc(mLabel(mm))}</td>${d.kind.map((t,j)=>`<td><i class="${t==='1'?'on':t==='0'&&j+1<=d.dayLast?'miss':'off'}" data-tip="${j+1} ${TH[mm.m]} · ${DOWN[dowI(mm.a+j)]} · ${t==='1'?'ขึ้นขับ':t==='0'?(j+1<=d.dayLast?'ไม่ได้ขึ้นขับ':'ยังไม่มีข้อมูล'):'ไม่อยู่ในช่วงทำงาน'}"></i></td>`).join('')}</tr></tbody></table></div><div class="legend"><span><i style="background:var(--s1)"></i>ขึ้นขับ</span><span><i style="background:var(--bad)"></i>ไม่ขึ้นขับ</span>${miss.length?`<span>วันที่ไม่ขึ้นขับ: ${miss.map(x=>x+' ('+DOWN[dowI(mm.a+x-1)]+')').join(', ')}</span>`:''}</div>`}}
  const byDay={};dd.r.forEach(q=>byDay[q[0]]=q);let rows='';
  for(let d=a;d<=b;d++){const q=byDay[d];if(!q)continue;const bl=q[FI.bills],ok=q[FI.billsOK],pt=q[FI.pBk]+q[FI.pDp]+q[FI.pVip]+q[FI.pOnly],c=d6[d];
    rows+=`<tr><td>${domI(d)} ${TH[m.m]}</td><td class="l">${DOWN[dowI(d)]}${isWorkI(d)?'':' <span class="tag">หยุด</span>'}</td><td>${q[FI.tD]}</td><td>${pt}</td><td>${nf(bl)}</td><td>${nf(ok)}</td><td>${bl?pf(ok/bl*100):'—'}</td><td>${c?nf(c[2]+c[4]):'—'}</td></tr>`}
  h+=`<div class="tw"><table class="t"><thead><tr><th class="pl l">วันที่</th><th class="pl l">วัน</th><th class="pl">เที่ยวส่ง</th><th class="pl">เที่ยวเข้ารับ</th><th class="pl">บิล</th><th class="pl">ส่งได้</th><th class="pl">%</th><th class="pl">ต้นทุนกระจาย (บาท)</th></tr></thead><tbody>${rows||'<tr><td colspan="8" class="empty">ไม่มีเที่ยววิ่งในเดือนนี้</td></tr>'}</tbody></table></div>`;
  openSheet(h)}
/* ---------- ค่าจุดดรอป (ค่าจัดส่งสำเร็จส่วนเพิ่ม · รถบริษัท) ---------- */
const DROP_POS=p=>POS_ALL.includes(p)&&p!=='พนักงาน DC'&&p!=='รถผู้ประกอบการ';
const isOS=p=>/^Outsource/.test(p||'');
function dropPayDay(pts,main,os){const c=S.cfg.drop||{},add=os?(+c.osAdd||0):0;
  if(main==='P'){const ex=Math.max(0,pts-(+c.minP||0));return{ex,pay:ex*((+c.rateP||0)+add)}}
  const mn=+c.minD||0,T=c.tiers||[];let ex=0,pay=0;
  for(let i=0;i<5;i++){const lo=mn+10*i,hi=i===4?Infinity:lo+10,n=Math.max(0,Math.min(pts,hi)-lo);ex+=n;pay+=n*((+T[i]||0)+add)}
  return{ex,pay}}
function dropFor(r){const m=diligMonth();if(!m)return null;const key=r.match||normKey(r.name),os=isOS(r.pos),days=[],wk=[0,0,0,0,0];let pts=0,ex=0,pay=0,has=false;
  (DATA.d6[key]||[]).forEach(q=>{if(q[0]<m.a||q[0]>=m.a+m.n)return;if(q.length>10)has=true;const D=q[9]||0,P=q[10]||0,t=D+P;if(t<=0)return;const xd=D>0?dropPayDay(D,'D',os):{ex:0,pay:0},xp=P>0?dropPayDay(P,'P',os):{ex:0,pay:0},main=D>0&&P>0?'DP':P>0?'P':'D',x={ex:xd.ex+xp.ex,pay:xd.pay+xp.pay},dom=q[0]-m.a+1;
    days.push({d:q[0],dom,pts:t,D,P,main,ex:x.ex,pay:x.pay});pts+=t;ex+=x.ex;pay+=x.pay;wk[Math.min(4,Math.floor((dom-1)/7))]+=x.pay});
  return{days,pts,ex,pay,wk,paidDays:days.filter(x=>x.pay>0).length,has}}
function dropRows(){return S.roster.filter(r=>DROP_POS(r.pos)).map(r=>({r,d:dropFor(r)})).filter(x=>x.d)}
function dropMonthHas(){const m=diligMonth();if(!m)return false;for(const k in DATA.d6)if(DATA.d6[k].some(q=>q[0]>=m.a&&q[0]<m.a+m.n&&q.length>10))return true;return false}
function viewDrop(){if(noPriv())return noPriv();const m=diligMonth();
  let h=pageHead('NIM Express · SEAL Gold Chain','ค่าจุดดรอป',`ค่าจัดส่งสำเร็จส่วนเพิ่ม · รถบริษัท · ${esc(mLabel(m))} · คำนวณรายวันจากจุดดรอป (ส่งได้ + เข้ารับ) เฉพาะส่วนที่เกินขั้นต่ำ · งานกระจาย/เข้ารับ ใช้ขั้นต่ำและอัตราคนละชุด`);
  if(!S.rosterReady)return h+'<div class="card empty">กำลังโหลดรายชื่อ…</div>';
  const all=dropRows().filter(passDilig),rows=all.filter(x=>x.d.days.length);
  if(!all.length)return h+`<div class="card empty">ยังไม่มีพนักงานในกลุ่มที่ได้ค่าจุดดรอป · เพิ่มได้ที่ "ตั้งค่า"</div>`;
  if(!dropMonthHas())h+=`<div class="warnbox">เดือนนี้ยังไม่มีข้อมูลจุดดรอป${window.ADMIN?' · เติมไฟล์ NIMEX06006 ของเดือนนี้อีกครั้งเพื่อให้ระบบเก็บจุดดรอปรายวัน':''}</div>`;
  const sum=f=>rows.reduce((s,x)=>s+f(x.d),0),tot=sum(d=>d.pay);
  h+=`<div class="kpis">`+kpi({l:'ผู้ได้ค่าจุดดรอป',v:nf(rows.filter(x=>x.d.pay>0).length)+' <small>จาก '+nf(all.length)+' คน</small>',d:`ไม่มีจุดดรอป/ไม่ถึงขั้นต่ำ ${nf(all.length-rows.filter(x=>x.d.pay>0).length)} คน`})+
   kpi({l:'ยอดค่าจุดดรอปรวม (บาท)',v:nf(tot),d:`เฉลี่ย ${nf(rows.length?Math.round(tot/rows.length):0)} บาท/คน`})+
   kpi({l:'จุดดรอปรวม',v:nf(sum(d=>d.pts)),d:`ส่วนเกินขั้นต่ำ ${nf(sum(d=>d.ex))} จุด`})+
   kpi({l:'วันที่ได้ค่าจุด (คน×วัน)',v:nf(sum(d=>d.paidDays)),d:`จาก ${nf(sum(d=>d.days.length))} วันที่มีจุด`})+`</div>`;
  h+=`<div class="grid2"><div class="card"><h2>ยอดตามกลุ่มการจ้าง</h2><div class="note">บาท</div><div class="chart" id="ch-dg"></div></div><div class="card"><h2>ยอดรายสัปดาห์</h2><div class="note">บาท · สัปดาห์ 1–4 = วันที่ 1–28 · 29+ = วันที่ 29 เป็นต้นไป</div><div class="chart" id="ch-dw"></div></div></div>`;
  h+=`<div class="card"><div class="sec-h"><h2>รายบุคคล</h2><button class="btn" type="button" data-act="dropxl">ส่งออก Excel (${nf(rows.length)} คน)</button></div><div class="msg" id="xl-msg"></div><div class="tools"><input type="search" id="q" placeholder="ค้นหาชื่อ รหัส หรือ DC" value="${esc(S.q)}" aria-label="ค้นหา"></div><div id="z-table"></div></div>`;
  return h}
function dropTable(){const rows=dropRows().filter(passDilig).filter(x=>x.d.days.length).filter(x=>searchMatch(x.r.name+' '+x.r.code+' '+x.r.branch));
  const cols=[{k:'n',label:'ชื่อ',l:1,get:x=>x.r.name,fmt:x=>esc(x.r.name)},{k:'c',label:'รหัส',l:1,get:x=>x.r.code,fmt:x=>esc(x.r.code)},{k:'dc',label:'DC',l:1,get:x=>x.r.branch,fmt:x=>esc(x.r.branch)},{k:'pos',label:'กลุ่ม',l:1,get:x=>POS_SHORT(x.r.pos),fmt:x=>esc(POS_SHORT(x.r.pos))},
   {k:'pd',label:'วันที่ได้',get:x=>x.d.paidDays,fmt:x=>nf(x.d.paidDays)},{k:'pt',label:'จุดรวม',get:x=>x.d.pts,fmt:x=>nf(x.d.pts)},{k:'ex',label:'จุดส่วนเกิน',get:x=>x.d.ex,fmt:x=>nf(x.d.ex)}];
  ['สัปดาห์ 1','สัปดาห์ 2','สัปดาห์ 3','สัปดาห์ 4','วันที่ 29+'].forEach((t,i)=>cols.push({k:'w'+i,label:t,get:x=>x.d.wk[i],fmt:x=>x.d.wk[i]>0?nf(x.d.wk[i]):'–'}));
  cols.push({k:'tot',label:'รวม (บาท)',get:x=>x.d.pay,fmt:x=>`<b>${nf(x.d.pay)}</b>`});
  return table({id:'drop',cols,rows,rowKey:x=>x.r.code,foot:rs=>{if(!rs.length)return'';const sm=f=>rs.reduce((s,x)=>s+f(x.d),0);return `<tr class="sum"><td>รวม ${nf(rs.length)} คน</td><td></td><td></td><td></td><td>${nf(sm(d=>d.paidDays))}</td><td>${nf(sm(d=>d.pts))}</td><td>${nf(sm(d=>d.ex))}</td>`+[0,1,2,3,4].map(i=>`<td>${nf(sm(d=>d.wk[i]))}</td>`).join('')+`<td>${nf(sm(d=>d.pay))}</td></tr>`}})}
function dropCharts(){const P=pal(),ok=dropRows().filter(passDilig);
  const gi=POS_ALL.filter(DROP_POS).map(p=>({l:POS_SHORT(p),v:ok.filter(x=>x.r.pos===p).reduce((s,x)=>s+x.d.pay,0)}));
  $('#ch-dg').innerHTML=hbars({items:gi,P,fmt:v=>nf(v),labelW:120});
  const wi=['1','2','3','4','29+'].map((l,i)=>({l:'ส.'+l,v:ok.reduce((s,x)=>s+x.d.wk[i],0)}));
  $('#ch-dw').innerHTML=vbars({items:wi,P,fmt:v=>nf(v),color:P.s[0]})}
function sheetDrop(code){const r=S.roster.find(x=>x.code===code);if(!r)return;const d=dropFor(r);if(!d)return;const m=diligMonth(),c=S.cfg.drop||{};
  let h=`<h2>${esc(r.name)}</h2><div class="chips"><span class="chip">${esc(r.code)}</span><span class="chip">${esc(r.branch)}</span><span class="chip">${esc(POS_SHORT(r.pos))}</span><span class="chip">${esc(mLabel(m))}</span>${isOS(r.pos)?`<span class="chip">+${nf(+c.osAdd||0)} บาท/จุด (Outsource)</span>`:''}</div>`;
  h+=`<div class="stats"><div class="stat"><b>${nf(d.pay)}</b><span>ค่าจุดดรอป (บาท)</span></div><div class="stat"><b>${nf(d.pts)}</b><span>จุดรวม</span></div><div class="stat"><b>${nf(d.ex)}</b><span>จุดส่วนเกินขั้นต่ำ</span></div><div class="stat"><b>${d.paidDays}/${d.days.length}</b><span>วันที่ได้ / วันที่มีจุด</span></div></div>`;
  h+=`<div class="tw"><table class="t"><thead><tr><th class="pl l">วันที่</th><th class="pl l">วัน</th><th class="pl l">ประเภทงาน</th><th class="pl">จุด</th><th class="pl">ขั้นต่ำ</th><th class="pl">จุดส่วนเกิน</th><th class="pl">ค่าจุด (บาท)</th></tr></thead><tbody>`+
   (d.days.map(x=>`<tr><td class="l">${x.dom} ${TH[m.m]}</td><td class="l">${DOWN[dowI(x.d)]}</td><td class="l">${x.main==='P'?'เข้ารับ':x.main==='DP'?'กระจาย + เข้ารับ':'กระจาย'}</td><td>${nf(x.pts)}</td><td>${x.main==='P'?nf(+c.minP||0):x.main==='DP'?nf(+c.minD||0)+' / '+nf(+c.minP||0):nf(+c.minD||0)}</td><td>${nf(x.ex)}</td><td>${x.pay>0?`<b class="good">${nf(x.pay)}</b>`:'–'}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">ไม่มีจุดดรอปในเดือนนี้</td></tr>')+
   `<tr class="sum"><td class="l">รวม</td><td></td><td></td><td>${nf(d.pts)}</td><td></td><td>${nf(d.ex)}</td><td>${nf(d.pay)}</td></tr></tbody></table></div>`;
  openSheet(h)}
async function dropExport(){const msg=$('#xl-msg'),set=t=>{if(msg)msg.textContent=t};const m=diligMonth(),rows=dropRows().filter(passDilig).filter(x=>x.d.days.length).filter(x=>searchMatch(x.r.name+' '+x.r.code+' '+x.r.branch));
  if(!rows.length){set('ไม่มีรายชื่อให้ส่งออก');return}set('กำลังสร้างไฟล์…');
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')}catch(e){set('โหลดตัวสร้าง Excel ไม่สำเร็จ ลองใหม่อีกครั้ง');return}
  try{const wb=new window.ExcelJS.Workbook(),ws=wb.addWorksheet('ค่าจุดดรอป'),ws2=wb.addWorksheet('รายวัน');
    ws.addRow(['รหัส','ชื่อ','DC','กลุ่ม','วันที่ได้','จุดรวม','จุดส่วนเกิน','สัปดาห์ 1','สัปดาห์ 2','สัปดาห์ 3','สัปดาห์ 4','วันที่ 29+','รวม (บาท)']);
    rows.forEach(x=>ws.addRow([x.r.code,x.r.name,x.r.branch,POS_SHORT(x.r.pos),x.d.paidDays,x.d.pts,x.d.ex,...x.d.wk,x.d.pay]));
    ws.getRow(1).font={bold:true};ws.columns.forEach((c,i)=>c.width=i===1||i===2?28:13);
    ws2.addRow(['รหัส','ชื่อ','วันที่','ประเภทงาน','จุด','จุดส่วนเกิน','ค่าจุด (บาท)']);
    rows.forEach(x=>x.d.days.forEach(y=>ws2.addRow([x.r.code,x.r.name,isoI(y.d),y.main==='P'?'เข้ารับ':y.main==='DP'?'กระจาย + เข้ารับ':'กระจาย',y.pts,y.ex,y.pay])));ws2.getRow(1).font={bold:true};
    const buf=await wb.xlsx.writeBuffer();await saveFile(`NIMEX-DropPay-${m.y}-${String(m.m).padStart(2,'0')}.xlsx`,new Blob([buf]));set('ดาวน์โหลดไฟล์แล้ว')}catch(e){console.error(e);set('สร้างไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง')}}
/* ---------- ชี้แจง DC (รายสัปดาห์ จ–อา) · ไม่มีผลต่อตัวเลขใด ๆ ---------- */
const WHY_R=['ลาออก','ปริมาณสินค้าน้อย','ลา/ป่วย','รถเสีย','ย้ายสาขา','อื่นๆ'];
const whyMap=()=>window.__WHY||(window.__WHY={});
const whyMonth=()=>S.ww===-1;
function whyPeriod(){const m=M.months[S.mi];if(whyMonth())return[m.a,m.a+m.n-1];return weeksOf(S.mi)[whyWk()]}
function whyWk(){if(S.ww===-1)return 0;const w=weeksOf(S.mi);if(S.ww!=null)return Math.min(S.ww,w.length-1);const e=dataEndI();let k=-1;w.forEach((x,i)=>{if(x[1]<=e)k=i});if(k<0){w.forEach((x,i)=>{if(x[0]<=e&&k<0)k=i});if(k<0)k=0}return k}/* ค่าเริ่มต้น = สัปดาห์ล่าสุดที่ครบทั้งสัปดาห์ (วันอาทิตย์อยู่ในข้อมูลแล้ว) */
function whyRows(){const [a,b]=whyPeriod(),end=dataEndI(),W=whyMap(),out=[];
  if(a>end)return out;
  S.roster.forEach(r=>{if(!POS_ALL.includes(r.pos)||r.end)return;
    const key=r.match||normKey(r.name),wi=wdInfo(a,b,r);if(!wi.days.size)return;
    const dd=DATA.drv[key],ds=new Set();if(dd)dd.r.forEach(q=>{if(wi.days.has(q[0]))ds.add(q[0])});
    const num=Math.min(ds.size,wi.den),need=Math.min(wi.den,Math.round((+S.cfg.minDays||6)*wi.days.size/7)),li=lastTrip(key),gap=li==null?null:end-li,fl=[];
    if(wi.den>0&&ds.size===0)fl.push('ไม่ขึ้นขับเลย');
    if(!r.end&&li!=null&&gap>STALE_DAYS&&a<=end&&end<=b)fl.push(`ไม่ขึ้นขับเกิน 7 วัน (${gap} วัน)`);
    if(whyMonth()){let bad=0,tot=0;weeksOf(S.mi).forEach(([wa,wb])=>{if(wa>end)return;const w2=wdInfo(wa,wb,r);if(!w2.days.size||w2.den<1)return;let n2=0;if(dd)dd.r.forEach(q=>{if(w2.days.has(q[0]))n2++});tot++;if(n2>0&&n2<Math.min(w2.den,Math.round((+S.cfg.minDays||6)*w2.days.size/7)))bad++});
      if(bad)fl.push(`ขึ้นขับต่ำกว่าเกณฑ์ ${bad} จาก ${tot} สัปดาห์`)}
    else if(num>0&&num<need)fl.push(`ขึ้นขับต่ำกว่าเกณฑ์ (${num}/${need} วัน)`);
    if(!fl.length)return;
    const id=r.code+'|'+isoI(a)+(whyMonth()?'M':'');out.push({r,key,a,b,num,den:wi.den,need,fl,li,id,w:W[id]||null})});
  return out}
const whyPass=x=>(!S.dc||x.r.branch===S.dc)&&(!S.ws||(S.ws==='done')===!!x.w)&&searchMatch(x.r.name+' '+x.r.code+' '+x.r.branch);
const whySt=x=>x.w?(x.w.reason==='ลาออก'&&!x.w.ok?'<span class="tag ok">DC ชี้แจงแล้ว</span> <span class="tag gd">รอผู้ดูแลยืนยันวันลาออก</span>':'<span class="tag ok">DC ชี้แจงแล้ว</span>'):'<span class="tag bad">รอชี้แจง</span>';
function viewWhy(){if(noPriv())return noPriv();if(!S.whyDcInit){S.whyDcInit=1;try{const sv=localStorage.getItem('nimex-why-dc');if(sv&&!S.dc&&dcList().includes(sv))S.dc=sv}catch(e){}}const [a,b]=whyPeriod();
  let h=pageHead('NIM Express · SEAL Gold Chain','ชี้แจง DC',`${whyMonth()?'ทั้งเดือน '+TH[MI().m]+' '+(MI().y+543):`สัปดาห์ที่ ${whyWk()+1} (${wkTxt(a,b)} ${TH[MI().m]} ${MI().y+543})`} · พนักงานที่ผิดปกติ 3 ด้าน: ไม่ขึ้นขับเลย · ไม่ขึ้นขับเกิน 7 วันโดยไม่มีวันสิ้นสุด · ขึ้นขับต่ำกว่าเกณฑ์สัปดาห์ · DC กดที่ชื่อเพื่อเลือกสาเหตุและบอกแนวทางแก้ไข (การชี้แจงไม่มีผลกับตัวเลขในระบบ)`);
  if(!S.rosterReady)return h+'<div class="card empty">กำลังโหลดรายชื่อ…</div>';
  const all=whyRows().filter(x=>!S.dc||x.r.branch===S.dc),wait=all.filter(x=>!x.w).length;
  const c0=t=>all.filter(x=>x.fl.some(f=>f.indexOf(t)===0)).length;
  h+=`<div class="kpis">`+kpi({l:'ต้องชี้แจง (คน)',v:nf(all.length),d:S.dc?esc(S.dc):'ทุก DC'})+kpi({l:'รอชี้แจง',v:nf(wait),d:'ยังไม่มี DC ตอบ'})+kpi({l:'DC ชี้แจงแล้ว',v:nf(all.length-wait),d:all.length?nf((all.length-wait)/all.length*100,0)+'%':'—'})+
   kpi({l:'แยกตามประเด็น',v:`<small>ไม่ขึ้นขับเลย ${nf(c0('ไม่ขึ้นขับเลย'))} · เกิน 7 วัน ${nf(c0('ไม่ขึ้นขับเกิน'))} · ต่ำกว่าเกณฑ์ ${nf(c0('ขึ้นขับต่ำกว่า'))}</small>`,d:''})+`</div>`;
  h+=`<div class="card"><div class="sec-h"><h2>รายชื่อ</h2>${window.ADMIN?`<span><label class="btn" style="cursor:pointer">นำเข้าวันลาออกจาก Excel<input type="file" id="why-imp" accept=".xlsx" hidden></label> <button class="btn" type="button" data-act="whyxl">ส่งออก Excel</button></span>`:''}</div>${window.ADMIN?whyClearBox():''}<div class="msg" id="xl-msg"></div><div class="tools"><input type="search" id="q" placeholder="ค้นหาชื่อ รหัส หรือ DC" value="${esc(S.q)}" aria-label="ค้นหา"></div><div id="z-table"></div></div>`;
  return h}
function whyTable(){const rows=whyRows().filter(whyPass);
  const cols=[{k:'n',label:'ชื่อ',l:1,get:x=>x.r.name,fmt:x=>esc(x.r.name)},{k:'c',label:'รหัส',l:1,get:x=>x.r.code,fmt:x=>esc(x.r.code)},{k:'dc',label:'DC',l:1,get:x=>x.r.branch,fmt:x=>esc(x.r.branch)},{k:'pos',label:'กลุ่ม',l:1,get:x=>POS_SHORT(x.r.pos),fmt:x=>esc(POS_SHORT(x.r.pos))},
   {k:'fl',label:'ประเด็น',l:1,get:x=>x.fl.join(' '),fmt:x=>x.fl.map(f=>`<span class="tag bad">${esc(f)}</span>`).join(' ')},
   {k:'dd',label:'วันขึ้นขับ / วันทำการ',get:x=>x.num,fmt:x=>`${x.num} / ${x.den}`},{k:'lt',label:'ขึ้นขับล่าสุด',get:x=>x.li==null?-1:x.li,fmt:x=>x.li==null?'—':`${domI(x.li)} ${TH[+isoI(x.li).slice(5,7)]}`},
   {k:'st',label:'สถานะ',l:1,get:x=>x.w?1:0,fmt:x=>whySt(x)},{k:'rs',label:'สาเหตุ',l:1,get:x=>x.w?x.w.reason:'',fmt:x=>x.w?esc(x.w.reason)+(x.w.rd?` (${esc(x.w.rd)})`:''):'–'}];
  return table({id:'why',cols,rows,rowKey:x=>x.r.code})}
function sheetWhy(code){const q=whyRows().find(x=>x.r.code===code);if(!q)return;const r=q.r,w=q.w;let by='';try{by=localStorage.getItem('nimex-why-by')||''}catch(e){}
  let h=`<h2>${esc(r.name)}</h2><div class="chips"><span class="chip">${esc(r.code)}</span><span class="chip">${esc(r.branch)}</span><span class="chip">${esc(POS_SHORT(r.pos))}</span><span class="chip">${whyMonth()?'ทั้งเดือน '+TH[MI().m]:'สัปดาห์ '+wkTxt(q.a,q.b)+' '+TH[MI().m]}</span></div>`;
  h+=`<div class="stats"><div class="stat"><b>${q.num}/${q.den}</b><span>วันขึ้นขับ / วันทำการ</span></div><div class="stat"><b>${q.li==null?'—':domI(q.li)+' '+TH[+isoI(q.li).slice(5,7)]}</b><span>ขึ้นขับล่าสุด</span></div></div><p>${q.fl.map(f=>`<span class="tag bad">${esc(f)}</span>`).join(' ')}</p>`;
  if(S.wSaved===code){h+=`<div class="warnbox" style="border-color:var(--gold-l)"><b>✔ บันทึกแล้ว</b> ${esc(new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}))}</div>`;S.wSaved=null}
  if(w&&w.ok)h+=`<div class="warnbox">ผู้ดูแลยืนยันแล้ว · วันสิ้นสุดของพนักงาน = ${esc(w.rd)}</div>`;
  if(w)h+=`<div class="warnbox">ชี้แจงแล้ว · ${esc(w.reason)}${w.rd?' · วันที่ลาออก '+esc(w.rd):''} · โดย ${esc(w.by)} · ${esc(String(w.at||'').slice(0,16).replace('T',' '))}<br>${esc(w.detail)}</div>`;
  h+=`<div class="form" style="margin-top:10px"><label>สาเหตุที่ไม่ขึ้นขับ / ขึ้นขับน้อย<select id="w-reason"><option value=""${w?'':' selected'} disabled>— เลือกสาเหตุ —</option>${WHY_R.map(x=>`<option${w&&w.reason===x?' selected':''}>${esc(x)}</option>`).join('')}</select></label>
   <label id="w-rdl"${(w&&w.reason==='ลาออก')?'':' hidden'}>วันที่ลาออก (วันสุดท้ายที่ทำงาน)<input id="w-rd" type="date" value="${esc((w&&w.rd)||'')}"></label>
   <label>แนวทางแก้ไข / รายละเอียด<textarea id="w-detail" rows="4" maxlength="500" placeholder="เช่น จะให้กลับมาขึ้นขับวันที่ … / ย้ายไป … / รอปริมาณสินค้า">${esc(w?w.detail:'')}</textarea></label>
   <label>ชื่อผู้ชี้แจง<input id="w-by" maxlength="60" value="${esc(w?w.by:by)}"></label></div>
   <div class="msg" id="w-msg"></div><div class="chips" style="margin-top:8px"><button class="btn" type="button" data-act="whysave:${esc(code)}">บันทึก</button>${window.ADMIN&&w&&w.reason==='ลาออก'&&!w.ok?`<button class="btn" type="button" data-act="whyok:${esc(code)}">ยืนยันวันลาออก และตั้งวันสิ้นสุดให้พนักงาน</button>`:''}${window.ADMIN&&w?`<button class="btn" type="button" data-act="whydel:${esc(q.id)}">ลบคำชี้แจง</button>`:''}</div>`;
  openSheet(h)}
async function whySave(code){const q=whyRows().find(x=>x.r.code===code),msg=$('#w-msg'),set=t=>{if(msg)msg.textContent=t};if(!q)return;
  const reason=$('#w-reason').value;if(!reason){set('เลือกสาเหตุก่อน');return}const detail=$('#w-detail').value.trim(),by=$('#w-by').value.trim();
  const rd=reason==='ลาออก'?($('#w-rd').value||''):'';if(reason==='ลาออก'&&!rd){set('ระบุวันที่ลาออก');return}
  if(!detail){set('กรอกแนวทางแก้ไข / รายละเอียดด้วย');return}if(!by){set('กรอกชื่อผู้ชี้แจง');return}
  set('กำลังส่ง…');
  try{const it=await NXS.why({code:q.r.code,w:isoI(q.a)+(whyMonth()?'M':''),dc:q.r.branch,reason,rd,detail,by});whyMap()[q.id]=it;try{localStorage.setItem('nimex-why-by',by)}catch(e){}S.wSaved=code;render();sheetWhy(code)}
  catch(e){set(e&&e.message==='busy'?'ระบบกำลังบันทึกอยู่ ลองใหม่อีกครั้ง':e&&e.message==='bad_item'?'ข้อมูลไม่ครบหรือรูปแบบไม่ถูกต้อง':'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง')}}
async function whyOk(code){const q=whyRows().find(x=>x.r.code===code),msg=$('#w-msg'),set=t=>{if(msg)msg.textContent=t};if(!q||!q.w)return;
  const rd=($('#w-rd')||{}).value||'';if(!rd){set('ระบุวันที่ลาออกก่อน');return}
  set('กำลังบันทึก…');
  try{const r=S.roster.find(x=>x.code===code);r.end=rd;await NXS.put('adm:roster',{list:S.roster});
    const j=await NXS.loadAdmin(),d=j['adm:why']||{items:{}};if(d.items[q.id]){d.items[q.id].ok=1;d.items[q.id].rd=rd;await NXS.put('adm:why',d);window.__WHY=d.items}
    $('#ov-root').innerHTML='';render()}catch(e){set('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง')}}
const lev1=(a,b)=>{if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;const x=a.slice(i),y=b.slice(i);return x.slice(1)===y.slice(1)||x.slice(1)===y||x===y.slice(1)};
/* ผู้ดูแลนำเข้าไฟล์ (คอลัมน์ รหัส + สาเหตุ = ลาออก): ตั้งวันสิ้นสุด = วันขึ้นขับล่าสุด + 1 · คนที่ไม่มีเที่ยวเลยแต่ชื่อใกล้เคียงชื่อในรายงาน (ต่าง 1 ตัวอักษร) จะแก้ชื่อที่ใช้จับคู่ให้ */
async function whyImport(file){const msg=$('#xl-msg'),set=t=>{if(msg)msg.textContent=t};set('กำลังอ่านไฟล์…');
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');const wb=new window.ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());const ws=wb.worksheets[0],hd=[];ws.getRow(1).eachCell((c,i)=>hd[i]=String(c.value||'').trim());
    const ci=hd.indexOf('รหัส'),cr=hd.indexOf('สาเหตุ');if(ci<1||cr<1){set('ไม่พบคอลัมน์ "รหัส" และ "สาเหตุ" ในแถวแรก');return}
    const keys=Object.keys(DATA.drv),done=[],fixed=[],none=[],miss=[];
    ws.eachRow((row,n)=>{if(n===1)return;const code=String(row.getCell(ci).value||'').trim(),why=String(row.getCell(cr).value||'');const spell=why.indexOf('สะกดผิด')>=0;if(!code||(why.indexOf('ลาออก')<0&&!spell))return;
      const r=S.roster.find(x=>String(x.code)===code);if(!r){miss.push(code);return}
      let key=r.match||normKey(r.name);
      if(lastTrip(key)==null){const c=keys.filter(k=>lev1(k,key)&&lastTrip(k)!=null);if(c.length===1){r.match=c[0];fixed.push(`${r.name} → ${c[0]}`);key=c[0]}}
      if(spell&&why.indexOf('ลาออก')<0)return;
      const li=lastTrip(key);if(li==null){none.push(r.name);return}
      r.end=isoI(li+1);done.push(r.name)});
    if(done.length||fixed.length)await NXS.put('adm:roster',{list:S.roster});
    const out=(`ตั้งวันสิ้นสุดแล้ว ${done.length} คน (วันขึ้นขับล่าสุด + 1)`+(fixed.length?` · แก้ชื่อจับคู่ ${fixed.length}: ${fixed.join(', ')}`:'')+(none.length?` · ไม่มีเที่ยวเลย ข้าม ${none.length}: ${none.join(', ')}`:'')+(miss.length?` · ไม่พบรหัส ${miss.length}: ${miss.join(', ')}`:''));render();{const m2=$('#xl-msg');if(m2)m2.textContent=out}}
  catch(e){console.error(e);set('นำเข้าไม่สำเร็จ ลองใหม่อีกครั้ง')}}
function whyClearBox(){const [a,b]=whyPeriod();if(!S.wcA)S.wcA=isoI(a);if(!S.wcB)S.wcB=isoI(b);const n=whyClearList().length,arm=S.wcArm;
  return `<div class="tools" style="flex-wrap:wrap;gap:8px;align-items:center"><b>ล้างคำชี้แจง</b> <label>ตั้งแต่ <input type="date" id="wc-a" value="${S.wcA}"></label> <label>ถึง <input type="date" id="wc-b" value="${S.wcB}"></label> <span>${S.dc?'เฉพาะ DC '+esc(S.dc):'ทุก DC'} · พบ ${nf(n)} รายการ</span> <button class="btn" type="button" data-act="wclear" ${n?'':'disabled'}>${arm?'กดอีกครั้งเพื่อยืนยันล้าง '+nf(n)+' รายการ':'ล้างช่วงนี้'}</button>${arm?' <button class="btn" type="button" data-act="wclearx">ยกเลิก</button>':''}</div><div class="msg" style="font-size:12px">ล้างแล้วคนนั้นจะกลับมาเป็น "รอชี้แจง" ให้ DC กรอกใหม่ (เทียบจากวันเริ่มสัปดาห์/เดือนของคำชี้แจง) · วันลาออกที่ยืนยันไปแล้วและตั้งวันสิ้นสุดในรายชื่อแล้วจะไม่ถูกย้อนกลับ</div>`}
function whyClearList(){const W=whyMap();return Object.keys(W).filter(id=>{const it=W[id],d=(it.w||id.split('|')[1]||'').slice(0,10);if(!d||d<S.wcA||d>S.wcB)return false;if(S.dc){const r=S.roster.find(x=>x.code===it.code);if(!r||r.branch!==S.dc)return false}return true})}
async function whyClear(){const ids=whyClearList(),msg=$('#xl-msg');try{const j=await NXS.loadAdmin(),d=j['adm:why']||{items:{}};ids.forEach(id=>delete d.items[id]);await NXS.put('adm:why',d);window.__WHY=d.items;S.wcArm=false;render();const m=$('#xl-msg');if(m)m.textContent='ล้างแล้ว '+ids.length+' รายการ'}catch(e){if(msg)msg.textContent='ล้างไม่สำเร็จ: '+(e.message||e)}}
async function whyDel(id){const msg=$('#w-msg');try{const j=await NXS.loadAdmin(),d=j['adm:why']||{items:{}};delete d.items[id];await NXS.put('adm:why',d);window.__WHY=d.items;$('#ov-root').innerHTML='';render()}catch(e){if(msg)msg.textContent='ลบไม่สำเร็จ ลองใหม่อีกครั้ง'}}
function resignRows(){const W=Object.values(whyMap()),by=new Map();W.forEach(it=>{(by.get(it.code)||by.set(it.code,[]).get(it.code)).push(it)});
  const out=[];S.roster.forEach(r=>{const its=(by.get(r.code)||[]).slice().sort((x,y)=>String(y.at||'').localeCompare(String(x.at||''))),rs=its.find(i=>i.reason==='ลาออก');if(!r.end&&!rs)return;
    const it=rs||its[0]||null,key=r.match||normKey(r.name),li=lastTrip(key);
    out.push({r,it,n:its.length,li,end:r.end||'',rd:r.end||(rs&&rs.rd)||'',st:r.end?'ลาออก':'รอผู้ดูแลยืนยัน'})});
  return out.filter(x=>!S.dc||x.r.branch===S.dc)}
function viewResign(){if(noPriv())return noPriv();let h=pageHead('NIM Express · SEAL Gold Chain','ประวัติลาออก','พนักงานที่ลาออกหรือแจ้งลาออก เก็บไว้เป็นประวัติ ไม่หายไปแม้ล้างคำชี้แจง');
  if(!S.rosterReady)return h+'<div class="card empty">กำลังโหลดรายชื่อ…</div>';
  const rows=resignRows(),done=rows.filter(x=>x.r.end).length;
  h+=`<div class="kpis">`+kpi({l:'ทั้งหมด (คน)',v:nf(rows.length),d:S.dc?esc(S.dc):'ทุก DC'})+kpi({l:'ลาออก (มีวันสิ้นสุดแล้ว)',v:nf(done),d:''})+kpi({l:'รอผู้ดูแลยืนยัน',v:nf(rows.length-done),d:''})+`</div>`;
  h+=`<div class="card"><div class="sec-h"><h2>รายชื่อ</h2><span><button class="btn" type="button" data-act="resignxl">ส่งออก Excel</button></span></div><div class="msg" id="xl-msg"></div><div id="z-table">${resignTable(rows)}</div></div>`;
  return h}
function resignTable(rows){const cols=[{k:'n',label:'ชื่อ',l:1,get:x=>x.r.name,fmt:x=>esc(x.r.name)},{k:'c',label:'รหัส',l:1,get:x=>x.r.code,fmt:x=>esc(x.r.code)},{k:'dc',label:'DC',l:1,get:x=>x.r.branch,fmt:x=>esc(x.r.branch)},{k:'pos',label:'กลุ่ม',l:1,get:x=>POS_SHORT(x.r.pos),fmt:x=>esc(POS_SHORT(x.r.pos))},
   {k:'sd',label:'วันเริ่มงาน',l:1,get:x=>x.r.start||'',fmt:x=>esc(x.r.start||'–')},{k:'lt',label:'ขึ้นขับล่าสุด',get:x=>x.li==null?-1:x.li,fmt:x=>x.li==null?'—':`${domI(x.li)} ${TH[+isoI(x.li).slice(5,7)]}`},
   {k:'rs',label:'สาเหตุที่ชี้แจง',l:1,get:x=>x.it?x.it.reason:'',fmt:x=>x.it?esc(x.it.reason):'–'},{k:'dt',label:'รายละเอียด',l:1,get:x=>x.it?x.it.detail:'',fmt:x=>x.it?`<span style="white-space:normal;display:inline-block;min-width:200px">${esc(x.it.detail)}</span>`:'–'},
   {k:'by',label:'ผู้ชี้แจง',l:1,get:x=>x.it?x.it.by:'',fmt:x=>x.it?esc(x.it.by):'–'},{k:'at',label:'เวลาชี้แจง',l:1,get:x=>x.it?String(x.it.at||''):'',fmt:x=>x.it?esc(String(x.it.at||'').slice(0,16).replace('T',' ')):'–'},
   {k:'st',label:'สถานะ',l:1,get:x=>x.st,fmt:x=>x.r.end?'<span class="tag bad">ลาออก</span>':'<span class="tag">รอผู้ดูแลยืนยัน</span>'},{k:'rd',label:'วันที่ลาออก',l:1,get:x=>x.rd,fmt:x=>esc(x.rd||'–')}];
  return table({id:'resign',cols,rows,rowKey:x=>x.r.code})}
async function resignExport(){const msg=$('#xl-msg'),set=t=>{if(msg)msg.textContent=t};set('กำลังสร้างไฟล์…');
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')}catch(e){set('โหลดตัวสร้าง Excel ไม่สำเร็จ ลองใหม่อีกครั้ง');return}
  try{const wb=new window.ExcelJS.Workbook(),ws=wb.addWorksheet('ประวัติลาออก');ws.addRow(['รหัส','ชื่อ','DC','กลุ่ม','วันเริ่มงาน','สาเหตุที่ชี้แจง','รายละเอียด','ผู้ชี้แจง','เวลาชี้แจง','สถานะ','วันที่ลาออก']);
    resignRows().forEach(x=>ws.addRow([x.r.code,x.r.name,x.r.branch,POS_SHORT(x.r.pos),x.r.start||'',x.it?x.it.reason:'',x.it?x.it.detail:'',x.it?x.it.by:'',x.it?String(x.it.at||'').slice(0,16).replace('T',' '):'',x.st,x.rd]));
    ws.getRow(1).font={bold:true};ws.columns.forEach((c,i)=>c.width=i===6?40:16);
    const buf=await wb.xlsx.writeBuffer();await saveFile('NIMEX-Resign-History.xlsx',new Blob([buf]));set('ดาวน์โหลดไฟล์แล้ว')}catch(e){console.error(e);set('สร้างไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง')}}
async function whyExport(){const msg=$('#xl-msg'),set=t=>{if(msg)msg.textContent=t};set('กำลังสร้างไฟล์…');
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')}catch(e){set('โหลดตัวสร้าง Excel ไม่สำเร็จ ลองใหม่อีกครั้ง');return}
  try{const wb=new window.ExcelJS.Workbook(),ws=wb.addWorksheet('คำชี้แจงทั้งหมด'),ws2=wb.addWorksheet('สัปดาห์ที่เลือก'),byCode=new Map(S.roster.map(r=>[r.code,r]));
    ws.addRow(['สัปดาห์เริ่ม (จันทร์)','รหัส','ชื่อ','DC','สาเหตุ','วันที่ลาออก','ผู้ดูแลยืนยัน','แนวทางแก้ไข','ผู้ชี้แจง','เวลา']);
    Object.values(whyMap()).sort((x,y)=>y.w.localeCompare(x.w)||x.code.localeCompare(y.code)).forEach(it=>{const r=byCode.get(it.code);ws.addRow([it.w,it.code,r?r.name:'',it.dc,it.reason,it.rd||'',it.reason==='ลาออก'?(it.ok?'ยืนยันแล้ว':'รอยืนยัน'):'',it.detail,it.by,String(it.at||'').slice(0,16).replace('T',' ')])});
    ws2.addRow(['รหัส','ชื่อ','DC','กลุ่ม','ประเด็น','วันขึ้นขับ','วันทำการ','สถานะ','สาเหตุ','แนวทางแก้ไข','ผู้ชี้แจง']);
    whyRows().filter(whyPass).forEach(x=>ws2.addRow([x.r.code,x.r.name,x.r.branch,POS_SHORT(x.r.pos),x.fl.join(' / '),x.num,x.den,x.w?'DC ชี้แจงแล้ว':'รอชี้แจง',x.w?x.w.reason:'',x.w?x.w.detail:'',x.w?x.w.by:'']));
    [ws,ws2].forEach(t=>{t.getRow(1).font={bold:true};t.columns.forEach((c,i)=>c.width=i===5||i===7||i===9||i===4?38:16)});
    const buf=await wb.xlsx.writeBuffer();await saveFile(`NIMEX-DC-Explain-${isoI(whyRows().length?whyRows()[0].a:MI().a)}.xlsx`,new Blob([buf]));set('ดาวน์โหลดไฟล์แล้ว')}catch(e){console.error(e);set('สร้างไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง')}}
/* diligence page */
function viewDilig(){if(noPriv())return noPriv();const m=diligMonth();
  let h=pageHead('NIM Express · SEAL Gold Chain','สรุปเบี้ยขยัน',`เฉพาะพนักงานขับรถประจำสาขา (รายวัน) · ${esc(mLabel(m))} · สัปดาห์นับตามวันที่ (1–7, 8–14, 15–21, 22–28) จ่ายไม่เกิน 4 สัปดาห์ · วันที่ 29 ขึ้นไปไม่คิดสัปดาห์ แต่มีผลต่อเบี้ยรายเดือน`);
  if(!S.rosterReady)return h+'<div class="card empty">กำลังโหลดรายชื่อ…</div>';
  const rows=diligRows().filter(x=>x.d&&passDilig(x));
  if(!rows.length)return h+`<div class="card empty">ยังไม่มีพนักงานรายวันในรายชื่อ · เพิ่มได้ที่ "ตั้งค่า"</div>`;
  const sum=f=>rows.reduce((s,x)=>s+f(x.d),0),cnt=f=>rows.filter(x=>f(x.d)>0).length;
  const wkT=sum(d=>d.weekly),moT=sum(d=>d.monthly),tot=wkT+moT,N=holN(ymKey(diligMonth()));
  h+=`<div class="kpis">`+kpi({l:'ผู้ได้รับเบี้ยขยัน',v:nf(cnt(d=>d.total))+' <small>จาก '+nf(rows.length)+' คน</small>',d:`ไม่ได้เลย ${nf(rows.length-cnt(d=>d.total))} คน`})+
   kpi({l:'ยอดเบี้ยขยันรวม (บาท)',v:nf(tot),d:`สัปดาห์ + เดือน`+(sum(d=>d.pot)>0?` · กำลังนับ มีโอกาสอีก ${nf(sum(d=>d.pot))}`:'')})+
   kpi({l:'เบี้ยรายสัปดาห์ (บาท)',v:nf(wkT),d:`${nf(sum(d=>d.wk.filter(w=>w.pay>0).length))} ครั้ง × ${nf(+S.cfg.rateWeek)} บาท`})+
   kpi({l:'เบี้ยรายเดือน (บาท)',v:nf(moT),d:`${nf(cnt(d=>d.monthly))} คน × ${nf(+S.cfg.rateMonth)} บาท`})+`</div>`;
  if(window.ADMIN)h+=`<div class="warnbox">มาวันไหนก็ได้ · สัปดาห์ (1–7, 8–14, 15–21, 22–28) ต้องขึ้นขับ ${nf(+S.cfg.minDays)} จาก 7 วัน${N?` · เดือนนี้มีนักขัต ${N} วัน ลดเกณฑ์ได้ 1 สัปดาห์ (เหลือ ${Math.max(1,(+S.cfg.minDays||6)-N)} จาก 7)`:''} · วันทำการรายเดือน = จำนวนวัน − หยุดปกติสัปดาห์ละ 1 วัน${N?' − นักขัต '+N+' วัน':''} · เบี้ยรายเดือนขาดได้ไม่เกิน ${nf(+S.cfg.monthMiss||0)} วัน · แก้ได้ที่ "ตั้งค่า → เงื่อนไขและเกณฑ์"</div>`;
  h+=`<div class="grid2"><div class="card"><h2>ผู้ได้เบี้ยรายสัปดาห์</h2><div class="note">จำนวนคนที่ได้ ${nf(+S.cfg.rateWeek)} บาท ในแต่ละสัปดาห์</div><div class="chart" id="ch-wk"></div></div><div class="card"><h2>สัดส่วนยอดจ่าย</h2><div class="note">บาท · รายสัปดาห์ เทียบ รายเดือน</div><div class="chart" id="ch-split" style="max-width:300px;margin-inline:auto"></div><div class="legend" id="lg-split"></div></div></div>`;
  h+=`<div class="card"><div class="sec-h"><h2>รายบุคคล</h2><button class="btn" type="button" id="xl-go">ส่งออก Excel (${nf(rows.length)} คน)</button></div><div class="msg" id="xl-msg"></div><div class="tools"><input type="search" id="q" placeholder="ค้นหาชื่อ รหัส หรือ DC" value="${esc(S.q)}" aria-label="ค้นหา"></div><div id="z-table"></div></div>`;
  return h}
const pendTag='<span class="tag gd">กำลังนับ</span>';
function wkCell(w){if(w.pend)return w.started?`${pendTag} <small style="color:var(--muted)">(${w.n} วัน · ${w.can?'มีโอกาสได้ '+nf(+S.cfg.rateWeek):'ไม่ทันเกณฑ์'})</small>`:'<span style="color:var(--muted)">ยังไม่ถึง</span>';return w.pay>0?`<b class="good">${nf(w.pay)}</b> <small style="color:var(--muted)">(${w.n} วัน)</small>`:`<span style="color:var(--muted)">– (${w.n} วัน)</span>`}
function diligTable(){const rows=diligRows().filter(x=>x.d&&passDilig(x)).filter(x=>searchMatch(x.r.name+' '+x.r.code+' '+x.r.branch));
  const cols=[{k:'n',label:'ชื่อ',l:1,get:x=>x.r.name,fmt:x=>esc(x.r.name)},{k:'c',label:'รหัส',l:1,get:x=>x.r.code,fmt:x=>esc(x.r.code)},{k:'dc',label:'DC',l:1,get:x=>x.r.branch,fmt:x=>esc(x.r.branch)},
   {k:'sd',label:'วันเริ่มงาน',l:1,get:x=>x.r.start,fmt:x=>esc(fdate(x.r.start))},{k:'need',label:'วันที่ต้องมา',get:x=>x.d.need,fmt:x=>nf(x.d.need)},{k:'have',label:'ขึ้นขับ',get:x=>x.d.have,fmt:x=>nf(x.d.have)}];
  for(let i=0;i<4;i++)cols.push({k:'w'+i,label:'สัปดาห์ '+(i+1),get:x=>x.d.wk[i].pay,fmt:x=>wkCell(x.d.wk[i])});
  cols.push({k:'mo',label:'เบี้ยรายเดือน',get:x=>x.d.monthly+(x.d.potMonthly||0)/1e3,fmt:x=>x.d.mpend?`${pendTag} <small style="color:var(--muted)">${x.d.canMonth?'มีโอกาสได้ '+nf(x.d.potMonthly):'ไม่ทันเกณฑ์'}</small>`:x.d.monthly>0?`<b class="good">${nf(x.d.monthly)}</b>`:'–'},
   {k:'tot',label:'รวม (บาท)',get:x=>x.d.total,fmt:x=>`<b>${nf(x.d.total)}</b>${x.d.pot>0?` <small style="color:var(--muted)">+ โอกาส ${nf(x.d.pot)}</small>`:''}`},{k:'miss',label:'ขาด (วัน)',get:x=>x.d.miss,fmt:x=>x.d.miss>0?`<span class="badt">${x.d.miss}</span>`:'0'});
  return table({id:'dilig',cols,rows,rowKey:x=>x.r.code,foot:rs=>{if(!rs.length)return'';const sm=f=>rs.reduce((s,x)=>s+f(x),0);return `<tr class="sum"><td>รวม ${nf(rs.length)} คน</td><td></td><td></td><td></td><td></td><td></td>`+[0,1,2,3].map(i=>`<td>${nf(sm(x=>x.d.wk[i].pay))}</td>`).join('')+`<td>${nf(sm(x=>x.d.monthly))}</td><td>${nf(sm(x=>x.d.total))}</td><td></td></tr>`}})}
function diligCharts(){const P=pal(),ok=diligRows().filter(x=>x.d&&passDilig(x));
  const items=[0,1,2,3].map(i=>({l:'สัปดาห์ '+(i+1),l2:`${i*7+1}–${(i+1)*7}`,v:ok.filter(x=>x.d.wk[i].pay>0).length,tip:`สัปดาห์ ${i+1} (${i*7+1}–${(i+1)*7})\nได้เบี้ย ${ok.filter(x=>x.d.wk[i].pay>0).length} จาก ${ok.length} คน`}));
  $('#ch-wk').innerHTML=vbars({items,P,fmt:v=>nf(v),color:P.s[0]});
  const w=ok.reduce((s,x)=>s+x.d.weekly,0),m=ok.reduce((s,x)=>s+x.d.monthly,0),parts=[{l:'รายสัปดาห์',v:w,c:P.s[0]},{l:'รายเดือน',v:m,c:P.s[1]}];
  $('#ch-split').innerHTML=donut({parts,center:nf(w+m),sub:'บาท',P,unit:'บาท'});
  $('#lg-split').innerHTML=parts.map(p=>`<span><i style="background:${p.c}"></i>${p.l} ${nf(p.v)}</span>`).join('')}
function openSheet(html){$('#ov-root').innerHTML=`<div class="ov" data-act="close"><div class="sheet" role="dialog" aria-modal="true" data-stop="1"><button class="close" type="button" data-act="close" aria-label="ปิด">✕</button>${html}</div></div>`;const c=$('#ov-root .close');if(c)c.focus()}
function sheetDilig(code){const r=S.roster.find(x=>x.code===code);if(!r)return;const d=diligFor(r);if(!d)return;const m=diligMonth(),ND=d.ND;
  const cells=()=>{let s='';for(let k=1;k<=ND;k++){const t=d.kind[k-1],di=m.a+k-1;const cl=t==='1'?'on':t==='0'?'miss':'off';
    s+=`<td><i class="${cl}" data-tip="${k} ${TH[m.m]} · ${DOWN[dowI(di)]} · ${t==='1'?'ขึ้นขับ':t==='0'?'ไม่ได้ขึ้นขับ':'ไม่อยู่ในช่วงทำงาน'}"></i></td>`}return s};
  let h=`<h2>${esc(r.name)}</h2><div class="chips"><span class="chip">${esc(r.code)}</span><span class="chip">${esc(r.branch)}</span><span class="chip">เริ่ม ${esc(fdate(r.start))}</span>${r.skip?`<span class="chip">วันยกเว้น ${esc(r.skip)}</span>`:''}</div>`;
  h+=`<div class="stats"><div class="stat"><b>${nf(d.total)}</b><span>เบี้ยขยัน (บาท)${d.pot>0?' · มีโอกาสอีก '+nf(d.pot):''}</span></div><div class="stat"><b>${nf(d.weekly)} + ${nf(d.monthly)}</b><span>สัปดาห์ + เดือน</span></div><div class="stat"><b>${d.have}/${d.mpend?d.needNow:d.need}</b><span>ขึ้นขับ / วันที่ต้องมา${d.mpend?' (ถึงวันนี้ · ไม่รวมวันหยุด)':''}</span></div><div class="stat"><b>${d.miss}</b><span>ขาด (วัน)</span></div></div>`;
  h+=`<div class="tw"><table class="heat"><thead><tr><th></th>${Array.from({length:ND},(_,i)=>`<th>${i+1}</th>`).join('')}</tr></thead><tbody><tr><td>เที่ยววิ่ง</td>${cells()}</tr></tbody></table></div><div class="legend"><span><i style="background:var(--s1)"></i>ขึ้นขับ</span><span><i style="background:var(--bad)"></i>ไม่ขึ้นขับ</span></div>`;
  h+=`<div class="tw"><table class="t"><thead><tr><th class="pl l">รอบ</th><th class="pl">วันที่นับได้</th><th class="pl">เบี้ย (บาท)</th></tr></thead><tbody>`+
   [0,1,2,3].map(i=>`<tr><td class="l">สัปดาห์ ${i+1} (${i*7+1}–${(i+1)*7} ${TH[m.m]})</td><td>${d.wk[i].n} / ${d.wk[i].req}${d.wk[i].len?' <small>(ลดเกณฑ์นักขัต)</small>':''}</td><td>${d.wk[i].pend?(d.wk[i].started?pendTag+' <small>'+(d.wk[i].can?'มีโอกาสได้ '+nf(+S.cfg.rateWeek):'ไม่ทันเกณฑ์')+'</small>':'<small>ยังไม่ถึง</small>'):nf(d.wk[i].pay)}</td></tr>`).join('')+
   `<tr class="sum"><td class="l">รายเดือน (รวมวันที่ 29–${ND})</td><td>${d.have}/${d.need} (ขาดได้ ${+S.cfg.monthMiss||0})</td><td>${d.mpend?pendTag+' <small>'+(d.canMonth?'มีโอกาสได้ '+nf(d.potMonthly):'ไม่ทันเกณฑ์')+'</small>':nf(d.monthly)}</td></tr></tbody></table></div>`;
  openSheet(h)}
/* ---------- Excel for HR (ExcelJS loaded on demand) ---------- */
function loadScript(src){return new Promise((res,rej)=>{if(window.ExcelJS)return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
function diligPayload(){const m=diligMonth(),rows=diligRows().filter(x=>x.d&&passDilig(x)).filter(x=>searchMatch(x.r.name+' '+x.r.code+' '+x.r.branch));
  const TM=['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return{y:m.y,m:m.m,n:m.n,hol:holN(ymKey(m)),monthLabel:`${TM[m.m]} ${m.y+543} (1–${m.n} ${TH[m.m]} ${m.y})`,cfg:S.cfg,
    people:rows.map(x=>({code:x.r.code,name:x.r.name,branch:x.r.branch,start:x.r.start||'',kind:x.d.kind.join(''),res:{rest:x.d.rest,whole:x.d.whole?1:0,len:x.d.wk.map(w=>w.len?1:0),wk:x.d.wk.map(w=>w.pay),weekly:x.d.weekly,monthly:x.d.monthly,total:x.d.total,need:x.d.need,have:x.d.have}}))}}
async function exportXlsx(){
  const msg=$('#xl-msg');const set=t=>{if(msg)msg.textContent=t};
  const P=diligPayload();if(!P.people.length){set('ไม่มีรายชื่อให้ส่งออก');return}
  set('กำลังสร้างไฟล์…');
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')}catch(e){set('โหลดตัวสร้าง Excel ไม่สำเร็จ ลองใหม่อีกครั้ง');return}
  try{const wb=NXXL.build(window.ExcelJS,P),buf=await wb.xlsx.writeBuffer();
    await saveFile(`NIMEX-Diligence-${P.y}-${String(P.m).padStart(2,'0')}.xlsx`,new Blob([buf]));set('ดาวน์โหลดไฟล์แล้ว · สูตรในไฟล์คำนวณใหม่ได้')}catch(e){console.error(e);set('สร้างไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง')}}
const blob64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
async function saveFile(filename,data){if(window.__testSave)return window.__testSave(filename,data);const f=data instanceof Blob?data:new Blob([data]),u=await blob64(f),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove()}
/* ---------- settings (admin only) ---------- */
function dcList(){return[...new Set(S.roster.map(r=>r.branch))].sort((a,b)=>a.localeCompare(b,'th'))}
const SET={plan:null,msg:'',busy:false};
function viewSettings(){
  if(!S.canEdit)return pageHead('NIM Express','ตั้งค่า','เฉพาะผู้ดูแลเท่านั้น');
  const c=S.cfg,tabs=[['upload','เติมไฟล์'],['roster','รายชื่อพนักงาน'+(DATA.drv&&M.months.length&&newNames().length?' · ใหม่ '+newNames().length:'')],['param','เงื่อนไขและเกณฑ์'],['check','ตรวจข้อมูล']];
  const tab=S.setTab||(M.months.length?'roster':'upload');
  let h=pageHead('NIM Express · ผู้ดูแล','ตั้งค่า','เติมไฟล์รายเดือน เพิ่ม/ลดรายชื่อ ปรับเงื่อนไขเบี้ยขยัน และเกณฑ์เกรด ทุกหน้าจะคำนวณใหม่ทันที')+
   `<div class="seg2" style="justify-self:start">${tabs.map(t=>`<button type="button" data-act="stab:${t[0]}" aria-pressed="${tab===t[0]}">${t[1]}</button>`).join('')}</div>`;
  if(tab==='upload'){
    {const lm=M.months[M.months.length-1];h+=`<div class="card"><h2 style="text-align:left">ข้อมูลที่ใช้แสดงผลอยู่</h2><p class="say">${lm?`ล่าสุด ${esc(mLabel(lm))} (1–${lm.n}) · อัปเดตเมื่อ ${esc(lm.src&&lm.src.at?lm.src.at:'—')} · มี ${M.months.length} เดือนในระบบ`:'ยังไม่มีข้อมูล'}<br>ส่งสำเร็จคำนวณจากรายงาน NIMEX026001 · ต้นทุนจากรายงาน NIMEX06006 · AB = ของแห้ง, CC = ของเย็น</p></div>`}
    h+=`<div class="card"><h2 style="text-align:left">เติมไฟล์รายเดือน</h2><p class="say">เลือกรายงาน NIMEX026001 (รายงานเที่ยววิ่ง) และ NIMEX06006 (รายได้-ต้นทุน) ของเดือนเดียวกัน ระบบสรุปผลให้ตรวจก่อนบันทึก ถ้าเดือนนั้นมีข้อมูลอยู่แล้วจะถูกแทนที่ด้วยค่าใหม่ ใช้ไฟล์ nimex-seed.json เพื่อนำเข้าข้อมูลเริ่มต้นพร้อมรายชื่อได้ด้วย</p>
     <div class="dz"><input type="file" id="up-file" multiple accept=".xlsx,.xls,.json" aria-label="เลือกไฟล์"><div id="set-up">${planHtml()}</div></div></div>`;
    h+=`<div class="card"><h2 style="text-align:left">เดือนที่มีในระบบ</h2><div class="tw"><table class="t"><thead><tr><th class="pl l">เดือน</th><th class="pl">วัน (026001)</th><th class="pl">วัน (06006)</th><th class="pl">เที่ยว 026001</th><th class="pl">เที่ยว 06006</th><th class="pl l">โหลดเมื่อ</th><th class="pl"></th></tr></thead><tbody>${M.months.map(m=>`<tr><td class="l">${esc(mLabel(m))}</td><td>${(m.days26||[]).length}/${m.n}</td><td>${(m.days06||[]).length}/${m.n}</td><td>${nf(m.src?m.src.t26:0)}</td><td>${nf(m.src?m.src.t06:0)}</td><td class="l">${esc(m.src?m.src.at:'')}</td><td>${S.confirm==='m'+m.key?`<button class="btn warn" type="button" data-act="mdel:${m.key}">ยืนยันลบ</button> <button class="btn alt" type="button" data-act="delx">ยกเลิก</button>`:`<button class="btn alt" type="button" data-act="mdelq:${m.key}">ลบเดือน</button>`}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></div></div>`;
    h+=`<div class="card"><h2 style="text-align:left">ส่งออก</h2><p class="say">ส่งออก Excel, PowerPoint, PNG หรืออินโฟกราฟิก ตามตัวกรองด้านบน</p><button class="btn" type="button" data-act="export">เลือกส่วนและส่งออก</button> <button class="btn alt" type="button" data-act="logout">ออกจากระบบผู้ดูแล</button></div>`}
  if(tab==='roster'){
    const q=(S.rq||'').toLowerCase(),list=S.roster.filter(r=>(!S.rpos||r.pos===S.rpos)&&(!q||(r.name+r.code+r.branch).toLowerCase().includes(q)));
    {const nn=newNames();S.newList=nn;
     h+=`<div class="card"><div class="sec-h"><h2>รายชื่อใหม่ในรายงาน (${nf(nn.length)} คน)</h2></div><p class="say">ชื่อที่ขึ้นขับรถบริษัทในรายงานแต่ยังไม่อยู่ในฐาน · ใส่รหัสพนักงาน เลือกกลุ่ม แล้วกด "เพิ่ม" · วันเริ่มงานใช้วันที่ขึ้นขับครั้งแรกในรายงาน (แก้ได้ภายหลังในตารางด้านล่าง)</p>`+
      (nn.length?`<div class="tw"><table class="t ed"><thead><tr><th class="pl l">ชื่อในรายงาน</th><th class="pl l">DC</th><th class="pl">วันที่มีเที่ยว</th><th class="pl l">ขึ้นขับล่าสุด</th><th class="pl l">รหัสพนักงาน</th><th class="pl l">กลุ่มการจ้าง</th><th class="pl"></th></tr></thead><tbody>${nn.slice(0,200).map((x,i)=>`<tr><td class="l">${esc(x.name)}</td><td class="l">${esc(x.dc)}</td><td>${nf(x.n)}</td><td class="l">${esc(fdate(isoI(x.last)))}</td><td class="l"><input data-nn="code" data-i="${i}" placeholder="เช่น 260080" aria-label="รหัส ${esc(x.name)}"></td><td class="l"><select data-nn="pos" data-i="${i}" aria-label="กลุ่ม ${esc(x.name)}">${POS_ALL.map(p=>`<option>${esc(p)}</option>`).join('')}</select></td><td><button class="btn" type="button" data-act="nnadd:${i}">เพิ่ม</button></td></tr>`).join('')}</tbody></table></div>${nn.length>200?`<div class="note">แสดง 200 จาก ${nf(nn.length)} รายการ</div>`:''}`:'<div class="empty">ไม่มีรายชื่อใหม่ — ทุกชื่อในรายงานอยู่ในฐานแล้ว</div>')+`<div class="msg" id="nn-msg">${esc(S.nnMsg||'')}</div></div>`}
    {const nc=nameChecks();S.nameList=nc;
     h+=`<div class="card"><div class="sec-h"><h2>ตรวจชื่อสะกดต่างจากรายงาน (${nf(nc.length)} รายการ)</h2></div><p class="say">ชื่อในรายชื่อไม่ตรงกับชื่อในรายงาน (ต่าง 1–2 ตัวอักษร) ทำให้เที่ยววิ่งบางส่วนไม่ถูกนับให้คนนี้ · "ผูกชื่อ" = ให้รับเที่ยวจากชื่อในรายงาน (คงชื่อที่แสดง) · "แก้ชื่อตามรายงาน" = เปลี่ยนชื่อที่แสดงเป็นแบบในรายงานด้วย · ยังไม่มีอะไรเปลี่ยนจนกว่าจะกด</p>`+(nc.length>1?`<p><button class="btn" type="button" data-act="nmall">${S.nmArm?'กดอีกครั้งเพื่อยืนยัน: ผูกชื่อทั้ง '+nf(nc.length)+' รายการ':'ผูกชื่อทั้งหมด ('+nf(nc.length)+')'}</button></p>`:'')+
      (nc.length?`<div class="tw"><table class="t ed"><thead><tr><th class="pl l">รหัส</th><th class="pl l">ชื่อในรายชื่อ</th><th class="pl l">DC (รายชื่อ)</th><th class="pl l">ชื่อในรายงาน</th><th class="pl l">DC (รายงาน)</th><th class="pl">เที่ยวชื่อเดิม</th><th class="pl">เที่ยวชื่อรายงาน</th><th class="pl"></th></tr></thead><tbody>${nc.map((x,i)=>`<tr><td class="l">${esc(x.r.code)}</td><td class="l">${esc(x.r.name)}</td><td class="l">${esc(x.r.branch)}</td><td class="l">${esc(x.cn)}</td><td class="l">${esc(x.cdc)}${x.sameDc?'':' <span class="tag bad">DC ต่างกัน</span>'}</td><td>${nf(x.own)}</td><td>${nf(x.ct)}</td><td><button class="btn" type="button" data-act="nmlink:${i}">ผูกชื่อ</button> <button class="btn" type="button" data-act="nmname:${i}">แก้ชื่อตามรายงาน</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">ไม่พบชื่อที่สะกดต่างกัน</div>')+`</div>`}
    h+=`<div class="card"><div class="sec-h"><h2>เพิ่มรายชื่อ</h2></div><p class="say">พิมพ์ชื่อเพื่อค้นหาจากรายงานเที่ยววิ่ง ระบบจะดึง DC และผูกชื่อให้อัตโนมัติ</p>
     <div class="form" style="margin-top:8px"><label>ชื่อ–สกุล<input id="a-name" list="dl-names" placeholder="เช่น นายสมชาย ใจดี" autocomplete="off"></label><label>รหัสพนักงาน<input id="a-code" placeholder="เช่น 260080"></label>
     <label>สาขา / DC<input id="a-dc" list="dl-dc" placeholder="เช่น 150 DC เชียงใหม่"></label><label>กลุ่มการจ้าง<select id="a-pos">${POS_ALL.map(p=>`<option>${esc(p)}</option>`).join('')}</select></label>
     <label>วันเริ่มงาน<input id="a-start" type="date" value="${M.months.length?isoI(MI().a):''}"></label><label>ผูกกับชื่อในรายงาน<input id="a-match" placeholder="อัตโนมัติจากชื่อ"></label><button class="btn" id="a-add" type="button">เพิ่มรายชื่อ</button></div>
     <div class="msg" id="a-msg"></div><datalist id="dl-names">${Object.values(DATA.drv).map(v=>`<option value="${esc(v.n)}">`).join('')}</datalist><datalist id="dl-dc">${dcList().concat(DATA.dcs.map(d=>d.n)).filter((v,i,a)=>a.indexOf(v)===i).map(v=>`<option value="${esc(v)}">`).join('')}</datalist></div>`;
    h+=`<div class="card"><div class="sec-h"><h2>รายชื่อทั้งหมด (${nf(S.roster.length)} คน)</h2></div><div class="tools"><input type="search" id="rq" placeholder="ค้นหาชื่อ รหัส หรือ DC" value="${esc(S.rq||'')}"><select id="rpos"><option value="">ทุกกลุ่มการจ้าง</option>${POS_ALL.map(p=>`<option value="${esc(p)}"${S.rpos===p?' selected':''}>${esc(POS_SHORT(p))} (${S.roster.filter(r=>r.pos===p).length})</option>`).join('')}</select></div>
     <p class="note" style="text-align:left">"วันยกเว้น" ใช้กับเบี้ยขยันรายคน เช่น 2026-10-20,2026-10-21 (นับเป็นวันมา ไม่ถูกนับว่าขาด)</p>
     <div class="tw"><table class="t ed"><thead><tr><th class="pl l">ชื่อ</th><th class="pl l">รหัส</th><th class="pl l">สาขา / DC</th><th class="pl l">กลุ่มการจ้าง</th><th class="pl l">วันเริ่มงาน</th><th class="pl l">วันสุดท้าย</th><th class="pl l">วันยกเว้น</th><th class="pl l">ผูกชื่อรายงาน</th><th class="pl">เที่ยววิ่ง</th><th class="pl"></th></tr></thead><tbody>`+
     list.slice(0,300).map(r=>{const dd=DATA.drv[r.match||normKey(r.name)];const del=S.confirm===r.code;return `<tr><td class="l">${esc(r.name)}</td><td class="l">${esc(r.code)}</td><td class="l"><input data-f="branch" data-c="${esc(r.code)}" value="${esc(r.branch)}" list="dl-dc2"></td><td class="l"><select data-f="pos" data-c="${esc(r.code)}">${POS_ALL.map(p=>`<option${p===r.pos?' selected':''}>${esc(p)}</option>`).join('')}</select></td>
      <td class="l"><input type="date" data-f="start" data-c="${esc(r.code)}" value="${esc(r.start)}"></td><td class="l"><input type="date" data-f="end" data-c="${esc(r.code)}" value="${esc(r.end||'')}"></td><td class="l"><input data-f="skip" data-c="${esc(r.code)}" value="${esc(r.skip||'')}" placeholder="ไม่มี"></td><td class="l"><input data-f="match" data-c="${esc(r.code)}" value="${esc(r.match||'')}"></td>
      <td>${dd?`<span class="tag ok">${dd.r.length} วัน</span>`:'<span class="tag bad">ไม่พบ</span>'}</td><td>${del?`<button class="btn warn" type="button" data-act="del:${esc(r.code)}">ยืนยันลบ</button> <button class="btn alt" type="button" data-act="delx">ยกเลิก</button>`:`<button class="btn alt" type="button" data-act="delq:${esc(r.code)}">ลบ</button>`}</td></tr>`}).join('')+
     `</tbody></table></div><datalist id="dl-dc2">${dcList().map(v=>`<option value="${esc(v)}">`).join('')}</datalist>${list.length>300?`<div class="note">แสดง 300 จาก ${list.length} รายการ · ใช้ช่องค้นหาเพื่อกรอง</div>`:''}<div class="msg" id="r-msg">${esc(S.msg||'')}</div></div>`}
  if(tab==='param'){
    const g=c.grades,gr=(k,lab,low)=>`<div class="gform"><b>${lab}</b>${['A','B','C','D'].map(l=>`<input data-g="${k}.${l}" inputmode="decimal" value="${esc(g[k]?.[l]??'')}" placeholder="${low?'≤':'≥'} ${l}" aria-label="เกรด ${l} ${lab}">`).join('')}</div>`;
    h+=`<div class="card"><h2 style="text-align:left">เงื่อนไขเบี้ยขยัน</h2>
     <h3 style="margin:10px 0 4px;font-size:15px">1) วันทำงานและวันนักขัตฤกษ์</h3><p class="say">มาวันไหนก็ได้ · หยุดปกติ 1 วัน/สัปดาห์ (สัปดาห์ที่ครบ 7 วัน: 1–7, 8–14, 15–21, 22–28) · ใส่จำนวนวันนักขัตของแต่ละเดือน ระบบหักออกจากวันทำการของเดือนนั้น และลดเกณฑ์รายสัปดาห์ให้ 1 สัปดาห์ (ลดตามจำนวนวันนักขัต)</p>
     <div class="form" style="margin-top:8px">${M.months.map(x=>`<label>จำนวนวันนักขัต · ${esc(mLabel(x))} (${x.n} วัน → วันทำการ ${(()=>{const w=wdInfo(x.a,x.a+x.n-1,null);return w.den})()} )<input data-hn="${ymKey(x)}" inputmode="numeric" value="${holN(ymKey(x))}"></label>`).join('')||'<span class="say">ยังไม่มีข้อมูลเดือน</span>'}</div>
     <h3 style="margin:14px 0 4px;font-size:15px">2) เบี้ยรายสัปดาห์</h3>
     <div class="form"><label>เบี้ยรายสัปดาห์ (บาท)<input id="p-rw" inputmode="numeric" value="${esc(c.rateWeek)}"></label><label>ขึ้นขับขั้นต่ำต่อสัปดาห์ (วัน จาก 7)<input id="p-min" inputmode="numeric" value="${esc(c.minDays)}"></label></div>
     <h3 style="margin:14px 0 4px;font-size:15px">3) เบี้ยรายเดือน</h3>
     <div class="form"><label>เบี้ยรายเดือน (บาท)<input id="p-rm" inputmode="numeric" value="${esc(c.rateMonth)}"></label><label>ขาดได้ไม่เกิน (วัน)<input id="p-miss" inputmode="numeric" value="${esc(c.monthMiss??0)}"></label>
     <label>วิธีจ่าย<select id="p-mm"><option value="month"${c.monthMode==='month'?' selected':''}>ครั้งเดียวต่อเดือน</option><option value="week"${c.monthMode==='week'?' selected':''}>ต่อสัปดาห์ที่ครบ</option></select></label></div>
     <p class="say" style="margin-top:6px">สัปดาห์นับตามวันที่ 1–7, 8–14, 15–21, 22–28 (จ่ายไม่เกิน 4 สัปดาห์) · วันที่ 29 เป็นต้นไปไม่คิดสัปดาห์ แต่นับในเบี้ยรายเดือน · วันที่ต้องมานับจากวันเริ่มงาน ถึงวันสุดท้าย</p></div>
     <div class="card"><h2 style="text-align:left">ค่าจุดดรอป (ค่าจัดส่งสำเร็จส่วนเพิ่ม)</h2><p class="say">รถบริษัท · คิดรายวัน · จุด = ดรอปที่ส่งได้ + ดรอปเข้ารับ จ่ายเฉพาะส่วนที่เกินขั้นต่ำ · พนักงาน DC ไม่ได้รับ · Outsource บวกเพิ่มต่อจุดทุกขั้น</p>
     <h3 style="margin:10px 0 4px;font-size:15px">งานกระจายเป็นหลัก (AB)</h3>
     <div class="form"><label>ขั้นต่ำ (จุด/วัน)<input id="dp-minD" inputmode="numeric" value="${esc(c.drop.minD)}"></label>${[0,1,2,3,4].map(i=>`<label>จุดที่ ${(+c.drop.minD||0)+10*i+1}${i===4?' ขึ้นไป':'–'+((+c.drop.minD||0)+10*(i+1))} (บาท/จุด)<input id="dp-t${i}" inputmode="decimal" value="${esc(c.drop.tiers[i])}"></label>`).join('')}</div>
     <h3 style="margin:10px 0 4px;font-size:15px">งานเข้ารับเป็นหลัก (AB&amp;CC)</h3>
     <div class="form"><label>ขั้นต่ำ (จุด/วัน)<input id="dp-minP" inputmode="numeric" value="${esc(c.drop.minP)}"></label><label>จุดส่วนเกิน (บาท/จุด)<input id="dp-rateP" inputmode="decimal" value="${esc(c.drop.rateP)}"></label></div>
     <h3 style="margin:10px 0 4px;font-size:15px">Outsource ANAR / MR</h3>
     <div class="form"><label>บวกเพิ่ม (บาท/จุด ทุกขั้น)<input id="dp-osAdd" inputmode="decimal" value="${esc(c.drop.osAdd)}"></label></div></div>
     <div class="card"><h2 style="text-align:left">หน้าที่ผู้ชมเห็น</h2><p class="say">เลือกหน้าที่คนเปิดลิงก์ปกติ (ไม่ต้องใส่รหัส) เห็นได้ ตัวเลือกนี้ไม่มีผลกับผู้ดูแล · ข้อมูลรายบุคคล (ชื่อ รหัส ผลรายคน) ถูกส่งไปที่เบราว์เซอร์ของทุกคนที่เปิดลิงก์ เพื่อแสดง "คนขับใน DC" · ใช้กับหัวหน้างานเท่านั้น อย่าแชร์ลิงก์ออกนอกวงนี้</p><div class="chips" style="margin-top:8px">${VP.filter(v=>v[0]!=='why').map(v=>`<label class="chip" style="gap:6px;display:inline-flex;align-items:center"><input type="checkbox" data-vp="${v[0]}"${viewerPages().includes(v[0])?' checked':''}> ${v[1]}</label>`).join('')}</div></div>
     <div class="card"><h2 style="text-align:left">ทดลองงาน</h2><div class="form" style="margin-top:8px"><label>ทดลองงาน (วัน)<input id="p-pd" inputmode="numeric" value="${esc(c.probDays)}"></label><label>ประเมิน ณ วันที่<input id="p-asof" type="date" value="${esc(c.asOf)}"></label></div>${M.months.length?`<p class="say" style="margin-top:6px">${esc(mLabel(MI()))} มีวันทำการ ${workDays(MI().a,MI().a+MI().n-1)} วัน</p>`:''}</div>
     <div class="card"><h2 style="text-align:left">เกณฑ์เกรด</h2><p class="say">ใส่ค่าเป็น % (ต้นทุนใช้ค่าสูงสุดที่ยอมรับได้ ส่วนข้ออื่นใช้ค่าต่ำสุด) เว้นว่างทั้งหมด = ไม่แสดงเกรด ต่ำกว่าเกรด D = F</p><div style="display:grid;gap:8px;margin-top:8px">${KPIS.map(([k,lab,op])=>gr(k,lab,op==='≤')).join('')}</div>
     <h2 style="text-align:left;margin-top:16px">น้ำหนักและคะแนนรวมรายคน</h2><p class="say">น้ำหนัก (%) ของแต่ละ KPI · คะแนนเกรด A=4 B=3 C=2 D=1 F=0 · คะแนนรวมคิดเฉพาะ KPI ที่มีเกรด</p>
     <div class="form" style="margin-top:8px">${KPIS.map(([k,lab])=>`<label>${lab} (%)<input data-w="${k}" inputmode="decimal" value="${esc(c.weights?.[k]??'')}"></label>`).join('')}</div>
     <div class="form" style="margin-top:8px">${['A','B','C','D'].map(l=>`<label>คะแนนรวมขั้นต่ำเกรด ${l}<input data-o="${l}" inputmode="decimal" value="${esc(c.overall?.[l]??'')}"></label>`).join('')}</div></div>
     <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn" id="p-save" type="button">บันทึกการตั้งค่า</button><span class="msg" id="p-msg">${esc(S.msg||'')}</span></div>`}
  if(tab==='check'){
    const hs=[],m=M.months.length?MI():null;
    if(m){const H=S.roster.filter(r=>!monthHasTrips(r.match||normKey(r.name),S.mi));
      hs.push(`<tr><td class="l">ไม่พบเที่ยววิ่งเลยใน ${esc(mLabel(m))} (กลุ่มผิดปกติ)</td><td>${H.length} คน</td><td class="l">${esc(H.slice(0,6).map(r=>r.name).join(', '))}${H.length>6?' …':''}</td></tr>`)}
    const early=S.roster.filter(r=>{const dd=DATA.drv[r.match||normKey(r.name)];return dd&&dd.r.length&&r.start>isoI(dd.r[0][0])});
    hs.push(`<tr><td class="l">มีเที่ยววิ่งก่อนวันเริ่มงานที่ระบุ</td><td>${early.length} คน</td><td class="l">${esc(early.slice(0,6).map(r=>r.name).join(', '))}${early.length>6?' …':''}</td></tr>`);
    const inRoster=new Set(S.roster.map(r=>r.match||normKey(r.name)));const nr=Object.keys(DATA.drv).filter(k=>!inRoster.has(k));
    hs.push(`<tr><td class="l">ชื่อในรายงานที่ไม่อยู่ในรายชื่อ</td><td>${nf(nr.length)} คน</td><td class="l">เพิ่มเข้ารายชื่อได้ที่แท็บ "รายชื่อพนักงาน"</td></tr>`);
    const gap=M.months.map(x=>{const miss=[];for(let d=1;d<=x.n;d++){if(!(x.days26||[]).includes(d)&&dowI(x.a+d-1)!==0)miss.push(d)}return[x,miss]}).filter(a=>a[1].length);
    hs.push(`<tr><td class="l">วันที่ไม่มีข้อมูล 026001 (ไม่นับวันอาทิตย์)</td><td>${gap.reduce((s,a)=>s+a[1].length,0)} วัน</td><td class="l">${esc(gap.map(([x,mm])=>mLabel(x)+': '+mm.join(',')).join(' · '))}</td></tr>`);
    h+=`<div class="card"><h2>ผลตรวจข้อมูล</h2><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th class="pl l">รายการ</th><th class="pl">จำนวน</th><th class="pl l">รายละเอียด</th></tr></thead><tbody>${hs.join('')}</tbody></table></div></div>`}
  return h}
/* ---- reading files ---- */
async function readRows(f){const b=await f.arrayBuffer();const wb=XLSX.read(b,{type:'array',dense:true,cellDates:false});return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:null})}
async function pickFiles(list){SET.plan=null;SET.msg='กำลังอ่านไฟล์ ใช้เวลาประมาณไฟล์ละ 10 วินาที…';renderSet();await new Promise(r=>setTimeout(r,60));
  const P={r26:[],r06:[],seed:null,bad:[]};
  for(const f of list){try{if(/\.json$/i.test(f.name)){const j=JSON.parse(await f.text());if(j.kind==='nimex-seed')P.seed=j;else P.bad.push(f.name);continue}
    await window.loadLib('xlsx');const rows=await readRows(f),t=NXP.detect(rows);if(t==='026001')P.r26.push({f:f.name,rows});else if(t==='06006')P.r06.push({f:f.name,rows});else P.bad.push(f.name)}catch(x){P.bad.push(f.name+(x.message==='lib'?' (โหลดตัวอ่าน Excel ไม่สำเร็จ)':''))}}
  const plans=[],miss=[];
  const month=a=>{const c={};a.rows.forEach(r=>{const s=String(r[2]||r[3]||'');const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(m){const k=(+m[3]-543)+'-'+m[2];c[k]=(c[k]||0)+1}});return Object.keys(c).sort((x,y)=>c[y]-c[x])[0]};
  const tag=(a,t)=>{let c={};const col=t==='026001'?2:3,st=t==='026001'?7:5;for(let i=st;i<a.rows.length;i++){const s=String((a.rows[i]||[])[col]||'');const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(m){const k=(+m[3]-543)+'-'+m[2];c[k]=(c[k]||0)+1}}a.m=Object.keys(c).sort((x,y)=>c[y]-c[x])[0]};
  P.r26.forEach(a=>tag(a,'026001'));P.r06.forEach(a=>tag(a,'06006'));
  const ms=[...new Set([...P.r26.map(a=>a.m),...P.r06.map(a=>a.m)])].filter(Boolean).sort();
  ms.forEach(m=>{const a=P.r26.find(x=>x.m===m),b=P.r06.find(x=>x.m===m);if(a&&b){try{plans.push(Object.assign({m},NXP.build(a.rows,b.rows,{f26:a.f,f6:b.f})))}catch(e){P.bad.push(a.f+': '+e.message)}}else miss.push(m+(a?' (ขาด 06006)':' (ขาด 026001)'))});
  /* เดือนที่มีข้อมูลเดิม: ผสานรายวัน (แทนเฉพาะวันที่อยู่ในไฟล์ใหม่ วันอื่นของเดิมเก็บไว้) */
  if(plans.some(x=>M.months.some(m=>m.key===x.m))){SET.msg='กำลังตรวจข้อมูลเดิมของเดือนเดียวกัน…';renderSet();
    try{const XP=await NXS.loadPublic(),XA=await NXS.loadAdmin();
      plans.forEach((x,i)=>{const O=XP['pub:'+x.m],Oa=XA['adm:'+x.m];if(!O||!Oa)return;const r=NXP.merge(O,Oa,x.pub,x.adm);plans[i]=Object.assign({},x,{pub:r.pub,adm:r.adm,merge:r})})}
    catch(e){P.bad.push('อ่านข้อมูลเดิมไม่ได้ จึงไม่ได้ผสาน: '+e.message);plans.length=0}}
  SET.plan={plans,miss,seed:P.seed,bad:P.bad};SET.msg='';renderSet()}
function planHtml(){const p=SET.plan;if(!p)return SET.msg?`<p class="msg" role="status">${esc(SET.msg)}</p>`:'';const have=new Set(M.months.map(m=>m.key));let h='';
  if(p.seed)h+=`<p>ไฟล์เริ่มต้น: ${p.seed.months.length} เดือน · รายชื่อ ${(p.seed.roster||[]).length} คน${p.seed.settings?' · การตั้งค่า':''}</p>`;
  p.plans.forEach(x=>{const s=x.stat;h+=`<div class="stats"><div class="stat"><span>${esc(x.m)}</span><b>${nf(s.t26)}</b><em>เที่ยว 026001</em></div><div class="stat"><span>06006</span><b>${nf(s.t06)}</b><em>เที่ยว</em></div><div class="stat"><span>คนขับ</span><b>${nf(s.drivers)}</b><em>${s.dcs} DC</em></div><div class="stat"><span>วันที่มีข้อมูล</span><b>${s.days26}/${s.days06}</b><em>026001 / 06006</em></div></div><p class="note" style="text-align:left">${x.merge?`เดือนนี้มีข้อมูลเดิม · ผสานรายวัน: แทนวันที่อยู่ในไฟล์ใหม่ ${x.merge.replaced.d26.length} วัน, เก็บวันเดิมที่ไฟล์ใหม่ไม่มี ${x.merge.kept.d26.length} วัน (026001)${x.merge.kept.d06.length?` / ${x.merge.kept.d06.length} วัน (06006)`:''}`:have.has(x.m)?'เดือนนี้มีข้อมูลเดิม':'เดือนใหม่ เพิ่มเข้าระบบ'}${s.unknownDc.length?` · DC ที่ยังไม่มีภาค (จัดเป็น "อื่นๆ"): ${esc(s.unknownDc.join(', '))}`:''}${x.warn.length?'<br>'+x.warn.map(esc).join('<br>'):''}</p>`});
  if(p.miss.length)h+=`<p class="badt">ต้องมีทั้ง 026001 และ 06006 ของเดือนเดียวกัน: ${p.miss.map(esc).join(', ')}</p>`;if(p.bad.length)h+=`<p class="badt">อ่านไม่ได้ หรือไม่รู้จักไฟล์: ${p.bad.map(esc).join(', ')}</p>`;
  return h+(p.plans.length||p.seed?`<button class="btn" data-act="commit"${SET.busy?' disabled':''}>บันทึกลงระบบ</button>`:'')+(SET.msg?`<p class="msg" role="status">${esc(SET.msg)}</p>`:'')}
function renderSet(){const b=$('#set-up');if(b)b.innerHTML=planHtml()}
async function commitFiles(){const p=SET.plan;if(!p||SET.busy)return;SET.busy=true;SET.msg='กำลังบันทึก…';renderSet();
  try{
    if(p.seed){for(const m of p.seed.months){await NXS.put('pub:'+m.pub.m,m.pub);await NXS.put('adm:'+m.pub.m,m.adm);SET.msg='บันทึก '+m.pub.m+' แล้ว…';renderSet()}
      if(p.seed.roster){await NXS.put('adm:roster',{list:p.seed.roster})}
      if(p.seed.settings){await NXS.put('adm:settings',p.seed.settings);await NXS.put('pub:cfg',{grades:p.seed.settings.grades})}}
    for(const x of p.plans){SET.msg='บันทึก '+x.m+'…';renderSet();await NXS.put('pub:'+x.m,x.pub);await NXS.put('adm:'+x.m,x.adm)}
    SET.msg='บันทึกแล้ว กำลังโหลดข้อมูลใหม่…';renderSet();setTimeout(()=>location.reload(),700)
  }catch(e){SET.busy=false;SET.msg='บันทึกไม่สำเร็จ: '+e.message;renderSet()}}
/* ---------- shell ---------- */
const ICONS={why:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',main:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
 detail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
 company:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
 dilig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4.5"/></svg>',
 resign:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
 settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>'};
const SHORT={main:'หน้าหลัก',detail:'รายละเอียด',company:'รถบริษัท',drop:'ค่าจุดดรอป',dilig:'เบี้ยขยัน',why:'ชี้แจง',resign:'ประวัติลาออก',settings:'ตั้งค่า'};
const VP=[['main','หน้าหลัก'],['detail','รายละเอียด DC'],['company','รถบริษัท'],['drop','ค่าจุดดรอป'],['dilig','เบี้ยขยัน'],['why','ชี้แจง DC']];
const CO_ONLY=['company','drop','dilig','why'];
const vg=()=>S.veh==='co'?[0]:S.veh==='op'?[1]:[0,1];
const VEH=[['all','ทั้งหมด'],['co','รถบริษัท'],['op','รถผู้ประกอบการ']];
function viewerPages(){const x=(S.cfg.viewerPages||[]).filter(k=>VP.some(v=>v[0]===k));const o=x.length?x:['main','detail'];if(!o.includes('why'))o.push('why');return o}
const allowedViews=()=>S.canEdit?['main','detail','company','drop','dilig','why','resign','settings']:viewerPages();
function groups(){const vis=v=>S.veh!=='op'||!CO_ONLY.includes(v[0]);if(!S.canEdit){const ok=viewerPages();return VP.filter(v=>ok.includes(v[0])&&vis(v))}const g=VP.filter(vis);g.push(['resign','ประวัติลาออก']);g.push(['settings','ตั้งค่า']);return g}
const hasPeriod=()=>S.view==='main'||S.view==='detail'||S.view==='company';
function renderShell(){
  const gs=groups();
  $('#seg-group').hidden=!S.canEdit;if(!S.canEdit)S.veh='co';
  $('#seg-group').innerHTML=VEH.map(g=>`<button type="button" data-act="veh:${g[0]}" aria-pressed="${S.veh===g[0]}">${g[1]}</button>`).join('');
  $('#rail').innerHTML=`<div class="lg"><img src="${LOGO}" alt="NIM Express · SEAL Gold Chain"></div><div class="nm">NIMEX Delivery<br>Driver Performance</div>`+gs.map(g=>`<button type="button" data-act="view:${g[0]}"${S.view===g[0]?' aria-current="page"':''}>${ICONS[g[0]]}${g[1]}</button>`).join('');
  $('#tab').innerHTML=gs.map(g=>`<button type="button" data-act="view:${g[0]}"${S.view===g[0]?' aria-current="page"':''}>${ICONS[g[0]]}${SHORT[g[0]]}</button>`).join('');
  const modes=hasPeriod()&&M.months.length?[['month','เดือน'],['week','สัปดาห์'],['day','วัน']]:[];
  $('#seg-mode').innerHTML=modes.map(m=>`<button type="button" data-act="mode:${m[0]}" aria-pressed="${S.mode===m[0]}">${m[1]}</button>`).join('');
  $('#seg-mode').style.display=modes.length?'':'none';
  const fr=$('#filter-row');$('#btn-share').style.display=S.canEdit?'':'none';if(S.view==='settings'||!M.months.length){fr.innerHTML='';return}
  const m=MI(),sel=(id,lab,opts,cur)=>`<select id="${id}" aria-label="${lab}">${opts.map(o=>`<option value="${esc(o[0])}"${String(cur)===String(o[0])?' selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
  let h=sel('f-mo','เดือน',M.months.map((x,i)=>[i,mLabel(x)]),S.mi);
  if(hasPeriod()&&S.mode==='week')h+=sel('f-wk','สัปดาห์',weeksOf(S.mi).map((w,i)=>[i,`สัปดาห์ ${i+1} (${wkTxt(w[0],w[1])})${w[1]>dataEndI()?' · ยังไม่ครบ':''}`]),Math.min(S.wk,weeksOf(S.mi).length-1));
  if(hasPeriod()&&S.mode==='day')h+=sel('f-day','วัน',Array.from({length:m.n},(_,i)=>[i+1,`${i+1} ${TH[m.m]} (${DOWN[dowI(m.a+i)]})`]),S.day);
  if(S.view==='why')h+=sel('f-ww','สัปดาห์',[[-1,'ทั้งเดือน'],...weeksOf(S.mi).map((w,i)=>[i,`สัปดาห์ ${i+1} (${wkTxt(w[0],w[1])})${w[1]>dataEndI()?' · ยังไม่ครบ':''}`])],whyMonth()?-1:whyWk());
  if(S.view==='main'||S.view==='detail')h+=sel('f-rg','ภาค',[['','ทุกภาค']].concat(REGIONS.map(r=>[r,r])),S.region);
  if(S.view==='company'||S.view==='dilig'||S.view==='drop'||S.view==='why'||S.view==='resign')h+=sel('f-dc','DC',[['','ทุก DC']].concat(dcList().map(p=>[p,p])),S.dc);
  if(S.view==='why')h+=sel('f-ws','สถานะ',[['','สถานะ: ทั้งหมด'],['wait','รอชี้แจง'],['done','DC ชี้แจงแล้ว']],S.ws||'');
  if(S.view==='company')h+=sel('f-prob','ทดลองงาน',[['','ทดลองงาน: ทั้งหมด'],['on','อยู่ในช่วงทดลองงาน'],['off','พ้นทดลองงานแล้ว']],S.prob);
  fr.innerHTML=h}
function renderView(){const v=$('#view');
  if(!M.months.length&&!(S.canEdit&&S.view==='settings')){v.innerHTML=pageHead('NIM Express · SEAL Gold Chain','ยังไม่มีข้อมูล','ผู้ดูแลต้องเติมไฟล์รายเดือนก่อน');return}
  v.innerHTML=({main:viewMain,detail:viewDetail,company:viewCompany,drop:viewDrop,dilig:viewDilig,why:viewWhy,resign:viewResign,settings:viewSettings}[S.view])();zones()}
function zones(){
  if(S.view==='main'){mainCharts();if(vg().length===1&&$('#ch-dcw'))mainDcw();$('#z-table').innerHTML=mainTable()}
  if(S.view==='detail')$('#z-table').innerHTML=detailTable();
  if(S.view==='company'&&S.rosterReady&&S.roster.length&&$('#z-table'))$('#z-table').innerHTML=companyTable();
  if(S.view==='dilig'&&S.rosterReady&&$('#z-table')){diligCharts();$('#z-table').innerHTML=diligTable()}
  if(S.view==='resign'&&S.rosterReady&&$('#z-table'))$('#z-table').innerHTML=resignTable(resignRows());
  if(S.view==='why'&&S.rosterReady&&$('#z-table'))$('#z-table').innerHTML=whyTable();
  if(S.view==='drop'&&S.rosterReady&&$('#z-table')&&$('#ch-dg')){dropCharts();$('#z-table').innerHTML=dropTable()}}
function setTopH(){const t=document.querySelector('.top');if(t)document.documentElement.style.setProperty('--toph',t.offsetHeight+'px')}
window.addEventListener('resize',setTopH);
function render(){renderShell();renderView();setTopH()}
/* ---------- events ---------- */
function setView(v){S.view=v;S.q='';S.sel=null;S.abn=false;document.documentElement.scrollTop=0;try{history.replaceState(null,'','#'+v)}catch(e){}render()}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el){return}
  if(el.classList.contains('ov')&&e.target!==el)return;
  const a=el.getAttribute('data-act'),i=a.indexOf(':'),k=i<0?a:a.slice(0,i),v=i<0?'':a.slice(i+1);
  if(k==='close'){$('#ov-root').innerHTML='';return}
  if(k==='view')return setView(v);
  if(k==='mode'){S.mode=v;if(v==='day')S.day=latestDay();return render()}
  if(k==='rk'){S.rk=v;return renderView()}
  if(k==='veh'){if(!S.canEdit)return;S.veh=v;if(!groups().some(g=>g[0]===S.view)){S.view='main';try{history.replaceState(null,'','#main')}catch(x){}}S.sel=null;return render()}
  if(k==='dropxl')return dropExport();
  if(k==='whysave')return whySave(v);
  if(k==='whydel')return whyDel(v);
  if(k==='wclear'){if(!S.wcArm){S.wcArm=true;return renderView()}return whyClear()}
  if(k==='wclearx'){S.wcArm=false;return renderView()}
  if(k==='whyok')return whyOk(v);
  if(k==='whyxl')return whyExport();
  if(k==='resignxl')return resignExport();
  if(k==='dcpng')return window.dcPng&&window.dcPng(v);
  if(k==='nnadd')return addNew(+v);
  if(k==='nmall')return nameAll();
  if(k==='nmlink')return nameFix(+v,'link');
  if(k==='nmname')return nameFix(+v,'name');
  if(k==='dcs'){S.dcs=v;return redoDC()}
  if(k==='dcp'){S.dcp=v;return redoDC()}
  if(k==='dcrow'){return sheetPerson(v)}
  if(k==='pos'){S.pos=S.pos===v?'':v;return renderView()}
  if(k==='abn'){S.abn=v==='1';return renderView()}
  if(k==='sort'){const[id,c]=[v.slice(0,v.lastIndexOf(':')),v.slice(v.lastIndexOf(':')+1)],o=S.sort[id]||{};S.sort[id]=o.k===c?{k:c,dir:o.dir==='desc'?'asc':'desc'}:{k:c,dir:'desc'};return zones()}
  if(k==='row'){S.sel=v;zones();return S.view==='why'?sheetWhy(v):S.view==='drop'?sheetDrop(v):S.view==='dilig'?sheetDilig(v):S.view==='detail'?sheetDC(v):S.view==='company'?sheetPerson(v):void 0}
  if(k==='goroster'){S.setTab='roster';return setView('settings')}
  if(k==='stab'){S.setTab=v;S.msg='';S.confirm=null;return renderView()}
  if(k==='delq'){S.confirm=v;return renderView()}
  if(k==='delx'){S.confirm=null;return renderView()}
  if(k==='del')return delMember(v);
  if(k==='export')return openExport();
  if(k==='logout'){try{sessionStorage.removeItem('nimex-key')}catch(x){}location.hash='';return location.reload()}
  if(k==='commit')return commitFiles();
  if(k==='mdelq'){S.confirm='m'+v;return renderView()}
  if(k==='mdel')return delMonth(v);
  if(['doxlsx','dopptx','dopng','doinfo','dopeople','dodcs','onepeople','onedc','docopy','docopytsv'].includes(k))return window.doExport(k);
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('gcard')){e.preventDefault();e.target.click()}if(e.key==='Escape')$('#ov-root').innerHTML=''});
document.addEventListener('input',e=>{if(e.target.id==='dcq'){S.dcq=e.target.value;const st=e.target.selectionStart;redoDC();const n=document.getElementById('dcq');if(n){n.focus();try{n.setSelectionRange(st,st)}catch(x){}}return}
  if(e.target.id==='q'){S.q=e.target.value;zones()}
  if(e.target.id==='a-name'){const k=normKey(e.target.value),d=DATA.drv[k];if(d){const mm=$('#a-match');if(mm)mm.value=k;const dc=$('#a-dc');if(dc&&!dc.value)dc.value=d.dc;$('#a-msg').textContent=`พบในรายงาน ${d.r.length} วัน · ${d.dc}`}else if($('#a-msg'))$('#a-msg').textContent=''}
  if(e.target.id==='rq'){S.rq=e.target.value;clearTimeout(S._rt);S._rt=setTimeout(()=>{renderView();const q=$('#rq');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}},250)}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='up-file'&&t.files.length){pickFiles([...t.files]);return}
  if(t.id==='f-mo'||t.id==='f-ww'){S.wcA=S.wcB=null}if(t.id==='f-mo'){S.mi=+t.value;S.wk=0;S.ww=null;S.day=latestDay();return render()}if(t.id==='f-ww'){S.ww=+t.value;return render()}if(t.id==='f-ws'){S.ws=t.value;return render()}if(t.id==='f-wk'){S.wk=+t.value;return render()}if(t.id==='f-day'){S.day=+t.value;return render()}
  if(t.id==='why-imp'){const f=t.files&&t.files[0];t.value='';if(f)whyImport(f);return}
  if(t.id==='w-reason'){const l=$('#w-rdl');if(l)l.hidden=t.value!=='ลาออก';return}
  if(t.id==='wc-a'||t.id==='wc-b'){if(t.id==='wc-a')S.wcA=t.value;else S.wcB=t.value;S.wcArm=false;return renderView()}if(t.id==='f-rg'){S.region=t.value;return render()}if(t.id==='f-dc'){S.dc=t.value;if(S.view==='why'){try{localStorage.setItem('nimex-why-dc',t.value)}catch(e){}}return render()}if(t.id==='f-prob'){S.prob=t.value;return render()}
  if(t.id==='rpos'){S.rpos=t.value;return renderView()}
  if(t.dataset&&t.dataset.f)return saveField(t.dataset.c,t.dataset.f,t.value)});
document.addEventListener('click',e=>{if(e.target.id==='a-add')addMember();if(e.target.id==='p-save')saveCfg();if(e.target.id==='xl-go')exportXlsx()});
$('#btn-share').addEventListener('click',()=>openExport());
$('#btn-theme').addEventListener('click',()=>{const r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),n=cur==='dark'?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('nimex-theme',n)}catch(e){}renderView()});
try{const t=localStorage.getItem('nimex-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}
const tip=$('#tip');function showTip(e){const t=e.target.closest&&e.target.closest('[data-tip]');if(!t){tip.style.display='none';return}tip.textContent=t.getAttribute('data-tip');tip.style.display='block';const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+12,y=e.clientY+14;if(x+w>innerWidth-8)x=innerWidth-w-8;if(y+h>innerHeight-8)y=e.clientY-h-10;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px'}
document.addEventListener('pointermove',showTip);document.addEventListener('pointerdown',showTip);document.addEventListener('pointerleave',()=>tip.style.display='none');
/* ---------- persistence: roster + settings (admin only, through the Apps Script API) ---------- */
const errMsg=e=>e&&e.message==='denied'?'รหัสผู้ดูแลไม่ถูกต้อง หรือหมดอายุ':e&&e.message==='busy'?'ระบบกำลังบันทึกอยู่ ลองใหม่อีกครั้ง':'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';
let rosterTimer=null,saving=Promise.resolve();
function note(t){S.msg=t;const m=$('#r-msg')||$('#a-msg');if(m)m.textContent=t}
function saveRoster(){clearTimeout(rosterTimer);rosterTimer=setTimeout(()=>{saving=saving.then(()=>NXS.put('adm:roster',{list:S.roster})).then(()=>note('บันทึกแล้ว')).catch(e=>note(errMsg(e)))},500)}
function saveField(code,f,v){const r=S.roster.find(x=>x.code===code);if(!r)return;r[f]=f==='match'?normKey(v):v;note('กำลังบันทึก…');saveRoster()}
function delMember(code){S.roster=S.roster.filter(r=>r.code!==code);S.confirm=null;S.msg='ลบ '+code+' แล้ว';saveRoster();renderView()}
function addNew(i){const x=(S.newList||[])[i];if(!x)return;const q=f=>document.querySelector(`[data-nn="${f}"][data-i="${i}"]`),code=((q('code')||{}).value||'').trim().replace(/[^A-Za-z0-9_.-]/g,''),pos=(q('pos')||{}).value||POS_ALL[0];
  if(!code){S.nnMsg='ใส่รหัสพนักงานของ '+x.name+' ก่อน';return renderView()}
  if(S.roster.some(r=>r.code===code)){S.nnMsg='รหัส '+code+' มีอยู่แล้ว';return renderView()}
  S.roster.push({code,name:x.name,branch:x.dc,pos,start:isoI(x.first),end:'',skip:'',match:x.key});S.roster.sort((a,b)=>String(a.code).localeCompare(String(b.code)));
  S.nnMsg='เพิ่ม '+x.name+' เข้ากลุ่ม '+pos+' แล้ว';saveRoster();renderView()}
function addMember(){
  const g=id=>($('#'+id)||{}).value||'',msg=$('#a-msg');
  const name=g('a-name').trim(),code=g('a-code').trim().replace(/[^A-Za-z0-9_.-]/g,''),dc=g('a-dc').trim(),pos=g('a-pos'),start=g('a-start'),match=normKey(g('a-match')||name);
  if(!name||!code||!dc||!start){msg.textContent='กรอกชื่อ รหัส DC และวันเริ่มงานให้ครบ';return}
  if(S.roster.some(r=>r.code===code)){msg.textContent='รหัสนี้มีอยู่แล้ว';return}
  S.roster.push({code,name,branch:dc,pos,start,end:'',skip:'',match});S.roster.sort((a,b)=>String(a.code).localeCompare(String(b.code)));
  S.msg='เพิ่ม '+name+' แล้ว'+(DATA.drv[match]?'':' (ยังไม่พบเที่ยววิ่งในรายงาน)');saveRoster();renderView()}
function pubCfgOf(c){return{grades:c.grades,viewerPages:c.viewerPages,monthN:c.monthN||{}}}
function saveCfg(){
  const g=id=>$('#'+id).value,c=JSON.parse(JSON.stringify(S.cfg));
  c.drop={minD:+g('dp-minD')||0,tiers:[0,1,2,3,4].map(i=>+g('dp-t'+i)||0),minP:+g('dp-minP')||0,rateP:+g('dp-rateP')||0,osAdd:+g('dp-osAdd')||0};c.rateWeek=+g('p-rw')||0;c.minDays=Math.min(7,Math.max(1,+g('p-min')||6));c.rateMonth=+g('p-rm')||0;c.monthMode=g('p-mm');c.monthMiss=Math.max(0,+g('p-miss')||0);
    c.viewerPages=[...document.querySelectorAll('[data-vp]')].filter(i=>i.checked).map(i=>i.dataset.vp);if(!c.viewerPages.length){$('#p-msg').textContent='ให้ผู้ชมเห็นอย่างน้อย 1 หน้า';return}
  c.monthN={};document.querySelectorAll('[data-hn]').forEach(i=>{const v=Math.max(0,Math.floor(+i.value||0));if(v)c.monthN[i.dataset.hn]=v});c.probDays=+g('p-pd')||0;c.asOf=g('p-asof')||c.asOf;
  c.weights=c.weights||{};c.overall=c.overall||{};document.querySelectorAll('[data-w]').forEach(i=>{c.weights[i.dataset.w]=+i.value||0});document.querySelectorAll('[data-o]').forEach(i=>{c.overall[i.dataset.o]=+i.value||0});
  document.querySelectorAll('[data-g]').forEach(i=>{const[k,l]=i.dataset.g.split('.');const v=i.value.trim();c.grades[k]=c.grades[k]||{};c.grades[k][l]=v===''?'':(+v)});
  $('#p-msg').textContent='กำลังบันทึก…';
  saving=saving.then(()=>NXS.put('adm:settings',c)).then(()=>NXS.put('pub:cfg',pubCfgOf(c))).then(()=>{S.cfg=c;S.msg='บันทึกแล้ว';const m=$('#p-msg');if(m)m.textContent='บันทึกแล้ว · ทุกหน้าคำนวณใหม่แล้ว'}).catch(e=>{const m=$('#p-msg');if(m)m.textContent=errMsg(e)})}
function mergeCfg(d){const c=JSON.parse(JSON.stringify(CFG0));if(d)for(const k in d){if(k==='costCol')continue;if(k==='grades'&&d.grades){for(const m in d.grades)if(d.grades[m])c.grades[m]=Object.assign(c.grades[m]||{},d.grades[m])}else if((k==='weights'||k==='overall'||k==='drop')&&d[k])Object.assign(c[k],d[k]);else c[k]=d[k]}return c}
async function delMonth(key){try{await NXS.del('pub:'+key);await NXS.del('adm:'+key);location.reload()}catch(e){S.msg=errMsg(e);S.confirm=null;renderView()}}
/* ---------- boot ---------- */
function init(){
  S.canEdit=!!window.ADMIN;
  S.cfg=mergeCfg(Object.assign({},window.__CFG_PUB||{},window.__CFG_ADM||{}));
  {const mn=(window.__CFG_PUB||{}).monthN;if(mn&&!(S.cfg.monthN&&Object.keys(S.cfg.monthN).length))S.cfg.monthN=mn}
  S.roster=(window.__ROSTER||[]).filter(r=>r&&r.code&&r.name).sort((a,b)=>String(a.code).localeCompare(String(b.code)));S.rosterReady=true;mergeAliases();
  S.mi=M.months.length-1;
  const h=(location.hash||'').replace('#','');
  const okv=allowedViews();
  if(!okv.includes(S.view))S.view=okv[0];
  if(okv.includes(h))S.view=h;
  if(!M.months.length&&S.canEdit){S.view='settings';S.setTab='upload'}
  render()}
/* ---------- hooks for export.js ---------- */
S.day=latestDay();
window.NX_APP={POS_CO,refresh:()=>{if(!groups().some(g=>g[0]===S.view)){S.view='main';try{history.replaceState(null,'','#main')}catch(x){}}S.sel=null;render()},overallOf,diligMonth,passPeople,dcDrivers,dropFor,DROP_POS,diligMonth,vg,workDays,wdInfo,holN,NE,S,M,DATA,$,esc,nf,pf,signed,kv,prevRange,prevName,withRange,dl,LOWK,personAgg,gradeOf,range,periodLabel,BYKEY,EMPTY,REGIONS,MAIN4,KPIS,GRP,POS_ALL,POS_SHORT,regionData,detailRows,rosterRows,diligRows,passDilig,headcount,openSheet,saveFile,pal,wkTxt,mLabel,MI,domI,TH,get cfg(){return S.cfg}};
init();
})();
