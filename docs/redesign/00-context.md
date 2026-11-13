# สิ่งที่เว็บนี้ทำ

อ้างอิงซอร์สเดิมที่ commit `670a372` ใช้ `git show 670a372:<path>` เมื่อต้องการตรวจเลขบรรทัดย้อนหลัง

| ความมั่นใจ | ข้อค้นพบ | หลักฐาน |
|---|---|---|
| [CONFIRMED] | HypeCheck AI เป็นเดโมภาษาไทยสำหรับอ่านคำชวนลงทุน ตรวจหลักฐาน และทดลองความเสี่ยง ผู้ใช้เริ่มจากวางโพสต์หรือเลือกกรณีตัวอย่างแล้วส่งตรวจ | README.md:3, README.md:27, components/fact-check.tsx:28 |
| [INFERRED] | ผู้อ่านหลักน่าจะเป็นผู้ลงทุนไทยที่เจอโพสต์บนโซเชียล รวมถึงผู้เพิ่งเริ่มลงทุน เพราะมีคำว่า “ก่อนตกรถ” และแบบฝึก DCA ที่อธิบายเงินต้นทีละงวด | lib/data.ts:11, README.md:39 |
| [UNSURE] | ยังระบุอายุของผู้ใช้จริงหรือระยะเวลาที่คนเข้าใจหน้าแรกไม่ได้ ไม่มีผลวิจัยผู้ใช้ในชุดไฟล์ baseline | git ls-tree -r --name-only 670a372 |
| [CONFIRMED] | จุดเฉพาะคือคำที่ถูกจับคู่ย้อนกลับไปยังข้อความได้ กรณี MINT มีเอกสารสมมติที่ขัดกับคำรับรอง ส่วน DCA มีหลักฐานเฉพาะยอดเงินต้น โพสต์ที่ผู้ใช้พิมพ์เองจะไม่ได้โปรไฟล์ผู้เผยแพร่สมมติโดยอัตโนมัติ | lib/analysis.ts:48, lib/data.ts:11, tests/domain.test.ts:19 |
| [CONFIRMED] | RiskLab เปรียบเทียบสามวิธีลงทุนบนเส้นทางตลาดเดียวกัน ใช้ seed 42 และ 240 เส้นทาง | README.md:45, lib/simulation.ts:29 |
| [CONFIRMED] | Next App Router, React, TypeScript strict, Tailwind, Recharts, Motion, Zod, Lucide และ Button ภายในโปรเจกต์ ใช้ npm ci และ npm run dev สำหรับพัฒนา npm run build แล้ว npm start สำหรับ production | package.json:5, tsconfig.json:8, components/ui/button.tsx:16, README.md:7 |
| [CONFIRMED] | หน้าเดียวมีห้า hash routes ใช้ draft และ report ร่วมกัน เดิมมี dark tokens, panel, disclosure, radial gauge และ mobile bottom nav | app/page.tsx:46, app/globals.css:1, components/shared.tsx:67 |
| [CONFIRMED] | ก่อนเริ่มไม่มี .git หรือประวัติ commit จึงสร้าง repository บน redesign/ux-ui และเก็บ root snapshot ไม่พบไฟล์ตั้งค่า analytics หรือ backend ในต้นไม้ของ snapshot | git log --reverse, git ls-tree -r --name-only 670a372 |

**ขอบเขตงาน** เปลี่ยนวิธีอ่านข้อความและเรียงหลักฐาน เก็บ service, fixtures, สูตรจำลอง, hash URLs, metadata และพฤติกรรมการใช้ข้อมูลใน browser memory ตามเดิม
