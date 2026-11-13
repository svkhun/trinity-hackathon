"use client";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCopy,
  FileSearch,
  FileText,
  Flame,
  GraduationCap,
  Link2,
  LoaderCircle,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  Bitcoin,
} from "lucide-react";
import { Button } from "./ui/button";
import { Disclosure, PanelHead, Status, type Go } from "./shared";
import { postSchema, type Report } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
const icons = [TrendingUp, ShieldCheck, GraduationCap, Bitcoin];
export function Composer({
  draft,
  setDraft,
  analyze,
  busy,
  error,
}: {
  draft: string;
  setDraft: (v: string) => void;
  analyze: () => void;
  busy: boolean;
  error: string;
}) {
  const selected = scenarios.find((x) => x.text === draft.trim());
  return (
    <section className="panel composer">
      <PanelHead
        icon={ScanLine}
        eyebrow="FACT CHECK"
        title="ตรวจสอบโพสต์ลงทุน"
        action={<span className="small-chip">Text analysis</span>}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze();
        }}
      >
        <label htmlFor="post">ข้อความที่ต้องการตรวจสอบ</label>
        <div className={"input-wrap " + (error ? "invalid" : "")}>
          <textarea
            id="post"
            placeholder="วางโพสต์การลงทุนที่อยากตรวจสอบที่นี่…"
            value={draft}
            disabled={busy}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "post-error" : undefined}
          />
          <span className="char-count">
            {draft.length.toLocaleString()} / 3,000
          </span>
        </div>
        {error && (
          <p id="post-error" role="alert" className="error">
            {error}
          </p>
        )}
        <div className="example-label">ลองโพสต์ตัวอย่าง</div>
        <div className="chips">
          {scenarios.map((s, i) => {
            const Icon = icons[i];
            return (
              <button
                type="button"
                disabled={busy}
                className={selected?.id === s.id ? "selected" : ""}
                aria-pressed={selected?.id === s.id}
                onClick={() => setDraft(s.text)}
                key={s.id}
              >
                <Icon size={13} />
                {s.name}
              </button>
            );
          })}
        </div>
        <div className="form-footer">
          <span className="privacy">
            <LockKeyhole size={13} /> ประมวลผลบนอุปกรณ์
          </span>
          <Button disabled={busy} type="submit">
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}{" "}
            {busy ? "กำลังวิเคราะห์…" : "Analyze with AI"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </form>
    </section>
  );
}
const evidenceColor = (s: string) =>
  s === "Supported" ? "lime" : s === "Contradicted" ? "pink" : "orange";
export function Highlighted({ report }: { report: Report }) {
  const phrases = report.metrics
    .flatMap((m) => m.phrases)
    .sort((a, b) => b.length - a.length);
  if (!phrases.length) return <>{report.text}</>;
  const regex = new RegExp(
    "(" +
      phrases.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
      ")",
    "gi",
  );
  return (
    <>
      {report.text
        .split(regex)
        .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}
export function Findings({
  report,
  go,
  notify,
}: {
  report: Report;
  go: Go;
  notify: (v: string) => void;
}) {
  const [tab, setTab] = useState<"claims" | "evidence">("claims");
  async function copy() {
    const summary = [
      "HypeCheck AI · ผลวิเคราะห์จำลอง",
      report.text,
      "Risk Signal: " + report.score + "/100",
      ...report.findings.map(
        (f) => f.phrase + " — " + f.title + " (" + f.evidence + ")",
      ),
      "คะแนนนี้ใช้เพื่อการเรียนรู้",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      notify("คัดลอกสรุปผลแล้ว");
    } catch {
      notify("คัดลอกไม่ได้ กรุณาอนุญาตการใช้คลิปบอร์ดในเบราว์เซอร์");
    }
  }
  return (
    <section className="panel report">
      <PanelHead
        icon={FileSearch}
        title="ผลตรวจสอบโพสต์"
        eyebrow="ANALYSIS REPORT"
        action={
          <button onClick={copy} className="square" aria-label="คัดลอกสรุปผล">
            <ClipboardCopy size={16} />
          </button>
        }
      />
      <blockquote>
        <Highlighted report={report} />
      </blockquote>
      <div className="tab-strip">
        {(["claims", "evidence"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={tab === t ? "active" : ""}
          >
            {t === "claims"
              ? "ข้อสังเกต (" + report.findings.length + ")"
              : "หลักฐานอ้างอิง"}
          </button>
        ))}
      </div>
      {tab === "claims" ? (
        report.findings.map((f, i) => (
          <Disclosure
            key={i + report.text}
            initial={i === 0}
            title={
              <span className="finding-title">
                <b>“{f.phrase}”</b>
                <small>{f.title}</small>
              </span>
            }
          >
            <Status color={evidenceColor(f.evidence)}>{f.evidence}</Status>
            <p>{f.explanation}</p>
            {f.reference && <small>{f.reference}</small>}
          </Disclosure>
        ))
      ) : (
        <div className="evidence-box">
          <BookOpen size={20} />
          <strong>
            {report.reference?.title ?? "ยังไม่มีหลักฐานต้นทางสำหรับข้อความนี้"}
          </strong>
          <p>
            {report.reference?.body ??
              "ระบบไม่ได้ค้นเว็บหรือยืนยันข้อเท็จจริง การขาดแหล่งอ้างอิงยังไม่เพียงพอที่จะสรุปว่าข้อความเป็นเท็จ"}
          </p>
          {report.reference && (
            <p>
              หลักฐานนี้ใช้ได้เฉพาะข้อกล่าวอ้าง “{report.reference.quote}” ในกรณีศึกษาสมมติ
            </p>
          )}
        </div>
      )}
      <div className="section-actions">
        <Button variant="outline" onClick={() => go("sources")}>
          <Link2 size={15} /> สำรวจแหล่งข้อมูล
        </Button>
        <Button onClick={() => go("ai-analysis")}>
          ดู AI Signals <ArrowRight size={15} />
        </Button>
      </div>
    </section>
  );
}
