"use client";
import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  FlaskConical,
  GitCompareArrows,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
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
import { Button } from "./ui/button";
import { Disclosure, PanelHead } from "./shared";
import { tipStyle } from "./analytics";
const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const axis = { fill: "#a7a3b5", fontSize: 11 };
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
    { key: "vol", label: "ความผันผวนต่อปี", min: 0, max: 60, step: 1, unit: "%" },
  ] as const;
  return (
    <>
      <div className="notice">
        <FlaskConical size={16} />
        Illustrative simulation only. Not a prediction or investment
        recommendation.
      </div>
      <div className="split lab-grid">
        <section className="panel lab-controls">
          <PanelHead
            icon={SlidersHorizontal}
            title="ตั้งค่าสถานการณ์"
            eyebrow="SIMULATION INPUTS"
            action={
              <button
                className="square"
                title="คืนค่าเริ่มต้น"
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
          <PanelHead
            icon={ChartNoAxesCombined}
            title="Portfolio Simulation"
            eyebrow="MONTE CARLO · SEED 42"
          />
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
          <div className="chart tall">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.paths}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#302d3c" strokeDasharray="3 6" />
                <XAxis dataKey="month" tick={axis} minTickGap={35} />
                <YAxis tick={axis} tickFormatter={compact} width={45} />
                <Tooltip
                  contentStyle={tipStyle}
                  labelFormatter={(n) => "เดือน " + n}
                  formatter={(n) => "฿" + money.format(Number(n))}
                />
                {Array.from({ length: 8 }, (_, i) => (
                  <Line
                    key={i}
                    dataKey={"p" + i}
                    name={"เส้นทาง " + (i + 1)}
                    stroke={["#ab94ff", "#7b6fca", "#e28cb9", "#a4b5e3"][i % 4]}
                    strokeOpacity={0.8}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
                <Line
                  dataKey="contribution"
                  stroke="#c8f36b"
                  name="เงินต้น"
                  dot={false}
                  strokeDasharray="4 5"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            เดือนที่ลงทุน · แสดง 8 จาก 240 เส้นทาง · เส้นประคือเงินต้นสะสม
          </p>
        </section>
      </div>
      <div className="split equal">
        <section className="panel">
          <PanelHead
            icon={Layers3}
            title="การกระจายมูลค่าปลายงวด"
            eyebrow="VALUE DISTRIBUTION"
          />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.histogram}>
                <XAxis dataKey="value" tick={axis} tickFormatter={compact} />
                <YAxis width={30} tick={axis} />
                <Tooltip
                  contentStyle={tipStyle}
                  cursor={{ fill: "#272432" }}
                  labelFormatter={(v) =>
                    "มูลค่าเริ่มช่วง ฿" + money.format(Number(v))
                  }
                />
                <Bar
                  name="จำนวนเส้นทาง"
                  dataKey="count"
                  fill="#a28bf5"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="body-text">
            เปอร์เซ็นไทล์ที่ 5 อยู่ที่ ฿{money.format(result.downside)} และ{" "}
            {result.below}% ของเส้นทางจบต่ำกว่าเงินต้น
          </p>
        </section>
        <section className="panel">
          <PanelHead
            icon={GitCompareArrows}
            title="เปรียบเทียบแนวทาง"
            eyebrow="SCENARIO COMPARISON"
          />
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.comparison} layout="vertical">
                <XAxis type="number" tick={axis} tickFormatter={compact} />
                <YAxis type="category" dataKey="name" width={110} tick={axis} />
                <Tooltip
                  contentStyle={tipStyle}
                  cursor={{ fill: "#272432" }}
                  formatter={(v) => "฿" + money.format(Number(v))}
                />
                <Bar
                  dataKey="value"
                  name="มัธยฐาน"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                >
                  {approaches.map((a, i) => (
                    <Cell key={a} fill={["#a28bf5", "#b7da79", "#e483ad"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            ค่ามัธยฐานจากเส้นทางตลาดชุดเดียวกันและเงินต้นเท่ากัน
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
