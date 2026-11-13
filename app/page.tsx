"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, Check, LockKeyhole, X } from "lucide-react";
import { Brand, navItems, RiskSummary, type View } from "@/components/shared";
import { Lead, ReportIndex } from "@/components/reading-desk";
import { Composer, Findings } from "@/components/fact-check";
const Analytics = dynamic(() =>
  import("@/components/analytics").then((m) => m.Analytics),
);
const Sources = dynamic(() =>
  import("@/components/sources").then((m) => m.Sources),
);
const RiskLab = dynamic(() =>
  import("@/components/risklab").then((m) => m.RiskLab),
);
import { analyzePost, mockAnalysisService, postSchema } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
const titles: Record<Exclude<View, "overview">, [string, string]> = {
  "fact-check": ["Fact Check", "ตรวจสอบถ้อยคำและหลักฐานประกอบโพสต์การลงทุน"],
  "ai-analysis": ["AI Analysis", "สำรวจสัญญาณภาษาและเหตุผลเบื้องหลังคะแนนจำลอง"],
  sources: ["Source Intelligence", "สำรวจที่มาและความโปร่งใสของแหล่งข้อมูลตัวอย่าง"],
  risklab: ["RiskLab", "ทดลองเปลี่ยนสมมติฐานเพื่อเข้าใจความไม่แน่นอนของการลงทุน"],
};
function readView(): View {
  return (
    navItems.find((n) => "#" + n.id === window.location.hash)?.id ?? "overview"
  );
}
export default function Page() {
  const [view, setView] = useState<View>("overview"),
    [draft, setDraft] = useState(scenarios[0].text),
    [report, setReport] = useState(() => analyzePost(scenarios[0].text)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [guide, setGuide] = useState(false);
  const [targetPhrase, setTargetPhrase] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    pending = useRef(false);
  useEffect(() => {
    function sync() {
      setView(readView());
      window.scrollTo(0, 0);
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (guide) dialog.current?.showModal();
    else dialog.current?.close();
  }, [guide]);
  function go(next: View) {
    window.location.hash = next;
    setView(next);
    window.scrollTo(0, 0);
  }
  async function analyze() {
    if (pending.current) return;
    const validation = postSchema.safeParse(draft);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      document.getElementById("post")?.focus();
      return;
    }
    setError("");
    setBusy(true);
    pending.current = true;
    try {
      const next = await mockAnalysisService.analyze(validation.data);
      setReport(next);
      setTargetPhrase(null);
      go("fact-check");
      setToast("วิเคราะห์โพสต์เสร็จแล้ว");
      requestAnimationFrame(() =>
        document.getElementById("analysis-result")?.focus(),
      );
    } catch {
      setError("วิเคราะห์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }
  const editor = (
    <Composer
      draft={draft}
      setDraft={(v) => {
        setDraft(v);
        setError("");
      }}
      analyze={analyze}
      busy={busy}
      error={error}
    />
  );
  const summary = (
    <RiskSummary report={report} onOpen={() => go("ai-analysis")} />
  );
  return (
    <div className="shell">
      <button
        type="button"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        ข้ามไปเนื้อหา
      </button>
      <header className="masthead">
        <div className="mast-inner">
          <a
            className="brand-link"
            href="#overview"
            aria-label="HypeCheck AI Overview"
          >
            <Brand />
          </a>
          <nav aria-label="เมนูหลัก" className="desk-nav">
            {navItems.map(({ id, name }) => (
              <a
                key={id}
                href={"#" + id}
                aria-current={view === id ? "page" : undefined}
              >
                {name}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="guide-link"
            onClick={() => setGuide(true)}
          >
            <BookOpen size={17} /> คู่มือ
          </button>
        </div>
      </header>
      <div className="workarea">
        <main id="main" tabIndex={-1}>
          <div className="page" key={view}>
            {view !== "overview" && (
              <header className="page-heading">
                <h1>{titles[view][0]}</h1>
                <p>{titles[view][1]}</p>
              </header>
            )}
            {view === "overview" ? (
              <>
                <Lead
                  report={report}
                  onRead={(phrase) => {
                    setTargetPhrase(phrase);
                    go("fact-check");
                  }}
                />
                <div className="split overview-grid">
                  {editor}
                  {busy ? (
                    <div role="status" className="panel skeleton">
                      กำลังวิเคราะห์สัญญาณ…
                    </div>
                  ) : (
                    summary
                  )}
                </div>
                <ReportIndex report={report} />
              </>
            ) : view === "fact-check" ? (
              <>
                <div className="split overview-grid">
                  {editor}
                  {summary}
                </div>
                <div id="analysis-result" tabIndex={-1}>
                  {busy ? (
                    <div role="status" className="panel skeleton">
                      กำลังวิเคราะห์ข้อความ…
                    </div>
                  ) : (
                    <Findings
                      targetPhrase={targetPhrase}
                      report={report}
                      go={go}
                      notify={setToast}
                    />
                  )}
                </div>
              </>
            ) : view === "ai-analysis" ? (
              <Analytics report={report} go={go} />
            ) : view === "sources" ? (
              <Sources report={report} go={go} />
            ) : (
              <RiskLab />
            )}
            <footer>
              <span>HypeCheck AI</span> ข้อมูลจำลองเพื่อการเรียนรู้ ·
              ไม่มีคำแนะนำซื้อขายหลักทรัพย์
            </footer>
          </div>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {navItems.map(({ id, name, icon: Icon }) => (
          <a
            key={id}
            aria-current={view === id ? "page" : undefined}
            href={"#" + id}
            className={view === id ? "active" : ""}
          >
            <Icon size={19} />
            <small>{id === "sources" ? "Sources" : name}</small>
          </a>
        ))}
      </nav>
      <dialog
        ref={dialog}
        className="guide-dialog"
        onCancel={() => setGuide(false)}
        onClose={() => setGuide(false)}
        closedby="any"
        aria-labelledby="guide-title"
      >
        <div>
          <div className="dialog-head">
            <h2 id="guide-title">คู่มือ HypeCheck AI</h2>
            <button
              type="button"
              className="square"
              aria-label="ปิดคู่มือ"
              onClick={() => setGuide(false)}
            >
              <X size={17} />
            </button>
          </div>
          <ol>
            <li>เลือกตัวอย่างหรือวางโพสต์ใน Fact Check แล้วกด “ตรวจโพสต์นี้”</li>
            <li>เปิดข้อสังเกตและหลักฐาน ดูสัญญาณภาษาใน AI Analysis</li>
            <li>
              สำรวจโปรไฟล์สมมติใน Source Intelligence และเปลี่ยนสมมติฐานใน RiskLab
            </li>
          </ol>
          <p>
            <LockKeyhole size={16} />{" "}
            ข้อความใช้ในหน่วยความจำของเบราว์เซอร์และหายเมื่อโหลดหน้าใหม่
            เครื่องมือใช้กฎที่อธิบายได้ ไม่มีการส่งโพสต์ไปยังบริการ AI ภายนอก
          </p>
          <p>คะแนนสะท้อนถ้อยคำที่กฎตรวจพบ การพิสูจน์ข้อเท็จจริงต้องอาศัยหลักฐานจากต้นทาง</p>
        </div>
      </dialog>
      <div aria-live="polite" className="toast-region">
        {toast && (
          <div className="toast">
            <Check size={16} />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
