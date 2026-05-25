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
  const supportKey = sleeping
    ? "sleepSupportSleeping"
    : isFocusActive
      ? "sleepUnavailableDuringFocus"
      : "sleepSupportAwake";
  const sectionTone = sleeping
    ? "border-teal-100 bg-teal-50/70 text-slate-950"
    : isFocusActive
      ? "border-slate-100 bg-slate-50/80 text-slate-700"
      : "border-rose-100 bg-rose-50/70 text-slate-950";

  return (
    <div
      className={[
        "space-y-3 rounded-lg border p-4 text-left transition-colors",
        sectionTone,
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={[
                "h-2.5 w-2.5 rounded-full",
                sleeping
                  ? "bg-teal-500"
                  : isFocusActive
                    ? "bg-slate-300"
                    : "bg-rose-400",
              ].join(" ")}
            />
            <p className="text-sm font-semibold">{t("sleepTitle")}</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {t(supportKey, { pet: pet.name })}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto sm:self-start"
          disabled={actionDisabled}
          onClick={sleeping ? onWakeSleep : onStartSleep}
          variant={sleeping ? "primary" : "secondary"}
        >
          {t(sleeping ? "wakePet" : "startPetSleep", { pet: pet.name })}
        </Button>
      </div>

      {sleeping && sleepPreview ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md bg-white/70 p-3 text-sm ring-1 ring-white/80">
          <SleepMetric
            label={t("sleepDurationLabel")}
            value={formatSleepDuration(sleepPreview.elapsedMinutes)}
          />
          <SleepMetric
            label={t("sleepEnergyLabel")}
            value={formatSigned(sleepPreview.energyGained)}
          />
          <SleepMetric
            label={t("sleepHungerLabel")}
            value={formatSigned(sleepPreview.hungerChanged)}
          />
          <SleepMetric
            label={t("sleepHappinessLabel")}
            value={formatSigned(sleepPreview.happinessGained)}
          />
        </dl>
      ) : null}

      {lastSleepSummary ? (
        <div className="rounded-md border border-teal-100 bg-white/80 p-3 text-sm leading-6 text-slate-700">
          <p className="font-semibold text-slate-950">
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
            className="mt-3 w-full text-sm sm:w-auto"
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

interface SleepMetricProps {
  label: string;
  value: string;
}

function SleepMetric({ label, value }: SleepMetricProps) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-950">
        {value}
      </dd>
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
