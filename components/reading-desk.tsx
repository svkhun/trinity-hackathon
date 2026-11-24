import { Activity, BookOpen, ScanText, Search, Waypoints } from "lucide-react";
import type { Report } from "@/lib/analysis";
import { profiles, scenarios } from "@/lib/data";
export function Lead({
  report,
  onRead,
}: {
  report: Report;
  onRead: (phrase: string) => void;
}) {
  const finding =
    report.findings.find((f) => f.phrase === "วงในยืนยันแล้ว") ??
    report.findings[0];
  const index = report.text.indexOf(finding.phrase);
  // Keep complete Thai words and combining marks when showing nearby context.
  const before = report.text.slice(0, index);
  const after = report.text.slice(index + finding.phrase.length);
  const prefix = before.match(/(?:\S+\s+){0,4}$/u)?.[0] ?? "";
  const suffix = after.match(/^\s+\S+/u)?.[0] ?? "";
  const name =
    scenarios.find((s) => s.id === report.scenario)?.name ?? "โพสต์ที่คุณป้อน";
  return (
    <section className="lead">
      <div className="lead-type">
        <p className="edition">
          <ScanText size={16} /> A LITTLE PAUSE. A CLEARER PICTURE.
        </p>
        <h1>
          ก่อนเชื่อ ลองเช็ก
          <br />
          <em>ให้ชัดอีกนิด</em>
        </h1>
        <p className="deck">
          เข้าใจคำชวนลงทุน แยกถ้อยคำออกจากหลักฐาน
          <br className="wide-br" /> เริ่มต้นด้วยโพสต์ที่คุณอยากรู้ให้มากขึ้น
        </p>
      </div>
      <div className="proof-wrap">
        <article className="proof">
          <header>
            <span className="proof-icon"><Search size={18} /></span>
            <div><span>มองให้ลึกกว่าข้อความ</span><small>ข้อความจากรายงานล่าสุด</small></div>
            <span className="proof-tag">{name}</span>
          </header>
          <blockquote>
            “{prefix.length < before.length ? "…" : ""}
            {prefix}
            <mark>{finding.phrase}</mark>
            {suffix}
            {suffix.length < after.length ? "…" : ""}”
          </blockquote>
          <button type="button" onClick={() => onRead(finding.phrase)}>
            <BookOpen size={16} /> อ่านข้อสังเกตของคำนี้
          </button>
        </article>
        <p className="proof-caption">คำที่สะดุดตา อาจเป็นจุดเริ่มต้นของคำถามที่ดี</p>
      </div>
    </section>
  );
}
export function ReportIndex({ report }: { report: Report }) {
  const entries = [
    { href: "#fact-check", title: "ข้อสังเกตและหลักฐาน", subtitle: report.findings.length + " ข้อสังเกตจากโพสต์", icon: ScanText, tone: "indigo" },
    { href: "#ai-analysis", title: "เข้าใจสัญญาณภาษา", subtitle: report.metrics.length + " ตัวชี้วัดที่อธิบายได้", icon: Activity, tone: "peach" },
    { href: "#sources", title: "รู้จักที่มาของโพสต์", subtitle: report.source ? profiles[report.source].name : "ยังไม่ทราบผู้เผยแพร่", icon: Waypoints, tone: "teal" },
  ];
  return (
    <section className="report-index">
      <div className="report-index-heading">
        <h2>ค่อย ๆ ทำความเข้าใจ ทีละมุม</h2>
        <p>สำรวจเพิ่มเติมจากรายงานล่าสุด</p>
      </div>
      <div className="report-cards">
        {entries.map(({ href, title, subtitle, icon: Icon, tone }) => (
          <a href={href} key={href}>
            <span className={"report-icon " + tone}><Icon size={21} strokeWidth={1.7} /></span>
            <div><strong>{title}</strong><small>{subtitle}</small></div>
          </a>
        ))}
      </div>
    </section>
  );
}
