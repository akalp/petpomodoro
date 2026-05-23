import { motion, useReducedMotion } from "framer-motion";

import type { RewardSummary } from "../../domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface RewardModalProps {
  onClose: () => void;
  summary: RewardSummary;
}

export function RewardModal({ onClose, summary }: RewardModalProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-10 flex items-end bg-slate-950/35 p-4 sm:items-center sm:justify-center"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full sm:max-w-md"
        initial={{ opacity: 0, scale: 0.98, y: 18 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.24, ease: "easeOut" }
        }
      >
        <Card className="w-full space-y-4 border-rose-200 bg-white shadow-xl">
        <div>
          <p className="text-sm font-semibold uppercase text-rose-700">
            {summary.rewardType === "focus_completed"
              ? "Session complete"
              : "Honesty reward"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.rewardType === "focus_completed"
              ? "You showed up. Your pet noticed."
              : "Thanks for being honest. Trust keeps your pet happy."}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary.leveledUp
              ? "Your pet grew a little stronger."
              : summary.rewardType === "focus_completed"
                ? "A little care goes a long way."
                : "No points lost. No scolding."}
          </p>
        </div>

        {summary.leveledUp ? (
          <motion.div
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
            className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900"
            transition={{ duration: 0.45 }}
          >
            Level up! Your care is adding up.
          </motion.div>
        ) : null}

        <div className="grid gap-3">
          {summary.xpAwarded > 0 ? (
            <StatRow label="XP gained" value={`+${summary.xpAwarded}`} />
          ) : null}
          {summary.coinsAwarded > 0 ? (
            <StatRow label="Coins" value={`+${summary.coinsAwarded}`} />
          ) : null}
          {summary.happinessAwarded > 0 ? (
            <StatRow label="Happiness" value={`+${summary.happinessAwarded}`} />
          ) : null}
          {summary.hungerAwarded > 0 ? (
            <StatRow label="Hunger" value={`+${summary.hungerAwarded}`} />
          ) : null}
          {summary.energyAwarded !== 0 ? (
            <StatRow
              label="Energy"
              value={
                summary.energyAwarded > 0
                  ? `+${summary.energyAwarded}`
                  : summary.energyAwarded
              }
            />
          ) : null}
          {summary.streakAwarded > 0 ? (
            <StatRow label="Streak" value={`+${summary.streakAwarded}`} />
          ) : null}
          {summary.honestyHeartsAwarded > 0 ? (
            <StatRow
              label="Honesty hearts"
              value={`+${summary.honestyHeartsAwarded}`}
            />
          ) : null}
          {summary.leveledUp ? (
            <StatRow label="New level" value={summary.newLevel} />
          ) : null}
        </div>

        <Button className="w-full" onClick={onClose}>
          Continue
        </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
