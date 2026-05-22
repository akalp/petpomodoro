import type { PetMood } from "../../domain";

interface PetAvatarProps {
  mood: PetMood;
}

const moodFace: Record<PetMood, string> = {
  calm: "^_^",
  happy: "*_*",
  sleepy: "-_-",
};

export function PetAvatar({ mood }: PetAvatarProps) {
  return (
    <div
      aria-label={`Pet mood: ${mood}`}
      className="relative mx-auto flex aspect-square w-40 items-center justify-center rounded-full bg-teal-100 shadow-inner shadow-teal-200"
      role="img"
    >
      <div className="absolute top-8 h-9 w-24 rounded-full bg-rose-100" />
      <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-amber-100 text-slate-800 shadow-sm">
        <div className="absolute -left-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <div className="absolute -right-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <span className="text-2xl font-bold tracking-normal">{moodFace[mood]}</span>
        <span className="mt-2 h-2 w-8 rounded-full bg-rose-300" />
      </div>
    </div>
  );
}
