import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StatRowProps {
  label: string;
  value: ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-rose-50 px-3 py-3 sm:px-4">
      <span className="min-w-0 text-sm font-medium leading-tight text-slate-600">
        {label}
      </span>
      <motion.span
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.04, 1] }}
        className="min-w-0 break-words text-right text-sm font-semibold leading-tight text-slate-900"
        key={`${label}-${String(value)}`}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.span>
    </div>
  );
}
