import { ArrowRight, ArrowUpRight } from "lucide-react";
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
          <span /> สมุดตรวจโพสต์การลงทุน
        </p>
        <h1>
          อ่านให้ทัน
          <br />
          <em>คำชวนลงทุน</em>
        </h1>
        <p className="deck">
          วางโพสต์ที่คุณสงสัย แล้วดูว่าคำไหนเร่งให้ซื้อ
          <br className="wide-br" /> และข้อไหนยังต้องหาหลักฐาน
        </p>
      </div>
      <div className="proof-wrap">
        <article className="proof">
          <header>
            <span>ข้อความจากรายงานล่าสุด</span>
            <span>{name}</span>
          </header>
          <blockquote>
            “{prefix.length < before.length ? "…" : ""}
            {prefix}
            <mark>{finding.phrase}</mark>
            {suffix}
            {suffix.length < after.length ? "…" : ""}”
          </blockquote>
          <button type="button" onClick={() => onRead(finding.phrase)}>
            <span className="proof-mark" aria-hidden="true">
              ↳
            </span>{" "}
            อ่านข้อสังเกตของคำนี้ <ArrowUpRight size={16} />
          </button>
        </article>
      </div>
    </section>
  );
}
export function ReportIndex({ report }: { report: Report }) {
  const entries = [
    ["#fact-check", "ข้อสังเกตและหลักฐาน", report.findings.length + " ข้อสังเกต"],
    ["#ai-analysis", "ถ้อยคำที่ระบบจับคู่", report.metrics.length + " ตัวชี้วัด"],
    [
      "#sources",
      "ที่มาของโพสต์",
      report.source ? profiles[report.source].name : "ยังไม่ทราบผู้เผยแพร่",
    ],
  ];
  return (
    <section className="report-index">
      <div>
        <span className="folio">Report index</span>
        <h2>เปิดรายงานทีละส่วน</h2>
      </div>
      <div>
        {entries.map(([href, title, subtitle]) => (
          <a href={href} key={href}>
            <strong>{title}</strong>
            <small>{subtitle}</small>
            <ArrowRight size={17} />
          </a>
        ))}
      </div>
    </section>
  );
}
