import {
  isEmergencySnackNeeded,
  isPetSleeping,
  POWER_NAP_DURATION_MINUTES,
  type EmergencySnackSummary,
  type PetState,
  type PowerNapSummary,
} from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";

interface PetRescueControlProps {
  disabled: boolean;
  isFocusActive: boolean;
  lastEmergencySnackSummary: EmergencySnackSummary | null;
  lastPowerNapSummary: PowerNapSummary | null;
  onClearEmergencySnackSummary: () => void;
  onClearPowerNapSummary: () => void;
  onEmergencySnack: () => void;
  onPowerNap: () => void;
  pet: PetState;
  t: Translator;
}

export function PetRescueControl({
  disabled,
  isFocusActive,
  lastEmergencySnackSummary,
  lastPowerNapSummary,
  onClearEmergencySnackSummary,
  onClearPowerNapSummary,
  onEmergencySnack,
  onPowerNap,
  pet,
  t,
}: PetRescueControlProps) {
  const sleeping = isPetSleeping(pet);
  const actionDisabled = disabled || isFocusActive || sleeping;
  const offerEmergencySnack = isEmergencySnackNeeded(pet);

  return (
    <div className="space-y-3 rounded-lg border border-amber-100 bg-amber-50/70 p-4 text-left text-slate-950">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{t("rescueTitle")}</p>
        <p className="text-sm leading-6 text-slate-600">
          {isFocusActive
            ? t("rescueUnavailableDuringFocus")
            : t("rescueSupport", { pet: pet.name })}
        </p>
      </div>

      <div className="space-y-3 rounded-md bg-white/65 p-3 ring-1 ring-white/80">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t("powerNapTitle")}</p>
          <p className="text-xs leading-5 text-slate-600">
            {t("powerNapSupport", { minutes: POWER_NAP_DURATION_MINUTES })}
          </p>
        </div>
        <Button
          className="w-full text-sm sm:w-auto"
          disabled={actionDisabled}
          onClick={onPowerNap}
          variant="secondary"
        >
          {t("takePowerNap")}
        </Button>
      </div>

      {offerEmergencySnack ? (
        <div className="space-y-3 rounded-md bg-white/65 p-3 ring-1 ring-white/80">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t("emergencySnackTitle")}</p>
            <p className="text-xs leading-5 text-slate-600">
              {t("emergencySnackSupport", { pet: pet.name })}
            </p>
          </div>
          <Button
            className="w-full text-sm sm:w-auto"
            disabled={actionDisabled}
            onClick={onEmergencySnack}
          >
            {t("offerEmergencySnack")}
          </Button>
        </div>
      ) : null}

      {lastPowerNapSummary ? (
        <RescueResult
          onClear={onClearPowerNapSummary}
          support={t("powerNapResultSupport", {
            energy: formatSigned(lastPowerNapSummary.energyGained),
            hunger: formatSigned(lastPowerNapSummary.hungerChanged),
            happiness: formatSigned(lastPowerNapSummary.happinessGained),
          })}
          title={t("powerNapResultTitle", { pet: pet.name })}
          t={t}
        />
      ) : null}

      {lastEmergencySnackSummary ? (
        <RescueResult
          onClear={onClearEmergencySnackSummary}
          support={t("emergencySnackResultSupport", {
            hunger: formatSigned(lastEmergencySnackSummary.hungerGained),
          })}
          title={t("emergencySnackResultTitle", { pet: pet.name })}
          t={t}
        />
      ) : null}
    </div>
  );
}

function RescueResult({
  onClear,
  support,
  title,
  t,
}: {
  onClear: () => void;
  support: string;
  title: string;
  t: Translator;
}) {
  return (
    <div className="rounded-md border border-amber-100 bg-white/80 p-3 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-slate-950">{title}</p>
      <p>{support}</p>
      <Button
        className="mt-3 w-full text-sm sm:w-auto"
        onClick={onClear}
        variant="secondary"
      >
        {t("continue")}
      </Button>
    </div>
  );
}

function formatSigned(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return value > 0 ? `+${formatted}` : formatted;
}
