import { csvResponse, toCsv } from "@/app/_lib/csv";
import { getRawSeries, SERIES_CATALOG } from "@/app/_lib/fred";

/**
 * GET /api/export/timeseries
 * All underlying FRED observations (about 10 years) in long/tidy format:
 * one row per series per date, ready for pivot tables, pandas or R.
 */
export async function GET() {
  const series = await getRawSeries();
  const asOf = series.SP500[series.SP500.length - 1].date;

  const rows = SERIES_CATALOG.flatMap(
    ({ id, name, units, frequency, adjustment }) =>
      series[id].map((o) => ({
        series_id: id,
        series_name: name,
        units,
        frequency,
        seasonal_adjustment: adjustment,
        date: o.date,
        value: o.value,
      })),
  );

  const columns = [
    "series_id",
    "series_name",
    "units",
    "frequency",
    "seasonal_adjustment",
    "date",
    "value",
  ] as const;
  return csvResponse(
    toCsv([...columns], rows),
    `fred-dashboard-timeseries-${asOf}.csv`,
  );
}
