/** Links to the FRED pages behind each dashboard card. Safe to import from client components. */

const FRED = "https://fred.stlouisfed.org";

/** FRED's page for one series: chart, notes, source agency and release info. */
export const fredSeriesUrl = (id: string) => `${FRED}/series/${id}`;

/** A FRED graph plotting several series together. */
export const fredGraphUrl = (ids: readonly string[]) =>
  `${FRED}/graph/?id=${ids.join(",")}`;

export type Source = { href: string; series: readonly string[] };

const source = (series: readonly string[]): Source => ({
  href: series.length === 1 ? fredSeriesUrl(series[0]) : fredGraphUrl(series),
  series,
});

/** Each card links to exactly the series it is built from. */
export const CARD_SOURCES = {
  sp500: source(["SP500"]),
  labor: source(["PAYEMS", "JTSJOL", "ICSA"]),
  inflation: source(["CPIAUCSL", "CPILFESL", "CPIUFDSL", "CPIENGSL"]),
  yields: source([
    "DGS1MO",
    "DGS3MO",
    "DGS1",
    "DGS2",
    "DGS5",
    "DGS10",
    "DGS30",
  ]),
} as const;
