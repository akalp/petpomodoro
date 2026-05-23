import { motion } from "framer-motion";

import type { FocusSession } from "../../domain";
import { Card } from "../ui/Card";

interface SessionHistoryProps {
  isLoading?: boolean;
  sessions: FocusSession[];
}

export function SessionHistory({ isLoading = false, sessions }: SessionHistoryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950">Recent sessions</h2>
        {isLoading ? (
          <span className="text-xs font-semibold uppercase text-slate-500">
            Updating
          </span>
        ) : null}
      </div>
      {isLoading && sessions.length === 0 ? (
        <Card className="space-y-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-rose-100" />
          <div className="h-3 w-full animate-pulse rounded-full bg-rose-100" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-rose-100" />
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">No focus sessions yet.</p>
          <p className="mt-1">
            Your session history will appear here after your first focus session.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              key={session.id}
              transition={{ duration: 0.2 }}
            >
              <Card className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {statusLabel(session.status)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(session.startedAt)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {statusSupportLabel(session.status)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-rose-700">
                    {session.plannedDurationMinutes} min
                  </p>
                  <p className="mt-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {statusMetaLabel(session.status)}
                  </p>
                </div>
              </Card>
            </motion.article>
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
    return "Awaiting";
  }

  return status;
}

function statusSupportLabel(status: FocusSession["status"]): string {
  if (status === "completed") {
    return "That focus time counts.";
  }

  if (status === "abandoned") {
    return "No points lost. No scolding.";
  }

  if (status === "awaiting_confirmation") {
    return "Your pet is ready for your answer.";
  }

  return "Your session is underway.";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
