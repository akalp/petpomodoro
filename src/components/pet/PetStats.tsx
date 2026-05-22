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
      <ProgressBar label="Pet progress" max={XP_PER_LEVEL} value={levelXp} />
      <div className="grid grid-cols-2 gap-3">
        <StatRow label="Level" value={pet.level} />
        <StatRow label="Mood" value={moodLabel(pet.mood)} />
      </div>
      <StatRow label="Total XP" value={pet.xp} />
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
