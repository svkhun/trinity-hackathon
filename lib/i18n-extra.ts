import type { Locale } from "./i18n";

/**
 * English renderings for the Thai strings that the rule engine and fixtures
 * produce. The analysis service itself is untouched; this is display-only.
 */
export const enText: Record<string, string> = {
  // finding titles
  "กระตุ้นความกลัวพลาดโอกาส": "Triggers fear of missing out",
  "เร่งให้ตัดสินใจ": "Pushes for a rushed decision",
  "ข้อกล่าวอ้างที่ต้องตรวจสอบ": "Claim that needs verification",
  "ใช้ภาษาโน้มน้าวอารมณ์": "Emotionally persuasive wording",
  "ตรวจเทียบกับเอกสารตัวอย่าง": "Checked against the sample document",
  "ข้อความที่ส่งมาตรวจสอบ": "Submitted text",
  // finding explanations / metric descriptions
  "ถ้อยคำนี้ชวนให้ตัดสินใจตามกระแสโดยกลัวเสียโอกาส":
    "This wording nudges readers to follow the crowd out of fear of missing out.",
  "มีกรอบเวลาหรือคำเร่งรัด ควรขอเวลาตรวจสอบข้อมูลก่อนตัดสินใจ":
    "A deadline or urgent call to act. Take time to verify the facts before deciding.",
  "ควรตรวจเอกสารต้นทาง เงื่อนไข และที่มาของตัวเลขก่อนเชื่อข้อกล่าวอ้าง":
    "Check the source document, its conditions, and where the numbers come from before trusting this claim.",
  "คำยืนยันหนักแน่นหรือเครื่องหมายเน้นอารมณ์อาจทำให้ข้อความดูมั่นใจกว่าหลักฐาน":
    "Emphatic certainty or emotional markers can make the text sound more confident than its evidence.",
  "ไม่พบถ้อยคำตามกฎที่กำหนด และไม่มีเอกสารประกอบสำหรับยืนยันข้อความนี้":
    "No phrases matched the rules, and no document is available to confirm this text.",
  "สัดส่วนความยาวช่วงข้อความที่สั้นที่สุดต่อช่วงที่ยาวที่สุด":
    "Ratio of the shortest sentence segment to the longest one.",
  "มีช่วงข้อความน้อยเกินไป จึงยังเปรียบเทียบความสม่ำเสมอไม่ได้":
    "Too few segments to compare sentence consistency.",
  // sample reference documents
  "เงื่อนไขกองทุน MINT · เอกสารสมมติ": "MINT fund terms · illustrative document",
  "กรณีศึกษาระบุว่ามูลค่าเงินลงทุนผันผวนและไม่มีการรับประกันผลตอบแทน":
    "The case study states that investment value fluctuates and returns are not guaranteed.",
  "ตารางเงินสมทบ · เอกสารสมมติ": "Contribution schedule · illustrative document",
  "เงินสมทบ 12 งวด × 1,000 บาท = 12,000 บาท ก่อนคิดผลตอบแทน":
    "12 contributions × 1,000 baht = 12,000 baht before any returns.",
};

export function tx(locale: Locale, text: string): string {
  return locale === "en" ? (enText[text] ?? text) : text;
}

