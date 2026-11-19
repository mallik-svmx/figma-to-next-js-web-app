"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./icon";

const OPTIONS = [
  {
    href: "/api/export/snapshot",
    title: "Dashboard snapshot",
    description:
      "Every figure on this page with its date, change and FRED series ID.",
  },
  {
    href: "/api/export/timeseries",
    title: "Full time series",
    description:
      "~10 years of all 18 underlying FRED series, one row per date.",
  },
];

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    itemRefs.current[0]?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = itemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={rootRef} className="relative max-[420px]:flex-1">
      <button
        ref={buttonRef}
        type="button"
        className="secondary-button w-full"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="download" size={15} /> Export data
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Export data"
          onKeyDown={onMenuKeyDown}
          className="absolute left-0 z-30 sm:left-auto sm:right-0 mt-2 w-[290px] max-w-[calc(100vw-32px)] rounded-xl border border-[#e3e9f0] bg-white p-1.5 shadow-[0_12px_32px_rgb(15_23_42/0.12)]"
        >
          {OPTIONS.map((option, i) => (
            <a
              key={option.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="menuitem"
              href={option.href}
              download
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 rounded-lg p-3 outline-none transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <span className="metric-icon metric-blue mt-0.5 shrink-0">
                <Icon name="download" size={15} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  {option.title}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                    CSV
                  </span>
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-slate-500">
                  {option.description}
                </span>
              </span>
            </a>
          ))}
          <p className="border-t border-slate-100 px-3 pb-1.5 pt-2.5 text-[10px] leading-snug text-slate-400">
            Source: FRED®, Federal Reserve Bank of St. Louis. Refreshed hourly.
          </p>
        </div>
      )}
    </div>
  );
}
