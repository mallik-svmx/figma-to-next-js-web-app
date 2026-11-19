import type { IconName } from "@/app/_components/icon";

/* Static navigation. Live economic data comes from `fred.ts`. */

export type NavItem = { icon: IconName; label: string; count?: string };
export type NavSection = { label: string; items: NavItem[] };

export const navSections: NavSection[] = [
  { label: "Overview", items: [{ icon: "grid", label: "Dashboard" }] },
  {
    label: "Economic data",
    items: [
      { icon: "activity", label: "Indicators", count: "12" },
      { icon: "chart", label: "Market data" },
      { icon: "briefcase", label: "Employment" },
      { icon: "building", label: "Housing" },
      { icon: "bank", label: "Monetary policy" },
      { icon: "globe", label: "International" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { icon: "layers", label: "My watchlist", count: "8" },
      { icon: "chart", label: "Saved charts" },
    ],
  },
];
