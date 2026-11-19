import { CardHeader, Trend } from "./_components/card-parts";
import { InflationCard } from "./_components/charts/inflation-card";
import { Sp500Card } from "./_components/charts/sp500-card";
import { YieldCurveCard } from "./_components/charts/yield-curve-card";
import { DashboardShell } from "./_components/dashboard-shell";
import { Icon } from "./_components/icon";
import { getDashboardData } from "./_lib/fred";
import type { LaborData } from "./_lib/types";

function LaborMarketCard({ data }: { data: LaborData }) {
  return (
    <article className="dashboard-card">
      <CardHeader
        title="Labor market"
        subtitle="Latest readings · bars show level vs. 2-year high"
      />
      <div className="mt-7 space-y-6">
        {data.items.map((item) => (
          <div key={item.label} title={item.date}>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {item.label}{" "}
                <span className="text-[10px] text-slate-400">
                  · {item.date}
                </span>
              </span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-100"
              role="meter"
              aria-label={`${item.label}, percent of two-year high`}
              aria-valuenow={item.width}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${item.width}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 rounded-xl bg-blue-50/70 p-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          <strong className="font-semibold text-blue-700">
            {data.headline}
          </strong>{" "}
          {data.summary}
        </p>
      </div>
    </article>
  );
}

export default async function Home() {
  const data = await getDashboardData();

  return (
    <DashboardShell asOf={data.asOf}>
      <main className="mx-auto max-w-[1540px] p-4 md:p-7 lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">
              United States economy
            </p>
            <h1 className="text-2xl font-semibold tracking-[-.025em] text-slate-900 md:text-[28px]">
              Economic Overview
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Real-time insights from the Federal Reserve Economic Data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="secondary-button">
              <Icon name="download" size={15} /> Export data
            </button>
            <button type="button" className="primary-button">
              Customize dashboard
            </button>
          </div>
        </div>

        <section
          aria-label="Key indicators"
          className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {data.metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="flex items-center justify-between">
                <div className={`metric-icon metric-${metric.color}`}>
                  <Icon name={metric.icon} size={17} />
                </div>
                <span className="text-[10px] text-slate-400">
                  {metric.detail}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-medium text-slate-500">
                {metric.label}
              </p>
              <div className="mt-1 flex items-end justify-between">
                <strong className="text-[25px] font-semibold tracking-tight text-slate-900">
                  {metric.value}
                </strong>
                <Trend direction={metric.up ? "up" : "down"}>
                  {metric.trend}
                </Trend>
              </div>
              <p className="mt-1 text-[9px] text-slate-400">{metric.caption}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
          <Sp500Card data={data.sp500} />
          <LaborMarketCard data={data.labor} />
          <InflationCard data={data.inflation} />
          <YieldCurveCard data={data.yields} />
        </section>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          Source: FRED®, Federal Reserve Bank of St. Louis · S&amp;P 500® ©
          S&amp;P Dow Jones Indices LLC · Refreshed hourly
        </p>
      </main>
    </DashboardShell>
  );
}
