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
      <div className="grid grid-cols-2 gap-3">
        <StatRow label={t("level")} value={pet.level} />
        <StatRow label={t("mood")} value={moodLabel(displayMood, t)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
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

  if (mood === "sleepy") {
    return t("moodSleepy");
  }

  return t("moodCalm");
}
