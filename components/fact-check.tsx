"use client";
import { useEffect, useRef } from "react";
import { ArrowRight, Copy } from "lucide-react";
import { Disclosure, PageHead, ScoreFigure, type Go } from "./shared";
import { ComposerForm } from "./composer";
import type { Report } from "@/lib/analysis";
import { copy, type Locale } from "@/lib/i18n";
import { tx, ui } from "@/lib/i18n-extra";

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
  const c = copy[locale];
  const t = c.factCheck;
  const u = ui[locale].factCheck;
  const tov = c.overview;
  const evLabels = c.evidenceLabels;

  const listRef = useRef<HTMLDivElement>(null);
  const targetIndex = report.findings.findIndex(
    (f) => f.phrase === targetPhrase,
  );
  useEffect(() => {
    if (targetIndex >= 0)
      listRef.current?.querySelectorAll("summary")[targetIndex]?.focus();
  }, [targetIndex]);

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

  async function copySummary() {
    const summary = [
      "hypecheck. · Illustrative review",
      report.text,
      `Persuasion score: ${report.score}/100`,
      ...report.findings.map(
        (f) => `${f.phrase} — ${tx("en", f.title)} (${f.evidence})`,
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
      <PageHead
        crumb={t.eyebrow}
        line1={t.headlineLine1}
        line2={t.headlineLine2}
        deck={t.deck}
      />

      <section className="mc-band mc-band-white">
        <div className="mc-container mc-workspace">
          {/* Left: input stays visible while reading results */}
          <aside className="mc-panel-warm mc-sticky">
            <h2 className="mc-h2">{tov.composerTitle}</h2>
            <p className="mc-side-note">{u.inputHint}</p>
            <ComposerForm
              locale={locale}
              draft={draft}
              setDraft={setDraft}
              analyze={analyze}
              busy={busy}
              error={error}
            />
          </aside>

          {/* Right: result reading order */}
          <div
            id="analysis-result"
            tabIndex={-1}
            className="mc-results"
            aria-busy={busy}
          >
            {busy ? (
              <p className="mc-loading" role="status">
                {u.busy}
              </p>
            ) : (
              <>
                <header className="mc-result-head">
                  <div>
                    <span className="mc-muted-label">{tov.scoreLabel}</span>
                    <ScoreFigure
                      score={report.score}
                      levelText={levelText}
                      context={activeName}
                    />
                  </div>
                  <button
                    type="button"
                    className="mc-inline-action"
                    onClick={copySummary}
                  >
                    <Copy size={15} strokeWidth={1.6} />
                    <span>{t.copyBtn}</span>
                  </button>
                </header>

                <section className="mc-block">
                  <div className="mc-block-head">
                    <h2 className="mc-h3">{u.passageLabel}</h2>
                    <span className="mc-fineprint">{u.passageHint}</span>
                  </div>
                  <blockquote className="mc-passage">
                    <Highlighted report={report} />
                  </blockquote>
                </section>

                <section className="mc-block" ref={listRef}>
                  <div className="mc-block-head">
                    <h2 className="mc-h3">{t.findingsHeading(report.findings.length)}</h2>
                  </div>
                  <div>
                    {report.findings.map((f, i) => (
                      <Disclosure
                        key={JSON.stringify([f.title, f.phrase])}
                        index={i + 1}
                        initial={i === (targetIndex >= 0 ? targetIndex : 0)}
                        title={
                          <span className="mc-finding">
                            <span className="mc-finding-quote">
                              “{f.phrase}”
                            </span>
                            <span className="mc-finding-meta">
                              {tx(locale, f.title)}
                              <i aria-hidden="true">·</i>
                              <em className={"mc-tone-" + statusTone(f.evidence)}>
                                {evLabels[f.evidence] ?? f.evidence}
                              </em>
                            </span>
                          </span>
                        }
                      >
                        <p className="mc-prose">{tx(locale, f.explanation)}</p>
                        {f.reference && (
                          <p className="mc-fineprint">
                            {t.refCitePrefix}
                            {tx(locale, f.reference)}
                          </p>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </section>

                <section className="mc-block">
                  <div className="mc-block-head">
                    <h2 className="mc-h3">{t.refHeading}</h2>
                  </div>
                  {report.reference ? (
                    <>
                      <p className="mc-ref-line">
                        <span
                          className={
                            "mc-tone-" + statusTone(report.reference.status)
                          }
                        >
                          {evLabels[report.reference.status] ??
                            report.reference.status}
                        </span>
                        <i aria-hidden="true">·</i>
                        {tx(locale, report.reference.title)}
                      </p>
                      <p className="mc-prose">
                        {tx(locale, report.reference.body)}
                      </p>
                      <p className="mc-fineprint">
                        {t.refScope(report.reference.quote)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mc-ref-line">{t.noRefTitle}</p>
                      <p className="mc-prose">{t.noRefBody}</p>
                    </>
                  )}
                </section>

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
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
