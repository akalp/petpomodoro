import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PomodoroStartPanelProps {
  disabled?: boolean;
  onStart: () => void;
}

export function PomodoroStartPanel({
  disabled = false,
  onStart,
}: PomodoroStartPanelProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          Ready to focus together?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          A gentle 25-minute session is ready.
        </p>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        Your pet will wait while you spend a little time with your task.
      </p>
      <Button className="w-full" disabled={disabled} onClick={onStart}>
        Start focus
      </Button>
    </Card>
  );
}
