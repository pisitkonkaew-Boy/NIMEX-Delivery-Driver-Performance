/* Compact diligence workbook (เบี้ยขยัน) for HR. Three sheets: conditions, summary, one row per person per day.
   Every amount is a live formula on the day matrix, so changing a condition recalculates the file. Results are also stored so previewers show numbers. */
(function(root){
'use strict';
const FONT='Prompt';
const NAVY='FF0A2A5E',GOLD='FFD4AF37',LIGHT='FFF2F5FB',GRN='FFD9EBDD',RED='FFF6D5DA',HOL='FFF7EBC2',OFF='FFEEEEEE';
const col=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
const WD=['อา','จ','อ','พ','พฤ','ศ','ส'];
const q=n=>"'"+n+"'!";
function build(ExcelJS,P){
  /* P:{y,m,n,monthLabel,cfg:{minDays,rateWeek,rateMonth,monthMiss,monthMode,hCounts},people:[{code,name,branch,start,kind:'10H-...',res:{wk:[],weekly,monthly,total,need,have}}]} */
  const wb=new ExcelJS.Workbook();wb.creator='NIMEX Delivery Driver Performance';wb.created=new Date();
  const cf=P.cfg,N=P.n,CD='เงื่อนไข',SM='สรุปเบี้ยขยัน',DY='รายวัน';
  const thin={style:'thin',color:{argb:'FFDBE3F0'}};const box={top:thin,left:thin,bottom:thin,right:thin};
  const hdr=(c)=>{c.font={name:FONT,size:10,bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:NAVY}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border=box};
  /* --- conditions --- */
  const wc=wb.addWorksheet(CD,{views:[{showGridLines:false}]});
  wc.columns=[{width:36},{width:16},{width:70}];
  wc.getCell('A1').value='เงื่อนไขเบี้ยขยัน — แก้ค่าในช่องสีเหลืองได้ ทุกชีตคำนวณใหม่';wc.getCell('A1').font={name:FONT,size:14,bold:true,color:{argb:NAVY}};
  wc.getCell('A2').value='ช่วงที่คำนวณ';wc.getCell('B2').value=P.monthLabel;
  const rows=[['เบี้ยขยันสัปดาห์ (บาท)',cf.rateWeek,'จ่ายเมื่อขึ้นขับครบตามขั้นต่ำ'],['ขึ้นขับขั้นต่ำต่อสัปดาห์ (วัน จาก 7)',cf.minDays,'สัปดาห์ = วันที่ 1–7, 8–14, 15–21, 22–28 จ่ายไม่เกิน 4 สัปดาห์ต่อเดือน'],['เบี้ยขยันรายเดือน (บาท)',cf.rateMonth,'วันที่ 29 เป็นต้นไปไม่คิดสัปดาห์ แต่นับในเบี้ยรายเดือน'],['ขาดได้ไม่เกิน (วัน) สำหรับเบี้ยรายเดือน',cf.monthMiss,'0 = ต้องขึ้นขับครบทุกวันที่ต้องมา'],['วิธีจ่ายเบี้ยรายเดือน (month / week)',cf.monthMode,'month = ครั้งเดียวต่อเดือน, week = คูณจำนวนสัปดาห์ที่ได้'],['นับวันหยุดนักขัตฤกษ์/วันยกเว้นเป็นวันมา (yes / no)',cf.hCounts,'ใช้กับเบี้ยรายสัปดาห์ (เบี้ยรายเดือนไม่นับวันเหล่านี้เป็นวันที่ต้องมา)']];
  /* B4..B9 are referenced by the summary: B3 reserved for spacing */
  wc.getCell('A3').value='';
  const ref={rw:'B4',min:'B5',rm:'B6',miss:'B7',mode:'B8',h:'B9'};
  const labels=[['A4',rows[0]],['A5',rows[1]],['A6',rows[2]],['A7',rows[3]],['A8',rows[4]],['A9',rows[5]]];
  labels.forEach(([a,r],i)=>{const rr=4+i;wc.getCell('A'+rr).value=r[0];wc.getCell('B'+rr).value=r[1];wc.getCell('C'+rr).value=r[2];
    wc.getCell('A'+rr).font={name:FONT,size:10};wc.getCell('C'+rr).font={name:FONT,size:10,color:{argb:'FF55657F'}};
    const b=wc.getCell('B'+rr);b.font={name:FONT,size:11,bold:true};b.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF4C2'}};b.border=box;b.alignment={horizontal:'center'}});
  wc.getCell('B8').dataValidation={type:'list',allowBlank:false,formulae:['"month,week"']};wc.getCell('B9').dataValidation={type:'list',allowBlank:false,formulae:['"yes,no"']};
  wc.getCell('A2').font={name:FONT,size:10,bold:true};wc.getCell('B2').font={name:FONT,size:10};
  wc.getCell('A11').value='สัญลักษณ์ในชีต "'+DY+'"';wc.getCell('A11').font={name:FONT,size:10,bold:true};
  [['1','ขึ้นขับในวันที่ต้องมา',GRN],['0','ไม่ขึ้นขับในวันที่ต้องมา',RED],['H','วันหยุดนักขัตฤกษ์ / วันยกเว้นรายคน',HOL],['-','ไม่ต้องมา (ก่อนเริ่มงาน, หลังวันสุดท้าย หรือวันหยุดประจำสัปดาห์)',OFF]].forEach((r,i)=>{const a=wc.getCell('A'+(12+i)),b=wc.getCell('B'+(12+i));a.value=r[0];a.alignment={horizontal:'center'};a.fill={type:'pattern',pattern:'solid',fgColor:{argb:r[2]}};a.font={name:FONT,size:10,bold:true};b.value=r[1];b.font={name:FONT,size:10}});
  const ws=wb.addWorksheet(SM,{views:[{state:'frozen',xSplit:3,ySplit:5,showGridLines:false}]});
  /* --- daily matrix --- */
  const wd=wb.addWorksheet(DY,{views:[{state:'frozen',xSplit:2,ySplit:4,showGridLines:false}]});
  wd.getColumn(1).width=11;wd.getColumn(2).width=28;for(let d=1;d<=N;d++)wd.getColumn(2+d).width=4.2;
  wd.getCell('A1').value='เที่ยววิ่งรายวัน — '+P.monthLabel;wd.getCell('A1').font={name:FONT,size:13,bold:true,color:{argb:NAVY}};
  wd.getCell('A2').value='1 = ขึ้นขับ · 0 = ไม่ขึ้นขับ · H = วันหยุด/ยกเว้น · - = ไม่ต้องมา';wd.getCell('A2').font={name:FONT,size:9,color:{argb:'FF55657F'}};
  ['รหัส','ชื่อ'].forEach((t,i)=>{const c=wd.getCell(4,1+i);c.value=t;hdr(c);wd.getCell(3,1+i).value=''});
  for(let d=1;d<=N;d++){const dow=new Date(Date.UTC(P.y,P.m-1,d)).getUTCDay();const a=wd.getCell(3,2+d),b=wd.getCell(4,2+d);a.value=WD[dow];hdr(a);a.font={name:FONT,size:8,bold:true,color:{argb:'FFFFFFFF'}};b.value=d;hdr(b);if(d===1||d===8||d===15||d===22||d===29){}}
  const styles={'1':GRN,'0':RED,H:HOL,'-':OFF};
  P.people.forEach((p,i)=>{const r=5+i;const a=wd.getCell(r,1),b=wd.getCell(r,2);a.value=p.code;b.value=p.name;a.font=b.font={name:FONT,size:10};a.border=b.border=box;
    for(let d=1;d<=N;d++){const ch=p.kind[d-1],c=wd.getCell(r,2+d);c.value=ch==='1'?1:ch==='0'?0:ch;c.alignment={horizontal:'center'};c.font={name:FONT,size:9,bold:ch!=='-'};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:styles[ch]}};c.border=box}});
  /* --- summary --- */
  wb.views=[{activeTab:1}];
  const W=[6,11,28,22,12,11,11,11,11,13,13,14,34,12];W.forEach((w,i)=>ws.getColumn(i+1).width=w);
  ws.getCell('A1').value='สรุปเบี้ยขยันที่ได้รับ — '+P.monthLabel;ws.getCell('A1').font={name:FONT,size:14,bold:true,color:{argb:NAVY}};
  ws.getCell('A2').value='นับจากเที่ยววิ่งจริง · เบี้ยรายสัปดาห์สูงสุด 4 สัปดาห์ (วันที่ 1–7, 8–14, 15–21, 22–28) · วันที่ 29 เป็นต้นไปมีผลต่อเบี้ยรายเดือนเท่านั้น · แก้เงื่อนไขที่ชีต "'+CD+'" · คลิกรหัสเพื่อไปดูแถวรายวัน';ws.getCell('A2').font={name:FONT,size:9,color:{argb:'FF55657F'}};
  const wr=[[1,7],[8,14],[15,21],[22,28]].map(([a,b])=>[a,b]);
  const wl=wr.map(([a,b])=>String(a).padStart(2,'0')+'/'+String(P.m).padStart(2,'0')+' – '+String(b).padStart(2,'0')+'/'+String(P.m).padStart(2,'0'));
  wl.forEach((t,i)=>{const c=ws.getCell(4,6+i);c.value=t;c.font={name:FONT,size:9,color:{argb:'FF55657F'}};c.alignment={horizontal:'center'}});
  ['ลำดับ','รหัสพนักงาน','ชื่อ','สาขา / DC','วันเริ่มงาน','สัปดาห์ 1','สัปดาห์ 2','สัปดาห์ 3','สัปดาห์ 4','รวมรายสัปดาห์','เบี้ยรายเดือน','รวมเบี้ยขยัน (บาท)','รายละเอียด','ขาด (วัน)'].forEach((t,i)=>{const c=ws.getCell(5,1+i);c.value=t;hdr(c)});
  ws.getRow(5).height=30;
  const R=(a)=>q(CD)+'$'+ref[a][0]+'$'+ref[a].slice(1);
  const first=6,last=5+P.people.length;
  P.people.forEach((p,i)=>{const r=first+i,dr=5+i;const rng=(a,b)=>q(DY)+col(2+a)+dr+':'+col(2+Math.min(b,N))+dr,full=rng(1,N);
    const set=(c,v,fmt)=>{const x=ws.getCell(r,c);x.value=v;x.font={name:FONT,size:10};x.border=box;if(fmt)x.numFmt=fmt;return x};
    set(1,i+1).alignment={horizontal:'center'};
    const lk=set(2,{text:p.code,hyperlink:"#'"+DY+"'!A"+dr});lk.font={name:FONT,size:10,color:{argb:'FF1D57B8'},underline:true};
    set(3,p.name);set(4,p.branch);if(p.start)set(5,new Date(p.start+'T00:00:00Z'),'dd/mm/yyyy');else set(5,'');
    wr.forEach(([a,b],k)=>{const f=`IF(COUNTIF(${rng(a,b)},1)+IF(${R('h')}="yes",COUNTIF(${rng(a,b)},"H"),0)>=${R('min')},${R('rw')},0)`;const x=set(6+k,{formula:f,result:p.res.wk[k]},'#,##0;-#,##0;"–"');x.alignment={horizontal:'right'}});
    set(10,{formula:`SUM(F${r}:I${r})`,result:p.res.weekly},'#,##0');
    const need=`(COUNTIF(${full},1)+COUNTIF(${full},0))`;
    set(11,{formula:`IF(AND(${need}>0,${need}-COUNTIF(${full},1)<=${R('miss')}),${R('rm')}*IF(${R('mode')}="month",1,COUNTIF(F${r}:I${r},">0")),0)`,result:p.res.monthly},'#,##0;-#,##0;"–"');
    const t=set(12,{formula:`J${r}+K${r}`,result:p.res.total},'#,##0');t.font={name:FONT,size:10,bold:true};
    set(13,{formula:`"ขึ้นขับ "&COUNTIF(${full},1)&"/"&${need}&" วัน | ขาด "&(${need}-COUNTIF(${full},1))&" วัน"`,result:`ขึ้นขับ ${p.res.have}/${p.res.need} วัน | ขาด ${p.res.need-p.res.have} วัน`});
    set(14,{formula:`${need}-COUNTIF(${full},1)`,result:p.res.need-p.res.have},'0').alignment={horizontal:'center'}});
  const tr=last+1;
  const sumRow=(c,res)=>{const x=ws.getCell(tr,c);x.value={formula:`SUM(${col(c)}${first}:${col(c)}${last})`,result:res};x.font={name:FONT,size:10,bold:true};x.fill={type:'pattern',pattern:'solid',fgColor:{argb:LIGHT}};x.numFmt='#,##0';x.border=box};
  ws.getCell(tr,3).value='รวม '+P.people.length+' คน';ws.getCell(tr,3).font={name:FONT,size:10,bold:true};
  for(let k=0;k<4;k++)sumRow(6+k,P.people.reduce((s,p)=>s+p.res.wk[k],0));
  sumRow(10,P.people.reduce((s,p)=>s+p.res.weekly,0));sumRow(11,P.people.reduce((s,p)=>s+p.res.monthly,0));sumRow(12,P.people.reduce((s,p)=>s+p.res.total,0));
  ws.getCell(tr+1,3).value='ผู้ได้รับเบี้ยขยัน (คน)';ws.getCell(tr+1,3).font={name:FONT,size:10};
  const pc=ws.getCell(tr+1,12);pc.value={formula:`COUNTIF(L${first}:L${last},">0")`,result:P.people.filter(p=>p.res.total>0).length};pc.font={name:FONT,size:10,bold:true};
  ws.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0};
  return wb}
const api={build};
if(typeof module!=='undefined')module.exports=api;else root.NXXL=api;
})(typeof window!=='undefined'?window:globalThis);
