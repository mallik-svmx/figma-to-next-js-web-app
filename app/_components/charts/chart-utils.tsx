import type { ReactNode } from "react";

/**
 * X-axis tick that mirrors the design's `justify-between` label row:
 * the first label is left-aligned, the last right-aligned, the rest centered.
 */
export function EdgeAnchoredTick(props: {
  x?: number | string;
  y?: number | string;
  index?: number;
  visibleTicksCount?: number;
  payload?: { value: unknown };
  formatter: (value: unknown) => string;
  fontSize: number;
}) {
  const {
    x = 0,
    y = 0,
    index = 0,
    visibleTicksCount = 0,
    payload,
    formatter,
    fontSize,
  } = props;
  const anchor =
    index === 0 ? "start" : index === visibleTicksCount - 1 ? "end" : "middle";
  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy={fontSize - 6}
      textAnchor={anchor}
      fontSize={fontSize}
      fill="#94a3b8"
    >
      {formatter(payload?.value)}
    </text>
  );
}

export function ChartTooltipCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-[0_8px_24px_rgb(15_23_42/0.08)]">
      <p className="text-[10px] text-slate-400">{title}</p>
      <div className="mt-0.5 font-semibold text-slate-800">{children}</div>
    </div>
  );
}
