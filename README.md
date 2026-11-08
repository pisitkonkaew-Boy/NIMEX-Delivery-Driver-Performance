# NIMEX Delivery Driver Performance (GitHub Pages)

เว็บ static + ฐานข้อมูลเป็น Google Sheet ผ่าน Apps Script. **ไม่มีข้อมูลจริงใน repo นี้**

## ติดตั้ง
1. สร้าง Google Sheet ใหม่ → Extensions > Apps Script → วางเนื้อหา `Code.gs.txt` (บันทึกเป็น Code.gs)
2. Project Settings > Script Properties → เพิ่ม `ADMIN_KEY` = รหัสผู้ดูแล (ตั้งเอง ยาวๆ)
3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone → คัดลอก URL `/exec`
4. แก้ `config.js` ใส่ `window.FLEET_API="URL ที่ได้"`
5. แก้ `og:image` ใน `index.html` (คำว่า YOUR-USERNAME/YOUR-REPO) ให้เป็นที่อยู่จริงของ cover.jpg
6. อัปโหลดทุกไฟล์ (รวมโฟลเดอร์ assets) ขึ้น GitHub → Settings > Pages > Deploy from branch
7. เปิด `https://<user>.github.io/<repo>/#admin` ใส่ ADMIN_KEY → ตั้งค่า > เติมไฟล์รายเดือน

## ใช้งานรายเดือน
ตั้งค่า > เติมไฟล์: ลากรายงาน NIMEX026001 + NIMEX06006 ของเดือนนั้น (อ่านในเบราว์เซอร์) → ตรวจผล → บันทึก
ถ้าเปลี่ยนข้อมูลแล้วผู้ชมยังเห็นของเก่า ให้เพิ่มเลข `FLEET_V` ใน config.js

## สิทธิ์การเห็น
- ผู้ชมทั่วไป: ผู้ดูแลกำหนดได้ที่ ตั้งค่า > เงื่อนไขและเกณฑ์ (ค่าเริ่มต้น หน้าหลัก + รายละเอียด DC) ถ้าเปิด รถบริษัท/เบี้ยขยัน ข้อมูลรายคนจะเปิดสาธารณะ
- ผู้ดูแล (`#admin` + key): รถบริษัท, เบี้ยขยัน, ตั้งค่า, ส่งออก
- repo/Pages เป็นสาธารณะ — ตัวเลขภาพรวมระดับบริษัท/DC ใครมี URL ก็เห็น

## เบี้ยขยัน
เงื่อนไขทั้งหมดแก้ได้ที่ ตั้งค่า > เงื่อนไขและเกณฑ์ (วันที่ต้องมา, สัปดาห์, เดือน) และ "วันยกเว้น" รายคนในรายชื่อพนักงาน
