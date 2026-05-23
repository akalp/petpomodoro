import { XP_PER_LEVEL, type PetDisplayMood, type PetState } from "../../domain";
import type { Translator } from "../../i18n";
import { ProgressBar } from "../ui/ProgressBar";
import { StatRow } from "../ui/StatRow";

interface PetStatsProps {
  displayMood: PetDisplayMood;
  pet: PetState;
  t: Translator;
}

export function PetStats({ displayMood, pet, t }: PetStatsProps) {
  const levelXp = pet.xp % XP_PER_LEVEL;

  return (
    <div className="space-y-3">
      <ProgressBar label={t("xpProgress")} max={XP_PER_LEVEL} value={levelXp} />
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <StatRow label={t("mood")} value={moodLabel(displayMood, t)} />
        <StatRow label={t("coins")} value={pet.coins} />
        <StatRow label={t("streak")} value={pet.streak} />
      </div>
      <ProgressBar label={t("happiness")} max={100} value={pet.happiness} />
      <ProgressBar label={t("hunger")} max={100} value={pet.hunger} />
      <ProgressBar label={t("energy")} max={100} value={pet.energy} />
      <StatRow label={t("totalXp")} value={pet.xp} />
      <StatRow label={t("honestyHearts")} value={pet.honestyHearts} />
    </div>
  );
}

function moodLabel(mood: PetDisplayMood, t: Translator): string {
  if (mood === "working") {
    return t("moodWorking");
  }

  if (mood === "happy") {
    return t("moodHappy");
  }

  if (mood === "hungry") {
    return t("moodHungry");
  }

  if (mood === "tired") {
    return t("moodTired");
  }

  if (mood === "sad") {
    return t("moodSad");
  }

  return t("moodCalm");
}
