"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  approaches,
  approachNames,
  defaults,
  simulate,
  type Inputs,
} from "@/lib/simulation";

import { Disclosure, PanelHead } from "./shared";
import {
  axisColor,
  chartColors,
  chartGrid,
  chartHover,
  tipStyle,
} from "./chart-style";

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const axis = {
  fill: axisColor,
  fontSize: 12,
  fontFamily: '"IBM Plex Mono", monospace',
};
const displayedPaths = Array.from({ length: 8 }, (_, i) => ({
  key: "p" + i,
  label: "เส้นทาง " + (i + 1),
  color: chartColors[i % chartColors.length],
}));
const compact = (n: number) =>
  Intl.NumberFormat("en", { notation: "compact" }).format(n);

export function RiskLab() {
  const [inputs, set] = useState<Inputs>(defaults);
  const result = useMemo(() => simulate(inputs), [inputs]);
  const controls = [
    {
      key: "amount",
      label: "เงินลงทุนต่อเดือน",
      min: 500,
      max: 50000,
      step: 500,
      unit: "บาท",
    },
    {
      key: "years",
      label: "ระยะเวลาลงทุน",
      min: 1,
      max: 20,
      step: 1,
      unit: "ปี",
    },
    {
      key: "rate",
      label: "ผลตอบแทนต่อปีที่สมมติ",
      min: -10,
      max: 20,
      step: 0.5,
      unit: "%",
    },
    {
      key: "vol",
      label: "ความผันผวนต่อปี",
      min: 0,
      max: 60,
      step: 1,
      unit: "%",
    },
  ] as const;

  return (
    <>
      <div className="notice">
        ทดลองปรับสมมติฐานและสำรวจผลลัพธ์ที่เป็นไปได้ · ข้อมูลจำลองเพื่อการเรียนรู้ ไม่ใช่การคาดการณ์หรือคำแนะนำการลงทุน
      </div>

      <div className="split lab-grid">
        <section className="panel lab-controls">
          <PanelHead
            title="ตั้งค่าสถานการณ์"
            action={
              <button
                type="button"
                className="square"
                title="คืนค่าเริ่มต้น"
                aria-label="คืนค่าเริ่มต้น"
                onClick={() => set(defaults)}
              >
                <RotateCcw size={15} />
              </button>
            }
          />
          {controls.map((c) => (
            <label className="slider-label" key={c.key}>
              <span>
                {c.label}
                <b>
                  {inputs[c.key].toLocaleString("th-TH")} {c.unit}
                </b>
              </span>
              <input
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={inputs[c.key]}
                onChange={(e) =>
                  set({ ...inputs, [c.key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
          <label className="select-label">
            แนวทางลงทุน
            <select
              value={inputs.approach}
              onChange={(e) =>
                set({
                  ...inputs,
                  approach: e.target.value as Inputs["approach"],
                })
              }
            >
              {approaches.map((a) => (
                <option value={a} key={a}>
                  {approachNames[a]}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel">
          <PanelHead title="Portfolio Simulation" />
          <div className="sim-ribbon">
            <div className="sim-values">
              <div>
                <small>เงินต้นทั้งหมด</small>
                <strong>฿{money.format(result.contribution)}</strong>
              </div>
              <div>
                <small>มูลค่าปลายงวดมัธยฐาน</small>
                <strong className="lime-text">
                  ฿{money.format(result.median)}
                </strong>
              </div>
            </div>
            <div className="sim-tail-kpi">
              <div>
                <small>P5 ขาลง (5th Pct)</small>
                <strong>฿{money.format(result.downside)}</strong>
              </div>
              <div>
                <small>ต่ำกว่าเงินต้น</small>
                <strong className={result.below >= 30 ? "crimson-text" : ""}>
                  {result.below}%
                </strong>
              </div>
            </div>
          </div>

          <div className="chart tall">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.paths}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={chartGrid}
                  strokeDasharray="3 6"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={axis}
                  minTickGap={35}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axis}
                  tickFormatter={compact}
                  width={45}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tipStyle}
                  labelFormatter={(n) => "เดือน " + n}
                  formatter={(n) => "฿" + money.format(Number(n))}
                />
                {displayedPaths.map((path) => (
                  <Line
                    key={path.key}
                    dataKey={path.key}
                    name={path.label}
                    stroke={path.color}
                    strokeOpacity={0.75}
                    strokeWidth={1.65}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
                <Line
                  dataKey="contribution"
                  stroke="#0B121A"
                  strokeWidth={2.2}
                  name="เงินต้น"
                  dot={false}
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            <span>Seed 42 · เดือนที่ลงทุน · แสดง 8 จาก 240 เส้นทาง</span>
            <span>เส้นประสีเข้มคือเงินต้นสะสม</span>
          </p>
        </section>
      </div>

      <div className="split equal">
        <section className="panel">
          <PanelHead title="การกระจายมูลค่าปลายงวด" />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.histogram}>
                <XAxis
                  dataKey="value"
                  tick={axis}
                  tickFormatter={compact}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={30}
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tipStyle}
                  cursor={{ fill: chartHover }}
                  labelFormatter={(v) =>
                    "มูลค่าเริ่มช่วง ฿" + money.format(Number(v))
                  }
                />
                <Bar
                  name="จำนวนเส้นทาง"
                  dataKey="count"
                  radius={[5, 5, 0, 0]}
                  isAnimationActive={false}
                >
                  {result.histogram.map((bin, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        bin.value < result.contribution ? "#E11D48" : "#0D9488"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="body-text">
            เปอร์เซ็นไทล์ที่ 5 อยู่ที่ ฿{money.format(result.downside)} และ{" "}
            {result.below}% ของเส้นทางจบต่ำกว่าเงินต้น (แท่งสีแดงแสดงช่วงต่ำกว่าเงินต้น)
          </p>
        </section>

        <section className="panel">
          <PanelHead title="เปรียบเทียบแนวทาง" />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.comparison} layout="vertical">
                <XAxis
                  type="number"
                  tick={axis}
                  tickFormatter={compact}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={122}
                  tick={{
                    fill: axisColor,
                    fontSize: 12,
                    fontFamily: '"Inter", "IBM Plex Sans Thai", sans-serif',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tipStyle}
                  cursor={{ fill: chartHover }}
                  formatter={(v) => "฿" + money.format(Number(v))}
                />
                <Bar
                  dataKey="value"
                  name="มัธยฐาน"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                >
                  {approaches.map((a) => (
                    <Cell
                      key={a}
                      fill={a === inputs.approach ? "#1D4ED8" : "#94A3B8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            <span>ค่ามัธยฐานจากเส้นทางตลาดชุดเดียวกันและเงินต้นเท่ากัน</span>
            <span>ACTIVE HIGHLIGHTED</span>
          </p>
        </section>
      </div>

      <section className="panel">
        <Disclosure title="สมมติฐานและวิธีอ่านผล" initial>
          <p>
            ใช้ผลตอบแทนรายเดือนแบบ lognormal และสุ่มซ้ำด้วย seed 42
            ผลตอบแทนและความผันผวนคงที่ตลอดช่วง ไม่มีค่าธรรมเนียม ภาษี หรือเงินเฟ้อ
            เงินสดไม่ให้ดอกเบี้ย
          </p>
          <p>
            แบบสม่ำเสมอลงทุนต้นเดือน แบบก้อนเดียวมีเงินต้นทั้งหมดตั้งแต่วันแรก
            แบบจับจังหวะพักเงินสดหลังเดือนติดลบและลงทุนเงินที่สะสมเมื่อเดือนก่อนหน้าไม่ติดลบ
            เดือนแรกลงทุนทันที
          </p>
          <p>
            ช่วงปลายซ้ายของการกระจายแสดงผลลัพธ์ที่ต่ำในชุดจำลอง
            ตลาดจริงอาจเกิดเหตุการณ์รุนแรงกว่าที่แบบจำลองสร้างได้
          </p>
        </Disclosure>
      </section>
    </>
  );
}
