import type { PetMood, PetState } from "./types";

export const XP_PER_LEVEL = 100;
export const MAX_HUNGER = 100;
export const DEFAULT_HUNGER_DECAY_PER_HOUR = 4;

export function calculateLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function addPetXp(pet: PetState, xpToAdd: number, now: string): PetState {
  const xp = Math.max(0, pet.xp + xpToAdd);

  return {
    ...pet,
    xp,
    level: calculateLevel(xp),
    mood: "happy",
    updatedAt: now,
  };
}

export function applyHungerDecay(
  pet: PetState,
  now: string,
  decayPerHour = DEFAULT_HUNGER_DECAY_PER_HOUR,
): PetState {
  const elapsedMs = Date.parse(now) - Date.parse(pet.updatedAt);

  if (elapsedMs <= 0 || decayPerHour <= 0) {
    return pet;
  }

  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const hunger = clampHunger(pet.hunger - elapsedHours * decayPerHour);

  return {
    ...pet,
    hunger,
    mood: moodForHunger(hunger),
    updatedAt: now,
  };
}

export function moodForHunger(hunger: number): PetMood {
  if (hunger <= 25) {
    return "sleepy";
  }

  return "calm";
}

function clampHunger(hunger: number): number {
  return Math.min(MAX_HUNGER, Math.max(0, hunger));
}
