"use client";
import { ArrowRight } from "lucide-react";
import type { Report } from "@/lib/analysis";
import { scenarios } from "@/lib/data";
import { copy, type Locale } from "@/lib/i18n";
import type { Go } from "./shared";

export function Analytics({
  locale,
  report,
  go,
}: {
  locale: Locale;
  report: Report;
  go: Go;
}) {
  const t = copy[locale].analysis;
  const tov = copy[locale].overview;
  const metricsNames = copy[locale].metrics;
  const metricDescEn = copy[locale].metricDescEn;

  const activeName =
    report.scenario !== "custom"
      ? copy[locale].scenarios[report.scenario] ??
        scenarios.find((s) => s.id === report.scenario)?.name ??
        report.scenario
      : tov.customName;

  const levelTone =
    report.score >= 60 ? "high" : report.score >= 25 ? "mid" : "low";
  const levelText =
    report.score >= 60
      ? tov.levelHigh
      : report.score >= 25
        ? tov.levelMid
        : tov.levelLow;

  return (
    <div className="mc-page">
      {/* Editorial Report Header */}
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

      {/* Band 1: Executive Linguistic Summary & Proportional Bars on Warm Neutral */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-work-grid">
          <div>
            <span className="mc-muted-label">{t.summaryLabel}</span>
            <div className="mc-score-figure">
              <strong>{report.score}</strong>
              <span>/ 100</span>
            </div>
            <p className="mc-score-context">
              <span className={"mc-tone-" + levelTone}>{levelText}</span>
              {" · "}
              {activeName}
            </p>
            <blockquote className="mc-quote" style={{ marginTop: 24 }}>
              “{report.text}”
            </blockquote>
          </div>

          <div className="mc-signal-col">
            <h2 className="mc-sub-h2">{t.dimensionsHeading}</h2>
            <div className="mc-proportion-list">
              {report.metrics.map((m) => {
                const barTone =
                  m.score >= 60 ? "high" : m.score >= 25 ? "mid" : "low";
                return (
                  <div className="mc-proportion-item" key={m.label}>
                    <div className="mc-proportion-top">
                      <span>{metricsNames[m.label] ?? m.label}</span>
                      <b>{m.score} / 100</b>
                    </div>
                    <div className="mc-proportion-track" aria-hidden="true">
                      <i
                        className={"mc-fill-" + barTone}
                        style={{ width: `${Math.max(2, m.score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Band 2: Editorial Dimension Findings (Asymmetric Rail) */}
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-explore-grid">
          <div className="mc-rail-meta">
            <h2 className="mc-explore-h2">{t.findingsRailTitle}</h2>
            <p className="mc-explore-sub">{t.findingsRailSub}</p>
          </div>

          <div className="mc-editorial-list">
            {report.metrics.map((m) => {
              const desc =
                locale === "en" && metricDescEn[m.label]
                  ? metricDescEn[m.label]
                  : m.description;
              return (
                <article className="mc-editorial-item" key={m.label}>
                  <div className="mc-editorial-head">
                    <h3>{metricsNames[m.label] ?? m.label}</h3>
                    <span className="mc-editorial-score">{m.score} / 100</span>
                  </div>
                  <p className="mc-prose">{desc}</p>
                  {m.phrases.length > 0 ? (
                    <p className="mc-matched-line">
                      <span>{t.matchedPrefix}</span>
                      {m.phrases.map((ph, idx) => (
                        <span key={ph}>
                          {idx > 0 ? " · " : ""}
                          <mark className="mc-inline-mark">“{ph}”</mark>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="mc-fineprint">{t.noMatches}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Band 3: Cadence & Methodology Limits on Warm Neutral */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-explore-grid">
          <div className="mc-rail-meta">
            <h2 className="mc-explore-h2">{t.cadenceRailTitle}</h2>
            <p className="mc-explore-sub">{t.cadenceRailSub}</p>
          </div>

          <div className="mc-editorial-notes">
            <div>
              <h3 className="mc-sub-h2">{t.cadenceTitle}</h3>
              <p className="mc-prose">{t.cadenceBody}</p>
              <p className="mc-fineprint">{t.cadenceStat(report.fragments)}</p>
            </div>

            <div className="mc-note-divider" />

            <div>
              <h3 className="mc-sub-h2">{t.evidenceBoundaryTitle}</h3>
              <p className="mc-prose">
                {report.reference?.body ?? t.evidenceBoundaryFallback}
              </p>
            </div>

            <div className="mc-next-row">
              <button
                type="button"
                className="mc-btn-primary"
                onClick={() => go("sources")}
              >
                <span>{t.nextSources}</span>
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
