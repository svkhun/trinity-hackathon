"use client";
import { useState } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { profiles, type SourceId } from "@/lib/data";
import type { Report } from "@/lib/analysis";
import { copy, type Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n-extra";
import { PageHead, type Go } from "./shared";
import { axisColor, chartGrid, chartHover, tipStyle } from "./chart-style";

export function Sources({
  locale,
  report,
  go,
}: {
  locale: Locale;
  report: Report;
  go: Go;
}) {
  const c = copy[locale];
  const t = c.sources;
  const u = ui[locale].sources;
  const [id, set] = useState<SourceId>(report.source ?? "anon");
  const p = profiles[id];
  const en = locale === "en" ? copy.en.sources.profilesEn[id] : null;

  const label = (k: SourceId) =>
    locale === "en" ? copy.en.sources.profilesEn[k].label : profiles[k].label;
  const desc = en?.desc ?? p.desc;
  const identity = en?.identity ?? p.identity;
  const provenance = en?.provenance ?? p.provenance;
  const timeline = en?.timeline ?? p.timeline;

  const avg = Math.round((p.bars.reduce((a, b) => a + b, 0) / p.bars.length) * 10) / 10;
  const max = Math.max(...p.bars);
  const ratio = Math.round((p.citations / p.total) * 100);
  const tone = p.citations >= 10 ? "low" : p.citations >= 5 ? "mid" : "high";

  const note = report.source
    ? t.linkedNote(profiles[report.source].name)
    : t.unlinkedNote;

  return (
    <div className="mc-page">
      <PageHead
        crumb={t.eyebrow}
        line1={t.headlineLine1}
        line2={t.headlineLine2}
        deck={t.deck}
      />

      <section className="mc-band mc-band-white">
        <div className="mc-container mc-section-stack">
          <div className="mc-toolbar">
            <div
              className="mc-scenario-tabs"
              role="group"
              aria-label={u.tabsLabel}
            >
              {(Object.keys(profiles) as SourceId[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  aria-pressed={k === id}
                  className={"mc-tab " + (k === id ? "active" : "")}
                  onClick={() => set(k)}
                >
                  {label(k)}
                </button>
              ))}
            </div>
            <p className="mc-fineprint mc-toolbar-note">{note}</p>
          </div>

          {/* Profile + citation audit side by side */}
          <div className="mc-source-grid">
            <div>
              <h2 className="mc-h2">{p.name}</h2>
              <p className="mc-handle">{p.handle}</p>
              <p className="mc-prose">{desc}</p>

              <h3 className="mc-h3 mc-mt">{u.factsHeading}</h3>
              <dl className="mc-facts">
                <div>
                  <dt>{t.identityLabel}</dt>
                  <dd>{identity}</dd>
                </div>
                <div>
                  <dt>{t.provenanceLabel}</dt>
                  <dd>{provenance}</dd>
                </div>
                <div>
                  <dt>{t.consistencyLabel}</dt>
                  <dd>
                    {p.consistent} / {p.total} {t.consistentUnit}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mc-panel-warm">
              <h3 className="mc-h3">{u.auditTitle}</h3>
              <p className="mc-side-note">{u.auditSub}</p>

              <div className="mc-score-figure mc-mt-sm">
                <strong>{p.citations}</strong>
                <span>/ {p.total}</span>
              </div>
              <p className="mc-score-context">
                <span className={"mc-tone-" + tone}>{ratio}%</span>
                {" · "}
                {t.citationLabel}
              </p>

              <ol
                className="mc-audit"
                aria-label={t.citationSub(p.citations, p.total)}
              >
                {Array.from({ length: p.total }, (_, i) => {
                  const cited = i < p.citations;
                  return (
                    <li
                      key={i}
                      className={cited ? "cited" : ""}
                      title={`P${i + 1}`}
                    >
                      {cited ? (
                        <Check size={15} strokeWidth={2} aria-label={u.citedLegend} />
                      ) : (
                        <Minus size={15} strokeWidth={1.6} aria-label={u.uncitedLegend} />
                      )}
                      <span>{i + 1}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="mc-legend">
                <span>
                  <i className="mc-dot cited" /> {u.citedLegend}
                </span>
                <span>
                  <i className="mc-dot" /> {u.uncitedLegend}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity + trail */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-split-even">
          <div>
            <h2 className="mc-h2">{u.activityTitle}</h2>
            <p className="mc-side-note">
              {u.activityNote} · {u.avg(avg)}
            </p>
            <div
              className="mc-chart mc-chart-sm"
              role="img"
              aria-label={`${u.activityTitle}: ${p.bars.join(", ")}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={p.bars.map((v, i) => ({ week: `W${i + 1}`, posts: v }))}
                  margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                >
                  <XAxis
                    dataKey="week"
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={{ stroke: chartGrid }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <ReferenceLine y={avg} stroke="#8C857B" strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={tipStyle}
                    cursor={{ fill: chartHover }}
                    labelFormatter={(w) => `${u.weekShort}${String(w).slice(1)}`}
                    formatter={(v) => [v, u.posts]}
                  />
                  <Bar dataKey="posts" radius={[3, 3, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                    {p.bars.map((v, i) => (
                      <Cell
                        key={i}
                        fill={v === max && max >= 8 ? "#C84630" : "#E86B20"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="mc-h2">{t.trailHeading}</h2>
            <ol className="mc-trail">
              {timeline.map((step, i) => (
                <li key={step}>
                  <span className="mc-trail-n">{i + 1}</span>
                  <div>
                    <small>
                      {t.stepPrefix}
                      {i + 1}
                    </small>
                    <p>{step}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mc-next-row">
              <button
                type="button"
                className="mc-btn-primary"
                onClick={() => go("risklab")}
              >
                <span>{t.nextRisklab}</span>
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
