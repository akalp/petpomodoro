import type { PetDisplayMood, PetState } from "../../domain";
import type { Translator } from "../../i18n";
import { PetDashboard } from "../../components/pet/PetDashboard";

interface PetScreenProps {
  displayMood: PetDisplayMood | null;
  pet: PetState | null;
  t: Translator;
}

export function PetScreen({ displayMood, pet, t }: PetScreenProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <PetDashboard displayMood={displayMood} pet={pet} t={t} />
    </section>
  );
}
