import {
  checkEmergencySnackEligibility,
  checkPowerNapEligibility,
  createDailyFocusState,
  EMERGENCY_SNACK_DAILY_LIMIT_ERROR,
  isEmergencySnackNeeded,
  isPetSleeping,
  POWER_NAP_DURATION_MINUTES,
  POWER_NAP_COOLDOWN_ACTIVE_ERROR,
  POWER_NAP_DAILY_LIMIT_ERROR,
  POWER_NAP_ENERGY_GAIN,
  POWER_NAP_HUNGER_COST,
  EMERGENCY_SNACK_HUNGER_GAIN,
  type DailyFocusState,
  type EmergencySnackSummary,
  type PetState,
  type PowerNapSummary,
  type RescueEligibility,
} from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { formatSigned } from "../ui/format";

interface PetRescueControlProps {
  dailyFocusToday: DailyFocusState | null;
  disabled: boolean;
  isFocusActive: boolean;
  lastEmergencySnackSummary: EmergencySnackSummary | null;
  lastPowerNapSummary: PowerNapSummary | null;
  now: string;
  onClearEmergencySnackSummary: () => void;
  onClearPowerNapSummary: () => void;
  onEmergencySnack: () => void;
  onPowerNap: () => void;
  pet: PetState;
  t: Translator;
}

export function PetRescueControl({
  dailyFocusToday,
  disabled,
  isFocusActive,
  lastEmergencySnackSummary,
  lastPowerNapSummary,
  now,
  onClearEmergencySnackSummary,
  onClearPowerNapSummary,
  onEmergencySnack,
  onPowerNap,
  pet,
  t,
}: PetRescueControlProps) {
  const sleeping = isPetSleeping(pet);
  const fallbackDailyFocusState = createDailyFocusState({
    petId: pet.id,
    dateKey: now.slice(0, 10),
  });
  const dailyFocusState = dailyFocusToday ?? fallbackDailyFocusState;
  const powerNapEligibility = checkPowerNapEligibility(
    pet,
    dailyFocusState,
    now,
  );
  const emergencySnackEligibility = checkEmergencySnackEligibility(
    pet,
    dailyFocusState,
  );
  const sharedDisabled = disabled || isFocusActive || sleeping;
  const powerNapDisabled = sharedDisabled || !powerNapEligibility.canApply;
  const emergencySnackDisabled =
    sharedDisabled || !emergencySnackEligibility.canApply;
  const emergencySnackNeeded = isEmergencySnackNeeded(pet);
  const panelStatus = rescuePanelStatus(
    t,
    isFocusActive,
    powerNapEligibility,
    emergencySnackEligibility,
  );

  return (
    <div className="space-y-4 rounded-lg border border-rose-100 bg-rose-50/55 p-4 text-left text-slate-950">
      <div className="flex items-start justify-between gap-3 max-[420px]:flex-col max-[420px]:gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">{t("rescueTitle")}</p>
          <p className="text-sm leading-6 text-slate-600">
            {isFocusActive
              ? t("rescueUnavailableDuringFocus")
              : t("rescueSupport", { pet: pet.name })}
          </p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ring-1",
            panelStatus.tone === "ready"
              ? "bg-white text-teal-700 ring-teal-100"
              : "bg-slate-50 text-slate-600 ring-slate-100",
          ].join(" ")}
        >
          {panelStatus.label}
        </span>
      </div>

      <div className="grid gap-3 min-[520px]:grid-cols-2">
        <RescueActionCard
          actionLabel={t("takePowerNap")}
          disabled={powerNapDisabled}
          onClick={onPowerNap}
          status={powerNapStatus(t, powerNapEligibility.reasons)}
          statusTone={powerNapEligibility.canApply ? "ready" : "muted"}
          support={powerNapSupport(t, pet.name, powerNapEligibility.reasons)}
          title={t("powerNapTitle")}
          tone="rest"
          chips={[
            t("powerNapDurationChip", {
              minutes: POWER_NAP_DURATION_MINUTES,
            }),
            t("energyChangeChip", {
              value: formatSigned(POWER_NAP_ENERGY_GAIN),
            }),
            t("hungerChangeChip", {
              value: formatSigned(-POWER_NAP_HUNGER_COST),
            }),
          ]}
        />

        <RescueActionCard
          actionLabel={t("offerEmergencySnack")}
          disabled={emergencySnackDisabled}
          onClick={onEmergencySnack}
          status={emergencySnackStatus(
            t,
            emergencySnackEligibility.reasons,
            emergencySnackNeeded,
          )}
          statusTone={emergencySnackEligibility.canApply ? "ready" : "muted"}
          support={emergencySnackSupport(
            t,
            pet.name,
            emergencySnackEligibility.reasons,
            emergencySnackNeeded,
          )}
          title={t("emergencySnackTitle")}
          tone="snack"
          chips={[
            t("hungerChangeChip", {
              value: formatSigned(EMERGENCY_SNACK_HUNGER_GAIN),
            }),
            t("emergencySnackFreeChip"),
            t("emergencySnackDailyChip"),
          ]}
        />
      </div>

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

