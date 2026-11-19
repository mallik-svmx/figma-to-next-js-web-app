import type { ReactNode } from "react";
import { Icon } from "./icon";

export function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        )}
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label={`More options for ${title}`}
      >
        <Icon name="more" size={18} />
      </button>
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
