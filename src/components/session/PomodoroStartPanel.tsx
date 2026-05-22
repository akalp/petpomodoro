import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PomodoroStartPanelProps {
  disabled?: boolean;
  durations: number[];
  onDurationChange: (duration: number) => void;
  onStart: (duration: number) => void;
  selectedDuration: number;
}

export function PomodoroStartPanel({
  disabled = false,
  durations,
  onDurationChange,
  onStart,
  selectedDuration,
}: PomodoroStartPanelProps) {
  return (
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
                "min-h-11 rounded-lg border px-2 text-sm font-semibold transition",
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
      <Button
        className="w-full"
        disabled={disabled}
        onClick={() => onStart(selectedDuration)}
      >
        Start focus
      </Button>
    </Card>
  );
}
