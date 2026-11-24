"use client";
import { ArrowRight } from "lucide-react";
import type { Report } from "@/lib/analysis";
import { profiles, scenarios } from "@/lib/data";
import { copy, type Locale } from "@/lib/i18n";

export function OverviewPrototype({
  locale,
  draft,
  setDraft,
  report,
  busy,
  error,
  analyze,
  onInspectPhrase,
  onOpenScore,
}: {
  locale: Locale;
  draft: string;
  setDraft: (v: string) => void;
  report: Report;
  busy: boolean;
  error: string;
  analyze: () => void;
  onInspectPhrase: (phrase: string) => void;
  onOpenScore: () => void;
}) {
  const t = copy[locale].overview;
  const scNames = copy[locale].scenarios;
  const selected = scenarios.find((s) => s.text === draft.trim());

  const finding =
    report.findings.find((f) => f.phrase === "วงในยืนยันแล้ว") ??
    report.findings[0];
  const idx = report.text.indexOf(finding.phrase);
  const before = idx >= 0 ? report.text.slice(0, idx) : "";
  const after =
    idx >= 0 ? report.text.slice(idx + finding.phrase.length) : "";
  const prefix = before.match(/(?:\S+\s+){0,4}$/u)?.[0] ?? "";
  const suffix = after.match(/^\s+\S+/u)?.[0] ?? "";

  const activeReportName =
    report.scenario !== "custom"
      ? scNames[report.scenario] ?? report.scenario
      : t.customName;

  const levelText =
    report.score >= 60
      ? t.levelHigh
      : report.score >= 25
        ? t.levelMid
        : t.levelLow;

  const levelTone =
    report.score >= 60 ? "high" : report.score >= 25 ? "mid" : "low";

  const sourceTitle = report.source ? profiles[report.source].name : null;

  const pathways = [
    {
      href: "#fact-check",
      title: t.pathways.factCheckTitle,
      desc: t.pathways.factCheckDesc,
      stat: t.pathways.factCheckStat(report.findings.length),
    },
    {
      href: "#ai-analysis",
      title: t.pathways.analysisTitle,
      desc: t.pathways.analysisDesc,
      stat: t.pathways.analysisStat(report.score),
    },
    {
      href: "#sources",
      title: t.pathways.sourcesTitle,
      desc: t.pathways.sourcesDesc,
      stat: t.pathways.sourcesStat(sourceTitle),
    },
    {
      href: "#risklab",
      title: t.pathways.risklabTitle,
      desc: t.pathways.risklabDesc,
      stat: t.pathways.risklabStat,
    },
  ];

  return (
    <div className="mc-overview">
      {/* Band 1: Asymmetric Editorial Introduction on Pure White */}
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-intro-grid">
          <div className="mc-rail-meta">
            <span className="mc-eyebrow">{t.eyebrow}</span>
            <span className="mc-eyebrow-sub">{t.eyebrowSub}</span>
          </div>
          <div className="mc-intro-main">
            <h1 className="mc-display">
              {t.headlineLine1}
              <br />
              {t.headlineLine2}
            </h1>
            <p className="mc-lead-deck">{t.deck}</p>
          </div>
        </div>
      </section>

      {/* Band 2: Immediate Verification Workspace on Warm Neutral #F5F3F0 */}
      <section className="mc-band mc-band-warm" aria-label={t.composerTitle}>
        <div className="mc-container mc-work-grid">
          {/* Left Column: Open Post Input */}
          <div className="mc-input-col">
            <h2 className="mc-section-h2">{t.composerTitle}</h2>

            <div
              className="mc-scenario-tabs"
              role="tablist"
              aria-label={t.selectLabel}
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
                {t.customTab}
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
                {t.composerTitle}
              </label>
              <div className={"mc-sheet " + (error ? "invalid" : "")}>
                <textarea
                  id="post"
                  placeholder={t.placeholder}
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
                  {busy ? t.submitting : t.submit}
                </button>
                <span className="mc-privacy-note">{t.privacy}</span>
              </div>
            </form>
          </div>

          {/* Right Column: Open Typographic Signal Assessment */}
          <div className="mc-signal-col" aria-live="polite">
            <span className="mc-muted-label">{t.scoreLabel}</span>

            <div className="mc-score-figure">
              <strong>{report.score}</strong>
              <span>/ 100</span>
            </div>

            <p className="mc-score-context">
              <span className={"mc-tone-" + levelTone}>{levelText}</span>
              {" · "}
              {activeReportName}
            </p>

            <div className="mc-thin-bar" aria-hidden="true">
              <i
                className={"mc-fill-" + levelTone}
                style={{ width: `${Math.max(3, report.score)}%` }}
              />
            </div>

            <div className="mc-excerpt-block">
              <span className="mc-muted-label">{t.excerptLabel}</span>
              <blockquote className="mc-quote">
                “{prefix.length < before.length ? "…" : ""}
                {prefix}
                <mark>{finding.phrase}</mark>
                {suffix}
                {suffix.length < after.length ? "…" : ""}”
              </blockquote>
              <button
                type="button"
                className="mc-text-link"
                onClick={() => onInspectPhrase(finding.phrase)}
              >
                <span>{t.inspectPhrase}</span>
                <ArrowRight size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="mc-dimension-list">
              {report.metrics.slice(0, 3).map((m) => (
                <div className="mc-dimension-row" key={m.label}>
                  <span>{copy[locale].metrics[m.label] ?? m.label}</span>
                  <b>{m.score}</b>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mc-subtle-link"
              onClick={onOpenScore}
            >
              <span>{t.howScoreWorks}</span>
              <ArrowRight size={15} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </section>

      {/* Band 3: Editorial Research Pathways on Pure White */}
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-explore-grid">
          <div className="mc-rail-meta">
            <h2 className="mc-explore-h2">{t.exploreTitle}</h2>
            <p className="mc-explore-sub">{t.exploreSub}</p>
          </div>

          <div className="mc-pathway-list">
            {pathways.map((item) => (
              <a href={item.href} key={item.href} className="mc-pathway-row">
                <div className="mc-pathway-copy">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className="mc-pathway-meta">
                  <span>{item.stat}</span>
                  <ArrowRight size={18} strokeWidth={1.6} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
