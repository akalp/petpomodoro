import { DomainError } from "./errors";
import {
  ACTIVE_BALANCE_PROFILE,
  calculateFocusStartEligibility,
  calculateFocusCareImpact,
  calculateIdleCareImpact,
  calculateLowCareHappinessDecay,
  calculateMoodForStats,
  calculateWakeUpEffects,
  clampPetStat as clampBalancePetStat,
} from "./balance";
import type {
  FocusSessionStatus,
  PetDisplayMood,
  PetMood,
  PetSpeciesId,
  PetState,
} from "./types";
import { resolvePetMood, type PetMoodStats } from "./petMoodRules";

export const XP_PER_LEVEL = ACTIVE_BALANCE_PROFILE.progression.xpPerLevel;
export const MAX_PET_STAT = ACTIVE_BALANCE_PROFILE.progression.maxPetStat;
export const MAX_HUNGER = MAX_PET_STAT;
export const DEFAULT_HUNGER_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.care.hungerDecayPerHour;
export const BASE_HAPPINESS_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.care.baseHappinessDecayPerHour;
export const APP_OPEN_HAPPINESS_DECAY_PER_HOUR =
  BASE_HAPPINESS_DECAY_PER_HOUR;
export const LOW_HUNGER_HAPPINESS_THRESHOLD =
  ACTIVE_BALANCE_PROFILE.care.lowHungerHappinessThreshold;
export const LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.care.lowHungerHappinessDecayPerHour;
export const LOW_ENERGY_HAPPINESS_THRESHOLD =
  ACTIVE_BALANCE_PROFILE.care.lowEnergyHappinessThreshold;
export const LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.care.lowEnergyHappinessDecayPerHour;
export const CRITICAL_HUNGER_ENERGY_THRESHOLD =
  ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyThreshold;
export const CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyDecayPerHour;
export const MAX_APP_OPEN_HAPPINESS_DECAY =
  ACTIVE_BALANCE_PROFILE.care.maxAppOpenHappinessDecay;
export const FOCUS_HUNGER_DECAY_PER_MINUTE =
  ACTIVE_BALANCE_PROFILE.focus.hungerDecayPerMinute;
export const FOCUS_ENERGY_DECAY_PER_MINUTE =
  ACTIVE_BALANCE_PROFILE.focus.energyDecayPerMinute;
export const FOCUS_COIN_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.baseCoinIntervalMinutes;
export const SLEEP_ENERGY_GAIN_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.sleep.energyGainPerHour;
export const SLEEP_HUNGER_DECAY_PER_HOUR =
  ACTIVE_BALANCE_PROFILE.sleep.hungerDecayPerHour;
export const SLEEP_HAPPINESS_ENERGY_STEP =
  ACTIVE_BALANCE_PROFILE.sleep.happinessEnergyStep;
export const SLEEP_HAPPINESS_MAX_GAIN =
  ACTIVE_BALANCE_PROFILE.sleep.maxHappinessGain;
export const MAX_SLEEP_HAPPINESS_GAIN = SLEEP_HAPPINESS_MAX_GAIN;
export const PET_ALREADY_SLEEPING_ERROR = "pet_already_sleeping";
export const PET_NOT_SLEEPING_ERROR = "pet_not_sleeping";
export const PET_SLEEPING_CANNOT_FOCUS_ERROR = "pet_sleeping_cannot_focus";
export const PET_FOCUS_NEEDS_CARE_ERROR = "pet_focus_needs_care";
export const DEFAULT_PET_SPECIES_ID = "momo" satisfies PetSpeciesId;
export const PET_DEFAULT_NAME_BY_SPECIES = {
  momo: "Momo",
  moowi: "Moowi",
} satisfies Record<PetSpeciesId, string>;

export interface PetStatAdjustments {
  xp?: number;
  coins?: number;
  happiness?: number;
  hunger?: number;
  energy?: number;
  streak?: number;
  honestyHearts?: number;
}

export interface PetSleepSummary {
  startedAt: string;
  endedAt: string;
  elapsedMinutes: number;
  energyGained: number;
  hungerChanged: number;
  happinessGained: number;
  previousStats: Pick<PetState, "hunger" | "happiness" | "energy">;
  nextStats: Pick<PetState, "hunger" | "happiness" | "energy">;
}

export interface PetSleepResult {
  pet: PetState;
  summary: PetSleepSummary;
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
  const impact = calculateIdleCareImpact(
    pet,
    pet.lastHungerUpdatedAt,
    now,
    ACTIVE_BALANCE_PROFILE,
    { hungerDecayPerHour: decayPerHour },
  );

  if (
    impact.hungerChanged === 0 &&
    impact.happinessChanged === 0 &&
    impact.energyChanged === 0
  ) {
    return pet;
  }

  const { hunger, happiness, energy } = impact.nextStats;

