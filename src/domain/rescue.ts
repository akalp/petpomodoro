import { ACTIVE_BALANCE_PROFILE } from "./balance";
import { DomainError } from "./errors";
import {
  applyPetStatAdjustments,
  isPetSleeping,
  PET_ALREADY_SLEEPING_ERROR,
} from "./pet";
import { FOOD_CATALOG, PET_SLEEPING_CANNOT_EAT_ERROR } from "./shop";
import { normalizeDailyFocusState } from "./dailyFocus";
import type { DailyFocusState, PetState } from "./types";

const powerNapConfig = ACTIVE_BALANCE_PROFILE.rescue.powerNap;
const emergencySnackConfig = ACTIVE_BALANCE_PROFILE.rescue.emergencySnack;

export const POWER_NAP_DURATION_MINUTES = powerNapConfig.durationMinutes ?? 0;
export const POWER_NAP_ENERGY_GAIN = powerNapConfig.energyGain;
export const POWER_NAP_HUNGER_COST = Math.abs(powerNapConfig.hungerChange);
export const POWER_NAP_HAPPINESS_GAIN = powerNapConfig.happinessGain;
export const MAX_POWER_NAPS_PER_DAY = powerNapConfig.maxUsesPerDay;
export const POWER_NAP_COOLDOWN_MINUTES =
  powerNapConfig.cooldownMinutes ?? 0;
export const EMERGENCY_SNACK_HUNGER_GAIN = emergencySnackConfig.hungerChange;
export const EMERGENCY_SNACK_HAPPINESS_GAIN = emergencySnackConfig.happinessGain;
export const EMERGENCY_SNACK_ENERGY_GAIN = emergencySnackConfig.energyGain;
export const MAX_EMERGENCY_SNACKS_PER_DAY = emergencySnackConfig.maxUsesPerDay;

// A free snack is reserved for a clearly hungry pet without a coin-funded option.
export const EMERGENCY_SNACK_MAX_HUNGER =
  emergencySnackConfig.eligibilityMaxHunger;
export const POWER_NAP_DAILY_LIMIT_ERROR = "power_nap_daily_limit_reached";
export const POWER_NAP_COOLDOWN_ACTIVE_ERROR = "power_nap_cooldown_active";
export const EMERGENCY_SNACK_DAILY_LIMIT_ERROR =
  "emergency_snack_daily_limit_reached";
export const EMERGENCY_SNACK_NOT_NEEDED_ERROR = "emergency_snack_not_needed";

export type RescueIneligibilityReason =
  | typeof POWER_NAP_DAILY_LIMIT_ERROR
  | typeof POWER_NAP_COOLDOWN_ACTIVE_ERROR
  | typeof EMERGENCY_SNACK_DAILY_LIMIT_ERROR
  | typeof EMERGENCY_SNACK_NOT_NEEDED_ERROR
  | typeof PET_ALREADY_SLEEPING_ERROR
  | typeof PET_SLEEPING_CANNOT_EAT_ERROR;

export interface RescueEligibility {
  canApply: boolean;
  reasons: RescueIneligibilityReason[];
}

export interface PowerNapSummary {
  durationMinutes: number;
  energyGained: number;
  hungerChanged: number;
  happinessGained: number;
}

export interface EmergencySnackSummary {
  hungerGained: number;
  energyGained: number;
  happinessGained: number;
}

export interface PowerNapResult {
  pet: PetState;
  dailyFocusState: DailyFocusState;
  summary: PowerNapSummary;
}

export interface EmergencySnackResult {
  pet: PetState;
  dailyFocusState: DailyFocusState;
  summary: EmergencySnackSummary;
}

export interface EmergencySnackOptions {
  hasOtherAntiDeadlockCondition?: boolean;
}

