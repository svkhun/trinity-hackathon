"use client";
import { ArrowRight } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "./ui/button";
import { Disclosure, PanelHead, Ring, type Go } from "./shared";
import type { Report } from "@/lib/analysis";
import { axisColor, tipStyle } from "./chart-style";
const labels = ["FOMO", "Urgency", "Claims", "Emotion", "Consistency"];

export function Analytics({ report, go }: { report: Report; go: Go }) {
  const data = report.metrics.map((m, i) => ({
    ...m,
    axis: labels[i],
    max: 100,
  }));
  return (
    <>
      <div className="metric-grid">
        {data.map((m, i) => (
          <div className="panel metric-card" key={m.label}>
            <Ring
              value={m.score}
              color={
                [
                  "var(--pink)",
                  "var(--orange)",
                  "var(--purple)",
                  "var(--pink)",
                  "var(--lime)",
                ][i]
              }
              small
              label="/ 100"
            />
            <h3>{m.label}</h3>
          </div>
        ))}
      </div>
      <div className="split equal">
        <section className="panel">
          <PanelHead title="รูปแบบสัญญาณภาษา" />
          <div className="chart tall">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="70%">
                <PolarGrid stroke="#bbbba8" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: axisColor, fontSize: 11 }}
                />
                <Radar
                  isAnimationActive={false}
                  dataKey="max"
                  stroke="none"
                  fill="transparent"
                  tooltipType="none"
                />
                <Radar
                  isAnimationActive={false}
                  name="คะแนนจำลอง"
                  dataKey="score"
                  stroke="#8d3020"
                  fill="#b9704c"
                  fillOpacity={0.38}
                />
                <Tooltip contentStyle={tipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel">
          <PanelHead title="อธิบายคะแนน" />
          {data.map((m) => (
            <Disclosure
              key={m.label}
              title={
                <>
                  <b>{m.label}</b>
                  <em>{m.score}/100</em>
                </>
              }
            >
              <p>{m.description}</p>
              {m.phrases.length > 0 && <p>พบคำว่า {m.phrases.join(" · ")}</p>}
            </Disclosure>
          ))}
        </section>
      </div>
      <section className="panel">
        <PanelHead title="AI-Generated Content Signals" />
        <p className="body-text">
          ตรวจรูปแบบภาษาที่อาจพบในงานเขียนที่ผ่านการเรียบเรียง เช่น
          ความสม่ำเสมอของประโยคและการย้ำอารมณ์ รูปแบบเหล่านี้พบในงานเขียนของคนได้เช่นกัน
        </p>
        <Disclosure title="ดูรูปแบบและข้อจำกัด">
          <p>
            แบ่งข้อความได้ {report.fragments} ช่วง · {report.metrics[4].description}{" "}
            ระบบนี้ไม่มีตัวอย่างเทียบเคียงสำหรับระบุผู้เขียนหรือโมเดลที่สร้างข้อความ
          </p>
        </Disclosure>
        <Disclosure title="หลักฐานประกอบ">
          <p>
            {report.reference?.body ??
              "ไม่มีเอกสารให้เทียบในรายงานนี้ คะแนนมาจากคำที่กฎตรวจพบเท่านั้น"}
          </p>
        </Disclosure>
        <div className="section-actions">
          <Button onClick={() => go("sources")}>
            ตรวจ Source Intelligence <ArrowRight size={15} />
          </Button>
        </div>
      </section>
    </>
  );
}
