"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { inflationComponents } from "@/app/_lib/dashboard-data";
import { CardHeader } from "../card-parts";
import { ChartTooltipCard } from "./chart-utils";

const SIZE = 128;
const RING = 15;

export function InflationCard() {
  return (
    <article className="dashboard-card">
      <CardHeader title="Inflation trends" subtitle="12-month percent change" />
      <div className="mt-6 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <PieChart
            width={SIZE}
            height={SIZE}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Pie
              data={inflationComponents}
              dataKey="share"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={SIZE / 2 - RING}
              outerRadius={SIZE / 2}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {inflationComponents.map((c) => (
                <Cell key={c.name} fill={c.slice} />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 10 }}
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as
                  (typeof inflationComponents)[number] | undefined;
                if (!active || !item) return null;
                return (
                  <ChartTooltipCard title={item.name}>
                    {item.value} y/y
                  </ChartTooltipCard>
                );
              }}
            />
          </PieChart>
          <div className="pointer-events-none absolute inset-[15px] flex flex-col items-center justify-center rounded-full">
            <span className="text-[22px] font-semibold text-slate-900">
              2.4%
            </span>
            <span className="text-[9px] text-slate-400">Headline CPI</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-4">
          {inflationComponents.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center gap-2 text-slate-500">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                {c.name}
              </span>
              <strong className="text-slate-800">{c.value}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400">
        <span>Fed target</span>
        <span className="font-semibold text-slate-600">2.0%</span>
      </div>
    </article>
  );
}
