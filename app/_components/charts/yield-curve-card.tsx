"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { niceTicks } from "@/app/_lib/scale";
import type { YieldData, YieldPoint } from "@/app/_lib/types";
import { CardHeader } from "../card-parts";
import { ChartTooltipCard, EdgeAnchoredTick } from "./chart-utils";

const LINE = "#7557c7";

export function YieldCurveCard({ data }: { data: YieldData }) {
  const rates = data.curve.map((p) => p.rate);
  // Four gridlines, with a little headroom above and below like the design.
  const ticks = niceTicks(Math.min(...rates), Math.max(...rates), 3);
  const span = ticks[3] - ticks[0];
  const domain: [number, number] = [
    ticks[0] - (span * 5) / 105,
    ticks[3] + (span * 10) / 105,
  ];
  const spreadPositive = data.spreadBps >= 0;

  return (
    <article className="dashboard-card">
      <CardHeader
        title="Treasury yield curve"
        subtitle={`Constant maturity rates · ${data.date}`}
      />
      <div className="mt-6 h-[144px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.curve}
            margin={{ top: 0, right: 4, bottom: 0, left: 4 }}
          >
            <CartesianGrid
              vertical={false}
              horizontalValues={ticks}
              stroke="#e7edf4"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="tenor"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={24}
              tick={(props) => (
                <EdgeAnchoredTick {...props} formatter={String} fontSize={9} />
              )}
            />
            <YAxis hide domain={domain} ticks={ticks} />
            <Tooltip
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as YieldPoint | undefined;
                if (!active || !point) return null;
                return (
                  <ChartTooltipCard title={`${point.tenor} Treasury`}>
                    {point.rate.toFixed(2)}%
                  </ChartTooltipCard>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={LINE}
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#fff", stroke: LINE, strokeWidth: 2 }}
              activeDot={{ r: 4.5, fill: "#fff", stroke: LINE, strokeWidth: 2 }}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-[18px] flex gap-6 border-t border-slate-100 pt-4 text-[10px]">
        <span className="text-slate-400">
          10Y{" "}
          <strong className="ml-1 text-slate-700">
            {data.tenYear.toFixed(2)}%
          </strong>
        </span>
        <span className="text-slate-400">
          2Y{" "}
          <strong className="ml-1 text-slate-700">
            {data.twoYear.toFixed(2)}%
          </strong>
        </span>
        <span className="text-slate-400">
          Spread{" "}
          <strong
            className={`ml-1 ${spreadPositive ? "text-emerald-600" : "text-rose-500"}`}
          >
            {spreadPositive ? "+" : "−"}
            {Math.abs(data.spreadBps)} bps
          </strong>
        </span>
      </div>
    </article>
  );
}
