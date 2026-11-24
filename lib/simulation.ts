export const approaches = ["monthly", "lump", "timing"] as const;
export type Approach = (typeof approaches)[number];
export const approachNames: Record<Approach, string> = {
  monthly: "ลงทุนสม่ำเสมอ",
  lump: "ลงทุนก้อนเดียว",
  timing: "จับจังหวะตามอารมณ์",
};
export type Inputs = {
  amount: number;
  years: number;
  rate: number;
  vol: number;
  approach: Approach;
};
export const defaults: Inputs = {
  amount: 3000,
  years: 5,
  rate: 6,
  vol: 18,
  approach: "monthly",
};
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };
}
export function simulate(
  { amount, years, rate, vol, approach }: Inputs,
  seed = 42,
) {
  if (
    ![amount, years, rate, vol].every(Number.isFinite) ||
    amount <= 0 ||
    years < 1 ||
    years > 30 ||
    !Number.isInteger(years) ||
    rate <= -100 ||
    vol < 0
  )
    throw new RangeError("Invalid scenario inputs");
  const rng = random(seed),
    months = years * 12,
    contribution = amount * months,
    sigma = vol / 100;
  const drift = (Math.log1p(rate / 100) - (sigma * sigma) / 2) / 12,
    noise = sigma / Math.sqrt(12);
  const paths: Record<string, number>[] = Array.from(
    { length: months + 1 },
    (_, i) => ({
      month: i,
      contribution: approach === "lump" ? contribution : i * amount,
    }),
  );
  const totals: Record<Approach, number[]> = {
    monthly: [],
    lump: [],
    timing: [],
  };
  for (let path = 0; path < 240; path++) {
    let monthly = 0,
      lump = contribution,
      timing = 0,
      cash = 0,
      previous = 1;
    if (path < 8) paths[0]["p" + path] = approach === "lump" ? lump : 0;
    for (let t = 1; t <= months; t++) {
      const normal =
        Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng());
      const growth = Math.exp(drift + noise * normal);
      monthly = (monthly + amount) * growth;
      lump *= growth;
      cash += amount;
      if (previous >= 1) {
        timing += cash;
        cash = 0;
      }
      timing *= growth;
      previous = growth;
      if (path < 8)
        paths[t]["p" + path] = Math.round(
          { monthly, lump, timing: timing + cash }[approach],
        );
    }
    totals.monthly.push(monthly);
    totals.lump.push(lump);
    totals.timing.push(timing + cash);
  }
  for (const key of approaches) totals[key].sort((a, b) => a - b);
  const values = totals[approach],
    min = values[0],
    max = values[values.length - 1],
    width = (max - min) / 10 || 1;
  const histogram = Array.from({ length: 10 }, (_, i) => ({
    value: Math.round(min + i * width),
    count: 0,
  }));
  for (const value of values)
    histogram[Math.min(9, Math.floor((value - min) / width))].count++;
  return {
    paths,
    histogram,
    contribution,
    median: values[119],
    downside: values[11],
    below: Math.round(
      values.filter((v) => v < contribution - 0.01).length / 2.4,
    ),
    comparison: approaches.map((key) => ({
      name: approachNames[key],
      value: Math.round(totals[key][119]),
    })),
  };
}

export function simulateBands(
  { amount, years, rate, vol, approach }: Inputs,
  seed = 42,
) {
  const rng = random(seed),
    months = years * 12,
    contribution = amount * months,
    sigma = vol / 100;
  const drift = (Math.log1p(rate / 100) - (sigma * sigma) / 2) / 12,
    noise = sigma / Math.sqrt(12);
  const byMonth: number[][] = Array.from({ length: months + 1 }, () => []);

  for (let path = 0; path < 240; path++) {
    let monthly = 0,
      lump = contribution,
      timing = 0,
      cash = 0,
      previous = 1;
    byMonth[0].push(approach === "lump" ? lump : 0);
    for (let t = 1; t <= months; t++) {
      const normal =
        Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng());
      const growth = Math.exp(drift + noise * normal);
      monthly = (monthly + amount) * growth;
      lump *= growth;
      cash += amount;
      if (previous >= 1) {
        timing += cash;
        cash = 0;
      }
      timing *= growth;
      previous = growth;
      byMonth[t].push({ monthly, lump, timing: timing + cash }[approach]);
    }
  }

  return byMonth.map((vals, m) => {
    vals.sort((a, b) => a - b);
    const p10 = Math.round(vals[24]);
    const median = Math.round(vals[119]);
    const p90 = Math.round(vals[215]);
    return {
      month: m,
      contribution: approach === "lump" ? contribution : m * amount,
      median,
      p10,
      p90,
      band: [p10, p90] as [number, number],
    };
  });
}
