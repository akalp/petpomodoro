import type { FocusSessionStatus, PetDisplayMood, PetMood, PetState } from "./types";

export const XP_PER_LEVEL = 100;
export const MAX_PET_STAT = 100;
export const MAX_HUNGER = MAX_PET_STAT;
export const DEFAULT_HUNGER_DECAY_PER_HOUR = 4;

export interface PetStatAdjustments {
  xp?: number;
  coins?: number;
  happiness?: number;
  hunger?: number;
  energy?: number;
  streak?: number;
  honestyHearts?: number;
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function addPetXp(pet: PetState, xpToAdd: number, now: string): PetState {
  return applyPetStatAdjustments(pet, { xp: xpToAdd }, now);
}

export function applyPetStatAdjustments(
  pet: PetState,
  adjustments: PetStatAdjustments,
  now: string,
): PetState {
  const xp = Math.max(0, pet.xp + (adjustments.xp ?? 0));
  const happiness = clampPetStat(pet.happiness + (adjustments.happiness ?? 0));
  const hunger = clampPetStat(pet.hunger + (adjustments.hunger ?? 0));
  const energy = clampPetStat(pet.energy + (adjustments.energy ?? 0));

  return {
    ...pet,
    xp,
    level: calculateLevel(xp),
    coins: Math.max(0, pet.coins + (adjustments.coins ?? 0)),
    happiness,
    hunger,
    energy,
    streak: Math.max(0, pet.streak + (adjustments.streak ?? 0)),
    honestyHearts: Math.max(
      0,
      pet.honestyHearts + (adjustments.honestyHearts ?? 0),
    ),
    lastHungerUpdatedAt:
      adjustments.hunger === undefined ? pet.lastHungerUpdatedAt : now,
    mood: moodForStats({ happiness, hunger, energy }),
    updatedAt: now,
  };
}

export function applyHungerDecay(
  pet: PetState,
  now: string,
  decayPerHour = DEFAULT_HUNGER_DECAY_PER_HOUR,
): PetState {
  const elapsedMs = Date.parse(now) - Date.parse(pet.lastHungerUpdatedAt);

  if (elapsedMs <= 0 || decayPerHour <= 0) {
    return pet;
  }

  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const hunger = clampHunger(pet.hunger - elapsedHours * decayPerHour);

  return {
    ...pet,
    hunger,
    mood: moodForStats({ happiness: pet.happiness, hunger, energy: pet.energy }),
    lastHungerUpdatedAt: now,
    updatedAt: now,
  };
}

export function moodForHunger(hunger: number): PetMood {
  return moodForStats({ happiness: 50, hunger, energy: 50 });
}

export function displayMoodForSession(
  mood: PetMood,
  sessionStatus: FocusSessionStatus | null,
): PetDisplayMood {
  return sessionStatus === "running" ? "working" : mood;
}

export function moodForStats({
  happiness,
  hunger,
  energy,
}: Pick<PetState, "happiness" | "hunger" | "energy">): PetMood {
  if (hunger <= 25 || energy <= 15) {
    return "sleepy";
  }

  if (happiness >= 60) {
    return "happy";
  }

  return "calm";
}

export function normalizePetState(pet: PetState): PetState {
  const happiness = clampPetStat(pet.happiness ?? 50);
  const hunger = clampPetStat(pet.hunger ?? 100);
  const energy = clampPetStat(pet.energy ?? 80);

  return {
    ...pet,
    coins: Math.max(0, pet.coins ?? 0),
    happiness,
    hunger,
    energy,
    streak: Math.max(0, pet.streak ?? 0),
    honestyHearts: Math.max(0, pet.honestyHearts ?? 0),
    lastHungerUpdatedAt: pet.lastHungerUpdatedAt ?? pet.updatedAt,
    mood: moodForStats({ happiness, hunger, energy }),
  };
}

function clampHunger(hunger: number): number {
  return clampPetStat(hunger);
}

function clampPetStat(value: number): number {
  return Math.min(MAX_PET_STAT, Math.max(0, value));
}
