"use client";

import { useEffect, useState, type ReactNode } from "react";
import { navSections } from "@/app/_lib/dashboard-data";
import { Icon } from "./icon";

function Sidebar({
  open,
  active,
  onSelect,
  onClose,
}: {
  open: boolean;
  active: string;
  onSelect: (label: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Primary"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#123358]">
              <Icon name="bank" size={21} />
            </div>
            <div>
              <div className="text-[17px] font-semibold tracking-tight text-white">
                FRED
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[.18em] text-blue-200/60">
                Economic Data
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-white/70 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {navSections.map((section) => (
            <div className="mb-7" key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-blue-200/45">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => onSelect(item.label)}
                    aria-current={active === item.label ? "page" : undefined}
                    className={`nav-item ${active === item.label ? "nav-active" : ""}`}
                  >
                    <Icon name={item.icon} size={17} />
                    <span>{item.label}</span>
                    {item.count && (
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-blue-100/70">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-white/10 bg-white/[.06] p-4">
          <p className="text-xs font-semibold text-white">Data updated</p>
          <p className="mt-1 text-[11px] leading-relaxed text-blue-100/55">
            All series are current as of June 12, 2025.
          </p>
          <button
            type="button"
            className="mt-3 text-[11px] font-semibold text-blue-300 hover:text-blue-200"
          >
            View release calendar
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSelect("Settings")}
          className={`nav-item mb-4 ml-3 w-[calc(100%-24px)] ${active === "Settings" ? "nav-active" : ""}`}
        >
          <Icon name="settings" size={17} />
          <span>Settings</span>
        </button>
      </aside>
    </>
  );
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-7">
      <button
        type="button"
        className="mr-3 text-slate-600 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </button>
      <form
        role="search"
        className="relative hidden max-w-[440px] flex-1 md:block"
        onSubmit={(e) => e.preventDefault()}
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon name="search" size={17} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search economic data series"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          placeholder="Search 825,000+ economic data series..."
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="icon-button relative"
          aria-label="Notifications"
        >
          <Icon name="bell" size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>
        <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbe9f8] text-[11px] font-bold text-[#245e99]">
            AM
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-slate-700">
              Alex Morgan
            </span>
            <span className="block text-[10px] text-slate-400">Economist</span>
          </span>
          <Icon name="chevron" size={13} />
        </button>
      </div>
    </header>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-700">
      <Sidebar
        open={menuOpen}
        active={active}
        onSelect={(label) => {
          setActive(label);
          setMenuOpen(false);
        }}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pl-[244px]">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        {children}
      </div>
    </div>
  );
}
