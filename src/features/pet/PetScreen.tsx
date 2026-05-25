import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { PetDashboard } from "../../components/pet/PetDashboard";
import type {
  PetDisplayMood,
  PetSleepSummary,
  PetSpeciesId,
  PetState,
} from "../../domain";
import type { Translator } from "../../i18n";

import { PetMoodShowcase } from "./PetMoodShowcase";
import { PetSpeciesSelector } from "./PetSpeciesSelector";

interface PetScreenProps {
  displayMood: PetDisplayMood | null;
  installHint: ReactNode;
  isFocusActive: boolean;
  isSleepDisabled: boolean;
  isSpeciesSelectionDisabled: boolean;
  lastSleepSummary: PetSleepSummary | null;
  onClearSleepSummary: () => void;
  onSelectSpecies: (speciesId: PetSpeciesId) => void;
  onStartSleep: () => void;
  onWakeSleep: () => void;
  pet: PetState | null;
  sleepPreview: PetSleepSummary | null;
  t: Translator;
}

export function PetScreen({
  displayMood,
  installHint,
  isFocusActive,
  isSleepDisabled,
  isSpeciesSelectionDisabled,
  lastSleepSummary,
  onClearSleepSummary,
  onSelectSpecies,
  onStartSleep,
  onWakeSleep,
  pet,
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
        sleepPreview={sleepPreview}
        t={t}
      />
      {pet ? (
        <PetSpeciesSelector
          disabled={isSpeciesSelectionDisabled}
          onSelectSpecies={onSelectSpecies}
          pet={pet}
          t={t}
        />
      ) : null}
    </section>
  );
}
