import { motion } from "framer-motion";

import type { FocusSession } from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface AwaitingConfirmationScreenProps {
  disabled?: boolean;
  onCompleted?: () => void;
  onAbandoned?: () => void;
  session: FocusSession;
  t: Translator;
}

export function AwaitingConfirmationScreen({
  disabled = false,
  onCompleted,
  onAbandoned,
  session,
  t,
}: AwaitingConfirmationScreenProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="space-y-4 border-rose-200">
      <div>
        <p className="text-sm font-semibold uppercase text-rose-700">
          {t("confirmationStatus")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {t("confirmationTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t("confirmationSupport")}
        </p>
      </div>
      <StatRow
        label={t("focusTime")}
        value={t("durationMinutes", { minutes: session.plannedDurationMinutes })}
      />
      <div className="grid gap-3">
        <Button disabled={disabled || !onCompleted} onClick={onCompleted}>
          {t("completedChoice")}
        </Button>
        <Button
          disabled={disabled || !onAbandoned}
          onClick={onAbandoned}
          variant="secondary"
        >
          {t("abandonedChoice")}
        </Button>
      </div>
      </Card>
    </motion.div>
  );
}
