import { z } from "zod";
import { scenarios, type Evidence, type SourceId } from "./data";
export const postSchema = z
  .string()
  .trim()
  .min(1, "กรุณาใส่ข้อความที่ต้องการตรวจสอบ")
  .max(3000, "กรุณาใช้ข้อความไม่เกิน 3,000 ตัวอักษร");
export type Finding = {
  title: string;
  phrase: string;
  explanation: string;
  evidence: Evidence;
  reference?: string;
};
const rules = [
  {
    label: "FOMO Signal",
    title: "กระตุ้นความกลัวพลาดโอกาส",
    pattern:
      /ก่อนตกรถ|ตกรถ|ห้ามพลาด|ของมันต้องมี|รีบขึ้นรถ|fomo|don't miss|miss out/giu,
    detail: "ถ้อยคำนี้ชวนให้ตัดสินใจตามกระแสโดยกลัวเสียโอกาส",
    base: 86,
  },
  {
    label: "Urgency Language",
    title: "เร่งให้ตัดสินใจ",
    pattern:
      /รีบซื้อ|รีบขึ้นรถ|วันนี้เท่านั้น|คืนนี้|buy now|act now|today only|last chance/giu,
    detail: "มีกรอบเวลาหรือคำเร่งรัด ควรขอเวลาตรวจสอบข้อมูลก่อนตัดสินใจ",
    base: 82,
  },
  {
    label: "Unsupported Claims",
    title: "ข้อกล่าวอ้างที่ต้องตรวจสอบ",
    pattern:
      /วงในยืนยันแล้ว|รับประกันกำไรแน่นอน|รับประกันผลตอบแทน|ไม่มีความเสี่ยง|\d+(?:\.\d+)?\s*%|#?\d+x\b|guaranteed? (?:profits?|returns?)|risk[- ]free|insider/giu,
    detail: "ควรตรวจเอกสารต้นทาง เงื่อนไข และที่มาของตัวเลขก่อนเชื่อข้อกล่าวอ้าง",
    base: 74,
  },
  {
    label: "Emotional Persuasion",
    title: "ใช้ภาษาโน้มน้าวอารมณ์",
    pattern: /แน่นอน|ไปดวงจันทร์|คนทั้งกลุ่ม|!+|🚀|to the moon|everyone is buying/giu,
    detail: "คำยืนยันหนักแน่นหรือเครื่องหมายเน้นอารมณ์อาจทำให้ข้อความดูมั่นใจกว่าหลักฐาน",
    base: 56,
  },
];
export function analyzePost(input: string) {
  const text = postSchema.parse(input);
  const scenario = scenarios.find((item) => item.text === text);
  const findings: Finding[] = [];
  const metrics = rules.map((rule) => {
    const matches = Array.from(
      new Set(Array.from(text.matchAll(rule.pattern), (m) => m[0])),
    );
    for (const phrase of matches)
      findings.push({
        title: rule.title,
        phrase,
        explanation: rule.detail,
        evidence: "Insufficient Evidence",
      });
    return {
      label: rule.label,
      score: matches.length
        ? Math.min(98, rule.base + 5 * (matches.length - 1))
        : 0,
      description: rule.detail,
      phrases: matches,
    };
  });
  const reference = scenario?.reference;
  if (reference) {
    const finding = findings.find((f) => f.phrase === reference.quote);
    const fact = {
      title: "ตรวจเทียบกับเอกสารตัวอย่าง",
      phrase: reference.quote,
      explanation: reference.body,
      evidence: reference.status,
      reference: reference.title,
    };
    if (finding) Object.assign(finding, fact);
    else findings.unshift(fact);
  }
  if (!findings.length)
    findings.push({
      title: "ข้อความที่ส่งมาตรวจสอบ",
      phrase: text,
      explanation: "ไม่พบถ้อยคำตามกฎที่กำหนด และไม่มีเอกสารประกอบสำหรับยืนยันข้อความนี้",
      evidence: "Insufficient Evidence",
    });
  const score = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / 4);
  const fragments = text
    .split(/[.!?。！？\n]+/u)
    .map((s) => s.trim())
    .filter(Boolean);
  const lengths = fragments.map((s) => Array.from(s).length);
  const consistency =
    lengths.length > 1
      ? Math.round((100 * Math.min(...lengths)) / Math.max(...lengths))
      : 0;
  metrics.push({
    label: "Text Consistency",
    score: consistency,
    description:
      lengths.length > 1
        ? "สัดส่วนความยาวช่วงข้อความที่สั้นที่สุดต่อช่วงที่ยาวที่สุด"
        : "มีช่วงข้อความน้อยเกินไป จึงยังเปรียบเทียบความสม่ำเสมอไม่ได้",
    phrases: [],
  });
  return {
    text,
    score,
    level: score >= 60 ? "สูง" : score >= 25 ? "ปานกลาง" : "ต่ำ",
    metrics,
    findings,
    source: (scenario?.source ?? null) as SourceId | null,
    scenario: scenario?.id ?? "custom",
    reference,
    fragments: fragments.length,
  };
}
export type Report = ReturnType<typeof analyzePost>;
export interface AnalysisService {
  analyze(input: string): Promise<Report>;
}
export const mockAnalysisService: AnalysisService = {
  async analyze(input) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return analyzePost(input);
  },
};
