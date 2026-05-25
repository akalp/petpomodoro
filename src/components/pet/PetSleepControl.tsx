import {
  isPetSleeping,
  type PetSleepSummary,
  type PetState,
} from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";

interface PetSleepControlProps {
  disabled: boolean;
  isFocusActive: boolean;
  lastSleepSummary: PetSleepSummary | null;
  onClearSleepSummary: () => void;
  onStartSleep: () => void;
  onWakeSleep: () => void;
  pet: PetState;
  sleepPreview: PetSleepSummary | null;
  t: Translator;
}

export function PetSleepControl({
  disabled,
  isFocusActive,
  lastSleepSummary,
  onClearSleepSummary,
  onStartSleep,
  onWakeSleep,
  pet,
  sleepPreview,
  t,
}: PetSleepControlProps) {
  const sleeping = isPetSleeping(pet);
  const actionDisabled = disabled || (!sleeping && isFocusActive);
  const supportKey = isFocusActive
    ? "sleepUnavailableDuringFocus"
    : sleeping
      ? "sleepSupportSleeping"
      : "sleepSupportAwake";

  return (
    <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-left text-indigo-950">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t("sleepTitle")}</p>
          <p className="mt-1 text-sm leading-6 text-indigo-900">
            {t(supportKey, { pet: pet.name })}
          </p>
        </div>
        <Button
          className="shrink-0"
          disabled={actionDisabled}
          onClick={sleeping ? onWakeSleep : onStartSleep}
          variant={sleeping ? "primary" : "secondary"}
        >
          {t(sleeping ? "wakePet" : "startPetSleep", { pet: pet.name })}
        </Button>
      </div>

      {sleeping && sleepPreview ? (
        <div className="grid gap-2 text-sm font-medium sm:grid-cols-2">
          <div className="rounded-md bg-white/80 px-3 py-2">
            {t("sleepDuration", {
              duration: formatSleepDuration(sleepPreview.elapsedMinutes),
            })}
          </div>
          <div className="rounded-md bg-white/80 px-3 py-2">
            {t("sleepEnergyPreview", {
              energy: formatSigned(sleepPreview.energyGained),
            })}
          </div>
        </div>
      ) : null}

      {lastSleepSummary ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
          <p className="font-semibold">
            {t("sleepResultTitle", { pet: pet.name })}
          </p>
          <p>
            {t("sleepResultSupport", {
              energy: formatSigned(lastSleepSummary.energyGained),
              hunger: formatSigned(lastSleepSummary.hungerChanged),
              happiness: formatSigned(lastSleepSummary.happinessGained),
            })}
          </p>
          <Button
            className="mt-3 min-h-10 px-4 py-2 text-sm"
            onClick={onClearSleepSummary}
            variant="secondary"
          >
            {t("continue")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function formatSleepDuration(elapsedMinutes: number): string {
  const totalMinutes = Math.max(0, Math.floor(elapsedMinutes));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${formatStat(value)}` : formatStat(value);
}

function formatStat(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
