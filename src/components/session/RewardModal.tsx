import type { RewardSummary } from "../../domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface RewardModalProps {
  onClose: () => void;
  summary: RewardSummary;
}

export function RewardModal({ onClose, summary }: RewardModalProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-end bg-slate-950/35 p-4 sm:items-center sm:justify-center">
      <Card className="w-full space-y-4 border-rose-200 bg-white shadow-xl sm:max-w-md">
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
    </div>
  );
}
