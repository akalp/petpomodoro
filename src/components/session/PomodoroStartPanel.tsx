import { motion } from "framer-motion";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PomodoroStartPanelProps {
  disabled?: boolean;
  durations: number[];
  onDurationChange: (duration: number) => void;
  onCustomDurationChange: (value: string) => void;
  onCustomDurationCommit: (value: string) => void;
  onStart: (duration: number) => void;
  customDurationInput: string;
  durationError: string | null;
  selectedDuration: number;
}

export function PomodoroStartPanel({
  disabled = false,
  durations,
  onDurationChange,
  onCustomDurationChange,
  onCustomDurationCommit,
  onStart,
  customDurationInput,
  durationError,
  selectedDuration,
}: PomodoroStartPanelProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          Ready to focus together?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a focus session and begin when you are ready.
        </p>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        Your pet will wait while you spend a little time with your task.
      </p>
      <div
        aria-label="Focus duration"
        className="grid grid-cols-4 gap-2"
        role="group"
      >
        {durations.map((duration) => {
          const isSelected = duration === selectedDuration;

          return (
            <button
              aria-pressed={isSelected}
              className={[
                "min-h-12 rounded-lg border px-2 text-sm font-semibold transition active:scale-[0.98]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                isSelected
                  ? "border-rose-600 bg-rose-600 text-white"
                  : "border-rose-200 bg-white text-rose-800",
              ].join(" ")}
              disabled={disabled}
              key={duration}
              onClick={() => onDurationChange(duration)}
              type="button"
            >
              {duration}m
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="custom-duration">
          Custom minutes
        </label>
        <input
          aria-invalid={durationError !== null}
          className="min-h-12 w-full rounded-lg border border-rose-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          disabled={disabled}
          id="custom-duration"
          inputMode="numeric"
          min={1}
          max={180}
          onBlur={(event) => onCustomDurationCommit(event.currentTarget.value)}
          onChange={(event) => onCustomDurationChange(event.target.value)}
          type="number"
          value={customDurationInput}
        />
        {durationError ? (
          <p className="text-sm leading-6 text-rose-700">{durationError}</p>
        ) : null}
      </div>
      <Button
        className="w-full"
        disabled={disabled || durationError !== null}
        onClick={() => onStart(selectedDuration)}
      >
        Start focus
      </Button>
      </Card>
    </motion.div>
  );
}
