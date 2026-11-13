"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  FlaskConical,
  LayoutDashboard,
  ScanLine,
  ScanText,
  ShieldCheck,
  Sparkles,
  Waypoints,
  ChevronDown,
} from "lucide-react";
import type { Report } from "@/lib/analysis";
export const navItems = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "fact-check", name: "Fact Check", icon: ScanText },
  { id: "ai-analysis", name: "AI Analysis", icon: Activity },
  { id: "sources", name: "Source Intelligence", icon: Waypoints },
  { id: "risklab", name: "RiskLab", icon: FlaskConical },
] as const;
export type View = (typeof navItems)[number]["id"];
export type Go = (view: View) => void;
export function Brand() {
  return (
    <div className="brand">
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
        <g fill="none" stroke="#a394ff" strokeWidth="4.5">
          <path d="m2 26 12-16 8 10" />
          <path d="m3 36 17-22 9 12L44 7" />
          <path d="m22 37 10-13 6 7 7-9" />
        </g>
      </svg>
      <span>
        HypeCheck <b>AI</b>
      </span>
    </div>
  );
}
export function Counter({ value }: { value: number }) {
  const [n, set] = useState(value);
  const previous = useRef(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (reduced) {
      set(value);
      return;
    }
    const start = performance.now();
    let id = 0;
    function tick(now: number) {
      const f = Math.min(1, (now - start) / 500);
      set(Math.round(from + (value - from) * f));
      if (f < 1) id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, reduced]);
  return <>{n}</>;
}
export function Ring({
  value,
  color = "var(--purple)",
  small = false,
  label = "Risk index",
}: {
  value: number;
  color?: string;
  small?: boolean;
  label?: string;
}) {
  const radius = 47,
    length = 2 * Math.PI * radius;
  return (
    <div className={"score-gauge " + (small ? "small" : "")} style={{ color }}>
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <circle
          cx="56"
          cy="56"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeDasharray="1 4"
          opacity=".45"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="var(--track)"
          strokeWidth="6"
        />
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={length}
          initial={false}
          animate={{ strokeDashoffset: length * (1 - value / 100) }}
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div>
        <strong>
          <Counter value={value} />
        </strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
export function Status({
  children,
  color = "purple",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className={"status " + color}>
      <i />
      {children}
    </span>
  );
}
export function PanelHead({
  icon: Icon,
  title,
  eyebrow,
  action,
  tone = "purple",
}: {
  icon: typeof Activity;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="panel-head">
      <span className={"icon-tile " + tone}>
        <Icon size={19} />
      </span>
      <div className="head-copy">
        {eyebrow && <small className="eyebrow">{eyebrow}</small>}
        <h2>{title}</h2>
      </div>
      {action && <div className="head-action">{action}</div>}
    </div>
  );
}
export function Disclosure({
  title,
  children,
  initial = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  initial?: boolean;
}) {
  return (
    <details className="disclosure" open={initial || undefined}>
      <summary>
        {title}
        <ChevronDown size={15} />
      </summary>
      <div className="disclosure-detail">{children}</div>
    </details>
  );
}
export function RiskSummary({
  report,
  onOpen,
}: {
  report: Report;
  onOpen: () => void;
}) {
  const colors = ["pink", "orange", "purple"];
  return (
    <section className="panel summary-panel">
      <PanelHead
        icon={ChartNoAxesCombined}
        title="Risk Signal"
        eyebrow="SIGNAL OVERVIEW"
        tone="pink"
        action={
          <button
            className="square"
            aria-label="ดู AI Analysis"
            onClick={onOpen}
          >
            <ArrowUpRight size={16} />
          </button>
        }
      />
      <div className="risk-content">
        <Ring
          value={report.score}
          color={
            report.score >= 60
              ? "var(--pink)"
              : report.score >= 25
                ? "var(--orange)"
                : "var(--lime)"
          }
          label="/ 100"
        />
        <div>
          <Status
            color={
              report.score >= 60
                ? "pink"
                : report.score >= 25
                  ? "orange"
                  : "lime"
            }
          >
            สัญญาณ{report.level}
          </Status>
          <p>
            ความเข้มของสัญญาณ
            <br />
            จากโพสต์ที่วิเคราะห์
          </p>
        </div>
      </div>
      <div className="meter-list">
        {report.metrics.slice(0, 3).map((m, i) => (
          <div className="meter-row" key={m.label}>
            <span>{m.label}</span>
            <span className="meter">
              <i className={colors[i]} style={{ width: m.score + "%" }} />
            </span>
            <b>{m.score}</b>
          </div>
        ))}
      </div>
      <div className="panel-foot">
        <span className="dot purple" /> คะแนนจากกฎจำลอง
      </div>
    </section>
  );
}
export const featureCards = [
  {
    view: "fact-check" as View,
    icon: ScanLine,
    title: "Fact Check",
    th: "ตรวจสอบคำกล่าวอ้าง",
    color: "purple",
  },
  {
    view: "ai-analysis" as View,
    icon: Sparkles,
    title: "AI Analysis",
    th: "สำรวจรูปแบบภาษา",
    color: "pink",
  },
  {
    view: "sources" as View,
    icon: ShieldCheck,
    title: "Source Intelligence",
    th: "ตรวจที่มาของข้อมูล",
    color: "lime",
  },
];
export function Showcase({ go, report }: { go: Go; report: Report }) {
  return (
    <section className="showcase">
      <div className="section-title">
        <h2>Explore workspace</h2>
        <small>เครื่องมือวิเคราะห์</small>
      </div>
      <div className="show-grid">
        {featureCards.map(({ view, icon: Icon, title, th, color }, i) => (
          <button
            key={view}
            onClick={() => go(view)}
            className={"show-card " + color}
          >
            <div className="show-info">
              <Icon size={18} />
              <h3>{title}</h3>
              <p>{th}</p>
              <ArrowUpRight size={15} />
            </div>
            <div className="phone" aria-hidden="true">
              <div className="notch" />
              <div className="mini-head">
                <Icon size={10} />
                {title}
              </div>
              {i === 0 ? (
                <>
                  <div className="mini-line" />
                  <div className="mini-line short" />
                  {["FOMO", "Urgency", "Evidence"].map((t) => (
                    <div className="mini-tag" key={t}>
                      {t}
                    </div>
                  ))}
                </>
              ) : i === 1 ? (
                <>
                  <div className="mini-ring">{report.score}</div>
                  <div className="mini-line" />
                </>
              ) : (
                <>
                  <div className="mini-line" />
                  <div className="mini-bars">
                    {[30, 55, 44, 80, 63, 95, 72].map((h, n) => (
                      <i key={n} style={{ height: h + "%" }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
