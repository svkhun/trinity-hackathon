"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, LockKeyhole, Menu, X } from "lucide-react";
import { navItems, RiskSummary, type View } from "@/components/shared";
import { OverviewPrototype } from "@/components/reading-desk";
import { Composer, Findings } from "@/components/fact-check";
import { copy, type Locale } from "@/lib/i18n";

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

function BrandWordmark() {
  return (
    <span className="mc-brand">
      <svg
        aria-hidden="true"
        width="26"
        height="20"
        viewBox="0 0 28 22"
        fill="none"
      >
        <path
          d="M2.5 18.5L9.5 4.5L15 15"
          stroke="#E86B20"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 18.5L18.5 5.5L25.5 18.5"
          stroke="#141414"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mc-wordmark">hypecheck.</span>
    </span>
  );
}

export default function Page() {
  const [view, setView] = useState<View>("overview"),
    [locale, setLocale] = useState<Locale>("th"),
    [mobileMenu, setMobileMenu] = useState(false),
    [draft, setDraft] = useState(scenarios[0].text),
    [report, setReport] = useState(() => analyzePost(scenarios[0].text)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [guide, setGuide] = useState(false);

  const [targetPhrase, setTargetPhrase] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    pending = useRef(false);

  const t = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    function sync() {
      setView(readView());
      setMobileMenu(false);
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
    setMobileMenu(false);
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
      setToast(t.toastDone);
      requestAnimationFrame(() =>
        document.getElementById("analysis-result")?.focus(),
      );
    } catch {
      setError(
        locale === "th"
          ? "วิเคราะห์ไม่สำเร็จ กรุณาลองอีกครั้ง"
          : "Unable to analyze text. Please try again.",
      );
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
    <div className="mc-shell">
      <button
        type="button"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t.skip}
      </button>

      {/* Clean, Flat Corporate Horizontal Header */}
      <header className="mc-header">
        <div className="mc-header-inner">
          <a
            className="mc-brand-link"
            href="#overview"
            aria-label="hypecheck. Overview"
          >
            <BrandWordmark />
          </a>

          <div className="mc-header-right">
            <nav aria-label="Primary navigation" className="mc-nav">
              {navItems.map(({ id }) => (
                <a
                  key={id}
                  href={"#" + id}
                  aria-current={view === id ? "page" : undefined}
                >
                  {t.nav[id]}
                </a>
              ))}
            </nav>

            <span className="mc-divider-v" aria-hidden="true" />

            <div
              className="mc-lang-switch"
              role="group"
              aria-label="Language switcher"
            >
              <button
                type="button"
                className={locale === "th" ? "active" : ""}
                aria-pressed={locale === "th"}
                onClick={() => setLocale("th")}
              >
                ไทย
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                className={locale === "en" ? "active" : ""}
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              className="mc-guide-btn"
              onClick={() => setGuide(true)}
            >
              {t.guide}
            </button>

            <button
              type="button"
              className="mc-mobile-toggle"
              aria-expanded={mobileMenu}
              aria-label={mobileMenu ? t.menuClose : t.menuOpen}
              onClick={() => setMobileMenu((v) => !v)}
            >
              {mobileMenu ? (
                <X size={20} strokeWidth={1.6} />
              ) : (
                <Menu size={20} strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <nav className="mc-mobile-drawer" aria-label="Mobile navigation">
            {navItems.map(({ id }) => (
              <a
                key={id}
                href={"#" + id}
                aria-current={view === id ? "page" : undefined}
                onClick={() => setMobileMenu(false)}
              >
                {t.nav[id]}
              </a>
            ))}
            <button
              type="button"
              className="mc-drawer-guide"
              onClick={() => {
                setMobileMenu(false);
                setGuide(true);
              }}
            >
              {t.guide}
            </button>
          </nav>
        )}
      </header>

      <main id="main" tabIndex={-1} className="mc-main">
        {view === "overview" ? (
          <OverviewPrototype
            locale={locale}
            draft={draft}
            setDraft={(v) => {
              setDraft(v);
              setError("");
            }}
            report={report}
            busy={busy}
            error={error}
            analyze={analyze}
            onInspectPhrase={(phrase) => {
              setTargetPhrase(phrase);
              go("fact-check");
            }}
            onOpenScore={() => go("ai-analysis")}
          />
        ) : (
          /* Remaining pages preserved untouched during Phase 2 prototype review */
          <div className="legacy-subpage-wrap">
            <div className="page" key={view}>
              <header className="page-heading">
                <div>
                  <h1>{titles[view][0]}</h1>
                  <p>{titles[view][1]}</p>
                </div>
              </header>

              {view === "fact-check" ? (
                <>
                  <div className="prism-workbench">
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
            </div>
          </div>
        )}
      </main>

      <footer className="mc-footer">
        <div className="mc-container mc-footer-inner">
          <span className="mc-footer-brand">{t.footerLead}</span>
          <p>{t.footerNote}</p>
        </div>
      </footer>

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
            <h2 id="guide-title">{t.guideTitle}</h2>
            <button
              type="button"
              className="square"
              aria-label="Close"
              onClick={() => setGuide(false)}
            >
              <X size={17} />
            </button>
          </div>
          <ol>
            {t.guideSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            <LockKeyhole size={15} /> {t.guidePrivacy}
          </p>
          <p>{t.guideCaveat}</p>
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
