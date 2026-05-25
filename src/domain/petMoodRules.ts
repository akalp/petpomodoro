import type { PetMood, PetState } from "./types";

export type PetMoodStats = Pick<PetState, "happiness" | "hunger" | "energy">;

export interface PetMoodRule {
  mood: PetMood;
  priority: number;
  matches: (stats: PetMoodStats) => boolean;
}

export const PET_MOOD_RULES = [
  { mood: "hungry", priority: 100, matches: ({ hunger }) => hunger <= 25 },
  { mood: "tired", priority: 90, matches: ({ energy }) => energy <= 15 },
  { mood: "sad", priority: 80, matches: ({ happiness }) => happiness <= 25 },
  { mood: "happy", priority: 40, matches: ({ happiness }) => happiness >= 60 },
  { mood: "calm", priority: 0, matches: () => true },
] as const satisfies readonly PetMoodRule[];

export function resolvePetMood(stats: PetMoodStats): PetMood {
  const matchingRule = [...PET_MOOD_RULES]
    .sort((left, right) => right.priority - left.priority)
    .find((rule) => rule.matches(stats));

  if (!matchingRule) {
    throw new Error("Pet mood rules must include a default rule.");
  }

  return matchingRule.mood;
}
