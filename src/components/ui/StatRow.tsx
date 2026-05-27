import type { ReactNode } from "react";

interface StatRowProps {
  label: string;
  value: ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-rose-50 px-3 py-3 sm:px-4">
      <span className="min-w-0 text-sm font-medium leading-tight text-slate-600">
        {label}
      </span>
      <span
        className="ui-value-pulse min-w-0 break-words text-right text-sm font-semibold leading-tight text-slate-900"
        key={`${label}-${String(value)}`}
      >
        {value}
      </span>
    </div>
  );
}
