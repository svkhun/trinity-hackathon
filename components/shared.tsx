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
    <details className="mc-disclosure" open={initial || undefined}>
      <summary>
        <div className="mc-disclosure-head">{title}</div>
        <ChevronDown size={17} strokeWidth={1.6} />
      </summary>
      <div className="mc-disclosure-body">{children}</div>
    </details>
  );
}
