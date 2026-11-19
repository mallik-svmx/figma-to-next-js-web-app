/**
 * Server-side data access for FRED (Federal Reserve Economic Data).
 *
 * Uses FRED's public CSV download endpoint, which needs no API key:
 *   https://fred.stlouisfed.org/graph/fredgraph.csv?id=<SERIES>&cosd=<YYYY-MM-DD>
 *
 * Only import this module from Server Components.
 */
import { cacheLife } from "next/cache";
import type {
  DashboardData,
  InflationData,
  LaborData,
  Metric,
  Point,
  Range,
  Sp500Data,
  YieldData,
} from "./types";
import { ranges } from "./types";

const FRED_CSV = "https://fred.stlouisfed.org/graph/fredgraph.csv";

type Obs = { date: string; t: number; value: number };

/* ------------------------------------------------------------------ */
/* Fetching                                                            */
/* ------------------------------------------------------------------ */

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

async function fetchSeries(id: string, lookbackDays: number): Promise<Obs[]> {
  const url = `${FRED_CSV}?id=${encodeURIComponent(id)}&cosd=${isoDaysAgo(lookbackDays)}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`FRED ${id}: HTTP ${res.status}`);
      return parseCsv(await res.text());
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Failed to load FRED series ${id}`, { cause: lastError });
}

/** Parses `observation_date,VALUE` rows, skipping missing values ("" or "."). */
function parseCsv(text: string): Obs[] {
  const out: Obs[] = [];
  for (const line of text.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const value = Number(raw);
    if (
      !date ||
      raw === undefined ||
      raw.trim() === "" ||
      raw === "." ||
      Number.isNaN(value)
    )
      continue;
    out.push({ date, t: Date.parse(`${date}T00:00:00Z`), value });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const fmtMonth = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const fmtLongMonth = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
});
const fmtDay = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const fmtLongDay = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

const monthLabel = (o: Obs) => fmtMonth.format(o.t);
const quarterLabel = (o: Obs) => {
  const d = new Date(o.t);
  return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
};
const pct = (v: number, digits = 1) => `${v.toFixed(digits)}%`;
const last = <T>(xs: T[], n = 1) => xs[xs.length - n];

/*
 * Period comparisons are matched by calendar date, never by row position.
 * FRED leaves missing releases blank (e.g. BLS published no October 2025 CPI
 * or unemployment data), and counting rows back across such a gap would
 * silently compare the wrong months.
 */

/** Shifts a FRED "YYYY-MM-01" date back by whole calendar months. */
function monthsBefore(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString().slice(0, 10);
}

/** Percent change vs. the same date `months` earlier, for every observation whose base exists. */
function pctChangeSeries(obs: Obs[], months: number): Obs[] {
  const byDate = new Map(obs.map((o) => [o.date, o.value]));
  return obs.flatMap((o) => {
    const base = byDate.get(monthsBefore(o.date, months));
    return base === undefined ? [] : [{ ...o, value: (o.value / base - 1) * 100 }];
  });
}

/** Level difference vs. the same date `months` earlier, where both exist. */
function diffSeries(obs: Obs[], months: number): Obs[] {
  const byDate = new Map(obs.map((o) => [o.date, o.value]));
  return obs.flatMap((o) => {
    const base = byDate.get(monthsBefore(o.date, months));
    return base === undefined ? [] : [{ ...o, value: o.value - base }];
  });
}

/**
 * Latest observation and its change vs. the prior calendar month. If that
 * month was never published, compares with the most recent earlier
 * observation instead, and `prevLabel` names it so the caption stays honest.
 */
function latestChange(obs: Obs[]) {
  const cur = last(obs);
  const target = monthsBefore(cur.date, 1);
  const prev = obs.find((o) => o.date === target) ?? last(obs, 2);
  return { cur, delta: cur.value - prev.value, prevLabel: fmtMonth.format(prev.t) };
}

function trend(delta: number, unit: "pt" | "%"): Pick<Metric, "trend" | "up"> {
  const rounded = Math.round(delta * 10) / 10;
  return {
    trend: `${Math.abs(rounded).toFixed(1)}${unit === "pt" ? " pt" : "%"}`,
    up: rounded >= 0,
  };
}

/* ------------------------------------------------------------------ */
/* Section builders                                                    */
/* ------------------------------------------------------------------ */