export function checkPowerNapEligibility(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  now: string,
): RescueEligibility {
  const dailyState = normalizeDailyFocusState(dailyFocusState);
  const reasons: RescueIneligibilityReason[] = [];

  if (isPetSleeping(pet)) {
    reasons.push(PET_ALREADY_SLEEPING_ERROR);
  }

  if (dailyState.powerNapsUsed >= MAX_POWER_NAPS_PER_DAY) {
    reasons.push(POWER_NAP_DAILY_LIMIT_ERROR);
  }

  if (
    dailyState.lastPowerNapAt &&
    Date.parse(now) <
      Date.parse(dailyState.lastPowerNapAt) +
        POWER_NAP_COOLDOWN_MINUTES * 60 * 1000
  ) {
    reasons.push(POWER_NAP_COOLDOWN_ACTIVE_ERROR);
  }

  return { canApply: reasons.length === 0, reasons };
}

export function applyPowerNap(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  now: string,
): PowerNapResult {
  const eligibility = checkPowerNapEligibility(pet, dailyFocusState, now);

  if (!eligibility.canApply) {
    throw new DomainError(eligibility.reasons[0]);
  }

  const dailyState = normalizeDailyFocusState(dailyFocusState);
  const nextPet = applyPetStatAdjustments(
    pet,
    {
      energy: POWER_NAP_ENERGY_GAIN,
      happiness: POWER_NAP_HAPPINESS_GAIN,
      hunger: -POWER_NAP_HUNGER_COST,
    },
    now,
  );

  return {
    pet: nextPet,
    dailyFocusState: {
      ...dailyState,
      powerNapsUsed: dailyState.powerNapsUsed + 1,
      lastPowerNapAt: now,
    },
    summary: {
      durationMinutes: POWER_NAP_DURATION_MINUTES,
      energyGained: nextPet.energy - pet.energy,
      hungerChanged: nextPet.hunger - pet.hunger,
      happinessGained: nextPet.happiness - pet.happiness,
    },
  };
}

export function checkEmergencySnackEligibility(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  options: EmergencySnackOptions = {},
): RescueEligibility {
  const dailyState = normalizeDailyFocusState(dailyFocusState);
  const reasons: RescueIneligibilityReason[] = [];

  if (isPetSleeping(pet)) {
    reasons.push(PET_SLEEPING_CANNOT_EAT_ERROR);
  }

  if (dailyState.emergencySnacksUsed >= MAX_EMERGENCY_SNACKS_PER_DAY) {
    reasons.push(EMERGENCY_SNACK_DAILY_LIMIT_ERROR);
  }

  if (!options.hasOtherAntiDeadlockCondition && !isEmergencySnackNeeded(pet)) {
    reasons.push(EMERGENCY_SNACK_NOT_NEEDED_ERROR);
  }

  return { canApply: reasons.length === 0, reasons };
}

export function isEmergencySnackNeeded(
  pet: Pick<PetState, "coins" | "hunger">,
): boolean {
  const cheapestFoodCost = Math.min(...FOOD_CATALOG.map((food) => food.cost));
  return pet.hunger <= EMERGENCY_SNACK_MAX_HUNGER && pet.coins < cheapestFoodCost;
}

export function applyEmergencySnack(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  now: string,
  options: EmergencySnackOptions = {},
): EmergencySnackResult {
  const eligibility = checkEmergencySnackEligibility(pet, dailyFocusState, options);

  if (!eligibility.canApply) {
    throw new DomainError(eligibility.reasons[0]);
  }

  const dailyState = normalizeDailyFocusState(dailyFocusState);
  const nextPet = applyPetStatAdjustments(
    pet,
    {
      energy: EMERGENCY_SNACK_ENERGY_GAIN,
      happiness: EMERGENCY_SNACK_HAPPINESS_GAIN,
      hunger: EMERGENCY_SNACK_HUNGER_GAIN,
    },
    now,
  );

  return {
    pet: nextPet,
    dailyFocusState: {
      ...dailyState,
      emergencySnacksUsed: dailyState.emergencySnacksUsed + 1,
    },
    summary: {
      hungerGained: nextPet.hunger - pet.hunger,
      energyGained: nextPet.energy - pet.energy,
      happinessGained: nextPet.happiness - pet.happiness,
    },
  };
}
