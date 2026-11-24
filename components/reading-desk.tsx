"use client";
import { ArrowRight } from "lucide-react";
import type { Report } from "@/lib/analysis";
import { profiles } from "@/lib/data";
import { copy, type Locale } from "@/lib/i18n";
import { ComposerForm } from "./composer";
import { ScoreFigure } from "./shared";

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
  const c = copy[locale];
  const t = c.overview;

  const finding =
    report.findings.find((f) => f.phrase === "วงในยืนยันแล้ว") ??
    report.findings[0];
  const idx = report.text.indexOf(finding.phrase);
  const before = idx >= 0 ? report.text.slice(0, idx) : "";
  const after = idx >= 0 ? report.text.slice(idx + finding.phrase.length) : "";
  const prefix = before.match(/(?:\S+\s+){0,4}$/u)?.[0] ?? "";
  const suffix = after.match(/^\s+\S+/u)?.[0] ?? "";

  const activeName =
    report.scenario !== "custom"
      ? (c.scenarios[report.scenario] ?? report.scenario)
      : t.customName;
  const levelText =
    report.score >= 60
      ? t.levelHigh
      : report.score >= 25
        ? t.levelMid
        : t.levelLow;

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
    <div className="mc-page">
      <section className="mc-band mc-band-white">
        <div className="mc-container mc-intro">
          <div>
            <span className="mc-crumb">{t.eyebrow}</span>
            <h1 className="mc-display">
              {t.headlineLine1}
              <br />
              {t.headlineLine2}
            </h1>
          </div>
          <p className="mc-deck">{t.deck}</p>
        </div>
      </section>

      <section className="mc-band mc-band-warm" aria-label={t.composerTitle}>
        <div className="mc-container mc-overview-work">
          <div className="mc-input-col">
            <h2 className="mc-h2">{t.composerTitle}</h2>
            <ComposerForm
              locale={locale}
              draft={draft}
              setDraft={setDraft}
              analyze={analyze}
              busy={busy}
              error={error}
            />
          </div>

          <aside className="mc-result-col" aria-live="polite">
            <span className="mc-muted-label">{t.scoreLabel}</span>
            <ScoreFigure
              score={report.score}
              levelText={levelText}
              context={activeName}
            />

            <div className="mc-excerpt">
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

            <div className="mc-rows">
              {report.metrics.slice(0, 3).map((m) => (
                <div className="mc-row" key={m.label}>
                  <span>{c.metrics[m.label] ?? m.label}</span>
                  <b>{m.score}</b>
                </div>
              ))}
            </div>

            <button type="button" className="mc-subtle-link" onClick={onOpenScore}>
              <span>{t.howScoreWorks}</span>
              <ArrowRight size={15} strokeWidth={1.6} />
            </button>
          </aside>
        </div>
      </section>

      <section className="mc-band mc-band-white">
        <div className="mc-container mc-explore">
          <div>
            <h2 className="mc-h2">{t.exploreTitle}</h2>
            <p className="mc-side-note">{t.exploreSub}</p>
          </div>
          <div className="mc-pathways">
            {pathways.map((p) => (
              <a href={p.href} key={p.href} className="mc-pathway">
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
                <div className="mc-pathway-meta">
                  <span>{p.stat}</span>
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
