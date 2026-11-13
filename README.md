# HypeCheck AI

**Think Before You Invest.** เว็บเดโมภาษาไทยสำหรับสำรวจถ้อยคำชวนลงทุน ตรวจหลักฐาน และเรียนรู้ความไม่แน่นอนผ่านการจำลองพอร์ต

## Run locally

Use Node.js 22.12+ or Node.js 24 with npm. From the project directory, run the following in PowerShell.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [HypeCheck AI locally](http://localhost:3000). Next.js prints the active URL if port 3000 is occupied. Installation downloads dependencies once. The installed app runs locally without API keys, authentication, remote fonts, or a database.

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

## Demo walkthrough

1. Open Overview and choose one of four Thai sample posts or paste up to 3,000 characters. Select **Analyze with AI**.
2. Expand the highlighted findings in Fact Check. Open the evidence tab, inspect the reference, and copy the report summary. The initial dashboard displays the stock-promotion fixture until the next successful analysis.
3. In AI Analysis, inspect the five linguistic signals, their matched phrases, and the exploratory writing-pattern explanation.
4. Source Intelligence starts on the fixture’s source. Switch between three fictional publishers. Custom posts have unknown provenance and can browse the illustrative profiles separately.
5. In RiskLab, change the amount, duration, return, volatility, or approach. The value paths, histogram, downside and comparisons recalculate together.

## Data and interpretation

All four scenarios and all source profiles are fictional. The analyzer runs in browser memory. Reloading clears submitted text. There is no external inference, retrieval, storage, market price feed, or trading connection.

The local service matches explicit Thai and English expressions. Each of the first four signals has a fixed base weight and adds five points for each additional distinct matched phrase, capped at 98. The risk index averages these four signals. The separate consistency metric compares shortest and longest punctuation-delimited text segments by character count. One or zero segments yields zero with an insufficient-sample explanation. Scores are illustrative rule outputs. They have no calibrated relationship with fraud, authorship, factual accuracy, investment losses, or future returns.

Only an exact fixture (after trimming whitespace) can attach a synthetic reference. The MINT terms contradict the no-risk assertion. The DCA contribution schedule supports the principal calculation. Each reference applies only to its quoted claim. Unverified claims retain **Insufficient Evidence**.

## RiskLab assumptions

- 240 paths, seed 42, uniform LCG followed by a Box–Muller transform. Each strategy sees the same monthly returns. Eight sample paths are shown.
- Monthly growth factor is `exp((log(1 + annualReturn) - volatility² / 2) / 12 + volatility / sqrt(12) × Z)`. Rates in the formula are decimals and Z is standard normal.
- Regular investing deposits at the beginning of each month. Lump sum invests the entire contribution on day one. Emotional timing starts invested, holds incoming contributions as cash after negative months, then deploys accumulated cash after a nonnegative month. Existing holdings stay invested. All three strategies receive equal total contributions but cash availability differs.
- Cash yields zero. No fees, taxes, inflation or withdrawals. The histogram groups ending values in ten equal-width bins. Downside is the empirical fifth percentile, and the displayed median uses the lower middle observation. Simulation outcomes depend on assumptions. They are educational illustrations.

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js App Router, dashboard shell, hash navigation, shared session state and responsive styles |
| `components/` | Workspace views, reusable panels, interactive charts and procedural terrain artwork |
| `components/ui/` | Local shadcn-style Button primitive with Radix Slot and variant support |
| `lib/data.ts` | Typed scenarios, synthetic references and source profiles |
| `lib/analysis.ts` | Zod validation, deterministic analysis and asynchronous service contract |
| `lib/simulation.ts` | Seeded Monte Carlo engine, strategy accounting and distribution statistics |
| `tests/` | Domain regressions for evidence boundaries and simulation consistency |

The UI consumes an asynchronous `AnalysisService` returning a typed report. A future provider can replace the local service and validate a backend response at that boundary. A backend integration would also need explicit data-handling decisions and evidence provenance before displaying external conclusions.

