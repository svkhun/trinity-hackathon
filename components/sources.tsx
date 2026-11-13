"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { profiles, type SourceId } from "@/lib/data";
import type { Report } from "@/lib/analysis";
import { PanelHead, Status, type Go } from "./shared";
import { tipStyle, axisColor } from "./chart-style";
import { Button } from "./ui/button";
export function Sources({ report, go }: { report: Report; go: Go }) {
  const [id, set] = useState<SourceId>(report.source ?? "anon");
  const p = profiles[id];
  return (
    <>
      <div className="notice">
        {report.source
          ? "โปรไฟล์ในชุดข้อมูลของโพสต์นี้: " + profiles[report.source].name
          : "โพสต์ที่ป้อนเองยังไม่ทราบที่มา เลือกสำรวจโปรไฟล์ตัวอย่างด้านล่าง"}{" "}
        · ข้อมูลทุกโปรไฟล์เป็นข้อมูลสมมติ
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
      <section className="panel">
        <PanelHead title={p.name} action={<Status>{p.handle}</Status>} />
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
                    innerRadius={57}
                    outerRadius={70}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#577043" />
                    <Cell fill="#c8c8b8" />
                  </Pie>
                  <Tooltip
                    contentStyle={tipStyle}
                    itemStyle={{ color: "#242720" }}
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
            <i className="dot lime" /> โพสต์ที่มีแหล่งอ้างอิงในชุดตัวอย่าง
          </p>
        </section>
        <section className="panel">
          <PanelHead title="กิจกรรมเผยแพร่" />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={p.bars.map((v, i) => ({ week: "W" + (i + 1), posts: v }))}
              >
                <XAxis dataKey="week" stroke={axisColor} fontSize={11} />
                <YAxis width={25} stroke={axisColor} fontSize={11} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: "#e8e7d9" }} />
                <Bar
                  isAnimationActive={false}
                  name="โพสต์สมมติ"
                  dataKey="posts"
                  fill="#586f47"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">จำนวนโพสต์ใน 6 สัปดาห์สมมติ</p>
        </section>
      </div>
      <section className="panel">
        <PanelHead title="ลำดับกิจกรรม" />
        <ol className="timeline">
          {p.timeline.map((t, i) => (
            <li key={t}>
              <small>บันทึก {i + 1}</small>
              {t}
            </li>
          ))}
        </ol>
        <div className="section-actions">
          <Button onClick={() => go("risklab")}>
            เปิด RiskLab <ArrowRight size={15} />
          </Button>
        </div>
      </section>
    </>
  );
}
