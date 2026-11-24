"use client";
import { ArrowRight } from "lucide-react";
import type { Report } from "@/lib/analysis";
import { copy, type Locale } from "@/lib/i18n";
import { tx, ui } from "@/lib/i18n-extra";
import { PageHead, ScoreFigure, type Go } from "./shared";

const toneOf = (n: number) => (n >= 60 ? "high" : n >= 25 ? "mid" : "low");

export function Analytics({
  locale,
  report,
  go,
}: {
  locale: Locale;
  report: Report;
  go: Go;
}) {
  const c = copy[locale];
  const t = c.analysis;
  const u = ui[locale].analysis;
  const tov = c.overview;

  const activeName =
    report.scenario !== "custom"
      ? (c.scenarios[report.scenario] ?? report.scenario)
      : tov.customName;
  const levelText =
    report.score >= 60
      ? tov.levelHigh
      : report.score >= 25
        ? tov.levelMid
        : tov.levelLow;

  const describe = (label: string, original: string) =>
    locale === "en"
      ? label === "Text Consistency"
        ? tx("en", original)
        : (c.metricDescEn[label] ?? original).trim()
      : original;

  // Sentence rhythm: real sentence segments when there are 2+, otherwise
  // fall back to space-separated clauses and say so.
  const sentenceLens = report.text
    .split(/[.!?。！？\n]+/u)
    .map((s) => Array.from(s.trim()).length)
    .filter((n) => n > 0);
  const useSentences = sentenceLens.length > 1;
  const lens = useSentences
    ? sentenceLens
    : report.text
        .split(/\s+/u)
        .map((s) => Array.from(s.trim()).length)
        .filter((n) => n > 0)
        .slice(0, 10);
  const maxLen = Math.max(1, ...lens);
  const unitLabel = useSentences
    ? u.sentence
    : (n: number) => (locale === "th" ? `ช่วงที่ ${n}` : `Clause ${n}`);

  return (
    <div className="mc-page">
      <PageHead
        crumb={t.eyebrow}
        line1={t.headlineLine1}
        line2={t.headlineLine2}
        deck={t.deck}
      />

      {/* Summary: one figure + all five dimensions side by side */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-summary">
          <div>
            <span className="mc-muted-label">{t.summaryLabel}</span>
            <ScoreFigure
              score={report.score}
              levelText={levelText}
              context={activeName}
            />
            <blockquote className="mc-quote">“{report.text}”</blockquote>
          </div>

          <div>
            <h2 className="mc-h3">{t.dimensionsHeading}</h2>
            <ul className="mc-bars">
              {report.metrics.map((m) => (
                <li key={m.label}>
                  <div className="mc-bars-top">
                    <span>{c.metrics[m.label] ?? m.label}</span>
                    <b>{m.score}</b>
                  </div>
                  <div className="mc-track" aria-hidden="true">
                    <i
                      className={"mc-fill-" + toneOf(m.score)}
                      style={{ width: `${Math.max(2, m.score)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Per-dimension findings */}
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-split">
          <div className="mc-sticky-side">
            <h2 className="mc-h2">{t.findingsRailTitle}</h2>
            <p className="mc-side-note">{t.findingsRailSub}</p>
          </div>
          <div className="mc-dims">
            {report.metrics.map((m) => (
              <article className="mc-dim" key={m.label}>
                <header>
                  <h3>{c.metrics[m.label] ?? m.label}</h3>
                  <span className={"mc-dim-score mc-tone-" + toneOf(m.score)}>
                    {m.score}
                    <small>/100</small>
                  </span>
                </header>
                <p className="mc-prose">{describe(m.label, m.description)}</p>
                {m.phrases.length > 0 ? (
                  <p className="mc-matched">
                    <span>{t.matchedPrefix}</span>
                    {m.phrases.map((ph) => (
                      <mark key={ph}>“{ph}”</mark>
                    ))}
                  </p>
                ) : (
                  <p className="mc-fineprint">{t.noMatches}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sentence rhythm + limits */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-split">
          <div className="mc-sticky-side">
            <h2 className="mc-h2">{t.cadenceRailTitle}</h2>
            <p className="mc-side-note">{t.cadenceRailSub}</p>
          </div>
          <div className="mc-notes">
            <div>
              <h3 className="mc-h3">{u.rhythmTitle}</h3>
              <figure className="mc-rhythm">
                <div
                  className="mc-rhythm-bars"
                  role="img"
                  aria-label={lens
                    .map((n, i) => `${unitLabel(i + 1)}: ${n} ${u.rhythmUnit}`)
                    .join(", ")}
                >
                  {lens.map((n, i) => (
                    <div className="mc-rhythm-col" key={i}>
                      <span className="mc-rhythm-val">{n}</span>
                      <i style={{ height: `${Math.max(6, (n / maxLen) * 140)}px` }} />
                      <span className="mc-rhythm-lab">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <figcaption className="mc-fineprint">
                  {useSentences
                    ? u.rhythmNote
                    : `${u.rhythmSingle} ${
                        locale === "th"
                          ? "แท่งด้านบนแสดงความยาวคำ/วลีที่คั่นด้วยช่องว่างแทน"
                          : "The bars above show space-separated phrases instead."
                      }`}
                </figcaption>
              </figure>
            </div>

            <div>
              <h3 className="mc-h3">{t.cadenceTitle}</h3>
              <p className="mc-prose">{t.cadenceBody}</p>
              <p className="mc-fineprint">{t.cadenceStat(report.fragments)}</p>
            </div>

            <div>
              <h3 className="mc-h3">{t.evidenceBoundaryTitle}</h3>
              <p className="mc-prose">
                {report.reference
                  ? tx(locale, report.reference.body)
                  : t.evidenceBoundaryFallback}
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
