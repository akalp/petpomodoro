import { useEffect, useId, useRef } from "react";

import type { RewardSummary } from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatRow } from "../ui/StatRow";
import { useBodyScrollLock } from "../ui/useBodyScrollLock";
import { useFocusTrap } from "../ui/useFocusTrap";

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
      value: t("level", { level: summary.newLevel }),
      amount: summary.leveledUp ? summary.newLevel : 0,
    },
  ];

  return rewardRows.filter((row) => row.amount !== 0);
}

export function RewardModal({ onClose, summary, t }: RewardModalProps) {
  const rewardRows = buildRewardRows(summary, t);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useBodyScrollLock(true);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current
      ?.querySelector<HTMLButtonElement>("[data-reward-close]")
      ?.focus();

    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="ui-reward-backdrop fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/35 px-4 pt-4 pb-4 md:items-center"
      data-testid="reward-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="ui-reward-panel w-full max-w-xl sm:max-w-md">
        <Card className="max-h-[calc(100dvh-2rem)] w-full space-y-4 overflow-y-auto border-rose-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-rose-700">
                {summary.rewardType === "focus_completed"
                  ? t("sessionComplete")
                  : t("honestyReward")}
              </p>
              <h2
                className="mt-2 text-2xl font-semibold text-slate-950"
                id={titleId}
              >
                {summary.rewardType === "focus_completed"
                  ? t("completedRewardTitle")
                  : t("honestyRewardTitle")}
              </h2>
            </div>
            <button
              aria-label={t("close")}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-white text-slate-600 transition hover:bg-rose-50 hover:text-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              data-reward-close
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            {summary.leveledUp
              ? t("levelUpReward")
              : summary.rewardType === "focus_completed"
                ? t("completedRewardSupport")
                : t("honestyRewardSupport")}
          </p>

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
