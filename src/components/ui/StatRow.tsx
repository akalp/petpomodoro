import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StatRowProps {
  label: string;
  value: ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-rose-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <motion.span
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.04, 1] }}
        className="text-right text-sm font-semibold text-slate-900"
        key={`${label}-${String(value)}`}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.span>
    </div>
  );
}
