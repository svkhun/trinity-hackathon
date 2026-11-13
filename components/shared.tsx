"use client";
import {
  Activity,
  ArrowUpRight,
  FlaskConical,
  LayoutDashboard,
  ScanText,
  Waypoints,
  ChevronDown,
} from "lucide-react";
import { scenarios } from "@/lib/data";
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
    <span className="brand">
      <svg aria-hidden="true" width="34" height="34" viewBox="0 0 34 34">
        <rect width="34" height="34" rx="3" fill="currentColor" />
        <g
          fill="none"
          stroke="#fffaf1"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 13V8h6m12 13v5h-6M9 19l5 4L25 10" />
          <path d="M8 28h6" strokeWidth="1.4" />
        </g>
      </svg>
      <b>
        HypeCheck<span> AI</span>
      </b>
    </span>
  );
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
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - value / 100)}
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div>
        <strong>{value}</strong>
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
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="panel-head">
      <h2>{title}</h2>
      {action}
    </header>
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
  const name =
    scenarios.find((s) => s.id === report.scenario)?.name ?? "โพสต์ที่คุณป้อน";
  return (
    <section className="panel summary-panel">
      <div className="score-top">
        <span>บันทึกผลล่าสุด</span>
        <span lang="en">SIGNAL INDEX</span>
      </div>
      <h2>น้ำหนักคำชวนเชื่อ</h2>
      <div className="score-main">
        <strong>{report.score}</strong>
        <span>/ 100</span>
        <b>สัญญาณ{report.level}</b>
      </div>
      <p className="score-source">{name} · คะแนนจากกฎจำลอง</p>
      <div className="meter-list">
        {report.metrics.slice(0, 3).map((m) => (
          <div className="meter-row" key={m.label}>
            <span>{m.label}</span>
            <span className="meter">
              <i style={{ width: m.score + "%" }} />
            </span>
            <b>{m.score}</b>
          </div>
        ))}
      </div>
      <button type="button" className="score-link" onClick={onOpen}>
        ดูวิธีอ่านคะแนน <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
