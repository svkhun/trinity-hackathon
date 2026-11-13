"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Command,
  FlaskConical,
  LayoutDashboard,
  LockKeyhole,
  PanelLeft,
  Radio,
  ScanLine,
  ShieldCheck,
  Waypoints,
  X,
} from "lucide-react";
import {
  Brand,
  navItems,
  RiskSummary,
  Showcase,
  Status,
  type View,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Terrain } from "@/components/terrain";
import { Composer, Findings } from "@/components/fact-check";
import { Analytics } from "@/components/analytics";
import { Sources } from "@/components/sources";
import { RiskLab } from "@/components/risklab";
import { analyzePost, mockAnalysisService, postSchema } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
const titles: Record<View, [string, string]> = {
  overview: ["Workspace overview", "ภาพรวมพื้นที่วิเคราะห์การลงทุน"],
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
      return;
    }
    setError("");
    setBusy(true);
    pending.current = true;
    try {
      const next = await mockAnalysisService.analyze(validation.data);
      setReport(next);
      go("fact-check");
      setToast("วิเคราะห์โพสต์เสร็จแล้ว");
      requestAnimationFrame(() =>
        document
          .getElementById("analysis-result")
          ?.scrollIntoView({ block: "start" }),
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
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <a
          href="#main"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main")?.focus();
          }}
        >
          ข้ามไปเนื้อหา
        </a>
        <aside className="sidebar">
          <a
            className="brand-link"
            href="#overview"
            aria-label="HypeCheck AI Overview"
          >
            <Brand />
          </a>
          <div className="nav-label">WORKSPACE</div>
          <nav aria-label="เมนูหลัก">
            {navItems.map(({ id, name, icon: Icon }) => (
              <a
                key={id}
                href={"#" + id}
                onClick={() => go(id)}
                aria-current={view === id ? "page" : undefined}
                className={view === id ? "active" : ""}
              >
                <Icon size={18} />
                <span>{name}</span>
                {id === view && <i className="active-dot" />}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-status">
              <i className="dot lime" />
              <span>Local demo</span>
              <small>v1.0</small>
            </div>
            <button className="guide-link" onClick={() => setGuide(true)}>
              <BookOpen size={16} /> คู่มือการใช้งาน <ArrowUpRight size={13} />
            </button>
          </div>
        </aside>
        <div className="workarea">
          <header className="topbar">
            <div className="crumb">
              <PanelLeft size={16} />
              <i />
              Workspace <ChevronRight size={13} />
              <strong>{navItems.find((n) => n.id === view)?.name}</strong>
            </div>
            <a className="mobile-brand" href="#overview">
              <Brand />
            </a>
            <div className="top-right">
              <span className="demo-chip">
                <i className="dot lime" /> Demo mode
              </span>
              <span className="top-divider" />
              <button
                className="help-btn"
                title="คู่มือและข้อจำกัด"
                aria-label="คู่มือและข้อจำกัด"
                onClick={() => setGuide(true)}
              >
                <CircleHelp size={18} />
              </button>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.13 }}
                className="page"
              >
                <div className="page-heading">
                  <div>
                    <h1>{titles[view][0]}</h1>
                    <p>{titles[view][1]}</p>
                  </div>
                  {view === "overview" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => go("risklab")}
                    >
                      <FlaskConical size={15} /> เปิด RiskLab{" "}
                      <ArrowUpRight size={14} />
                    </Button>
                  )}
                </div>
                {view === "overview" ? (
                  <>
                    <section className="hero">
                      <Terrain />
                      <div className="hero-shade" />
                      <div className="hero-content">
                        <div className="hero-kicker">
                          <span className="tiny-wave">∿</span> INVESTMENT
                          INTELLIGENCE
                        </div>
                        <h2>
                          Think Before
                          <br />
                          <span>You Invest.</span>
                        </h2>
                        <p>อ่านสัญญาณ FOMO ตรวจหลักฐาน ก่อนตัดสินใจลงทุน</p>
                      </div>
                      <span className="hero-coordinate">
                        <Activity size={12} /> SIGNAL TOPOGRAPHY
                      </span>
                    </section>
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
                    <Showcase go={go} report={report} />
                  </>
                ) : view === "fact-check" ? (
                  <>
                    <div className="split overview-grid">
                      {editor}
                      {summary}
                    </div>
                    <div id="analysis-result">
                      {busy ? (
                        <div role="status" className="panel skeleton">
                          กำลังวิเคราะห์ข้อความ…
                        </div>
                      ) : (
                        <Findings report={report} go={go} notify={setToast} />
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
                  <ShieldCheck size={14} /> ข้อมูลจำลองเพื่อการเรียนรู้ <span>·</span>{" "}
                  ไม่มีคำแนะนำซื้อขายหลักทรัพย์
                </footer>
              </motion.div>
            </AnimatePresence>
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
          onClick={(e) => {
            if (e.target === dialog.current) setGuide(false);
          }}
          aria-labelledby="guide-title"
        >
          <div>
            <div className="dialog-head">
              <h2 id="guide-title">คู่มือ HypeCheck AI</h2>
              <button
                className="square"
                aria-label="ปิดคู่มือ"
                onClick={() => setGuide(false)}
              >
                <X size={17} />
              </button>
            </div>
            <ol>
              <li>เลือกตัวอย่างหรือวางโพสต์ใน Fact Check แล้วกด Analyze with AI</li>
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
    </MotionConfig>
  );
}
