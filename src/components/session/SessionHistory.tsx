import type { FocusSession } from "../../domain";
import { Card } from "../ui/Card";

interface SessionHistoryProps {
  sessions: FocusSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Recent sessions</h2>
      </div>
      {sessions.length === 0 ? (
        <Card className="text-sm leading-6 text-slate-600">
          Your session history will appear here after your first focus session.
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              as="article"
              className="flex items-center justify-between gap-4"
              key={session.id}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {statusLabel(session.status)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(session.startedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-700">
                  {session.plannedDurationMinutes} min
                </p>
                <p className="mt-1 text-xs font-medium uppercase text-slate-500">
                  {statusMetaLabel(session.status)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function statusLabel(status: FocusSession["status"]): string {
  if (status === "completed") {
    return "Session complete";
  }

  if (status === "abandoned") {
    return "Not this time";
  }

  if (status === "awaiting_confirmation") {
    return "Waiting for your answer";
  }

  return "In progress";
}

function statusMetaLabel(status: FocusSession["status"]): string {
  if (status === "awaiting_confirmation") {
    return "Awaiting confirmation";
  }

  return status;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