function RescueActionCard({
  actionLabel,
  chips,
  disabled,
  onClick,
  status,
  statusTone,
  support,
  title,
  tone,
}: {
  actionLabel: string;
  chips: string[];
  disabled: boolean;
  onClick: () => void;
  status: string;
  statusTone: "ready" | "muted";
  support: string;
  title: string;
  tone: "rest" | "snack";
}) {
  const statusClasses =
    statusTone === "ready"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : "bg-slate-50 text-slate-600 ring-slate-100";

  return (
    <div className="flex min-h-52 flex-col justify-between gap-4 rounded-lg bg-white/80 p-3 ring-1 ring-rose-100">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <span
            className={[
              "shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wide ring-1",
              statusClasses,
            ].join(" ")}
          >
            {status}
          </span>
        </div>
        <p className="min-h-10 text-xs leading-5 text-slate-600">{support}</p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              className="rounded-full bg-slate-50 px-2 py-1 text-[0.72rem] font-medium text-slate-600 ring-1 ring-slate-100"
              key={chip}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <Button
        className="w-full text-sm"
        disabled={disabled}
        onClick={onClick}
        variant={tone === "rest" ? "secondary" : "primary"}
      >
        {actionLabel}
      </Button>
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
    <div className="rounded-md border border-rose-100 bg-white/80 p-3 text-sm leading-6 text-slate-700">
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



function rescuePanelStatus(
  t: Translator,
  isFocusActive: boolean,
  powerNapEligibility: RescueEligibility,
  emergencySnackEligibility: RescueEligibility,
): { label: string; tone: "ready" | "muted" } {
  if (isFocusActive) {
    return { label: t("rescueAfterFocus"), tone: "muted" };
  }

  if (powerNapEligibility.canApply || emergencySnackEligibility.canApply) {
    return { label: t("rescueCareReady"), tone: "ready" };
  }

  if (
    powerNapEligibility.reasons.includes(POWER_NAP_COOLDOWN_ACTIVE_ERROR) &&
    !powerNapEligibility.reasons.includes(POWER_NAP_DAILY_LIMIT_ERROR)
  ) {
    return { label: t("rescueCoolingDown"), tone: "muted" };
  }

  if (
    powerNapEligibility.reasons.includes(POWER_NAP_DAILY_LIMIT_ERROR) &&
    emergencySnackEligibility.reasons.includes(
      EMERGENCY_SNACK_DAILY_LIMIT_ERROR,
    )
  ) {
    return { label: t("rescueDoneToday"), tone: "muted" };
  }

  return { label: t("rescueSaved"), tone: "muted" };
}

function powerNapSupport(
  t: Translator,
  petName: string,
  reasons: string[],
): string {
  if (reasons.includes(POWER_NAP_DAILY_LIMIT_ERROR)) {
    return t("powerNapLimitSupport", { pet: petName });
  }

  if (reasons.includes(POWER_NAP_COOLDOWN_ACTIVE_ERROR)) {
    return t("powerNapUnavailableSupport", { pet: petName });
  }

  return t("powerNapSupport", {
    minutes: POWER_NAP_DURATION_MINUTES,
    pet: petName,
  });
}

function powerNapStatus(t: Translator, reasons: string[]): string {
  if (reasons.includes(POWER_NAP_DAILY_LIMIT_ERROR)) {
    return t("rescueDoneToday");
  }

  if (reasons.includes(POWER_NAP_COOLDOWN_ACTIVE_ERROR)) {
    return t("rescueCoolingDown");
  }

  return t("rescueReady");
}

function emergencySnackSupport(
  t: Translator,
  petName: string,
  reasons: string[],
  emergencySnackNeeded: boolean,
): string {
  if (reasons.includes(EMERGENCY_SNACK_DAILY_LIMIT_ERROR)) {
    return t("emergencySnackLimitSupport", { pet: petName });
  }

  if (!emergencySnackNeeded) {
    return t("emergencySnackSavedSupport", { pet: petName });
  }

  return t("emergencySnackSupport", { pet: petName });
}

function emergencySnackStatus(
  t: Translator,
  reasons: string[],
  emergencySnackNeeded: boolean,
): string {
  if (reasons.includes(EMERGENCY_SNACK_DAILY_LIMIT_ERROR)) {
    return t("rescueDoneToday");
  }

  if (!emergencySnackNeeded) {
    return t("rescueSaved");
  }

  return t("rescueReady");
}
