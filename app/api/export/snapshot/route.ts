import { csvResponse, toCsv } from "@/app/_lib/csv";
import { buildSnapshot, getRawSeries, type SnapshotRow } from "@/app/_lib/fred";

/**
 * GET /api/export/snapshot
 * Every figure on the dashboard as one CSV row with raw (unformatted) values.
 * Uses the same hourly-cached FRED data as the page, so it is prerendered and
 * revalidated alongside it.
 */
export async function GET() {
  const series = await getRawSeries();
  const rows = buildSnapshot(series);
  const asOf = series.SP500[series.SP500.length - 1].date;

  const columns: (keyof SnapshotRow)[] = [
    "section",
    "indicator",
    "value",
    "unit",
    "observation_date",
    "change",
    "change_unit",
    "compared_to",
    "fred_series",
    "notes",
  ];
  return csvResponse(
    toCsv(columns, rows),
    `fred-dashboard-snapshot-${asOf}.csv`,
  );
}
