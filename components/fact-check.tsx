"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCopy,
  Link2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Button } from "./ui/button";
import { Disclosure, PanelHead, Status, type Go } from "./shared";
import type { Report } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
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
      <header className="composer-head">
        <div>
          <span className="folio">Fact Check</span>
          <h2>ต้นฉบับที่ต้องการตรวจ</h2>
        </div>
        <label className="case-select">
          <span>เลือกกรณีศึกษา</span>
          <select
            aria-label="เลือกกรณีศึกษา"
            disabled={busy}
            value={selected?.id ?? "custom"}
            onChange={(e) =>
              setDraft(
                scenarios.find((s) => s.id === e.target.value)?.text ?? "",
              )
            }
          >
            <option value="custom">เขียนโพสต์เอง</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze();
        }}
      >
        <label htmlFor="post" className="sr-only">
          ข้อความที่ต้องการตรวจสอบ
        </label>
        <div className={"input-wrap " + (error ? "invalid" : "")}>
          <textarea
            id="post"
            placeholder="วางโพสต์การลงทุนที่อยากตรวจสอบที่นี่…"
            value={draft}
            disabled={busy}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "post-error post-count" : "post-count"}
          />
          <span className="char-count" id="post-count">
            {draft.length.toLocaleString()} / 3,000
          </span>
        </div>
        {error && (
          <p id="post-error" role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-footer">
          <span className="privacy">
            <LockKeyhole size={13} /> ประมวลผลบนอุปกรณ์
          </span>
          <Button disabled={busy} type="submit">
            {busy && <LoaderCircle className="spin" size={16} />}{" "}
            {busy ? "กำลังเทียบถ้อยคำ…" : "ตรวจโพสต์นี้"}
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
  const segments: React.ReactNode[] = [];
  let offset = 0;
  for (const match of report.text.matchAll(regex)) {
    segments.push(
      report.text.slice(offset, match.index),
      <mark key={match.index}>{match[0]}</mark>,
    );
    offset = match.index + match[0].length;
  }
  return (
    <>
      {segments}
      {report.text.slice(offset)}
    </>
  );
}
export function Findings({
  targetPhrase,
  report,
  go,
  notify,
}: {
  report: Report;
  go: Go;
  notify: (v: string) => void;
  targetPhrase: string | null;
}) {
  const [tab, setTab] = useState<"claims" | "evidence">("claims");
  const findingsRef = useRef<HTMLDivElement>(null);
  const targetIndex = report.findings.findIndex(
    (f) => f.phrase === targetPhrase,
  );
  useEffect(() => {
    if (targetIndex >= 0)
      findingsRef.current?.querySelectorAll("summary")[targetIndex]?.focus();
  }, [targetIndex]);
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
        title="ผลตรวจสอบโพสต์"

        action={
          <button
            type="button"
            onClick={copy}
            className="square"
            aria-label="คัดลอกสรุปผล"
          >
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
            type="button"
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
        <div ref={findingsRef}>
          {report.findings.map((f, i) => (
            <Disclosure
              key={JSON.stringify([f.title, f.phrase])}
              initial={i === (targetIndex >= 0 ? targetIndex : 0)}
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
          ))}
        </div>
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
