import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { PetDashboard } from "../../components/pet/PetDashboard";
import type {
  DailyFocusState,
  EmergencySnackSummary,
  PetDisplayMood,
  PetSleepSummary,
  PetState,
  PowerNapSummary,
} from "../../domain";
import type { Translator } from "../../i18n";

import { PetMoodShowcase } from "./PetMoodShowcase";

interface PetScreenProps {
  displayMood: PetDisplayMood | null;
  dailyFocusToday: DailyFocusState | null;
  installHint: ReactNode;
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

export function PetScreen({
  displayMood,
  dailyFocusToday,
  installHint,
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
}: PetScreenProps) {
  const location = useLocation();
  const isMoodShowcase =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "moods";

  if (isMoodShowcase) {
    return <PetMoodShowcase t={t} />;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      {installHint}
      <PetDashboard
        displayMood={displayMood}
        dailyFocusToday={dailyFocusToday}
        isFocusActive={isFocusActive}
        isSleepDisabled={isSleepDisabled}
        lastEmergencySnackSummary={lastEmergencySnackSummary}
        lastPowerNapSummary={lastPowerNapSummary}
        lastSleepSummary={lastSleepSummary}
        now={now}
        onClearEmergencySnackSummary={onClearEmergencySnackSummary}
        onClearPowerNapSummary={onClearPowerNapSummary}
        onClearSleepSummary={onClearSleepSummary}
        onEmergencySnack={onEmergencySnack}
        onPowerNap={onPowerNap}
        onStartSleep={onStartSleep}
        onWakeSleep={onWakeSleep}
        pet={pet}
        petMessage={petMessage}
        sleepPreview={sleepPreview}
        t={t}
      />
    </section>
  );
}
