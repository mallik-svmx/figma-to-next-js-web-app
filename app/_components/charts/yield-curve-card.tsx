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
import {
  YIELD_DOMAIN,
  YIELD_TICKS,
  yieldCurve,
} from "@/app/_lib/dashboard-data";
import { CardHeader } from "../card-parts";
import { ChartTooltipCard, EdgeAnchoredTick } from "./chart-utils";

const LINE = "#7557c7";

export function YieldCurveCard() {
  return (
    <article className="dashboard-card">
      <CardHeader
        title="Treasury yield curve"
        subtitle="Constant maturity rates · June 12, 2025"
      />
      <div className="mt-6 h-[144px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={yieldCurve}
            margin={{ top: 0, right: 4, bottom: 0, left: 4 }}
          >
            <CartesianGrid
              vertical={false}
              horizontalValues={YIELD_TICKS}
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
            <YAxis hide domain={YIELD_DOMAIN} ticks={YIELD_TICKS} />
            <Tooltip
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as
                  (typeof yieldCurve)[number] | undefined;
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
          10Y <strong className="ml-1 text-slate-700">4.36%</strong>
        </span>
        <span className="text-slate-400">
          2Y <strong className="ml-1 text-slate-700">3.91%</strong>
        </span>
        <span className="text-slate-400">
          Spread <strong className="ml-1 text-emerald-600">+45 bps</strong>
        </span>
      </div>
    </article>
  );
}
