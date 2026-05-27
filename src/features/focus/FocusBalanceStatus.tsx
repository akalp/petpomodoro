import {
  checkStreakFreezeEligibility,
  DAILY_FOCUS_GOAL_MINUTES,
  STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR,
  type DailyFocusState,
  type FocusStartEligibilityCalculation,
  type PetState,
} from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

interface FocusBalanceStatusProps {
  dailyFocusToday: DailyFocusState | null;
  disabled: boolean;
  now: string;
  onStreakFreeze: (dateKey: string) => void;
  pet: PetState | null;
  previousDailyFocusState: DailyFocusState | null;
  t: Translator;
}

export function FocusBalanceStatus({
  dailyFocusToday,
  disabled,
  now,
  onStreakFreeze,
  pet,
  previousDailyFocusState,
  t,
}: FocusBalanceStatusProps) {
  if (!pet) {
    return null;
  }

  return (
    <div className="grid gap-4 min-[720px]:grid-cols-2">
      {dailyFocusToday ? (
        <Card className="space-y-3 border-rose-100 bg-white/85 text-left">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-950">
              {t("dailyFocusTitle")}
            </p>
            <p className="text-sm leading-6 text-slate-600">
              {dailyFocusToday.dailyGoalAwarded
                ? t("dailyFocusComplete", { pet: pet.name })
                : t("dailyFocusProgress", {
                    minutes: Math.min(
                      Math.round(dailyFocusToday.completedFocusMinutes),
                      DAILY_FOCUS_GOAL_MINUTES,
                    ),
                    goal: DAILY_FOCUS_GOAL_MINUTES,
                  })}
            </p>
          </div>
          <ProgressBar
            label={t("dailyFocusProgressLabel")}
            max={DAILY_FOCUS_GOAL_MINUTES}
            value={dailyFocusToday.completedFocusMinutes}
          />
        </Card>
      ) : null}

      <StreakFreezeStatus
        disabled={disabled}
        now={now}
        onStreakFreeze={onStreakFreeze}
        pet={pet}
        previousDailyFocusState={previousDailyFocusState}
        t={t}
      />
    </div>
  );
}

export function FocusStartNotice({
  focusStartEligibility,
  isPetSleeping,
  pet,
  t,
}: {
  focusStartEligibility: FocusStartEligibilityCalculation | null;
  isPetSleeping: boolean;
  pet: PetState | null;
  t: Translator;
}) {
  if (!pet) {
    return null;
  }

  if (isPetSleeping) {
    return (
      <div
        className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm font-medium leading-6 text-indigo-950"
        role="status"
      >
        {t("focusUnavailableDuringSleep", { pet: pet.name })}
      </div>
    );
  }

  if (!focusStartEligibility || focusStartEligibility.canStart) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm leading-6 text-rose-950"
      role="status"
    >
      <p className="font-semibold">
        {focusStartCareMessage(
          t,
          pet.name,
          focusStartEligibility.hasEnoughEnergy,
          focusStartEligibility.hasEnoughHunger,
        )}
      </p>
      <p className="mt-1 text-xs leading-5 text-rose-800">
        {t("focusRequirementSummary", {
          requiredEnergy: focusStartEligibility.requiredEnergy,
          requiredHunger: focusStartEligibility.requiredHunger,
        })}
      </p>
    </div>
  );
}

function StreakFreezeStatus({
  disabled,
  now,
  onStreakFreeze,
  pet,
  previousDailyFocusState,
  t,
}: {
  disabled: boolean;
  now: string;
  onStreakFreeze: (dateKey: string) => void;
  pet: PetState;
  previousDailyFocusState: DailyFocusState | null;
  t: Translator;
}) {
  if (!previousDailyFocusState) {
    return null;
  }

  const eligibility = checkStreakFreezeEligibility(
    pet,
    previousDailyFocusState,
    now,
  );

  if (eligibility.canApply) {
    return (
      <Card className="space-y-3 border-teal-100 bg-teal-50/80 text-left">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-teal-950">
            {t("streakFreezeAvailableTitle")}
          </p>
          <p className="text-sm leading-6 text-teal-900">
            {t("streakFreezeAvailableSupport", {
              cost: eligibility.costHonestyHearts,
              pet: pet.name,
            })}
          </p>
        </div>
        <Button
          className="w-full text-sm sm:w-auto"
          disabled={disabled}
          onClick={() => onStreakFreeze(previousDailyFocusState.dateKey)}
          variant="secondary"
        >
          {t("useStreakFreeze")}
        </Button>
      </Card>
    );
  }

  if (eligibility.reasons.includes(STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR)) {
    return (
      <Card className="border-rose-100 bg-white/85 text-left">
        <p className="text-sm font-semibold text-rose-950">
          {t("streakFreezeNotEnoughTitle")}
        </p>
        <p className="mt-1 text-sm leading-6 text-rose-900">
          {t("streakFreezeNotEnoughSupport", {
            cost: eligibility.costHonestyHearts,
          })}
        </p>
      </Card>
    );
  }

  return null;
}

function focusStartCareMessage(
  t: Translator,
  petName: string,
  hasEnoughEnergy: boolean,
  hasEnoughHunger: boolean,
): string {
  if (!hasEnoughEnergy && !hasEnoughHunger) {
    return t("focusUnavailableCareBoth", { pet: petName });
  }

  if (!hasEnoughEnergy) {
    return t("focusUnavailableCareEnergy", { pet: petName });
  }

  return t("focusUnavailableCareHunger", { pet: petName });
}
