# Audit ของหน้าที่รันจริง

ใช้ production build ของ `670a372` บน localhost คะแนน UX เป็นความเห็นเชิงออกแบบจากหน้าจอและโค้ด ไม่มีการทดสอบจับเวลาผู้ใช้ ลิงก์หลักฐานด้านล่างใช้ชื่อย่อ D, M, T, L และ LH

[D · desktop](evidence/before/overview-1440.png) · [M · mobile](evidence/before/overview-390.png) · [T · tablet](evidence/before/overview-768.png) · [L · ขนาด DOM และ controls](evidence/before/layout.json) · [LH · Lighthouse mobile](evidence/before/lighthouse.json)

| มิติ | /10 | สิ่งที่ตรวจพบ |
|---|---:|---|
| Information architecture | 6 | ชื่อ workspace กับภาพภูเขาคั่นระหว่างชื่อเว็บกับช่องตรวจโพสต์ ปุ่มส่งอยู่ที่ y=704 บน desktop และ 684 บน mobile (D, M, L) |
| ความชัดเจนเมื่อแรกเห็น | 6 | หัวเรื่อง “Think Before You Invest.” บอกเจตนา แต่ข้อความไทยบรรทัดเล็กใต้หัวเรื่องจึงจะอธิบายว่าตรวจอะไร (D) |
| การนำทาง | 7 | เข้าทุกเครื่องมือได้จาก sidebar แต่ปุ่ม RiskLab อยู่เหนือ action หลัก ส่วน tablet เหลือไอคอนที่ซ่อนชื่อในช่วง 761–950px (D, T, app/globals.css ช่วง media query หลังบรรทัด 1250) |
| ลำดับสายตา ระยะ ตัวอักษร สี | 5 | ภาพ mesh และตัวเลข 78 มีน้ำหนักสูง ขณะที่ quote และสถานะเป็นตัวเล็ก ใช้รูปแบบ icon tile + eyebrow ซ้ำในหัว panel (D, components/shared.tsx:138) |
| Responsive และ touch | 6 | ความกว้างเอกสารพอดีทั้งสามขนาด แต่ mobile มี 9 เป้าหมายต่ำกว่า 44px รวมปุ่มช่วยเหลือ 18×18 และตัวอย่างสูง 25px (L) |
| Accessibility | 8 | มี skip link, native dialog, focus-visible และ reduced motion; Lighthouse Accessibility 100 ที่หน้าแรก ขนาดเป้าหมายยังไม่ถึงเกณฑ์ 44px ของโจทย์ (app/page.tsx:130, app/globals.css:1589, L, LH) |
| Performance feel | 7 | Lighthouse mobile รอบเดียวได้ Performance 86, LCP 1.21s, TBT 536ms, CLS 0.00015 หน้าแรกมี 695 elements และ 448 SVG descendants (L, LH) |
| Microcopy | 6 | ข้อจำกัดหลักฐานอธิบายชัดใน report แต่ “Text analysis”, “Workspace overview”, “Explore workspace” ไม่บอกว่าจะได้คำตอบอะไรจากการกด (D, components/fact-check.tsx:48, components/shared.tsx:279) |

## สิบจุดที่ให้ภาพเหมือนแม่แบบ เรียงตามผลต่อการใช้

1. ภูเขาที่ติดฉลาก SIG.01–03 สื่อภาพการวัด แต่พิกัดคำนวณจากรูปทรง ไม่มีข้อมูลจากโพสต์ (D, components/terrain.tsx:30)
2. หัวเรื่องหน้ากว้างใช้ได้กับบริการการลงทุนหลายประเภท ให้พื้นที่น้อยแก่ถ้อยคำที่กำลังตรวจ (D, app/page.tsx:236)
3. โทรศัพท์จำลองสามใบซ้ำ navigation และแท่งกราฟในเครื่องขวากำหนดค่าคงที่ (D, components/shared.tsx:279)
4. สีม่วงเรืองและพื้นไล่สีรับบททั้ง navigation, hero และปุ่ม ทำให้แยกสิ่งที่กำลังเลือกจากภาพประกอบได้ยาก (D, app/globals.css:369)
5. หัว panel ใช้ไอคอนกรอบสี่เหลี่ยมพร้อมป้ายภาษาอังกฤษซ้ำ แม้หัวไทยจะอธิบายครบ (components/shared.tsx:138, D)
6. คำว่า workspace ปรากฏทั้ง sidebar, breadcrumb, heading และทางเข้าด้านล่าง โดยไม่ได้ให้ข้อมูลเพิ่ม (D)
7. ป้าย Local demo กับ Demo mode สื่อสารเรื่องเดียวกัน แต่ไม่มีชื่อกรณีที่เป็นที่มาของคะแนนใน panel (D, components/shared.tsx:183)
8. สเกลตัวเลขเด่นกว่าประโยคที่เป็นเหตุของคะแนน ผู้ใช้ต้องเปิดอีกหน้าจึงเห็นคำที่ระบบจับคู่ (D, components/fact-check.tsx:134)
9. Inter และ Noto Sans Thai ทำหน้าที่คล้ายกันทั้งบทอ่านและ controls โพสต์ขาดลักษณะของข้อความอ้างอิง (app/layout.tsx:2, D)
10. ทุก route มี animation เลื่อนขึ้นและ fade แม้เพียงเปลี่ยนเครื่องมือ ส่วน import ใน page เช่น Command ไม่ถูกใช้ (app/page.tsx:3, app/page.tsx:202)

ตรวจหมวดอื่นแล้วไม่พบ testimonial, client logo, review, ภาพ stock หรือคำโฆษณากลุ่ม “Unlock / Seamless” ในซอร์สหน้าและชุดข้อมูลของ baseline; hero เดิมจัดซ้ายและใช้ภาพ procedural จึงไม่ได้หักคะแนนเรื่อง centered stock hero (D, lib/data.ts:11, app/page.tsx:228)

**Slop score 72/100** เกณฑ์บรรณาธิการ 5 ด้าน ด้านละ 20 คะแนน ยิ่งสูงยิ่งพึ่งแม่แบบ ได้แก่ ภาพที่ไม่อ้างข้อมูล 18, โครงซ้ำ 16, หัวเรื่องสลับแบรนด์ได้ 14, ป้ายตกแต่ง 14, motion/สไตล์สำเร็จรูป 10 อ้างรายการ 1–10 ข้างต้น ใช้เกณฑ์เดิมตรวจหลังแก้
