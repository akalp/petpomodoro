import type { RewardSummary } from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";

interface RewardModalProps {
  onClose: () => void;
  summary: RewardSummary;
  t: Translator;
}

interface RewardRowMetadata {
  id: string;
  label: string;
  value: number | string;
  amount: number;
}

function formatRewardValue(amount: number) {
  return amount > 0 ? `+${amount}` : amount;
}

function buildRewardRows(
  summary: RewardSummary,
  t: Translator,
): RewardRowMetadata[] {
  const rewardRows: RewardRowMetadata[] = [
    {
      id: "xp",
      label: t("xpGained"),
      value: formatRewardValue(summary.xpAwarded),
      amount: summary.xpAwarded,
    },
    {
      id: "coins",
      label: t("coins"),
      value: formatRewardValue(summary.coinsAwarded),
      amount: summary.coinsAwarded,
    },
    {
      id: "happiness",
      label: t("happiness"),
      value: formatRewardValue(summary.happinessAwarded),
      amount: summary.happinessAwarded,
    },
    {
      id: "hunger",
      label: t("hunger"),
      value: formatRewardValue(summary.hungerAwarded),
      amount: summary.hungerAwarded,
    },
    {
      id: "energy",
      label: t("energy"),
      value: formatRewardValue(summary.energyAwarded),
      amount: summary.energyAwarded,
    },
    {
      id: "streak",
      label: t("streak"),
      value: formatRewardValue(summary.streakAwarded),
      amount: summary.streakAwarded,
    },
    {
      id: "honesty-hearts",
      label: t("honestyHearts"),
      value: formatRewardValue(summary.honestyHeartsAwarded),
      amount: summary.honestyHeartsAwarded,
    },
    {
      id: "new-level",
      label: t("newLevel"),
      value: summary.newLevel,
      amount: summary.leveledUp ? summary.newLevel : 0,
    },
  ];

  return rewardRows.filter((row) => row.amount !== 0);
}

export function RewardModal({ onClose, summary, t }: RewardModalProps) {
  const rewardRows = buildRewardRows(summary, t);

  return (
    <div
      className="ui-reward-backdrop fixed inset-x-0 top-0 bottom-28 z-20 flex items-end justify-center overflow-y-auto bg-slate-950/35 px-4 pt-4 pb-4 md:inset-0 md:z-50 md:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="ui-reward-panel w-full max-w-xl sm:max-w-md">
        <Card className="max-h-[calc(100dvh-8rem)] w-full space-y-4 overflow-y-auto border-rose-200 bg-white shadow-xl md:max-h-[calc(100dvh-2rem)]">
        <div>
          <p className="text-sm font-semibold uppercase text-rose-700">
            {summary.rewardType === "focus_completed"
              ? t("sessionComplete")
              : t("honestyReward")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.rewardType === "focus_completed"
              ? t("completedRewardTitle")
              : t("honestyRewardTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary.leveledUp
              ? t("levelUpReward")
              : summary.rewardType === "focus_completed"
                ? t("completedRewardSupport")
                : t("honestyRewardSupport")}
          </p>
        </div>

        {summary.leveledUp ? (
          <div
            className="ui-level-pulse rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900"
          >
            {t("levelUpSupport")}
          </div>
        ) : null}

        <div className="grid gap-3">
          {rewardRows.map((row) => (
            <StatRow key={row.id} label={row.label} value={row.value} />
          ))}
        </div>

        <Button className="w-full" onClick={onClose}>
          {t("continue")}
        </Button>
        </Card>
      </div>
    </div>
  );
}
