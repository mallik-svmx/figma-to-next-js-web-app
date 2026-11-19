/**
 * Returns evenly spaced, "nice" axis ticks (1/2/2.5/5 × 10ⁿ steps) that
 * cover [min, max] in exactly `intervals` steps.
 */
export function niceTicks(
  min: number,
  max: number,
  intervals: number,
): number[] {
  const span = Math.max(max - min, Math.abs(max) * 0.01 || 1);
  const raw = span / intervals;
  const mag = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10, 20]) {
    const step = m * mag;
    const lo = Math.floor(min / step) * step;
    if (lo + step * intervals >= max) {
      return Array.from(
        { length: intervals + 1 },
        (_, i) => +(lo + i * step).toFixed(10),
      );
    }
  }
  const step = 20 * mag;
  const lo = Math.floor(min / step) * step;
  return Array.from({ length: intervals + 1 }, (_, i) => lo + i * step);
}