function buildMetrics(gdp: Obs[], cpi: Obs[], unrate: Obs[], fedfunds: Obs[]): Metric[] {
  // Annualized growth vs. the prior quarter (3 calendar months earlier).
  const gdpGrowth = last(pctChangeSeries(gdp, 3));
  const gdpAnnualized = ((1 + gdpGrowth.value / 100) ** 4 - 1) * 100;
  const gdpNow = gdp.find((o) => o.date === gdpGrowth.date)!;

  const inflation = latestChange(pctChangeSeries(cpi, 12));
  const jobless = latestChange(unrate);
  const funds = latestChange(fedfunds);

  return [
    {
      label: "Real GDP",
      value: `$${(gdpNow.value / 1000).toFixed(2)}T`,
      detail: quarterLabel(gdpNow),
      ...trend(gdpAnnualized, "%"),
      caption: "annualized, vs. prior quarter",
      color: "blue",
      icon: "chart",
    },
    {
      label: "Inflation rate",
      value: pct(inflation.cur.value),
      detail: monthLabel(inflation.cur),
      ...trend(inflation.delta, "pt"),
      caption: `CPI y/y, vs. ${inflation.prevLabel}`,
      color: "amber",
      icon: "activity",
    },
    {
      label: "Unemployment",
      value: pct(jobless.cur.value),
      detail: monthLabel(jobless.cur),
      ...trend(jobless.delta, "pt"),
      caption: `vs. ${jobless.prevLabel}`,
      color: "violet",
      icon: "briefcase",
    },
    {
      label: "Federal funds rate",
      value: pct(funds.cur.value, 2),
      detail: monthLabel(funds.cur),
      ...trend(funds.delta, "pt"),
      caption: `monthly avg., vs. ${funds.prevLabel}`,
      color: "emerald",
      icon: "bank",
    },
  ];
}

const RANGE_DAYS: Record<Range, number> = {
  "1M": 31,
  "6M": 183,
  "1Y": 366,
  "5Y": 1827,
  Max: Infinity,
};
/** 5k + 1 points, so six evenly spaced axis labels land on both the first and latest point. */
const MAX_POINTS = 251;
const LABEL_GAPS = 5;

