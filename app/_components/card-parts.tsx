import type { ReactNode } from "react";
import type { Source } from "@/app/_lib/sources";
import { Icon } from "./icon";

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      <button type="button" className="icon-button" aria-label={`More options for ${title}`}>
        <Icon name="more" size={18} />
      </button>
    </div>
  );
}

/**
 * "View details" link to the FRED page a card's data comes from, pinned to the
 * card's bottom-right. The card must be a flex column (`dashboard-card flex flex-col`)
 * so `mt-auto` can push this row to the bottom when cards in a row stretch.
 */
export function SourceLink({ source, title }: { source: Source; title: string }) {
  return (
    <div className="mt-auto flex justify-end pt-3">
      <a
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
        title={`Source data on FRED: ${source.series.join(", ")}`}
        aria-label={`View details for ${title} on FRED (opens in a new tab)`}
        className="-mb-2 -mr-2 inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        View details
        <Icon name="external" size={12} />
      </a>
    </div>
  );
}

export function Trend({
  direction,
  children,
}: {
  direction: "up" | "down";
  children: ReactNode;
}) {
  const positive = direction === "up";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        positive ? "text-emerald-600" : "text-rose-500"
      }`}
    >
      <Icon name={positive ? "arrowUp" : "arrowDown"} size={12} />
      {children}
    </span>
  );
}
