"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  approaches,
  defaults,
  simulate,
  simulateBands,
  type Inputs,
} from "@/lib/simulation";
import { copy, type Locale } from "@/lib/i18n";
import { ui } from "@/lib/i18n-extra";
import { Disclosure, PageHead } from "./shared";
import { axisColor, chartGrid, chartHover, tipStyle } from "./chart-style";

const compact = (n: number) =>
  Intl.NumberFormat("en", { notation: "compact" }).format(n);

type Control = {
  key: "amount" | "years" | "rate" | "vol";
  min: number;
  max: number;
  step: number;
};
const controls: Control[] = [
  { key: "amount", min: 500, max: 50000, step: 500 },
  { key: "years", min: 1, max: 20, step: 1 },
  { key: "rate", min: -10, max: 20, step: 0.5 },
  { key: "vol", min: 0, max: 60, step: 1 },
];

export function RiskLab({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const t = c.risklab;
  const u = ui[locale].risklab;
  const [inputs, set] = useState<Inputs>(defaults);

  const result = useMemo(() => simulate(inputs), [inputs]);
  const bands = useMemo(() => simulateBands(inputs), [inputs]);

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 0 }),
    [locale],
  );
  const baht = (n: number) => `฿${nf.format(n)}`;
  const gain = result.median - result.contribution;

  const labelOf: Record<Control["key"], string> = {
    amount: t.amountLabel,
    years: t.yearsLabel,
    rate: t.rateLabel,
    vol: t.volLabel,
  };
  const display = (k: Control["key"]) => {
    const v = inputs[k];
    if (k === "amount") return `฿${nf.format(v)}`;
    if (k === "years") return `${v} ${t.yearsUnit}`;
    return `${v}%`;
  };

  const yearsTotal = inputs.years;
  const step = yearsTotal > 10 ? 24 : 12;
  const ticks = Array.from(
    { length: Math.floor((yearsTotal * 12) / step) + 1 },
    (_, i) => i * step,
  );

  const maxComparison = Math.max(...result.comparison.map((x) => x.value));

  return (
    <div className="mc-page">
      <PageHead
        crumb={t.eyebrow}
        line1={t.headlineLine1}
        line2={t.headlineLine2}
        deck={t.deck}
      />

      <section className="mc-band mc-band-white">
        <div className="mc-container mc-lab">
          {/* Scenario controls */}
          <aside className="mc-panel-warm mc-sticky" aria-label={t.scenarioHeading}>
            <div className="mc-row-between">
              <h2 className="mc-h2">{t.scenarioHeading}</h2>
              <button
                type="button"
                className="mc-inline-action"
                onClick={() => set(defaults)}
              >
                <RotateCcw size={14} strokeWidth={1.7} />
                <span>{t.resetBtn}</span>
              </button>
            </div>
            <p className="mc-side-note">{u.hint}</p>

            {controls.map((ctl) => {
              const pct =
                ((inputs[ctl.key] - ctl.min) / (ctl.max - ctl.min)) * 100;
              const id = "ctl-" + ctl.key;
              return (
                <div className="mc-slider" key={ctl.key}>
                  <label htmlFor={id}>{labelOf[ctl.key]}</label>
                  <output htmlFor={id}>{display(ctl.key)}</output>
                  <input
                    id={id}
                    type="range"
                    min={ctl.min}
                    max={ctl.max}
                    step={ctl.step}
                    value={inputs[ctl.key]}
                    style={{ "--pct": `${pct}%` } as React.CSSProperties}
                    onChange={(e) =>
                      set({ ...inputs, [ctl.key]: Number(e.target.value) })
                    }
                  />
                </div>
              );
            })}

            <fieldset className="mc-segmented">
              <legend>{t.approachLabel}</legend>
              {approaches.map((a) => (
                <button
                  type="button"
                  key={a}
                  aria-pressed={inputs.approach === a}
                  className={inputs.approach === a ? "active" : ""}
                  onClick={() => set({ ...inputs, approach: a })}
                >
                  {t.approaches[a]}
                </button>
              ))}
            </fieldset>
          </aside>

          {/* Visualization */}
          <div className="mc-lab-main">
            <div className="mc-lab-figure">
              <span className="mc-muted-label">{t.estValueLabel}</span>
              <div className="mc-big-number">{baht(result.median)}</div>
              <p className="mc-side-note">{t.medianNote}</p>
            </div>

            <figure className="mc-chart" role="img" aria-label={u.chartAria(baht(result.median), baht(result.contribution))}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={bands}
                  margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke={chartGrid} vertical={false} />
                  <XAxis
                    dataKey="month"
                    type="number"
                    domain={[0, yearsTotal * 12]}
                    ticks={ticks}
                    tickFormatter={(m: number) => (m === 0 ? "0" : u.yearTick(m / 12))}
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={{ stroke: chartGrid }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 12 }}
                    tickFormatter={compact}
                    width={48}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tipStyle}
                    labelFormatter={(m) => u.month(Number(m))}
                    formatter={(v, name) =>
                      Array.isArray(v)
                        ? [`${baht(v[0] as number)} – ${baht(v[1] as number)}`, name]
                        : [baht(Number(v)), name]
                    }
                  />
                  <Area
                    dataKey="band"
                    name={u.range}
                    stroke="none"
                    fill="#E86B20"
                    fillOpacity={0.16}
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="contribution"
                    name={u.contrib}
                    stroke="#666666"
                    strokeWidth={1.75}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="median"
                    name={u.median}
                    stroke="#E86B20"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: "#E86B20", stroke: "#fff", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </figure>

            <p className="mc-legend mc-legend-chart">
              <span>
                <i className="mc-key line" /> {t.legendMedian}
              </span>
              <span>
                <i className="mc-key band" /> {t.legendRange}
              </span>
              <span>
                <i className="mc-key dash" /> {t.legendContrib}
              </span>
            </p>

            <dl className="mc-kpis">
              <div>
                <dt>{t.totalContribLabel}</dt>
                <dd>{baht(result.contribution)}</dd>
              </div>
              <div>
                <dt>{t.estGainLabel}</dt>
                <dd className={gain >= 0 ? "mc-tone-up" : "mc-tone-high"}>
                  {gain >= 0 ? "+" : "−"}
                  {baht(Math.abs(gain))}
                </dd>
              </div>
              <div>
                <dt>{t.downsideLabel}</dt>
                <dd>{baht(result.downside)}</dd>
              </div>
              <div>
                <dt>{u.rangeAtEnd}</dt>
                <dd className="mc-kpi-sm">
                  {baht(bands[bands.length - 1].p10)} – {baht(bands[bands.length - 1].p90)}
                </dd>
              </div>
            </dl>
            <p className="mc-fineprint">{t.belowPrincipal(result.below)}</p>
          </div>
        </div>
      </section>

      {/* Distribution + approach comparison */}
      <section className="mc-band mc-band-warm">
        <div className="mc-container mc-split-even">
          <div>
            <h2 className="mc-h2">{u.distTitle}</h2>
            <p className="mc-side-note">{u.distSub}</p>
            <div className="mc-chart mc-chart-sm" role="img" aria-label={u.distTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.histogram} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                  <XAxis
                    dataKey="value"
                    tickFormatter={compact}
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
                  <Tooltip
                    contentStyle={tipStyle}
                    cursor={{ fill: chartHover }}
                    labelFormatter={(v) => baht(Number(v))}
                    formatter={(v) => [v, u.paths]}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {result.histogram.map((bin, i) => (
                      <Cell
                        key={i}
                        fill={bin.value < result.contribution ? "#C84630" : "#E86B20"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mc-legend">
              <span>
                <i className="mc-dot below" /> {u.belowLegend}
              </span>
              <span>
                <i className="mc-dot above" /> {u.aboveLegend}
              </span>
            </p>
          </div>

          <div>
            <h2 className="mc-h2">{t.compareRailTitle}</h2>
            <p className="mc-side-note">{t.compareRailSub}</p>
            <ul className="mc-compare">
              {result.comparison.map((row, i) => {
                const key = approaches[i];
                const active = key === inputs.approach;
                return (
                  <li key={key} className={active ? "active" : ""}>
                    <div className="mc-compare-top">
                      <span>{t.approaches[key]}</span>
                      <b>{baht(row.value)}</b>
                    </div>
                    <div className="mc-track" aria-hidden="true">
                      <i style={{ width: `${(row.value / maxComparison) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="mc-band mc-band-white">
        <div className="mc-container mc-split">
          <div className="mc-sticky-side">
            <h2 className="mc-h2">{t.methodologyRailTitle}</h2>
            <p className="mc-side-note">{t.methodologyRailSub}</p>
          </div>
          <div>
            <Disclosure title={<span className="mc-finding-quote">{t.methodologyRailTitle}</span>} initial>
              <p className="mc-prose">{t.methodologyP1}</p>
              <p className="mc-prose">{t.methodologyP2}</p>
            </Disclosure>
          </div>
        </div>
      </section>
    </div>
  );
}
