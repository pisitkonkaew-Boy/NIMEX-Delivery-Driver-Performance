/* Loads data from the Google Sheet API, then starts the dashboard. Viewers get totals only; admins (link ending #admin + key) also get names and per-driver rows. */
(function(){
const $=s=>document.querySelector(s);
const getKey=()=>{try{return sessionStorage.getItem('nimex-key')}catch(e){return null}};
const bootMsg=h=>{const b=$('#boot');b.innerHTML=h;b.hidden=false};
function closeCover(){const c=$('#cover');if(c)c.remove()}
(function(){const k=getKey();if(location.hash==='#admin'||k)return;const c=$('#cover');if(!c)return;c.hidden=false;c.querySelector('button').onclick=closeCover;c.querySelector('.fg').onclick=closeCover;c.querySelector('button').focus()})();
function askKey(err){bootMsg(`<h1>ผู้ดูแลระบบ</h1>${err?`<p class="badt">${err}</p>`:''}<label for="adm-key">รหัสผู้ดูแล</label><input id="adm-key" type="password" autocomplete="current-password"><button class="btn" id="adm-go">เข้าสู่ระบบ</button>`);
  $('#adm-go').onclick=async()=>{const v=$('#adm-key').value;try{sessionStorage.setItem('nimex-key',v)}catch(e){}try{await NXS.api({a:'auth'});location.reload()}catch(e){try{sessionStorage.removeItem('nimex-key')}catch(x){}askKey('รหัสไม่ถูกต้อง')}}}
function loadScripts(list,done){let i=0;(function next(){if(i>=list.length)return done();const s=document.createElement('script');s.src=list[i++]+'?v='+(window.FLEET_V||1);s.onload=next;document.body.appendChild(s)})()}
async function start(){
  const wantAdmin=location.hash==='#admin';let key=getKey();
  if(!window.FLEET_API){bootMsg('<h1>ยังไม่ได้ตั้งค่า</h1><p>ยังไม่ได้ใส่ที่อยู่ระบบข้อมูลใน config.js</p>');return}
  if(wantAdmin&&!key){askKey();return}
  let pub;try{bootMsg('<p>กำลังโหลดข้อมูล…</p>');pub=await NXS.loadPublic()}catch(e){bootMsg('<h1>โหลดข้อมูลไม่สำเร็จ</h1><p>ลองเปิดหน้านี้ใหม่อีกครั้ง</p>');return}
  let adm=null;
  if(key){try{adm=await NXS.loadAdmin();window.ADMIN=true}catch(e){try{sessionStorage.removeItem('nimex-key')}catch(x){}if(wantAdmin){askKey('รหัสไม่ถูกต้อง');return}}}
  window.DATA=NXS.build(pub,adm);
  window.__CFG_PUB=pub['pub:cfg']||null;window.__CFG_ADM=adm?adm['adm:settings']||null:null;window.__ROSTER=adm&&adm['adm:roster']?adm['adm:roster'].list:[];
  $('#boot').hidden=true;$('#app').hidden=false;
  loadScripts(['assets/app.js','assets/export.js'],()=>{});
}
start();
})();
