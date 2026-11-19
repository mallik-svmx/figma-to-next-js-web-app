"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { niceTicks } from "@/app/_lib/scale";
import { ranges, type Range, type Sp500Data } from "@/app/_lib/types";
import { CardHeader, Trend } from "../card-parts";
import { ChartTooltipCard, EdgeAnchoredTick } from "./chart-utils";

const LINE = "#2476cf";
const LABELS = 6; // x-axis labels, as in the design

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" });
const monthYear = fmt({ month: "short", year: "2-digit" });
const monthDay = fmt({ month: "short", day: "numeric" });
const yearOnly = fmt({ year: "numeric" });
const fullDate = fmt({ dateStyle: "medium" });
const indexFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function tickFormatter(range: Range) {
  return (value: unknown) => {
    const date = new Date(Number(value));
    if (range === "1M") return monthDay.format(date);
    if (range === "5Y" || range === "Max") return yearOnly.format(date);
    return monthYear.format(date).replace(" ", " '"); // "Jul 26" → "Jul '26"
  };
}

const formatK = (v: number) => `${+(v / 1000).toFixed(2)}K`;

export function Sp500Card({ data }: { data: Sp500Data }) {
  const [range, setRange] = useState<Range>("1Y");

  const points = useMemo(
    () => data.series[range].map(([t, value]) => ({ t, value })),
    [data, range],
  );
  const ticks = useMemo(() => {
    const values = points.map((p) => p.value);
    return niceTicks(Math.min(...values), Math.max(...values), 4);
  }, [points]);

  const lastIndex = points.length - 1;
  // The server sends 5k + 1 points, so labels every k points include the latest one.
  const interval = Math.max(0, Math.round(lastIndex / (LABELS - 1)) - 1);
  const change = data.change[range];
  const formatTick = tickFormatter(range);

  return (
    <article className="dashboard-card min-w-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <CardHeader
            title="S&P 500 Index"
            subtitle="Daily close · Index, not seasonally adjusted"
          />
          <div className="mt-5 flex items-baseline gap-3">
            <strong className="text-[28px] font-semibold tracking-tight text-slate-900">
              {indexFormat.format(data.latest)}
            </strong>
            <Trend direction={change >= 0 ? "up" : "down"}>
              {`${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(1)}%`}
            </Trend>
            <span className="text-[10px] text-slate-400">
              {range === "Max" ? "10Y" : range} change
            </span>
          </div>
        </div>
        <div
          className="flex self-start rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Time range"
        >
          {ranges.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setRange(item)}
              aria-pressed={range === item}
              className={`range-button ${range === item ? "range-active" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[220px]">
        <ResponsiveContainer width="100%" height={196}>
          <AreaChart
            data={points}
            margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="sp500Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2878d4" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2878d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#e7edf4"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="t"
              type="category"
              interval={interval}
              axisLine={false}
              tickLine={false}
              height={16}
              tick={(props) => (
                <EdgeAnchoredTick
                  {...props}
                  formatter={formatTick}
                  fontSize={10}
                />
              )}
            />
            <YAxis
              domain={[ticks[0], ticks[ticks.length - 1]]}
              ticks={ticks}
              width={36}
              axisLine={false}
              tickLine={false}
              tick={({ y, payload }) => (
                <text x={0} y={Number(y)} dy={3} fontSize={10} fill="#94a3b8">
                  {formatK(Number(payload.value))}
                </text>
              )}
            />
            <Tooltip
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as
                  { t: number; value: number } | undefined;
                if (!active || !point) return null;
                return (
                  <ChartTooltipCard title={fullDate.format(new Date(point.t))}>
                    {indexFormat.format(point.value)}
                  </ChartTooltipCard>
                );
              }}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke={LINE}
              strokeWidth={range === "1M" || range === "6M" ? 2.3 : 1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="url(#sp500Fill)"
              animationDuration={500}
              activeDot={{ r: 4, fill: "#fff", stroke: LINE, strokeWidth: 2 }}
              dot={(props) => {
                const { cx, cy, index } = props;
                if (index !== lastIndex) return <g key={`dot-${index}`} />;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill="#fff"
                    stroke={LINE}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
