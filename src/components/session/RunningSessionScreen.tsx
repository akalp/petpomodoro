import type { FocusSession } from "../../domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface RunningSessionScreenProps {
  countdownLabel: string;
  disabled?: boolean;
  onEnd?: () => void;
  session: FocusSession;
}

export function RunningSessionScreen({
  countdownLabel,
  disabled = false,
  onEnd,
  session,
}: RunningSessionScreenProps) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700">In progress</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Your pet is keeping you company while you focus.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Come back when your focus time is done.
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg bg-teal-50 px-4 py-5 text-center">
          <p className="text-sm font-semibold uppercase text-teal-700">
            Time remaining
          </p>
          <p className="mt-2 text-4xl font-semibold text-slate-950">
            {countdownLabel}
          </p>
        </div>
        <StatRow
          label="Focus time"
          value={`${session.plannedDurationMinutes} min`}
        />
        <StatRow label="Expected finish" value={formatTime(session.expectedEndAt)} />
      </div>
      {onEnd ? (
        <Button
          className="w-full"
          disabled={disabled}
          onClick={onEnd}
          variant="secondary"
        >
          End this session
        </Button>
      ) : null}
    </Card>
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