/** Evenly thins a series to at most `max` points, always keeping the last one. */
function downsample(points: Point[], max: number): Point[] {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

function buildSp500(obs: Obs[]): Sp500Data {
  const all: Point[] = obs.map((o) => [o.t, o.value]);
  const end = last(all)[0];
  const series = {} as Record<Range, Point[]>;
  const change = {} as Record<Range, number>;
  for (const r of ranges) {
    const start = end - RANGE_DAYS[r] * 86_400_000;
    let slice = all.filter(([t]) => t >= start);
    // Drop up to 4 of the oldest points so the count is 5k + 1 (see MAX_POINTS).
    if (slice.length <= MAX_POINTS) slice = slice.slice((slice.length - 1) % LABEL_GAPS);
    series[r] = downsample(slice, MAX_POINTS);
    change[r] = (last(slice)[1] / slice[0][1] - 1) * 100;
  }
  return { series, change, latest: last(all)[1] };
}

function buildLabor(payems: Obs[], openings: Obs[], claims: Obs[]): LaborData {
  // Monthly payroll changes, in thousands of jobs.
  const changes = diffSeries(payems, 1);
  const chg = last(changes);
  const recent = changes.slice(-24);
  const avg3 = changes.slice(-3).reduce((s, o) => s + o.value, 0) / 3;

  const share = (v: number, xs: Obs[]) =>
    Math.max(
      4,
      Math.min(
        100,
        Math.round(
          (Math.abs(v) / Math.max(...xs.map((o) => Math.abs(o.value)))) * 100,
        ),
      ),
    );

  const openNow = last(openings);
  const claimsNow = last(claims);
  const sign = (v: number) => (v >= 0 ? "+" : "−");

  const headline =
    avg3 >= 150
      ? "Labor remains resilient."
      : avg3 >= 50
        ? "Hiring is moderating."
        : "Hiring has cooled sharply.";

  return {
    items: [
      {
        label: "Nonfarm payrolls",
        value: `${sign(chg.value)}${Math.abs(Math.round(chg.value))}K`,
        date: monthLabel(chg),
        width: share(chg.value, recent),
        color: "#2777cf",
      },
      {
        label: "Job openings",
        value: `${(openNow.value / 1000).toFixed(2)}M`,
        date: monthLabel(openNow),
        width: share(openNow.value, openings.slice(-24)),
        color: "#5a8fd2",
      },
      {
        label: "Initial claims",
        value: `${Math.round(claimsNow.value / 1000)}K`,
        date: `Week of ${fmtDay.format(claimsNow.t)}`,
        width: share(claimsNow.value, claims.slice(-104)),
        color: "#8eb1dc",
      },
    ],
    headline,
    summary: `Payrolls ${chg.value >= 0 ? "rose" : "fell"} ${Math.abs(Math.round(chg.value))}K in ${fmtLongMonth.format(
      chg.t,
    )}, against a 3-month average of ${sign(avg3)}${Math.abs(Math.round(avg3))}K.`,
  };
}

/**
 * Slice sizes use each component's relative importance in the CPI-U basket
 * (BLS, December 2024), so the donut shows how much each part weighs in the
 * headline number. Values are each component's own 12-month change.
 */
const CPI_WEIGHTS = { core: 79.9, food: 13.7, energy: 6.4 };

function buildInflation(cpi: Obs[], core: Obs[], food: Obs[], energy: Obs[]): InflationData {
  const yoy = [cpi, core, food, energy].map((obs) => new Map(pctChangeSeries(obs, 12).map((o) => [o.date, o])));
  // Latest month for which headline and every component have a 12-month change.
  const month = [...yoy[0].keys()].reverse().find((d) => yoy.every((m) => m.has(d)));
  if (!month) throw new Error("No month with complete CPI data");
  const [headline, coreY, foodY, energyY] = yoy.map((m) => m.get(month)!);

  return {
    headline: pct(headline.value),
    period: monthLabel(headline),
    components: [
      { name: "Core CPI", value: pct(coreY.value), weight: CPI_WEIGHTS.core, slice: "#286fbd", dot: "bg-blue-600" },
      { name: "Food", value: pct(foodY.value), weight: CPI_WEIGHTS.food, slice: "#35a8bd", dot: "bg-cyan-500" },
      { name: "Energy", value: pct(energyY.value), weight: CPI_WEIGHTS.energy, slice: "#dce5ee", dot: "bg-slate-300" },
    ],
  };
}

const TENORS = [
  ["1M", "DGS1MO"],
  ["3M", "DGS3MO"],
  ["1Y", "DGS1"],
  ["5Y", "DGS5"],
  ["10Y", "DGS10"],
  ["30Y", "DGS30"],
] as const;

function buildYields(byId: Record<string, Obs[]>): YieldData {
  // Use the most recent date on which every maturity (and the 2Y) was published.
  const ids = [...TENORS.map(([, id]) => id), "DGS2"];
  const maps = Object.fromEntries(
    ids.map((id) => [id, new Map(byId[id].map((o) => [o.date, o.value]))]),
  );
  const dates = byId.DGS10.map((o) => o.date).reverse();
  const date = dates.find((d) => ids.every((id) => maps[id].has(d)));
  if (!date) throw new Error("No common Treasury observation date found");

  const at = (id: string) => maps[id].get(date)!;
  const tenYear = at("DGS10");
  const twoYear = at("DGS2");
  return {
    date: fmtLongDay.format(Date.parse(`${date}T00:00:00Z`)),
    curve: TENORS.map(([tenor, id]) => ({ tenor, rate: at(id) })),
    tenYear,
    twoYear,
    spreadBps: Math.round((tenYear - twoYear) * 100),
  };
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

/** Loads and shapes every dashboard series. Cached and refreshed hourly. */
export async function getDashboardData(): Promise<DashboardData> {
  "use cache";
  cacheLife("hours");

  const [
    gdp,
    cpi,
    core,
    food,
    energy,
    unrate,
    fedfunds,
    sp500,
    payems,
    openings,
    claims,
    ...yieldSeries
  ] = await Promise.all([
    fetchSeries("GDPC1", 800),
    fetchSeries("CPIAUCSL", 500),
    fetchSeries("CPILFESL", 500),
    fetchSeries("CPIUFDSL", 500),
    fetchSeries("CPIENGSL", 500),
    fetchSeries("UNRATE", 120),
    fetchSeries("FEDFUNDS", 120),
    fetchSeries("SP500", 3700), // FRED publishes the last 10 years only
    fetchSeries("PAYEMS", 800),
    fetchSeries("JTSJOL", 800),
    fetchSeries("ICSA", 800),
    ...[...TENORS.map(([, id]) => id), "DGS2"].map((id) => fetchSeries(id, 45)),
  ]);

  const yieldIds = [...TENORS.map(([, id]) => id), "DGS2"];
  const yields = buildYields(
    Object.fromEntries(yieldIds.map((id, i) => [id, yieldSeries[i]])),
  );

  return {
    asOf: fmtLongDay.format(last(sp500).t),
    metrics: buildMetrics(gdp, cpi, unrate, fedfunds),
    sp500: buildSp500(sp500),
    labor: buildLabor(payems, openings, claims),
    inflation: buildInflation(cpi, core, food, energy),
    yields,
  };
}
