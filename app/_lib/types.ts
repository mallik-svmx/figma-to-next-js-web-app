import type { IconName } from "@/app/_components/icon";

/** Shapes passed from the server (FRED) to the dashboard components. */

export type Metric = {
  label: string;
  value: string;
  detail: string; // observation period, e.g. "Q3 2026"
  trend: string; // formatted change, e.g. "0.1 pt"
  up: boolean;
  caption: string; // e.g. "vs. prior month"
  color: "blue" | "amber" | "violet" | "emerald";
  icon: IconName;
};

export const ranges = ["1M", "6M", "1Y", "5Y", "Max"] as const;
export type Range = (typeof ranges)[number];

/** [UTC ms timestamp, value] — compact to keep the client payload small. */
export type Point = [number, number];

export type Sp500Data = {
  series: Record<Range, Point[]>;
  /** % change from the first to the last point of each range. */
  change: Record<Range, number>;
  latest: number;
};

export type LaborItem = {
  label: string;
  value: string;
  date: string;
  /** 0–100: latest reading relative to its two-year high. */
  width: number;
  color: string;
};

export type LaborData = {
  items: LaborItem[];
  headline: string;
  summary: string;
};

export type InflationComponent = {
  name: string;
  value: string; // y/y, e.g. "2.8%"
  weight: number; // share of the CPI basket, %
  slice: string;
  dot: string;
};

export type InflationData = {
  headline: string; // headline CPI y/y
  period: string; // e.g. "Oct 2026"
  components: InflationComponent[];
};

export type YieldPoint = { tenor: string; rate: number };

export type YieldData = {
  date: string; // e.g. "Nov 17, 2026"
  curve: YieldPoint[];
  tenYear: number;
  twoYear: number;
  spreadBps: number;
};

export type DashboardData = {
  asOf: string;
  metrics: Metric[];
  sp500: Sp500Data;
  labor: LaborData;
  inflation: InflationData;
  yields: YieldData;
};
