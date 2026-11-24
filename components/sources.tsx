"use client";
import { useState } from "react";
import { FlaskConical, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { profiles, type SourceId } from "@/lib/data";
import type { Report } from "@/lib/analysis";
import { PanelHead, Status, type Go } from "./shared";
import { axisColor, chartHover, tipStyle } from "./chart-style";
import { Button } from "./ui/button";

export function Sources({ report, go }: { report: Report; go: Go }) {
  const [id, set] = useState<SourceId>(report.source ?? "anon");
  const p = profiles[id];
  const avgPosts =
    Math.round((p.bars.reduce((a, b) => a + b, 0) / p.bars.length) * 10) / 10;
  const maxBar = Math.max(...p.bars);

  return (
    <>
      <div className="source-bar">
        <div className="notice">
          <ShieldAlert size={16} color="#1D4ED8" />
          <span>
            {report.source
              ? "โปรไฟล์ในชุดข้อมูลของโพสต์นี้: " + profiles[report.source].name
              : "โพสต์ที่ป้อนเองยังไม่ทราบที่มา เลือกสำรวจโปรไฟล์ตัวอย่างด้านล่าง"}{" "}
            · ข้อมูลทุกโปรไฟล์เป็นข้อมูลสมมติ
          </span>
        </div>

        <div className="profile-options">
          {(Object.keys(profiles) as SourceId[]).map((k) => (
            <button
              type="button"
              className={k === id ? "active" : ""}
              key={k}
              aria-pressed={k === id}
              onClick={() => set(k)}
            >
              {profiles[k].label}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="dossier-grid">
          <div>
            <PanelHead
              title={p.name}
              action={
                <Status color={id === "official" ? "lime" : id === "creator" ? "purple" : "pink"}>
                  {p.handle}
                </Status>
              }
            />
            <p className="body-text">{p.desc}</p>
            <div className="source-details">
              <div>
                <small>ข้อมูลระบุตัวตน</small>
                <strong>{p.identity}</strong>
              </div>
              <div>
                <small>ที่มาของเนื้อหา</small>
                <strong>{p.provenance}</strong>
              </div>
              <div>
                <small>ความสอดคล้องกับบันทึกเดิม</small>
                <strong>
                  {p.consistent} / {p.total} โพสต์ตัวอย่าง
                </strong>
              </div>
            </div>
          </div>

          <div className="sample-matrix" aria-label="ตารางตรวจแหล่งอ้างอิง 12 โพสต์ตัวอย่าง">
            <div className="sample-matrix-head">
              <span>12-POST CITATION AUDIT</span>
              <span>
                {p.citations}/{p.total} CITED
              </span>
            </div>
            <div className="sample-cells">
              {Array.from({ length: p.total }, (_, i) => {
                const cited = i < p.citations;
                return (
                  <div
                    key={i}
                    className={"sample-cell " + (cited ? "cited" : "")}
                  >
                    {cited ? "✓" : "—"} P{String(i + 1).padStart(2, "0")}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="split equal">
        <section className="panel">
          <PanelHead title="การเปิดเผยแหล่งอ้างอิง" />
          <div className="donut-wrap">
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={[
                      { name: "ระบุแหล่งที่มา", value: p.citations },
                      { name: "ไม่ระบุ", value: p.total - p.citations },
                    ]}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={74}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell
                      fill={
                        p.citations >= 10
                          ? "#059669"
                          : p.citations >= 5
                            ? "#2563EB"
                            : "#E11D48"
                      }
                    />
                    <Cell fill="#E2E8F0" />
                  </Pie>
                  <Tooltip
                    contentStyle={tipStyle}
                    itemStyle={{ color: "#F8FAFC" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <strong>
              {p.citations}
              <small>/12 โพสต์</small>
            </strong>
          </div>
          <p className="chart-caption">
            <span>
              <i className="dot" /> โพสต์ที่มีแหล่งอ้างอิงในชุดตัวอย่าง
            </span>
            <span>RATIO: {Math.round((p.citations / p.total) * 100)}%</span>
          </p>
        </section>

        <section className="panel">
          <PanelHead title="กิจกรรมเผยแพร่" />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={p.bars.map((v, i) => ({ week: "W" + (i + 1), posts: v }))}
              >
                <XAxis
                  dataKey="week"
                  tick={{
                    fill: axisColor,
                    fontSize: 12,
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={26}
                  tick={{
                    fill: axisColor,
                    fontSize: 12,
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine
                  y={avgPosts}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: chartHover }} />
                <Bar
                  isAnimationActive={false}
                  name="โพสต์สมมติ"
                  dataKey="posts"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                >
                  {p.bars.map((v, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        v === maxBar && maxBar >= 8 ? "#E11D48" : "#2563EB"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            <span>จำนวนโพสต์ใน 6 สัปดาห์สมมติ</span>
            <span>AVG: {avgPosts} / WK</span>
          </p>
        </section>
      </div>

      <section className="panel">
        <PanelHead title="ลำดับกิจกรรม" />
        <ol className="timeline">
          {p.timeline.map((t, i) => (
            <li key={t}>
              <small>STEP 0{i + 1}</small>
              {t}
            </li>
          ))}
        </ol>
        <div className="section-actions">
          <Button onClick={() => go("risklab")}>
            <FlaskConical size={16} /> เปิด RiskLab
          </Button>
        </div>
      </section>
    </>
  );
}
