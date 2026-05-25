import type { PetDisplayMood, PetState } from "../../domain";
import type { Translator } from "../../i18n";
import { PetDashboard } from "../../components/pet/PetDashboard";
import { useLocation } from "react-router-dom";

import { PetMoodShowcase } from "./PetMoodShowcase";

interface PetScreenProps {
  displayMood: PetDisplayMood | null;
  pet: PetState | null;
  t: Translator;
}

export function PetScreen({ displayMood, pet, t }: PetScreenProps) {
  const location = useLocation();
  const isMoodShowcase =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "moods";

  if (isMoodShowcase) {
    return <PetMoodShowcase t={t} />;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <PetDashboard displayMood={displayMood} pet={pet} t={t} />
    </section>
  );
}
