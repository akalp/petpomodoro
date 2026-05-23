import { motion } from "framer-motion";

import type { FocusSession } from "../../domain";
import { languageLocale, type SupportedLanguage, type Translator } from "../../i18n";
import { Card } from "../ui/Card";

interface SessionHistoryProps {
  isLoading?: boolean;
  sessions: FocusSession[];
  language: SupportedLanguage;
  t: Translator;
}

export function SessionHistory({
  isLoading = false,
  sessions,
  language,
  t,
}: SessionHistoryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950">
          {t("recentSessions")}
        </h2>
        {isLoading ? (
          <span className="text-xs font-semibold uppercase text-slate-500">
            {t("updating")}
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
          <p className="font-semibold text-slate-900">{t("noSessions")}</p>
          <p className="mt-1">
            {t("noSessionsSupport")}
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
                    {statusLabel(session.status, t)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(session.startedAt, language)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {statusSupportLabel(session.status, t)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-rose-700">
                    {t("durationMinutes", { minutes: session.plannedDurationMinutes })}
                  </p>
                  <p className="mt-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {statusMetaLabel(session.status, t)}
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

function statusLabel(status: FocusSession["status"], t: Translator): string {
  if (status === "completed") {
    return t("sessionComplete");
  }

  if (status === "abandoned") {
    return t("abandonedChoice");
  }

  if (status === "awaiting_confirmation") {
    return t("waitingAnswer");
  }

  return t("inProgress");
}

function statusMetaLabel(status: FocusSession["status"], t: Translator): string {
  if (status === "awaiting_confirmation") {
    return t("awaiting");
  }

  if (status === "completed") {
    return t("statusCompleted");
  }

  if (status === "abandoned") {
    return t("statusAbandoned");
  }

  return t("statusRunning");
}

function statusSupportLabel(status: FocusSession["status"], t: Translator): string {
  if (status === "completed") {
    return t("completedSupport");
  }

  if (status === "abandoned") {
    return t("honestyRewardSupport");
  }

  if (status === "awaiting_confirmation") {
    return t("awaitingSupport");
  }

  return t("runningHistorySupport");
}

function formatDate(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(languageLocale(language), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
