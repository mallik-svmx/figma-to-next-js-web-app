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
import {
  getRangeTickStyle,
  getSp500Series,
  ranges,
  SP500_DOMAIN,
  SP500_TICKS,
  sp500Headline,
  type Range,
} from "@/app/_lib/dashboard-data";
import { CardHeader, Trend } from "../card-parts";
import { ChartTooltipCard, EdgeAnchoredTick } from "./chart-utils";

const LINE = "#2476cf";
const TICK_EVERY = 4; // 21 points → 6 labels, as in the design

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const fullDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const indexFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function tickFormatter(range: Range) {
  const style = getRangeTickStyle(range);
  return (value: unknown) => {
    const date = new Date(Number(value));
    if (style === "day") return monthDay.format(date);
    if (style === "year") return String(date.getUTCFullYear());
    // "Jul 24" → "Jul '24"
    return monthYear.format(date).replace(" ", " '");
  };
}

export function Sp500Card() {
  const [range, setRange] = useState<Range>("1Y");
  const data = useMemo(() => getSp500Series(range), [range]);
  const lastIndex = data.length - 1;
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
              {sp500Headline[range]}
            </strong>
            <Trend direction="up">+12.8%</Trend>
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
            data={data}
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
              interval={TICK_EVERY - 1}
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
              domain={SP500_DOMAIN}
              ticks={SP500_TICKS}
              width={36}
              axisLine={false}
              tickLine={false}
              tick={({ y, payload }) => (
                <text x={0} y={Number(y)} dy={3} fontSize={10} fill="#94a3b8">
                  {`${Number(payload.value) / 1000}K`}
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
              strokeWidth={2.3}
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
