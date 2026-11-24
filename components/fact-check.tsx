"use client";
import { useEffect, useRef } from "react";
import { ArrowRight, Copy } from "lucide-react";
import { Disclosure, type Go } from "./shared";
import type { Report } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
import { copy, type Locale } from "@/lib/i18n";

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

const statusTone = (s: string) =>
  s === "Supported" ? "low" : s === "Contradicted" ? "high" : "mid";

export function FactCheckPage({
  locale,
  draft,
  setDraft,
  report,
  busy,
  error,
  analyze,
  targetPhrase,
  go,
  notify,
}: {
  locale: Locale;
  draft: string;
  setDraft: (v: string) => void;
  report: Report;
  busy: boolean;
  error: string;
  analyze: () => void;
  targetPhrase: string | null;
  go: Go;
  notify: (v: string) => void;
}) {
  const t = copy[locale].factCheck;
  const tov = copy[locale].overview;
  const scNames = copy[locale].scenarios;
  const evLabels = copy[locale].evidenceLabels;
  const selected = scenarios.find((x) => x.text === draft.trim());

  const findingsRef = useRef<HTMLDivElement>(null);
  const targetIndex = report.findings.findIndex(
    (f) => f.phrase === targetPhrase,
  );

  useEffect(() => {
    if (targetIndex >= 0)
      findingsRef.current?.querySelectorAll("summary")[targetIndex]?.focus();
  }, [targetIndex]);

  const activeName =
    report.scenario !== "custom"
      ? scNames[report.scenario] ?? report.scenario
      : tov.customName;

  const levelTone =
    report.score >= 60 ? "high" : report.score >= 25 ? "mid" : "low";
  const levelText =
    report.score >= 60
      ? tov.levelHigh
      : report.score >= 25
        ? tov.levelMid
        : tov.levelLow;

  async function copySummary() {
    const summary = [
      "HypeCheck AI · Illustrative Review",
      report.text,
      `Persuasion Score: ${report.score}/100`,
      ...report.findings.map(
        (f) => `${f.phrase} — ${f.title} (${f.evidence})`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      notify(t.copiedToast);
    } catch {
      notify(t.copyFailToast);
    }
  }

  return (
    <div className="mc-page">
      {/* Page Header */}
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-page-head">
          <span className="mc-eyebrow">{t.eyebrow}</span>
          <h1 className="mc-display">
            {t.headlineLine1}
            <br />
            {t.headlineLine2}
          </h1>
          <p className="mc-lead-deck">{t.deck}</p>
        </div>
      </section>

      {/* Warm Neutral Submission & Score Band */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-work-grid">
          <div className="mc-input-col">
            <h2 className="mc-section-h2">{tov.composerTitle}</h2>
            <div
              className="mc-scenario-tabs"
              role="tablist"
              aria-label={tov.selectLabel}
            >
              {scenarios.map((s) => {
                const isCurrent = selected?.id === s.id;
                return (
                  <button
                    type="button"
                    role="tab"
                    key={s.id}
                    disabled={busy}
                    aria-selected={isCurrent}
                    className={"mc-tab " + (isCurrent ? "active" : "")}
                    onClick={() => setDraft(s.text)}
                  >
                    {scNames[s.id] ?? s.name}
                  </button>
                );
              })}
              <button
                type="button"
                role="tab"
                disabled={busy}
                aria-selected={!selected}
                className={"mc-tab " + (!selected ? "active" : "")}
                onClick={() => {
                  if (selected) setDraft("");
                  document.getElementById("post")?.focus();
                }}
              >
                {tov.customTab}
              </button>
            </div>

            <form
              className="mc-form"
              onSubmit={(e) => {
                e.preventDefault();
                analyze();
              }}
            >
              <label htmlFor="post" className="sr-only">
                {tov.composerTitle}
              </label>
              <div className={"mc-sheet " + (error ? "invalid" : "")}>
                <textarea
                  id="post"
                  placeholder={tov.placeholder}
                  value={draft}
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={
                    error ? "post-error post-count" : "post-count"
                  }
                />
                <div className="mc-sheet-foot" id="post-count">
                  <span>{draft.length.toLocaleString()} / 3,000</span>
                </div>
              </div>
              {error && (
                <p id="post-error" role="alert" className="mc-error">
                  {error}
                </p>
              )}
              <div className="mc-action-row">
                <button
                  type="submit"
                  disabled={busy}
                  className="mc-btn-primary"
                >
                  {busy ? tov.submitting : tov.submit}
                </button>
                <span className="mc-privacy-note">{tov.privacy}</span>
              </div>
            </form>
          </div>

          <div className="mc-signal-col">
            <span className="mc-muted-label">{tov.scoreLabel}</span>
            <div className="mc-score-figure">
              <strong>{report.score}</strong>
              <span>/ 100</span>
            </div>
            <p className="mc-score-context">
              <span className={"mc-tone-" + levelTone}>{levelText}</span>
              {" · "}
              {activeName}
            </p>
            <div className="mc-thin-bar" aria-hidden="true">
              <i
                className={"mc-fill-" + levelTone}
                style={{ width: `${Math.max(3, report.score)}%` }}
              />
            </div>
            <div className="mc-dimension-list">
              {report.metrics.slice(0, 4).map((m) => (
                <div className="mc-dimension-row" key={m.label}>
                  <span>{copy[locale].metrics[m.label] ?? m.label}</span>
                  <b>{m.score}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Verification Reading Workspace on Pure White */}
      <section
        id="analysis-result"
        tabIndex={-1}
        className="mc-band mc-band-white"
      >
        <div className="mc-container mc-verify-grid">
          {/* Left: Highlighted Original Text + Primary Reference */}
          <div className="mc-verify-left">
            <div className="mc-row-between">
              <span className="mc-muted-label">{t.originalLabel}</span>
              <button
                type="button"
                className="mc-inline-action"
                onClick={copySummary}
              >
                <Copy size={15} strokeWidth={1.6} />
                <span>{t.copyBtn}</span>
              </button>
            </div>

            <blockquote className="mc-reading-passage">
              <Highlighted report={report} />
            </blockquote>

            <div className="mc-ref-block">
              <h2 className="mc-sub-h2">{t.refHeading}</h2>
              {report.reference ? (
                <>
                  <p className="mc-ref-status">
                    <span
                      className={
                        "mc-tone-" + statusTone(report.reference.status)
                      }
                    >
                      {evLabels[report.reference.status] ??
                        report.reference.status}
                    </span>
                    {" · "}
                    {report.reference.title}
                  </p>
                  <p className="mc-prose">{report.reference.body}</p>
                  <p className="mc-fineprint">
                    {t.refScope(report.reference.quote)}
                  </p>
                </>
              ) : (
                <>
                  <p className="mc-ref-title">{t.noRefTitle}</p>
                  <p className="mc-prose">{t.noRefBody}</p>
                </>
              )}
            </div>
          </div>

          {/* Right: Flagged Claims & Explanations */}
          <div className="mc-verify-right" ref={findingsRef}>
            <h2 className="mc-section-h2">
              {t.findingsHeading(report.findings.length)}
            </h2>

            <div className="mc-findings-list">
              {report.findings.map((f, i) => (
                <Disclosure
                  key={JSON.stringify([f.title, f.phrase])}
                  initial={i === (targetIndex >= 0 ? targetIndex : 0)}
                  title={
                    <div className="mc-finding-summary">
                      <span className="mc-finding-quote">“{f.phrase}”</span>
                      <span className="mc-finding-meta">
                        {f.title} ·{" "}
                        <em className={"mc-tone-" + statusTone(f.evidence)}>
                          {evLabels[f.evidence] ?? f.evidence}
                        </em>
                      </span>
                    </div>
                  }
                >
                  <p className="mc-prose">{f.explanation}</p>
                  {f.reference && (
                    <p className="mc-fineprint">
                      {t.refCitePrefix}
                      {f.reference}
                    </p>
                  )}
                </Disclosure>
              ))}
            </div>

            <div className="mc-next-row">
              <button
                type="button"
                className="mc-btn-secondary"
                onClick={() => go("sources")}
              >
                {t.nextSources}
              </button>
              <button
                type="button"
                className="mc-btn-primary"
                onClick={() => go("ai-analysis")}
              >
                <span>{t.nextAnalysis}</span>
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
