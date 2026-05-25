import type { FocusSessionStatus, PetDisplayMood, PetMood, PetState } from "./types";
import { resolvePetMood, type PetMoodStats } from "./petMoodRules";

export const XP_PER_LEVEL = 100;
export const MAX_PET_STAT = 100;
export const MAX_HUNGER = MAX_PET_STAT;
export const DEFAULT_HUNGER_DECAY_PER_HOUR = 4;
export const APP_OPEN_HAPPINESS_DECAY_PER_HOUR = 0.25;
export const MAX_APP_OPEN_HAPPINESS_DECAY = 6;
export const FOCUS_HUNGER_DECAY_PER_MINUTE = 0.2;
export const FOCUS_ENERGY_DECAY_PER_MINUTE = 0.28;
export const FOCUS_COIN_MINUTES = 5;

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
  return applyIdlePetDecay(pet, now, decayPerHour);
}

export function applyIdlePetDecay(
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
  const happiness = clampPetStat(
    pet.happiness - lowCareHappinessDecay(hunger, pet.energy, elapsedHours),
  );

  return {
    ...pet,
    hunger,
    happiness,
    mood: moodForStats({ happiness, hunger, energy: pet.energy }),
    lastHungerUpdatedAt: now,
    updatedAt: now,
  };
}

export function applyAppOpenDecay(pet: PetState, now: string): PetState {
  const elapsedMs = Date.parse(now) - Date.parse(pet.lastAppOpenedAt);

  if (elapsedMs <= 0) {
    return pet;
  }

  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const happiness = clampPetStat(
    pet.happiness -
      Math.min(elapsedHours * APP_OPEN_HAPPINESS_DECAY_PER_HOUR, MAX_APP_OPEN_HAPPINESS_DECAY),
  );

  return {
    ...pet,
    happiness,
    lastAppOpenedAt: now,
    mood: moodForStats({ happiness, hunger: pet.hunger, energy: pet.energy }),
    updatedAt: now,
  };
}

export interface FocusImpactResult {
  pet: PetState;
  session: FocusSessionWithImpact;
}

export type FocusSessionWithImpact = PetFocusSessionFields & {
  id: string;
  startedAt: string;
  expectedEndAt: string;
  confirmedAt: string | null;
  abandonedAt: string | null;
};

interface PetFocusSessionFields {
  focusImpactAppliedUntil: string;
  focusCoinsAwarded: number;
}

export function applyFocusSessionImpact<
  TSession extends FocusSessionWithImpact,
>(pet: PetState, session: TSession, now: string): { pet: PetState; session: TSession } {
  const impactUntil = focusImpactUntil(session, now);
  const appliedUntil = session.focusImpactAppliedUntil || session.startedAt;
  const elapsedMs = Date.parse(impactUntil) - Date.parse(appliedUntil);

  if (elapsedMs <= 0) {
    return { pet, session };
  }

  const elapsedMinutes = elapsedMs / (60 * 1000);
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const totalFocusMinutes =
    (Date.parse(impactUntil) - Date.parse(session.startedAt)) / (60 * 1000);
  const totalCoinsEarned = Math.max(
    0,
    Math.floor(totalFocusMinutes / FOCUS_COIN_MINUTES),
  );
  const coinsToAward = Math.max(0, totalCoinsEarned - session.focusCoinsAwarded);
  const hunger = clampPetStat(
    pet.hunger - elapsedMinutes * FOCUS_HUNGER_DECAY_PER_MINUTE,
  );
  const energy = clampPetStat(
    pet.energy - elapsedMinutes * FOCUS_ENERGY_DECAY_PER_MINUTE,
  );
  const happiness = clampPetStat(
    pet.happiness - lowCareHappinessDecay(hunger, energy, elapsedHours),
  );
  const nextPet = {
    ...pet,
    coins: Math.max(0, pet.coins + coinsToAward),
    happiness,
    hunger,
    energy,
    lastHungerUpdatedAt: impactUntil,
    mood: moodForStats({ happiness, hunger, energy }),
    updatedAt: now,
  };
  const nextSession = {
    ...session,
    focusImpactAppliedUntil: impactUntil,
    focusCoinsAwarded: session.focusCoinsAwarded + coinsToAward,
  };

  return { pet: nextPet, session: nextSession };
}

export function shouldPersistFocusSessionImpact(
  session: FocusSessionWithImpact,
  now: string,
): boolean {
  const impactUntil = focusImpactUntil(session, now);
  const appliedUntil = session.focusImpactAppliedUntil || session.startedAt;
  const elapsedMs = Date.parse(impactUntil) - Date.parse(appliedUntil);

  return (
    elapsedMs >= 60 * 1000 ||
    (Date.parse(impactUntil) >= Date.parse(session.expectedEndAt) && elapsedMs > 0)
  );
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
}: PetMoodStats): PetMood {
  return resolvePetMood({ happiness, hunger, energy });
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
    lastAppOpenedAt:
      pet.lastAppOpenedAt ?? pet.lastHungerUpdatedAt ?? pet.updatedAt,
    mood: moodForStats({ happiness, hunger, energy }),
  };
}

function focusImpactUntil(
  session: FocusSessionWithImpact,
  now: string,
): string {
  const terminalAt = session.abandonedAt ?? session.confirmedAt ?? now;
  const cappedMs = Math.min(
    Date.parse(terminalAt),
    Date.parse(now),
    Date.parse(session.expectedEndAt),
  );

  return new Date(Math.max(Date.parse(session.startedAt), cappedMs)).toISOString();
}

function lowCareHappinessDecay(
  hunger: number,
  energy: number,
  elapsedHours: number,
): number {
  const lowCarePressure =
    (Math.max(0, 50 - hunger) + Math.max(0, 50 - energy)) / 100;

  return Math.min(elapsedHours * lowCarePressure, elapsedHours);
}

function clampHunger(hunger: number): number {
  return clampPetStat(hunger);
}

function clampPetStat(value: number): number {
  return Math.min(MAX_PET_STAT, Math.max(0, value));
}