  return {
    ...pet,
    hunger,
    happiness,
    energy,
    mood: moodForStats({ happiness, hunger, energy }),
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
  const totalCoinsEarned =
    calculateFocusCareImpact(totalFocusMinutes).coinsEarned;
  const coinsToAward = Math.max(0, totalCoinsEarned - session.focusCoinsAwarded);
  const focusImpact = calculateFocusCareImpact(elapsedMinutes);
  const hunger = clampPetStat(pet.hunger + focusImpact.hungerChanged);
  const energy = clampPetStat(pet.energy + focusImpact.energyChanged);
  const happiness = clampPetStat(
    pet.happiness -
      calculateLowCareHappinessDecay(
        hunger,
        energy,
        elapsedHours,
        ACTIVE_BALANCE_PROFILE,
      ),
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
  isSleeping = false,
): PetDisplayMood {
  if (sessionStatus === "running") {
    return calculateMoodForStats(
      { happiness: 50, hunger: 50, energy: 50 },
      { isWorking: true },
    );
  }

  if (isSleeping) {
    return calculateMoodForStats(
      { happiness: 50, hunger: 50, energy: 50 },
      { isSleeping: true },
    );
  }

  return mood;
}

export function canPetStartFocus(
  pet: Pick<PetState, "energy" | "hunger">,
  minutes: number,
): boolean {
  return calculateFocusStartEligibility(pet, minutes).canStart;
}

export function moodForStats({
  happiness,
  hunger,
  energy,
}: PetMoodStats): PetMood {
  const mood = calculateMoodForStats({ happiness, hunger, energy });

  if (mood === "working" || mood === "sleeping") {
    return resolvePetMood({ happiness, hunger, energy });
  }

  return mood;
}

export function normalizePetState(pet: PetState): PetState {
  const happiness = clampPetStat(pet.happiness ?? 50);
  const hunger = clampPetStat(pet.hunger ?? 100);
  const energy = clampPetStat(pet.energy ?? 80);
  const speciesId = pet.speciesId ?? DEFAULT_PET_SPECIES_ID;
  const customName =
    pet.customName === undefined
      ? legacyCustomName(pet.name)
      : pet.customName;

  return {
    ...pet,
    speciesId,
    name: customName ?? defaultPetNameForSpecies(speciesId),
    customName,
    coins: Math.max(0, pet.coins ?? 0),
    happiness,
    hunger,
    energy,
    streak: Math.max(0, pet.streak ?? 0),
    honestyHearts: Math.max(0, pet.honestyHearts ?? 0),
    lastFreezeUsedAt: pet.lastFreezeUsedAt ?? null,
    sleepStartedAt: pet.sleepStartedAt ?? null,
    lastHungerUpdatedAt: pet.lastHungerUpdatedAt ?? pet.updatedAt,
    lastAppOpenedAt:
      pet.lastAppOpenedAt ?? pet.lastHungerUpdatedAt ?? pet.updatedAt,
    mood: moodForStats({ happiness, hunger, energy }),
  };
}

export function changePetSpecies(
  pet: PetState,
  speciesId: PetSpeciesId,
  now: string,
): PetState {
  if (pet.speciesId === speciesId) {
    return pet;
  }

  return {
    ...pet,
    speciesId,
    name: pet.customName ?? defaultPetNameForSpecies(speciesId),
    updatedAt: now,
  };
}

export function changePetName(
  pet: PetState,
  name: string,
  now: string,
): PetState {
  const customName = name.trim().slice(0, 24) || null;
  const displayName = customName ?? defaultPetNameForSpecies(pet.speciesId);

  if (pet.customName === customName && pet.name === displayName) {
    return pet;
  }

  return {
    ...pet,
    customName,
    name: displayName,
    updatedAt: now,
  };
}

export function defaultPetNameForSpecies(speciesId: PetSpeciesId): string {
  return PET_DEFAULT_NAME_BY_SPECIES[speciesId];
}

export function isPetSleeping(pet: PetState): boolean {
  return pet.sleepStartedAt != null;
}

export function startPetSleep(pet: PetState, now: string): PetState {
  if (isPetSleeping(pet)) {
    throw new DomainError(PET_ALREADY_SLEEPING_ERROR);
  }

  return {
    ...pet,
    sleepStartedAt: now,
    updatedAt: now,
  };
}

export function previewPetSleep(pet: PetState, now: string): PetSleepSummary {
  const startedAt = requireSleepStartedAt(pet);
  return calculatePetSleepSummary(pet, startedAt, now);
}

export function wakePetFromSleep(pet: PetState, now: string): PetSleepResult {
  const summary = previewPetSleep(pet, now);
  const hasElapsed = Date.parse(now) > Date.parse(summary.startedAt);
  const { hunger, happiness, energy } = summary.nextStats;
  const nextPet: PetState = {
    ...pet,
    hunger,
    happiness,
    energy,
    sleepStartedAt: null,
    lastHungerUpdatedAt: hasElapsed ? now : pet.lastHungerUpdatedAt,
    lastAppOpenedAt: now,
    mood: moodForStats({ happiness, hunger, energy }),
    updatedAt: now,
  };

  return {
    pet: nextPet,
    summary,
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

function requireSleepStartedAt(pet: PetState): string {
  if (!pet.sleepStartedAt) {
    throw new DomainError(PET_NOT_SLEEPING_ERROR);
  }

  return pet.sleepStartedAt;
}

function calculatePetSleepSummary(
  pet: PetState,
  startedAt: string,
  endedAt: string,
): PetSleepSummary {
  return calculateWakeUpEffects(pet, startedAt, endedAt);
}

function clampPetStat(value: number): number {
  return clampBalancePetStat(value);
}

function legacyCustomName(name: string): string | null {
  return name === defaultPetNameForSpecies(DEFAULT_PET_SPECIES_ID) ? null : name;
}
