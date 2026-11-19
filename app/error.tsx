"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fa] p-6">
      <div
        className="dashboard-card max-w-md text-center"
        style={{ minHeight: 0 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">
          FRED data unavailable
        </p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          We couldn&apos;t load the latest economic data
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          The Federal Reserve Economic Data service didn&apos;t respond. This is
          usually temporary.
        </p>
        <button
          type="button"
          className="primary-button mt-5"
          onClick={() => retry()}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
