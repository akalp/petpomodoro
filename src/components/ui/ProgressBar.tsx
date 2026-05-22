interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
}

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span>
          {Math.round(value)} / {safeMax}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-rose-100">
        <div
          className="h-full rounded-full bg-teal-500 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
