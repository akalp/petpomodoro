import type {
  DailyFocusState,
  EmergencySnackSummary,
  PetDisplayMood,
  PetSleepSummary,
  PetState,
  PowerNapSummary,
} from "../../domain";
import type { Translator } from "../../i18n";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

import { PetAvatar } from "./PetAvatar";
import { PetRescueControl } from "./PetRescueControl";
import { PetSleepControl } from "./PetSleepControl";
import { PetStats } from "./PetStats";

interface PetDashboardProps {
  dailyFocusToday: DailyFocusState | null;
  displayMood: PetDisplayMood | null;
  isFocusActive: boolean;
  isSleepDisabled: boolean;
  lastEmergencySnackSummary: EmergencySnackSummary | null;
  lastPowerNapSummary: PowerNapSummary | null;
  lastSleepSummary: PetSleepSummary | null;
  now: string;
  onClearEmergencySnackSummary: () => void;
  onClearPowerNapSummary: () => void;
  onClearSleepSummary: () => void;
  onEmergencySnack: () => void;
  onPowerNap: () => void;
  onStartSleep: () => void;
  onWakeSleep: () => void;
  pet: PetState | null;
  petMessage: string;
  sleepPreview: PetSleepSummary | null;
  t: Translator;
}

export function PetDashboard({
  dailyFocusToday,
  displayMood,
  isFocusActive,
  isSleepDisabled,
  lastEmergencySnackSummary,
  lastPowerNapSummary,
  lastSleepSummary,
  now,
  onClearEmergencySnackSummary,
  onClearPowerNapSummary,
  onClearSleepSummary,
  onEmergencySnack,
  onPowerNap,
  onStartSleep,
  onWakeSleep,
  pet,
  petMessage,
  sleepPreview,
  t,
}: PetDashboardProps) {
  if (!pet) {
    return (
      <Card className="text-center">
        <div className="mx-auto h-32 w-32 animate-pulse rounded-full bg-rose-100" />
        <p className="mt-5 text-lg font-semibold text-slate-900">
          {t("meetPet")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t("startSmallSession")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5 text-center">
      <div className="flex items-center justify-between gap-3 text-left">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {pet.name}
          </h1>
        </div>
        <Badge>{t("levelValue", { level: pet.level })}</Badge>
      </div>
      <PetAvatar
        message={petMessage}
        mood={displayMood ?? pet.mood}
        speciesId={pet.speciesId}
        t={t}
      />
      <PetStats displayMood={displayMood ?? pet.mood} pet={pet} t={t} />
      <PetRescueControl
        dailyFocusToday={dailyFocusToday}
        disabled={isSleepDisabled}
        isFocusActive={isFocusActive}
        lastEmergencySnackSummary={lastEmergencySnackSummary}
        lastPowerNapSummary={lastPowerNapSummary}
        now={now}
        onClearEmergencySnackSummary={onClearEmergencySnackSummary}
        onClearPowerNapSummary={onClearPowerNapSummary}
        onEmergencySnack={onEmergencySnack}
        onPowerNap={onPowerNap}
        pet={pet}
        t={t}
      />
      <PetSleepControl
        disabled={isSleepDisabled}
        isFocusActive={isFocusActive}
        lastSleepSummary={lastSleepSummary}
        onClearSleepSummary={onClearSleepSummary}
        onStartSleep={onStartSleep}
        onWakeSleep={onWakeSleep}
        pet={pet}
        sleepPreview={sleepPreview}
        t={t}
      />
    </Card>
  );
}
