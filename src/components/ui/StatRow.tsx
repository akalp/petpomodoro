import type { ReactNode } from "react";

interface StatRowProps {
  label: string;
  value: ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-rose-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
