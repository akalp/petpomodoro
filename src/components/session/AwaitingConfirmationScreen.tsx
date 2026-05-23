import { motion } from "framer-motion";

import type { FocusSession } from "../../domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface AwaitingConfirmationScreenProps {
  disabled?: boolean;
  onCompleted?: () => void;
  onAbandoned?: () => void;
  session: FocusSession;
}

export function AwaitingConfirmationScreen({
  disabled = false,
  onCompleted,
  onAbandoned,
  session,
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
          Ready for your answer
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Your pet waited for you. Did you really finish this focus session?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No pressure. Just answer honestly. Trust keeps this little ritual meaningful.
        </p>
      </div>
      <StatRow label="Focus time" value={`${session.plannedDurationMinutes} min`} />
      <div className="grid gap-3">
        <Button disabled={disabled || !onCompleted} onClick={onCompleted}>
          Yes, we did it
        </Button>
        <Button
          disabled={disabled || !onAbandoned}
          onClick={onAbandoned}
          variant="secondary"
        >
          Not this time
        </Button>
      </div>
      </Card>
    </motion.div>
  );
}