export const ui = {
  th: {
    pageHead: { sub: "ข้อมูลเชิงลึกเพื่อการลงทุน" },
    factCheck: {
      resultHeading: "ผลการตรวจสอบ",
      inputHint: "แก้ข้อความหรือเลือกตัวอย่าง แล้วกดตรวจ ผลจะอัปเดตทางขวา",
      passageLabel: "ข้อความต้นฉบับ",
      passageHint: "ส่วนที่ไฮไลต์คือถ้อยคำที่ตรงกับเกณฑ์",
      findingsCount: (n: number) => `${n} ประเด็น`,
      busy: "กำลังวิเคราะห์ข้อความ…",
    },
    analysis: {
      overall: "ภาพรวมของโพสต์",
      rhythmTitle: "ความยาวของแต่ละช่วงประโยค",
      rhythmNote:
        "แท่งที่ยาวสั้นต่างกันมากแปลว่าจังหวะประโยคไม่สม่ำเสมอ ส่วนแท่งที่เท่ากันหมดอาจเป็นข้อความที่ผ่านการเกลา",
      rhythmUnit: "ตัวอักษร",
      rhythmSingle: "ข้อความนี้มีเพียงช่วงเดียว จึงยังเปรียบเทียบจังหวะประโยคไม่ได้",
      sentence: (n: number) => `ประโยค ${n}`,
    },
    sources: {
      tabsLabel: "เลือกรูปแบบผู้เผยแพร่",
      factsHeading: "ข้อมูลโปรไฟล์",
      auditTitle: "การอ้างอิงรายโพสต์",
      auditSub: "12 โพสต์ตัวอย่างของผู้เผยแพร่รายนี้",
      citedLegend: "แนบแหล่งอ้างอิง",
      uncitedLegend: "ไม่แนบ",
      activityTitle: "กิจกรรมเผยแพร่",
      activityNote: "สัปดาห์ที่โพสต์พุ่งสูงผิดปกติจะเน้นด้วยสีแดง เส้นประคือค่าเฉลี่ย",
      avg: (n: number) => `ค่าเฉลี่ย ${n} โพสต์/สัปดาห์`,
      posts: "โพสต์",
      weekShort: "สัปดาห์ที่ ",
    },
    risklab: {
      title: "สมมติฐานของคุณ",
      hint: "ปรับค่าแล้วกราฟจะคำนวณใหม่ทันที",
      amountUnit: "บาท",
      distTitle: "การกระจายของมูลค่าปลายงวด",
      distSub: "จำนวนเส้นทางจำลองในแต่ละช่วงมูลค่า",
      belowLegend: "ต่ำกว่าเงินต้น",
      aboveLegend: "เท่ากับหรือสูงกว่าเงินต้น",
      chartAria: (median: string, contrib: string) =>
        `กราฟจำลองมูลค่าพอร์ต ค่ามัธยฐานปลายงวด ${median} เทียบกับเงินต้นสะสม ${contrib}`,
      month: (m: number) => `เดือนที่ ${m}`,
      yearTick: (y: number) => `${y} ปี`,
      median: "ค่ามัธยฐาน",
      range: "กรอบ P10–P90",
      contrib: "เงินต้นสะสม",
      paths: "จำนวนเส้นทาง",
      rangeAtEnd: "กรอบความเป็นไปได้ปลายงวด",
      gainNote: "มัธยฐานลบเงินต้น",
    },
  },
  en: {
    pageHead: { sub: "Investment intelligence" },
    factCheck: {
      resultHeading: "Review result",
      inputHint: "Edit the text or pick a sample, then check. Results update on the right.",
      passageLabel: "Original text",
      passageHint: "Highlighted phrases matched a rule",
      findingsCount: (n: number) => `${n} items`,
      busy: "Reviewing the text…",
    },
    analysis: {
      overall: "Overall",
      rhythmTitle: "Length of each sentence segment",
      rhythmNote:
        "Very uneven bars mean an uneven rhythm. Near-identical bars can indicate heavily edited or templated copy.",
      rhythmUnit: "chars",
      rhythmSingle: "This text has a single segment, so sentence rhythm cannot be compared.",
      sentence: (n: number) => `Segment ${n}`,
    },
    sources: {
      tabsLabel: "Choose a publisher type",
      factsHeading: "Profile details",
      auditTitle: "Citation audit",
      auditSub: "12 sample posts from this publisher",
      citedLegend: "Cites a source",
      uncitedLegend: "No source",
      activityTitle: "Publishing activity",
      activityNote: "Unusual posting spikes are shown in red. The dashed line is the average.",
      avg: (n: number) => `Average ${n} posts / week`,
      posts: "Posts",
      weekShort: "Week ",
    },
    risklab: {
      title: "Your scenario",
      hint: "Adjust a value and the chart recalculates instantly.",
      amountUnit: "THB",
      distTitle: "Distribution of final values",
      distSub: "Number of simulated paths in each value range",
      belowLegend: "Below principal",
      aboveLegend: "At or above principal",
      chartAria: (median: string, contrib: string) =>
        `Portfolio simulation chart. Median final value ${median} versus total contributions ${contrib}`,
      month: (m: number) => `Month ${m}`,
      yearTick: (y: number) => `${y}Y`,
      median: "Median",
      range: "P10–P90 range",
      contrib: "Contributions",
      paths: "Paths",
      rangeAtEnd: "Potential range at the end",
      gainNote: "Median minus contributions",
    },
  },
} as const;
