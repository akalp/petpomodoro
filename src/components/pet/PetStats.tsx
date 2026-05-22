import { XP_PER_LEVEL, type PetState } from "../../domain";
import { ProgressBar } from "../ui/ProgressBar";
import { StatRow } from "../ui/StatRow";

interface PetStatsProps {
  pet: PetState;
}

export function PetStats({ pet }: PetStatsProps) {
  const levelXp = pet.xp % XP_PER_LEVEL;

  return (
    <div className="space-y-3">
      <ProgressBar label="XP progress" max={XP_PER_LEVEL} value={levelXp} />
      <div className="grid grid-cols-2 gap-3">
        <StatRow label="Level" value={pet.level} />
        <StatRow label="Mood" value={moodLabel(pet.mood)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatRow label="Coins" value={pet.coins} />
        <StatRow label="Streak" value={pet.streak} />
      </div>
      <ProgressBar label="Happiness" max={100} value={pet.happiness} />
      <ProgressBar label="Hunger" max={100} value={pet.hunger} />
      <ProgressBar label="Energy" max={100} value={pet.energy} />
      <StatRow label="Total XP" value={pet.xp} />
      <StatRow label="Honesty hearts" value={pet.honestyHearts} />
    </div>
  );
}

function moodLabel(mood: PetState["mood"]): string {
  if (mood === "happy") {
    return "Happy";
  }

  if (mood === "sleepy") {
    return "Sleepy";
  }

  return "Calm";
}
