/* ---------- share + export (admin only): Excel, PowerPoint, PNG, one-page A4 infographic, copyable text ---------- */
(function(){
'use strict';
const A=window.NX_APP,$=A.$,esc=A.esc,nf=A.nf,pf=A.pf;
const SECS=[['kpi','KPI หลัก 5 ตัว'],['region','ผลรายภาค'],['dc','DC ที่ผลต่ำสุด 10 อันดับ'],['groups','กลุ่มการจ้าง (รถบริษัท)'],['dilig','สรุปเบี้ยขยัน'],['bw_drive','ดีสุด/แย่สุด · อัตราการขึ้นขับ'],['bw_bills','ดีสุด/แย่สุด · ประสิทธิภาพ ทุกสาเหตุ'],['bw_billsC','ดีสุด/แย่สุด · ประสิทธิภาพ ตัดสาเหตุลูกค้า'],['bw_cost','ดีสุด/แย่สุด · ต้นทุนกระจาย'],['bw_pick','ดีสุด/แย่สุด · ต้นทุนเข้ารับ']];
const picked=new Set(['kpi','region','dc']);
const LIGHT={ink:'#0b1f3f',muted:'#55657f',line:'#dbe3f0',panel:'#ffffff',s:['#1d57b8','#b8860b','#6e93d6','#b8334a','#2f8f8f'],bad:'#b8334a'};
const GC={A:'#123f8c',B:'#6e93d6',C:'#d4a72c',D:'#d9822b',F:'#b8334a'};
const GE={A:'🔵',B:'🟦',C:'🟡',D:'🟠',F:'🔴'},MD=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
const LIBS={xlsx:['XLSX','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'],jszip:['JSZip','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'],pptx:['PptxGenJS','https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js']};
const loadLib=k=>new Promise((res,rej)=>{const[g,src]=LIBS[k];if(window[g])return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('lib'));document.head.appendChild(s)});
const say=m=>{const x=$('#xmsg');if(x)x.textContent=m};
const sgn=(v)=>Number.isFinite(v)?(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(2):'–';
/* ---------- data for the sections (always follows the filters at the top) ---------- */
const LOWK=k=>k==='cost'||k==='pick';
function groupsKpi(){const[a,b]=A.range(),mp=A.BYKEY(a,b,r=>r[2]),pr=A.prevRange(),pm=pr?A.BYKEY(pr[0],pr[1],r=>r[2]):null;
  return[0,1].map(g=>{const o=mp.get(g)||A.EMPTY(),T=A.kv(o,'all'),B=A.kv(o,'ab'),C=A.kv(o,'cc'),P=pm?A.kv(pm.get(g)||A.EMPTY(),'all'):null;
    return{g,name:A.GRP[g],items:A.MAIN4.map(([k,l])=>{const d=P&&Number.isFinite(T[k])&&Number.isFinite(P[k])?T[k]-P[k]:NaN;return{k,l,all:T[k],ab:B[k],cc:C[k],diff:d,good:Number.isFinite(d)?(LOWK(k)?d<0:d>0):null,gr:A.gradeOf(k,T[k])}})}})}
function regionRows(){const rd=A.regionData();return A.REGIONS.filter(rg=>rd[rg][0]||rd[rg][1]).map(rg=>({rg,v:[0,1].map(g=>rd[rg][g]?A.kv(rd[rg][g],'all'):null)}))}
function regionAll(){const rd=A.regionData();return A.REGIONS.filter(rg=>rd[rg][0]||rd[rg][1]).map(rg=>{const o=A.EMPTY();[0,1].forEach(g=>{if(rd[rg][g]){for(let i=0;i<12;i++)o.C[i]+=rd[rg][g].C[i];for(let i=0;i<A.NE;i++)o.E[i]+=rd[rg][g].E[i]}});return{rg,k:A.kv(o,'all')}})}
function dcRows(){const S=A.S,save=S.dg;S.dg='all';let rows=A.detailRows();S.dg=save;
  rows=rows.filter(r=>(!S.region||r.rg===S.region)&&Number.isFinite(r.k.bills)).sort((x,y)=>x.k.bills-y.k.bills).slice(0,10);return rows}
function groupRows(){const rows=A.rosterRows();return A.POS_ALL.map(pos=>{const mem=rows.filter(q=>q.r.pos===pos),act=mem.filter(q=>!q.abn),o=A.EMPTY();act.forEach(q=>{for(let i=0;i<12;i++)o.C[i]+=q.x.o.C[i];for(let i=0;i<A.NE;i++)o.E[i]+=q.x.o.E[i]});return{pos,n:mem.length,act:act.length,k:A.kv(o,'all')}})}
function diligSum(){const rows=A.diligRows().filter(x=>x.d&&A.passDilig(x)),sm=f=>rows.reduce((s,x)=>s+f(x.d),0);
  return{n:rows.length,paid:rows.filter(x=>x.d.total>0).length,total:sm(d=>d.total),weekly:sm(d=>d.weekly),monthly:sm(d=>d.monthly),wk:[0,1,2,3].map(i=>({n:rows.filter(x=>x.d.wk[i].pay>0).length,baht:sm(d=>d.wk[i].pay)}))}}
const scopeText=()=>A.S.region?'ภาค '+A.S.region:'ทุกภาค';
/* ---------- text summary ---------- */
function summaryText(){const L=['📊 NIMEX Delivery Driver Performance',`🗓️ ${A.periodLabel()}  |  📍 ${scopeText()}`];const sec=t=>{L.push('');L.push(t)};
  if(picked.has('kpi'))groupsKpi().forEach(G=>{sec(`🎯 ${G.name}`);G.items.forEach(i=>L.push(`${i.gr?GE[i.gr]+' ':'• '}${i.l}: ${pf(i.all,2)}${i.gr?' เกรด '+i.gr:''}  (${i.k==='drive'?'':'AB '+pf(i.ab,2)+' | CC '+pf(i.cc,2)+' | '}เทียบ${A.prevName()} ${Number.isFinite(i.diff)?(i.good?'🟢 ':i.diff===0?'':'🔴 ')+sgn(i.diff)+' pt':'–'})`))});
  if(picked.has('region')){sec('🗺️ ภาคที่ประสิทธิภาพ (ทุกสาเหตุ) ต่ำสุด');regionRows().filter(r=>r.v[0]||r.v[1]).sort((a,b)=>Math.min(...a.v.filter(Boolean).map(x=>x.bills))-Math.min(...b.v.filter(Boolean).map(x=>x.bills))).slice(0,3).forEach((r,i)=>L.push(`${MD[i]} ${r.rg}: บริษัท ${pf(r.v[0]?r.v[0].bills:NaN,2)} · ผป. ${pf(r.v[1]?r.v[1].bills:NaN,2)}`))}
  if(picked.has('dc')){sec('🚨 DC ที่ประสิทธิภาพต่ำสุด');dcRows().slice(0,5).forEach((r,i)=>L.push(`${MD[i]} ${r.dc} (${r.rg}): ${pf(r.k.bills,2)}`))}
  SECS.filter(x=>isBW(x[0])&&picked.has(x[0])).forEach(([key])=>{const kk=BWK(key),B=bwRows(kk,3);sec('🏅 ดีสุด/แย่สุด · '+kLabel(kk));B.list.forEach(x=>L.push(`${x.tag==='ดีสุด'?'🟢':'🔴'} ${x.r.dc} (${x.r.rg}): ${pf(x.r.k[kk],2)}`));L.push('ภาค:');bwRegion(kk,2).list.forEach(x=>L.push(`${x.tag==='ดีสุด'?'🟢':'🔴'} ${x.r.rg}: ${pf(x.r.k[kk],2)}`))});
  if(picked.has('groups')){sec('👷 กลุ่มการจ้าง (รถบริษัท)');groupRows().forEach(g=>L.push(`• ${A.POS_SHORT(g.pos)}: ${g.act}/${g.n} คน · ขึ้นขับ ${pf(g.k.drive,2)} · ทุกสาเหตุ ${pf(g.k.bills,2)}`))}
  if(picked.has('dilig')){const d=diligSum();sec('💰 เบี้ยขยัน');L.push(`👥 ได้รับ ${nf(d.paid)} จาก ${nf(d.n)} คน`);L.push(`💵 รวม ${nf(d.total)} บาท (สัปดาห์ ${nf(d.weekly)} + เดือน ${nf(d.monthly)})`)}
  return L.join('\n')}
function openExport(){A.openSheet(`<h2>แชร์และส่งออก</h2><p class="say" style="margin:0">${esc(A.periodLabel())} · ${esc(scopeText())} ใช้ผลตามตัวกรองที่เลือกอยู่</p>
 <div class="checks">${SECS.map(([k,t])=>`<label><input type="checkbox" data-sec="${k}"${picked.has(k)?' checked':''}> ${t}</label>`).join('')}</div>
 <div class="btns"><button class="btn" data-act="doxlsx">Excel</button><button class="btn" data-act="dopptx">PowerPoint</button><button class="btn" data-act="dopng">รูปภาพ PNG</button><button class="btn" data-act="dopeople">สรุปรายบุคคล (PNG ทุกคน · ZIP)</button><button class="btn" data-act="doinfo" style="background:linear-gradient(180deg,#f0d57a,#d4af37);color:#0a2a5e">อินโฟกราฟิก 1 หน้า</button></div>
 <label for="share-text"><b>ข้อความสรุป</b></label><textarea id="share-text">${esc(summaryText())}</textarea><button class="btn alt" data-act="docopy">คัดลอกข้อความ</button><p class="msg" id="xmsg" role="status"></p><div id="xfall" style="display:grid;gap:8px"></div>`)}
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.sec;if(!k)return;e.target.checked?picked.add(k):picked.delete(k);const t=$('#share-text');if(t)t.value=summaryText()});
const stamp=()=>{const S=A.S,m=A.MI(),mm=String(m.m).padStart(2,'0'),per=S.mode==='month'?`${m.y}-${mm}`:S.mode==='week'?`${m.y}-${mm}-week${S.wk+1}`:`${m.y}-${mm}-day${String(S.day).padStart(2,'0')}`;return 'NIMEX-Driver-Performance-'+per+(S.region?'-Region':'')};
/* ---------- svg building blocks (same code draws every export, light colours) ---------- */
const fontCss=()=>($('#fontcss')||{textContent:''}).textContent;
const IC={star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',pin:'<path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',alert:'<path d="M12 3L2 20h20zM12 10v4M12 17v.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-6 8-6s7 1 8 6"/>',money:'<circle cx="12" cy="12" r="9"/><path d="M15 8.5H10.5a2 2 0 000 4h3a2 2 0 010 4H9M12 6v12"/>',truck:'<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',bill:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6"/>',pct:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'};
const svgI=(n,x,y,s,col,sw=2)=>`<g transform="translate(${x} ${y}) scale(${s/24})" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</g>`;
const SECI={kpi:'star',region:'pin',dc:'alert',groups:'user',dilig:'money',bw_drive:'star',bw_bills:'star',bw_billsC:'star',bw_cost:'star',bw_pick:'star'};
const KI={drive:'truck',bills:'truck',billsC:'truck',cost:'bill',pick:'pct'};
function miniTable(cols,data,W,h){const rh=h?Math.min(58,h/(data.length+1)):28,fs=rh>=38?16:rh>=32?15:13,base=Math.round(rh/2+fs*.36),tw=cols.reduce((s,c)=>s+c.w,0);let x=0;const xs=cols.map(c=>{const a=x;x+=c.w/tw*W;return a});let s=`<rect width="${W}" height="${rh}" rx="6" fill="#0a2a5e"/>`;
  cols.forEach((c,i)=>{const cw=c.w/tw*W,tx=c.r?xs[i]+cw-10:c.c?xs[i]+cw/2:xs[i]+10;s+=`<text x="${tx}" y="${base}" text-anchor="${c.r?'end':c.c?'middle':'start'}" font-size="${fs}" font-weight="600" fill="#fff">${esc(c.t)}</text>`});
  data.forEach((r,j)=>{const y=(j+1)*rh;if(j%2)s+=`<rect y="${y}" width="${W}" height="${rh}" fill="#f2f5fb"/>`;cols.forEach((c,i)=>{const cw=c.w/tw*W,tx=c.r?xs[i]+cw-10:c.c?xs[i]+cw/2:xs[i]+10,col=c.col?c.col(r):'#0b1f3f';
    if(c.rank){const R=Math.min(11,rh/2-3);s+=`<circle cx="${tx}" cy="${y+rh/2}" r="${R}" fill="${j<3?'#b8334a':'#6e93d6'}"/><text x="${tx}" y="${y+rh/2+4.5}" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">${j+1}</text>`;return}
    s+=`<text x="${tx}" y="${y+base}" text-anchor="${c.r?'end':c.c?'middle':'start'}" font-size="${fs}" font-weight="${i<2?600:400}" fill="${col}">${esc(c.f(r))}</text>`})});
  return{s,h:h?Math.max(h,(data.length+1)*rh):(data.length+1)*rh}}
function kpiPiece(w,h){const G=groupsKpi(),gap=12,hh=34,nat=148,cw=(w-4*gap)/5,ch=h?Math.max(nat,(h-2*hh-gap)/2):nat;let s='';
  G.forEach((g,gi)=>{const y0=gi*(hh+ch+gap);s+=`<rect x="0" y="${y0+6}" width="8" height="${hh-12}" rx="3" fill="${gi?'#b8860b':'#1d57b8'}"/><text x="18" y="${y0+hh-9}" font-size="19" font-weight="600" font-family="Prompt,sans-serif" fill="#0a2a5e">${esc(g.name)}</text>`;
    g.items.forEach((t,i)=>{const x=i*(cw+gap),y=y0+hh,bar=GC[t.gr]||'#d4af37',lblY=ch*.2,valY=ch*.5;
      s+=`<g transform="translate(${x} ${y})"><rect width="${cw}" height="${ch}" rx="14" fill="#0a2a5e"/><path d="M0 ${ch-5}h${cw}v-.01c0 3-2 5-5 5H5c-3 0-5-2-5-5z" fill="${bar}"/><circle cx="24" cy="24" r="15" fill="#d4af37"/>${svgI(KI[t.k],14,14,20,'#0a2a5e',2.2)}
       <text x="${cw/2+8}" y="${lblY+4}" text-anchor="middle" font-size="12" fill="#e6d79c">${esc(t.l.replace('ประสิทธิภาพ ',''))}</text><text x="${cw/2}" y="${valY+10}" text-anchor="middle" font-size="31" font-weight="600" font-family="Prompt,sans-serif" fill="#fff">${esc(pf(t.all,2))}</text>
       ${t.k==='drive'?'':`<text x="${cw/2}" y="${ch-44}" text-anchor="middle" font-size="12" fill="#cfdcf2">AB ${esc(pf(t.ab,2))}  ·  CC ${esc(pf(t.cc,2))}</text>`}<text x="${cw/2}" y="${ch-24}" text-anchor="middle" font-size="13" font-weight="600" fill="${t.good==null?'#e6d79c':t.diff===0?'#e6d79c':t.good?'#5fe0a0':'#ff8a98'}">${Number.isFinite(t.diff)?(t.diff>0?'▲ ':t.diff<0?'▼ ':'')+esc(sgn(t.diff))+' pt':'ไม่มีช่วงก่อนหน้า'}</text>
       ${t.gr?`<rect x="${cw-40}" y="9" width="30" height="30" rx="8" fill="${bar}"/><text x="${cw-25}" y="30" text-anchor="middle" font-size="17" font-weight="600" fill="#fff">${t.gr}</text>`:''}</g>`})});
  return{t:'ผลสำคัญ',s,h:2*(hh+ch)+gap}}
/* ดีสุด/แย่สุดของ DC ในแต่ละ KPI (ค่าสูงดี ยกเว้นต้นทุนที่ต่ำดี) */
const BWK=k=>k.slice(3),isBW=k=>k.indexOf('bw_')===0;
function bwRows(kk,n){const low=kk==='cost'||kk==='pick',S=A.S,save=S.dg;S.dg='all';let rows=A.detailRows();S.dg=save;
  rows=rows.filter(r=>(!S.region||r.rg===S.region)&&Number.isFinite(r.k[kk])).sort((x,y)=>low?x.k[kk]-y.k[kk]:y.k[kk]-x.k[kk]);
  const h=Math.min(n,Math.floor(rows.length/2)),best=rows.slice(0,h).map(r=>({r,tag:'ดีสุด'})),worst=rows.slice(rows.length-h).reverse().map(r=>({r,tag:'แย่สุด'}));return{all:rows,list:best.concat(worst)}}
function bwRegion(kk,n){const low=kk==='cost'||kk==='pick';let rows=regionAll().filter(r=>Number.isFinite(r.k[kk])&&(!A.S.region||r.rg===A.S.region)).sort((x,y)=>low?x.k[kk]-y.k[kk]:y.k[kk]-x.k[kk]);
  const h=Math.min(n,Math.floor(rows.length/2));return{all:rows,list:rows.slice(0,h).map(r=>({r,tag:'ดีสุด'})).concat(rows.slice(rows.length-h).reverse().map(r=>({r,tag:'แย่สุด'})))}}
const kLabel=kk=>(A.MAIN4.find(x=>x[0]===kk)||[])[1]||kk;
const gcol=(k,v)=>{const g=A.gradeOf(k,v);return g&&GC[g]&&(g==='F'||g==='D')?GC[g]:'#0b1f3f'};
function piece(k,w,o={}){const h=o.h,n=o.n||10;
  if(k==='kpi')return kpiPiece(w,h);
  if(k==='region'){const R=regionRows(),M4=A.MAIN4,cols=[{t:'ภาค',w:2.2,f:r=>r.rg}];[0,1].forEach(g=>M4.forEach(([kk,l])=>cols.push({t:(g?'ผป. ':'บ. ')+(kk==='drive'?'ขึ้นขับ':kk==='bills'?'ทุกสาเหตุ':kk==='billsC'?'ตัดลูกค้า':kk==='cost'?'ต้นทุน':'เข้ารับ'),w:1.5,r:1,f:r=>r.v[g]?pf(r.v[g][kk],1):'–',col:r=>r.v[g]?gcol(kk,r.v[g][kk]):'#0b1f3f'})));
    const t=miniTable(cols,R,w,h);return{t:'ผลรายภาค (บ. = รถบริษัท, ผป. = รถผู้ประกอบการ)',s:t.s,h:t.h}}
  if(isBW(k)){const kk=BWK(k),B=bwRows(kk,5),RG=bwRegion(kk,3),gap=10,hd=h?Math.round(h*.64):0,
    t=miniTable([{t:'',w:1.3,c:1,f:x=>x.tag,col:x=>x.tag==='ดีสุด'?'#1a8a4a':'#c62839'},{t:'DC',w:4,f:x=>x.r.dc},{t:'ภาค',w:2,f:x=>x.r.rg},{t:'คน',w:1,r:1,f:x=>nf(x.r.n0+x.r.n1)},{t:kLabel(kk).replace('ประสิทธิภาพ ',''),w:2,r:1,f:x=>pf(x.r.k[kk],2),col:x=>gcol(kk,x.r.k[kk])}],B.list,w,hd),
    t2=RG.list.length?miniTable([{t:'',w:1.3,c:1,f:x=>x.tag,col:x=>x.tag==='ดีสุด'?'#1a8a4a':'#c62839'},{t:'ภาค',w:6,f:x=>x.r.rg},{t:kLabel(kk).replace('ประสิทธิภาพ ',''),w:2,r:1,f:x=>pf(x.r.k[kk],2),col:x=>gcol(kk,x.r.k[kk])}],RG.list,w,h?Math.max(0,h-t.h-gap):0):{s:'',h:0};
    return{t:'ดีสุด / แย่สุด · '+kLabel(kk)+' (DC และภาค)',s:t.s+`<g transform="translate(0 ${t.h+gap})">${t2.s}</g>`,h:t.h+gap+t2.h}}
  if(k==='dc'){const R=dcRows().slice(0,n),t=miniTable([{t:'#',w:.8,c:1,rank:1,f:()=>''},{t:'DC',w:4,f:r=>r.dc},{t:'ภาค',w:2,f:r=>r.rg},{t:'คน',w:1,r:1,f:r=>nf(r.n0+r.n1)},{t:'ทุกสาเหตุ',w:1.7,r:1,f:r=>pf(r.k.bills,2),col:r=>gcol('bills',r.k.bills)},{t:'ต้นทุนกระจาย',w:1.9,r:1,f:r=>pf(r.k.cost,2),col:r=>gcol('cost',r.k.cost)}],R,w,h);return{t:`${Math.min(n,R.length)} DC ที่ประสิทธิภาพ (ทุกสาเหตุ) ต่ำสุด`,s:t.s,h:t.h}}
  if(k==='groups'){const R=groupRows(),t=miniTable([{t:'กลุ่มการจ้าง',w:3,f:r=>A.POS_SHORT(r.pos)},{t:'คน',w:1,r:1,f:r=>nf(r.act)+'/'+nf(r.n)},{t:'ขึ้นขับ',w:1.4,r:1,f:r=>pf(r.k.drive,2),col:r=>gcol('drive',r.k.drive)},{t:'ทุกสาเหตุ',w:1.6,r:1,f:r=>pf(r.k.bills,2),col:r=>gcol('bills',r.k.bills)},{t:'ตัดลูกค้า',w:1.6,r:1,f:r=>pf(r.k.billsC,2),col:r=>gcol('billsC',r.k.billsC)},{t:'ต้นทุนกระจาย',w:1.8,r:1,f:r=>pf(r.k.cost,2),col:r=>gcol('cost',r.k.cost)},{t:'เข้ารับ',w:1.4,r:1,f:r=>pf(r.k.pick,2),col:r=>gcol('pick',r.k.pick)}],R,w,h);return{t:'กลุ่มการจ้าง รถบริษัท (คนที่มีเที่ยววิ่ง / ทั้งหมด)',s:t.s,h:t.h}}
  if(k==='dilig'){const d=diligSum(),sh=64,gap=12,cw=(w-3*gap)/4;let s='';
    [['money','ได้รับเบี้ย',nf(d.paid)+' / '+nf(d.n)+' คน'],['bill','ยอดรวม',nf(d.total)+' บาท'],['truck','รายสัปดาห์',nf(d.weekly)+' บาท'],['star','รายเดือน',nf(d.monthly)+' บาท']].forEach(([ic,l,v],i)=>{const x=i*(cw+gap);s+=`<g transform="translate(${x} 0)"><rect width="${cw}" height="${sh}" rx="12" fill="#f2f5fb" stroke="#dbe3f0"/><circle cx="32" cy="${sh/2}" r="20" fill="#0a2a5e"/>${svgI(ic,20,sh/2-12,24,'#d4af37')}<text x="${(cw+52)/2}" y="26" text-anchor="middle" font-size="14" fill="#55657f">${esc(l)}</text><text x="${(cw+52)/2}" y="50" text-anchor="middle" font-size="18" font-weight="600" font-family="Prompt,sans-serif" fill="#0b1f3f">${esc(v)}</text></g>`});
    const t=miniTable([{t:'รอบ',w:2,f:r=>r.l},{t:'ผู้ได้เบี้ย (คน)',w:2,r:1,f:r=>nf(r.n)},{t:'ยอด (บาท)',w:2,r:1,f:r=>nf(r.b)}],d.wk.map((x,i)=>({l:`สัปดาห์ ${i+1} (${i*7+1}–${(i+1)*7})`,n:x.n,b:x.baht})),w,h?Math.max(0,h-sh-gap):0);
    return{t:'สรุปเบี้ยขยัน (รายวัน)',s:s+`<g transform="translate(0 ${sh+gap})">${t.s}</g>`,h:sh+gap+t.h}}}
const CARD={top:52,pad:18};
function card(p,k,x,y,w,h){return`<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="16" fill="#fff" stroke="#dbe3f0"/><rect x="${w*.15}" y="-1.2" width="${w*.7}" height="2.4" fill="#d4af37"/><circle cx="${w/2}" cy="0" r="19" fill="#0a2a5e" stroke="#d4af37" stroke-width="2"/>${svgI(SECI[k],w/2-11,-11,22,'#f0d57a')}<text x="${w/2}" y="${CARD.top-12}" text-anchor="middle" font-size="18" font-weight="600" font-family="Prompt,sans-serif" fill="#0a2a5e">${esc(p.t)}</text><g transform="translate(${CARD.pad} ${CARD.top})">${p.s}</g></g>`}
const scopeLines=()=>[A.periodLabel().replace(/ \(.*\)$/,''),scopeText(),'ก.ย.–ต.ค. 2569'].slice(0,2);
function sheetHead(W,H0,id){const pw=H0>120?248:150,ph=H0-46,ly=(H0-5-ph)/2,m=24,L=scopeLines(),big=H0>120,dots=[.3,.42,.58,.7].map((f,i)=>`<circle cx="${W*f}" cy="${H0-20-(i%2)*14}" r="4" fill="#d4af37"/>`).join('');
  return`<defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#071f4a"/><stop offset=".5" stop-color="#143f8c"/><stop offset="1" stop-color="#071f4a"/></linearGradient></defs><rect width="${W}" height="${H0}" fill="url(#${id})"/><path d="M${W*.24} ${H0-20}C${W*.3} ${H0-46} ${W*.36} ${H0-6} ${W*.42} ${H0-34}S${W*.54} ${H0-8} ${W*.58} ${H0-20}S${W*.68} ${H0-44} ${W*.76} ${H0-20}" fill="none" stroke="#6e93d6" stroke-width="2" stroke-dasharray="6 7" opacity=".55"/>${big?dots:''}<rect y="${H0-5}" width="${W}" height="5" fill="#d4af37"/>
 <rect x="${m}" y="${ly}" width="${pw}" height="${ph}" rx="14" fill="#fff"/><image x="${m+10}" y="${ly+8}" width="${pw-20}" height="${ph-16}" href="${LOGO}" preserveAspectRatio="xMidYMid meet"/>
 <text x="${W/2}" y="${big?72:44}" text-anchor="middle" font-size="${big?(W<1300?34:40):30}" font-weight="600" font-family="Prompt,sans-serif" fill="#fff">NIMEX Delivery Driver Performance</text><text x="${W/2}" y="${big?106:72}" text-anchor="middle" font-size="${big?22:17}" fill="#e6d79c">สรุปผลการจัดส่ง</text>
 <rect x="${W-m-pw}" y="${ly}" width="${pw}" height="${ph}" rx="14" fill="rgba(255,255,255,.1)" stroke="#d4af37"/>${L.map((t,i)=>`<text x="${W-m-pw/2}" y="${ly+ph/2+(i-(L.length-1)/2)*(big?30:21)+(big?8:5)}" text-anchor="middle" font-size="${i?(big?17:13):(big?20:15)}" font-weight="${i?400:600}" font-family="Prompt,sans-serif" fill="#fff">${esc(t)}</text>`).join('')}`}
const sheetFoot=(W,H,h)=>`<rect y="${H-h}" width="${W}" height="${h}" fill="#0a2a5e"/><rect y="${H-h}" width="${W}" height="3" fill="#d4af37"/><text x="${W/2}" y="${H-h/2+6}" text-anchor="middle" font-size="14" fill="#dfe8f7">ประสิทธิภาพ = บิลส่งสำเร็จ ÷ บิลทั้งหมด · AB = ของแห้ง, CC = ของเย็น · ต้นทุน = ต้นทุน ÷ รายได้</text>`;
const wrap=(W,H,inner)=>({svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${fontCss()}text{font-family:Prompt,sans-serif}</style><rect width="${W}" height="${H}" fill="#eef2f9"/>${inner}</svg>`,W,H});
function infoMeasure(keys,W){const m=26,g=m,head=176,foot=46,ch=CARD.top+CARD.pad,inner=W-2*m,hw=(inner-g)/2,fullK=keys.filter(k=>k==='kpi'||k==='region'||k==='dilig'),halfK=keys.filter(k=>!fullK.includes(k));if(halfK.length===1){fullK.push(halfK[0]);halfK.length=0}
  const F=fullK.map(k=>({k,nh:piece(k,inner-2*CARD.pad).h})),C=[[],[]],cH=[0,0];halfK.forEach(k=>{const nh=piece(k,hw-2*CARD.pad).h,c=cH[0]<=cH[1]?0:1;C[c].push({k,nh});cH[c]+=nh+ch+(C[c].length>1?g:0)});
  const colH=Math.max(...cH),blocks=F.length+(colH?1:0),used=head+foot+g*(blocks+1)+F.reduce((s,f)=>s+f.nh+ch,0)+colH;return{W,m,g,head,foot,ch,inner,hw,F,C,cH,colH,blocks,used}}
function infographic(keys){const ratio=1754/1240;let lo=1080,hi=2000,best=infoMeasure(keys,lo);if(best.used>lo*ratio){for(let i=0;i<7;i++){const mid=(lo+hi)/2,T=infoMeasure(keys,mid);if(T.used<=mid*ratio){hi=mid;best=T}else lo=mid}if(best.used>best.W*ratio)best=infoMeasure(keys,hi)}
  const T=best,{W,m,g,head,foot,ch,inner,hw,F,C,cH,colH}=T,H=Math.round(W*ratio),spare=Math.max(0,H-T.used),base=F.reduce((s,f)=>s+f.nh,0)+colH||1,f=1+spare/base;
  let y=head+g,b='';F.forEach(x=>{const h=x.nh*f,p=piece(x.k,inner-2*CARD.pad,{h});b+=card(p,x.k,m,y,inner,h+ch);y+=h+ch+g});
  const colFinal=colH*f;C.forEach((c,ci)=>{if(!c.length)return;const gaps=(c.length-1)*g,chr=c.length*ch,sum=c.reduce((s,x)=>s+x.nh,0),sc=(colFinal-gaps-chr)/sum;let yy=y;c.forEach(x=>{const h=x.nh*sc,p=piece(x.k,hw-2*CARD.pad,{h});b+=card(p,x.k,m+ci*(hw+g),yy,hw,h+ch);yy+=h+ch+g})});
  return wrap(W,H,sheetHead(W,head,'hg')+b+sheetFoot(W,H,foot))}
function slideSheet(k){const W=1600,H=900,head=104,foot=40,m=26,cw=W-2*m,top=head+m,cardH=H-head-foot-2*m,h=cardH-CARD.top-CARD.pad,p=piece(k,cw-2*CARD.pad,{h,n:10});return wrap(W,H,sheetHead(W,head,'sg')+card(p,k,m,top,cw,cardH)+sheetFoot(W,H,foot))}
function compose(keys){const W=1240,m=26,head=176,foot=46,ch=CARD.top+CARD.pad,inner=W-2*m-2*CARD.pad;let y=head+m,b='';keys.forEach(k=>{const p=piece(k,inner);b+=card(p,k,m,y,W-2*m,p.h+ch);y+=p.h+ch+m});const H=y+foot;return wrap(W,H,sheetHead(W,head,'cg')+b+sheetFoot(W,H,foot))}
function toPng(c,scale){return new Promise((res,rej)=>{const area=c.W*c.H*scale*scale;if(area>16e6)scale=Math.sqrt(16e6/(c.W*c.H));const u=URL.createObjectURL(new Blob([c.svg],{type:'image/svg+xml'})),im=new Image();im.onload=()=>setTimeout(()=>{const cv=document.createElement('canvas');cv.width=Math.round(c.W*scale);cv.height=Math.round(c.H*scale);const x=cv.getContext('2d');x.drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);cv.toBlob(b=>b?res(b):rej(new Error('png')),'image/png')},120);im.onerror=rej;im.src=u})}
const blob64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});

/* ---------- per-person summary cards: one PNG each, bundled in a ZIP ---------- */
function personCard(q,P,dil){const W=720,m=q.m,pm=P?P.m:null,rows=A.KPIS;const rh=84,top=216,H=top+rows.length*rh+150;
  const ov=q.ov,gc=g=>GC[g]||'#9aa8c0';let b=`<rect width="${W}" height="${H}" fill="#fff"/><rect width="${W}" height="150" fill="#0a2a5e"/><rect y="146" width="${W}" height="4" fill="#d4af37"/>
  <text x="32" y="56" font-size="30" font-weight="600" font-family="Prompt,sans-serif" fill="#fff">${esc(q.r.name)}</text>
  <text x="32" y="90" font-size="16" fill="#cfdcf2">${esc(q.r.code||'')} · ${esc(q.r.branch||'')} · ${esc(A.POS_SHORT(q.r.pos))}</text>
  <text x="32" y="122" font-size="15" fill="#e6d79c">${esc(A.periodLabel())}</text>`;
  if(ov)b+=`<rect x="${W-130}" y="26" width="98" height="98" rx="16" fill="${gc(ov.g)}"/><text x="${W-81}" y="84" text-anchor="middle" font-size="46" font-weight="700" fill="#fff" font-family="Prompt,sans-serif">${ov.g}</text><text x="${W-81}" y="112" text-anchor="middle" font-size="14" fill="#fff">คะแนน ${ov.sc.toFixed(1)}</text>`;
  else b+=`<text x="${W-32}" y="84" text-anchor="end" font-size="16" fill="#cfdcf2">ไม่มีเที่ยววิ่งในช่วงนี้</text>`;
  b+=`<text x="32" y="${top-26}" font-size="15" fill="#55657f">ตัวชี้วัด 5 ตัว · เกรด · เทียบ${esc(A.prevName()||'ช่วงก่อนหน้า')}</text>`;
  rows.forEach(([k,l],i)=>{const y=top+i*rh,v=m[k],g=A.gradeOf(k,v),pv=pm?pm[k]:NaN,d=Number.isFinite(v)&&Number.isFinite(pv)?v-pv:NaN,good=Number.isFinite(d)?(LOWK(k)?d<0:d>0):null;
    b+=`<rect x="24" y="${y}" width="${W-48}" height="${rh-10}" rx="12" fill="${i%2?'#f2f5fb':'#fff'}" stroke="#dbe3f0"/>
    <text x="44" y="${y+34}" font-size="19" font-weight="600" fill="#0b1f3f">${esc(l)}</text>
    <text x="44" y="${y+58}" font-size="14" fill="${Number.isFinite(d)?(d===0?'#55657f':good?'#1a8a4a':'#c62839'):'#55657f'}">${Number.isFinite(d)?(d>0?'▲ ':d<0?'▼ ':'')+esc(sgn(d))+' pt':'ไม่มีช่วงก่อนหน้า'}</text>
    <text x="${W-150}" y="${y+48}" text-anchor="end" font-size="30" font-weight="600" font-family="Prompt,sans-serif" fill="#0b1f3f">${esc(pf(v,2))}</text>
    ${g?`<rect x="${W-130}" y="${y+14}" width="48" height="48" rx="10" fill="${gc(g)}"/><text x="${W-106}" y="${y+48}" text-anchor="middle" font-size="26" font-weight="700" fill="#fff">${g}</text>`:`<text x="${W-106}" y="${y+46}" text-anchor="middle" font-size="18" fill="#9aa8c0">–</text>`}`});
  const yy=top+rows.length*rh+10;
  b+=`<rect x="24" y="${yy}" width="${W-48}" height="100" rx="12" fill="#fff8e1" stroke="#e6d79c"/><text x="44" y="${yy+34}" font-size="17" font-weight="600" fill="#0a2a5e">เบี้ยขยัน</text>`;
  if(dil)b+=`<text x="44" y="${yy+64}" font-size="16" fill="#0b1f3f">${dil.total>0?'ได้รับ '+nf(dil.total)+' บาท':'ไม่ได้รับเบี้ยขยัน'} · วันขึ้นขับ ${nf(dil.have)}/${nf(dil.need)} วัน</text><text x="44" y="${yy+86}" font-size="14" fill="#55657f">สัปดาห์ที่ผ่าน ${dil.wk.filter(w=>w.ok).length}/4 · ${dil.full?'เต็มเดือน':'ขาด '+nf(dil.miss)+' วัน'}</text>`;
  else b+=`<text x="44" y="${yy+64}" font-size="15" fill="#55657f">ไม่อยู่ในกลุ่มที่ได้รับเบี้ยขยัน (เฉพาะรายวัน)</text>`;
  return wrap(W,H,b)}
async function peopleZip(){await loadLib('jszip');const rows=A.rosterRows(),pr=A.prevRange(),prev=new Map();
  if(pr)A.withRange(pr,A.rosterRows).forEach(q=>prev.set(q.r.code,q));
  const dm=new Map();A.diligRows().forEach(x=>dm.set(x.r.code,x.d));
  const zip=new JSZip(),used=new Set();let n=0;
  for(const q of rows){say(`กำลังสร้างรูป ${++n}/${rows.length}…`);
    const c=personCard(q,prev.get(q.r.code),dm.get(q.r.code));
    let nm=String(q.r.code||q.r.name).replace(/[\\/:*?"<>|\s]+/g,'_'),f=nm;for(let i=2;used.has(f);i++)f=nm+'_'+i;used.add(f);
    zip.file(f+'.png',await toPng(c,1.5));
    if(n%10===0)await new Promise(r=>setTimeout(r,0))}
  return zip.generateAsync({type:'blob'})}
/* ---------- Excel (one sheet per chosen section) ---------- */
function sheetsData(){const out=[],r2=v=>Number.isFinite(v)?Math.round(v*100)/100:'';
  if(picked.has('kpi')){const rows=[['กลุ่ม','ตัวชี้วัด','รวม (%)','เกรด','AB แห้ง (%)','CC เย็น (%)','เทียบช่วงก่อนหน้า (pt)','ดี/แย่']];groupsKpi().forEach(g=>g.items.forEach(i=>rows.push([g.name,i.l,r2(i.all),i.gr||'',r2(i.ab),r2(i.cc),r2(i.diff),i.good==null?'':i.good?'ดี':'แย่'])));out.push(['KPI',rows])}
  if(picked.has('region')){const rows=[['ภาค','บริษัท ขึ้นขับ','บริษัท ทุกสาเหตุ','บริษัท ตัดลูกค้า','บริษัท ต้นทุนกระจาย','บริษัท ต้นทุนเข้ารับ','ผป. ขึ้นขับ','ผป. ทุกสาเหตุ','ผป. ตัดลูกค้า','ผป. ต้นทุนกระจาย','ผป. ต้นทุนเข้ารับ']];regionRows().forEach(r=>rows.push([r.rg,...[0,1].flatMap(g=>A.MAIN4.map(([k])=>r.v[g]?r2(r.v[g][k]):''))]));out.push(['ภาค',rows])}
  if(picked.has('dc')){const save=A.S.dg;A.S.dg='all';const rows=[['DC','ภาค','คนขับ รถบริษัท','คนขับ ผู้ประกอบการ','ทุกสาเหตุ','ตัดลูกค้า','ต้นทุนกระจาย','ต้นทุนเข้ารับ']];A.detailRows().filter(r=>!A.S.region||r.rg===A.S.region).sort((a,b)=>a.k.bills-b.k.bills).forEach(r=>rows.push([r.dc,r.rg,r.n0,r.n1,r2(r.k.bills),r2(r.k.billsC),r2(r.k.cost),r2(r.k.pick)]));A.S.dg=save;out.push(['DC',rows])}
  if(picked.has('groups')){const rows=[['กลุ่มการจ้าง','คนทั้งหมด','มีเที่ยววิ่ง','อัตราการขึ้นขับ','ทุกสาเหตุ','ตัดลูกค้า','ต้นทุนกระจาย','ต้นทุนเข้ารับ']];groupRows().forEach(g=>rows.push([g.pos,g.n,g.act,r2(g.k.drive),r2(g.k.bills),r2(g.k.billsC),r2(g.k.cost),r2(g.k.pick)]));out.push(['กลุ่มการจ้าง',rows])}
  SECS.filter(x=>isBW(x[0])&&picked.has(x[0])).forEach(([key])=>{const kk=BWK(key),B=bwRows(kk,5),rows=[['อันดับ','DC','ภาค','คนขับ รถบริษัท','คนขับ ผู้ประกอบการ',kLabel(kk)+' (%)','เกรด','ดีสุด/แย่สุด']];B.all.forEach((r,i)=>rows.push([i+1,r.dc,r.rg,r.n0,r.n1,r2(r.k[kk]),A.gradeOf(kk,r.k[kk])||'',B.list.find(x=>x.r===r)?B.list.find(x=>x.r===r).tag:'']));rows.push([],['ภาค','','','','',kLabel(kk)+' (%)','','ดีสุด/แย่สุด']);{const R=bwRegion(kk,3);R.all.forEach(r=>rows.push([r.rg,'','','','',r2(r.k[kk]),'',(R.list.find(x=>x.r===r)||{}).tag||'']))}out.push([('ดีสุดแย่สุด '+kLabel(kk).replace('ประสิทธิภาพ ','')).slice(0,31).replace(/[\\/?*\[\]:]/g,''),rows])});
  if(picked.has('dilig')){const d=diligSum(),rows=[['รายการ','ค่า'],['ผู้ได้รับเบี้ย (คน)',d.paid],['ทั้งหมด (คน)',d.n],['ยอดรวม (บาท)',d.total],['รายสัปดาห์ (บาท)',d.weekly],['รายเดือน (บาท)',d.monthly]];d.wk.forEach((x,i)=>rows.push([`สัปดาห์ ${i+1} ผู้ได้เบี้ย (คน)`,x.n],[`สัปดาห์ ${i+1} ยอด (บาท)`,x.baht]));out.push(['เบี้ยขยัน',rows])}
  return out}
async function fallback(filename,data){const box=$('#xfall');if(!box)return;const ext=filename.split('.').pop();
  if(ext==='png'){const u=await blob64(data);box.innerHTML=`<p class="msg">เบราว์เซอร์นี้บันทึกไฟล์โดยตรงไม่ได้ กดค้างหรือคลิกขวาที่รูปเพื่อบันทึกภาพ</p><img src="${u}" alt="ภาพสรุปผล" style="width:100%;border:1px solid var(--line);border-radius:10px">`;say('สร้างรูปแล้ว ดูด้านล่าง')}else say('บันทึกไฟล์ไม่สำเร็จ')}
async function save(filename,data){try{await A.saveFile(filename,data);say('ดาวน์โหลดไฟล์แล้ว')}catch(e){await fallback(filename,data)}}
window.openExport=openExport;window.loadLib=loadLib;
window.doExport=async a=>{const keys=SECS.map(s=>s[0]).filter(k=>picked.has(k));
  if(a==='docopytsv')return;
  if(a==='docopy'){const t=$('#share-text');try{await navigator.clipboard.writeText(t.value);say('คัดลอกแล้ว นำไปวางใน LINE หรือแอปอื่นได้เลย')}catch(e){t.select();say('เลือกข้อความแล้ว กดคัดลอกจากเมนูของเครื่อง')}return}
  if(a==='dopeople'){document.querySelectorAll('.btns .btn').forEach(b=>b.disabled=true);try{await document.fonts.ready;await save(stamp()+'-People.zip',await peopleZip())}catch(e){say(e&&e.message==='lib'?'โหลดตัวช่วยส่งออกไม่สำเร็จ':'สร้างไฟล์ไม่สำเร็จ');console.error(e)}document.querySelectorAll('.btns .btn').forEach(b=>b.disabled=false);return}
  if(!keys.length){say('เลือกอย่างน้อย 1 ส่วนก่อน');return}
  document.querySelectorAll('.btns .btn').forEach(b=>b.disabled=true);say('กำลังสร้างไฟล์…');
  try{await document.fonts.ready;
    if(a==='doxlsx'){await loadLib('xlsx');const wb=XLSX.utils.book_new();sheetsData().forEach(([n,d])=>{const ws=XLSX.utils.aoa_to_sheet(d);ws['!cols']=d[0].map((_,i)=>({wch:i?16:30}));XLSX.utils.book_append_sheet(wb,ws,n)});await save(stamp()+'.xlsx',new Blob([XLSX.write(wb,{type:'array',bookType:'xlsx'})]))}
    if(a==='dopng'){await save(stamp()+'.png',await toPng(compose(keys),2.5))}
    if(a==='doinfo'){const c=infographic(keys);await save(stamp()+'-Infographic.png',await toPng(c,2480/c.W))}
    if(a==='dopptx'){await loadLib('pptx');const p=new PptxGenJS();p.layout='LAYOUT_WIDE';const t=p.addSlide();t.background={color:'0A2A5E'};t.addShape(p.ShapeType.roundRect,{x:5.17,y:.9,w:3,h:2.1,fill:{color:'FFFFFF'},line:{color:'FFFFFF'},rectRadius:.12});t.addImage({data:LOGO,x:5.37,y:1.05,w:2.6,h:1.8,sizing:{type:'contain',w:2.6,h:1.8}});
      t.addText('NIMEX Delivery Driver Performance',{x:0,y:3.4,w:13.33,h:.9,align:'center',color:'FFFFFF',fontFace:'Tahoma',fontSize:36,bold:true});t.addShape(p.ShapeType.rect,{x:4.67,y:4.4,w:4,h:.04,fill:{color:'D4AF37'},line:{color:'D4AF37'}});
      t.addText(`สรุปผลการจัดส่ง · ${A.periodLabel()}`,{x:0,y:4.6,w:13.33,h:.7,align:'center',color:'FFFFFF',fontFace:'Tahoma',fontSize:24});t.addText(scopeText(),{x:0,y:5.3,w:13.33,h:.6,align:'center',color:'E6D79C',fontFace:'Tahoma',fontSize:22});
      for(const k of keys){const u=await blob64(await toPng(slideSheet(k),1.5));p.addSlide().addImage({data:u,x:0,y:0,w:13.33,h:7.5})}
      const buf=await p.write({outputType:'arraybuffer'});await save(stamp()+'.pptx',new Blob([buf]))}
  }catch(e){say(e&&e.message==='lib'?'โหลดตัวช่วยส่งออกไม่สำเร็จ ลองเปิดหน้าใหม่อีกครั้ง':'สร้างไฟล์ไม่สำเร็จ ลองเลือกส่วนน้อยลง');console.error(e)}
  document.querySelectorAll('.btns .btn').forEach(b=>b.disabled=false)};
})();
