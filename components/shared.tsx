"use client";
import { ChevronDown } from "lucide-react";

export const navItems = [
  { id: "overview", name: "Overview" },
  { id: "fact-check", name: "Fact Check" },
  { id: "ai-analysis", name: "Analysis" },
  { id: "sources", name: "Sources" },
  { id: "risklab", name: "RiskLab" },
] as const;

export type View = (typeof navItems)[number]["id"];
export type Go = (view: View) => void;

/** Consistent page header used by every subpage. */
export function PageHead({
  crumb,
  line1,
  line2,
  deck,
}: {
  crumb: string;
  line1: string;
  line2?: string;
  deck: string;
}) {
  return (
    <section className="mc-band mc-band-white">
      <div className="mc-container mc-pagehead">
        <div>
          <span className="mc-crumb">{crumb}</span>
          <h1 className="mc-h1">
            {line1}
            {line2 && (
              <>
                <br />
                {line2}
              </>
            )}
          </h1>
        </div>
        <p className="mc-deck">{deck}</p>
      </div>
    </section>
  );
}

export function Disclosure({
  index,
  title,
  children,
  initial = false,
}: {
  index?: number;
  title: React.ReactNode;
  children: React.ReactNode;
  initial?: boolean;
}) {
  return (
    <details className="mc-disclosure" open={initial || undefined}>
      <summary>
        {index !== undefined && (
          <span className="mc-disclosure-idx">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <div className="mc-disclosure-head">{title}</div>
        <ChevronDown size={18} strokeWidth={1.6} />
      </summary>
      <div className="mc-disclosure-body">{children}</div>
    </details>
  );
}

/** Large figure + level label + thin bar. */
export function ScoreFigure({
  score,
  levelText,
  context,
}: {
  score: number;
  levelText: string;
  context: string;
}) {
  const tone = score >= 60 ? "high" : score >= 25 ? "mid" : "low";
  return (
    <div className="mc-score">
      <div className="mc-score-figure">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
      <p className="mc-score-context">
        <span className={"mc-tone-" + tone}>{levelText}</span>
        {" · "}
        {context}
      </p>
      <div className="mc-thin-bar" aria-hidden="true">
        <i
          className={"mc-fill-" + tone}
          style={{ width: `${Math.max(3, score)}%` }}
        />
      </div>
    </div>
  );
}
