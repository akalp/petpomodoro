import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { PetDashboard } from "../../components/pet/PetDashboard";
import type {
  PetDisplayMood,
  PetSleepSummary,
  PetState,
} from "../../domain";
import type { Translator } from "../../i18n";

import { PetMoodShowcase } from "./PetMoodShowcase";

interface PetScreenProps {
  displayMood: PetDisplayMood | null;
  installHint: ReactNode;
  isFocusActive: boolean;
  isSleepDisabled: boolean;
  lastSleepSummary: PetSleepSummary | null;
  onClearSleepSummary: () => void;
  onStartSleep: () => void;
  onWakeSleep: () => void;
  pet: PetState | null;
  petMessage: string;
  sleepPreview: PetSleepSummary | null;
  t: Translator;
}

export function PetScreen({
  displayMood,
  installHint,
  isFocusActive,
  isSleepDisabled,
  lastSleepSummary,
  onClearSleepSummary,
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
        isFocusActive={isFocusActive}
        isSleepDisabled={isSleepDisabled}
        lastSleepSummary={lastSleepSummary}
        onClearSleepSummary={onClearSleepSummary}
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
