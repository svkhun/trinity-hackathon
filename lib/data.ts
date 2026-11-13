export type SourceId = "anon" | "creator" | "official";
export type Evidence = "Supported" | "Contradicted" | "Insufficient Evidence";
export type Scenario = {
  id: string;
  name: string;
  short: string;
  text: string;
  source: SourceId;
  reference?: { title: string; body: string; quote: string; status: Evidence };
};
export const scenarios: Scenario[] = [
  {
    id: "stock",
    name: "หุ้นกระแสแรง",
    short: "Stock hype",
    text: "หุ้น ABC เตรียมพุ่ง 300% วงในยืนยันแล้ว รีบซื้อก่อนตกรถ รับประกันกำไรแน่นอน!",
    source: "anon",
  },
  {
    id: "promise",
    name: "การันตีกำไร",
    short: "Guaranteed profit",
    text: "กองทุนสมมติ MINT รับประกันผลตอบแทน 15% ทุกเดือน ไม่มีความเสี่ยง! โอนวันนี้เท่านั้น ห้ามพลาด",
    source: "creator",
    reference: {
      title: "เงื่อนไขกองทุน MINT · เอกสารสมมติ",
      body: "กรณีศึกษาระบุว่ามูลค่าเงินลงทุนผันผวนและไม่มีการรับประกันผลตอบแทน",
      quote: "ไม่มีความเสี่ยง",
      status: "Contradicted",
    },
  },
  {
    id: "education",
    name: "ความรู้ลงทุน",
    short: "Investor education",
    text: "กรณีศึกษา DCA ลงทุนเดือนละ 1,000 บาท เป็นเวลา 12 เดือน เงินต้นรวม 12,000 บาท ผลตอบแทนอาจผันผวน ควรศึกษาความเสี่ยงก่อนตัดสินใจ",
    source: "official",
    reference: {
      title: "ตารางเงินสมทบ · เอกสารสมมติ",
      body: "เงินสมทบ 12 งวด × 1,000 บาท = 12,000 บาท ก่อนคิดผลตอบแทน",
      quote: "เงินต้นรวม 12,000 บาท",
      status: "Supported",
    },
  },
  {
    id: "crypto",
    name: "คริปโทไวรัล",
    short: "Crypto hype",
    text: "เหรียญ MOONX กำลังจะไปดวงจันทร์ 🚀 คนทั้งกลุ่มกำลังซื้อ! ของมันต้องมี รีบขึ้นรถก่อนลิสต์คืนนี้ #100x",
    source: "anon",
  },
];
export const profiles = {
  anon: {
    name: "Viral Market Feed",
    label: "โพสต์ไวรัลนิรนาม",
    handle: "@viral_market",
    desc: "ตัวอย่างโพสต์ที่ส่งต่อในกลุ่มสาธารณะ โดยไม่เปิดเผยผู้เขียนต้นทาง",
    identity: "ไม่เปิดเผยตัวตน",
    provenance: "สำเนาโพสต์ที่ส่งต่อ ไม่พบต้นฉบับ",
    citations: 1,
    total: 12,
    consistent: 3,
    bars: [3, 6, 2, 8, 12, 7],
    timeline: [
      "พบข้อความที่ส่งต่อ",
      "ตรวจข้อมูลผู้เขียนแล้ว ไม่พบชื่อ",
      "พบลิงก์ประกอบ 1 จาก 12 โพสต์",
    ],
  },
  creator: {
    name: "Baht Notes Studio",
    label: "ครีเอเตอร์การลงทุน",
    handle: "@bahtnotes_demo",
    desc: "ตัวอย่างครีเอเตอร์ที่สรุปประเด็นการลงทุนและเขียนความเห็นส่วนบุคคล",
    identity: "ระบุผู้จัดทำ",
    provenance: "บัญชีต้นทางมีชื่อผู้เขียนและประวัติการแก้ไขบางโพสต์",
    citations: 7,
    total: 12,
    consistent: 8,
    bars: [4, 3, 6, 4, 5, 7],
    timeline: [
      "เผยแพร่บทสรุปโดยผู้เขียน",
      "เพิ่มลิงก์เอกสารประกอบ",
      "อัปเดตคำอธิบายความเสี่ยง",
    ],
  },
  official: {
    name: "Market Learning Desk",
    label: "สถาบันข้อมูลการเงิน",
    handle: "@learningdesk_demo",
    desc: "ตัวอย่างหน่วยงานเผยแพร่เอกสารความรู้ทางการเงินพร้อมบันทึกเวอร์ชัน",
    identity: "ยืนยันผู้เผยแพร่ในชุดข้อมูล",
    provenance: "เอกสารต้นทางระบุผู้เผยแพร่ วันที่ และประวัติการปรับปรุง",
    citations: 12,
    total: 12,
    consistent: 11,
    bars: [3, 4, 3, 4, 4, 5],
    timeline: ["ออกเอกสารฉบับแรก", "แนบตารางข้อมูลสมมติ", "เผยแพร่บันทึกปรับปรุง"],
  },
} satisfies Record<
  SourceId,
  {
    name: string;
    label: string;
    handle: string;
    desc: string;
    identity: string;
    provenance: string;
    citations: number;
    total: number;
    consistent: number;
    bars: number[];
    timeline: string[];
  }
>;
