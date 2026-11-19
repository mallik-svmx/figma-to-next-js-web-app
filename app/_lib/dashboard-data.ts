import type { IconName } from "@/app/_components/icon";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type NavItem = { icon: IconName; label: string; count?: string };
export type NavSection = { label: string; items: NavItem[] };

export const navSections: NavSection[] = [
  { label: "Overview", items: [{ icon: "grid", label: "Dashboard" }] },
  {
    label: "Economic data",
    items: [
      { icon: "activity", label: "Indicators", count: "12" },
      { icon: "chart", label: "Market data" },
      { icon: "briefcase", label: "Employment" },
      { icon: "building", label: "Housing" },
      { icon: "bank", label: "Monetary policy" },
      { icon: "globe", label: "International" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { icon: "layers", label: "My watchlist", count: "8" },
      { icon: "chart", label: "Saved charts" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Headline metrics                                                    */
/* ------------------------------------------------------------------ */

export type Metric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  up: boolean;
  color: "blue" | "amber" | "violet" | "emerald";
  icon: IconName;
};

export const metrics: Metric[] = [
  {
    label: "Real GDP",
    value: "$23.55T",
    detail: "Q1 2025",
    trend: "2.3%",
    up: true,
    color: "blue",
    icon: "chart",
  },
  {
    label: "Inflation rate",
    value: "2.4%",
    detail: "May 2025",
    trend: "0.1%",
    up: false,
    color: "amber",
    icon: "activity",
  },
  {
    label: "Unemployment",
    value: "4.2%",
    detail: "May 2025",
    trend: "0.1%",
    up: false,
    color: "violet",
    icon: "briefcase",
  },
  {
    label: "Federal funds rate",
    value: "4.33%",
    detail: "Jun 2025",
    trend: "0.0%",
    up: true,
    color: "emerald",
    icon: "bank",
  },
];

/* ------------------------------------------------------------------ */
/* S&P 500                                                             */
/* ------------------------------------------------------------------ */

export const ranges = ["1M", "6M", "1Y", "5Y", "Max"] as const;
export type Range = (typeof ranges)[number];

export const SP500_DOMAIN: [number, number] = [16000, 32000];
export const SP500_TICKS = [16000, 20000, 24000, 28000, 32000];

/*
 * Series shapes from the design, expressed as y-offsets on a 0–110 canvas
 * where 0 = 32K and 110 = 16K. Converted to index values below.
 */
const seriesShapes: Record<Range, number[]> = {
  "1M": [
    98, 92, 86, 90, 75, 80, 68, 71, 53, 58, 43, 49, 38, 35, 21, 28, 17, 20, 10,
    15, 8,
  ],
  "6M": [
    89, 94, 78, 82, 66, 72, 58, 64, 45, 49, 35, 38, 30, 33, 20, 25, 16, 19, 7,
    13, 5,
  ],
  "1Y": [
    85, 91, 83, 88, 71, 78, 69, 53, 59, 42, 46, 38, 47, 28, 32, 18, 25, 13, 20,
    9, 4,
  ],
  "5Y": [
    68, 63, 72, 60, 75, 68, 78, 66, 53, 61, 47, 51, 37, 45, 28, 34, 23, 29, 18,
    24, 12,
  ],
  Max: [
    84, 72, 78, 60, 69, 52, 61, 45, 52, 36, 44, 30, 40, 24, 33, 19, 29, 14, 22,
    10, 16,
  ],
};

/** Date window and axis label style for each range. */
const rangeWindows: Record<
  Range,
  { start: string; end: string; tick: "day" | "month" | "year" }
> = {
  "1M": { start: "2025-05-12", end: "2025-06-12", tick: "day" },
  "6M": { start: "2024-12-12", end: "2025-06-12", tick: "month" },
  "1Y": { start: "2024-07-01", end: "2025-05-01", tick: "month" },
  "5Y": { start: "2020-06-12", end: "2025-06-12", tick: "month" },
  Max: { start: "1957-03-04", end: "2025-06-12", tick: "year" },
};

export const sp500Headline: Record<Range, string> = {
  "1M": "30,284.6",
  "6M": "30,179.2",
  "1Y": "30,179.2",
  "5Y": "30,106.4",
  Max: "30,179.2",
};

export type SeriesPoint = { t: number; value: number };

export function getSp500Series(range: Range): SeriesPoint[] {
  const shape = seriesShapes[range];
  const { start, end } = rangeWindows[range];
  const t0 = Date.parse(start);
  const t1 = Date.parse(end);
  const steps = shape.length - 1;
  const s = new Date(t0);
  const e = new Date(t1);
  const spanMonths =
    (e.getUTCFullYear() - s.getUTCFullYear()) * 12 +
    e.getUTCMonth() -
    s.getUTCMonth();
  // Short windows interpolate by time; longer ones step in calendar months so
  // axis ticks land on month boundaries (e.g. Jul, Sep, Nov… for 1Y).
  const timeAt = (i: number) => {
    if (spanMonths < 2) return Math.round(t0 + (i * (t1 - t0)) / steps);
    const m = (i * spanMonths) / steps;
    const whole = Math.floor(m);
    const a = Date.UTC(
      s.getUTCFullYear(),
      s.getUTCMonth() + whole,
      s.getUTCDate(),
    );
    const b = Date.UTC(
      s.getUTCFullYear(),
      s.getUTCMonth() + whole + 1,
      s.getUTCDate(),
    );
    return Math.round(a + (m - whole) * (b - a));
  };
  const [min, max] = SP500_DOMAIN;
  return shape.map((y, i) => ({
    t: timeAt(i),
    value: Math.round((max - (y / 110) * (max - min)) * 10) / 10,
  }));
}

export function getRangeTickStyle(range: Range) {
  return rangeWindows[range].tick;
}

/* ------------------------------------------------------------------ */
/* Labor market                                                        */
/* ------------------------------------------------------------------ */

export const laborMarket = [
  { label: "Nonfarm payrolls", value: "+139K", width: 74, color: "#2777cf" },
  { label: "Job openings", value: "7.39M", width: 62, color: "#5a8fd2" },
  { label: "Initial claims", value: "248K", width: 45, color: "#8eb1dc" },
];

/* ------------------------------------------------------------------ */
/* Inflation                                                           */
/* ------------------------------------------------------------------ */

/** `share` sets each slice's arc (degrees out of 360), matching the design. */
export const inflationComponents = [
  {
    name: "Core CPI",
    value: "2.8%",
    share: 215,
    slice: "#286fbd",
    dot: "bg-blue-600",
  },
  {
    name: "Food",
    value: "2.9%",
    share: 78,
    slice: "#35a8bd",
    dot: "bg-cyan-500",
  },
  {
    name: "Energy",
    value: "-3.5%",
    share: 67,
    slice: "#dce5ee",
    dot: "bg-slate-300",
  },
];

/* ------------------------------------------------------------------ */
/* Treasury yield curve                                                */
/* ------------------------------------------------------------------ */

export const yieldCurve = [
  { tenor: "1M", rate: 3.86 },
  { tenor: "3M", rate: 4.41 },
  { tenor: "1Y", rate: 4.13 },
  { tenor: "5Y", rate: 3.97 },
  { tenor: "10Y", rate: 4.36 },
  { tenor: "30Y", rate: 4.56 },
];
/** Gridlines and domain chosen so the curve sits where the design places it. */
export const YIELD_TICKS = [3.39, 3.86, 4.33, 4.8];
export const YIELD_DOMAIN: [number, number] = [3.32, 4.94];
