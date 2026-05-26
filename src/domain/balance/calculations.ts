import type {
  FocusSession,
  PetDisplayMood,
  PetState,
} from "../types";
import { ACTIVE_BALANCE_PROFILE } from "./activeProfile";
import type {
  BalanceFoodItemConfig,
  BalanceFoodItemId,
  BalanceMoodRuleConfig,
  BalanceProfile,
  BalanceStatAdjustments,
} from "./types";

export interface FocusCareImpactCalculation {
  elapsedMinutes: number;
  coinsEarned: number;
  hungerChanged: number;
  energyChanged: number;
}

export interface FocusStartRequirementsCalculation {
  enabled: boolean;
  requiredEnergy: number;
  requiredHunger: number;
}

export interface FocusStartEligibilityCalculation
  extends FocusStartRequirementsCalculation {
  canStart: boolean;
  hasEnoughEnergy: boolean;
  hasEnoughHunger: boolean;
}

export interface IdleCareImpactCalculation {
  elapsedHours: number;
  hungerChanged: number;
  happinessChanged: number;
  energyChanged: number;
  previousStats: Pick<PetState, "hunger" | "happiness" | "energy">;
  nextStats: Pick<PetState, "hunger" | "happiness" | "energy">;
}

export interface IdleCareImpactOptions {
  hungerDecayPerHour?: number;
}

export interface WakeUpEffectsCalculation {
  startedAt: string;
  endedAt: string;
  elapsedMinutes: number;
  energyGained: number;
  hungerChanged: number;
  happinessGained: number;
  previousStats: Pick<PetState, "hunger" | "happiness" | "energy">;
  nextStats: Pick<PetState, "hunger" | "happiness" | "energy">;
}

export interface HonestyDailyState {
  honestyHeartsAwarded: number;
}

export interface HonestyRewardCalculation {
  eligible: boolean;
  reason:
    | null
    | "not_honest_confirmation"
    | "below_minimum_duration"
    | "daily_limit_reached";
  reward: BalanceStatAdjustments;
}

export interface MoodActivityState {
  isSleeping?: boolean;
  isWorking?: boolean;
}

export interface FoodEffectsCalculation {
  item: BalanceFoodItemConfig;
  canAfford: boolean;
  coinsSpent: number;
  previousCoins: number;
  nextCoins: number;
  hungerGained: number;
  happinessGained: number;
  energyGained: number;
  previousStats: Pick<PetState, "hunger" | "happiness" | "energy">;
  nextStats: Pick<PetState, "hunger" | "happiness" | "energy">;
}

export function calculateFocusReward(
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): BalanceStatAdjustments {
  const completedMinutes = Math.max(0, minutes);
  const fullBaseCoinIntervals =
    profile.focus.baseCoinIntervalMinutes > 0
      ? Math.floor(completedMinutes / profile.focus.baseCoinIntervalMinutes)
      : 0;
  const completedDailyGoals =
    profile.streak.dailyFocusGoalMinutes > 0
      ? Math.floor(completedMinutes / profile.streak.dailyFocusGoalMinutes)
      : 0;

  return {
    ...profile.focus.completedReward,
    xp: completedMinutes * profile.focus.xpPerFocusMinute,
    coins: completedDailyGoals * profile.focus.completionBonusPer25Minutes,
    happiness: Math.min(
      fullBaseCoinIntervals * profile.focus.happinessPer5Minutes,
      profile.focus.happinessMax,
    ),
  };
}

export function calculateFocusCareImpact(
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): FocusCareImpactCalculation {
  const elapsedMinutes = Math.max(0, minutes);
  const coinInterval = profile.focus.baseCoinIntervalMinutes;

  return {
    elapsedMinutes,
    coinsEarned:
      coinInterval > 0 ? Math.floor(elapsedMinutes / coinInterval) : 0,
    hungerChanged: -elapsedMinutes * profile.focus.hungerDecayPerMinute,
    energyChanged: -elapsedMinutes * profile.focus.energyDecayPerMinute,
  };
}

export function calculateFocusStartRequirements(
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): FocusStartRequirementsCalculation {
  const requirements = profile.focus.startRequirements;

  if (!requirements.enabled) {
    return {
      enabled: false,
      requiredEnergy: 0,
      requiredHunger: 0,
    };
  }

  return {
    enabled: true,
    requiredEnergy: Math.max(
      requirements.minEnergyBase,
      Math.ceil(minutes * requirements.minEnergyPerMinute),
    ),
    requiredHunger: Math.max(
      requirements.minHungerBase,
      Math.ceil(minutes * requirements.minHungerPerMinute),
    ),
  };
}

export function canStartFocus(
  pet: Pick<PetState, "energy" | "hunger">,
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): boolean {
  return calculateFocusStartEligibility(pet, minutes, profile).canStart;
}

export function calculateFocusStartEligibility(
  pet: Pick<PetState, "energy" | "hunger">,
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): FocusStartEligibilityCalculation {
  const requirements = calculateFocusStartRequirements(minutes, profile);

  if (!requirements.enabled) {
    return {
      ...requirements,
      canStart: true,
      hasEnoughEnergy: true,
      hasEnoughHunger: true,
    };
  }

  const hasEnoughEnergy = pet.energy >= requirements.requiredEnergy;
  const hasEnoughHunger = pet.hunger >= requirements.requiredHunger;

  return {
    ...requirements,
    canStart: hasEnoughEnergy && hasEnoughHunger,
    hasEnoughEnergy,
    hasEnoughHunger,
  };
}

export function calculateIdleCareImpact(
  pet: Pick<PetState, "hunger" | "happiness" | "energy">,
  from: string,
  to: string,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
  options: IdleCareImpactOptions = {},
): IdleCareImpactCalculation {
  const elapsedMs = Date.parse(to) - Date.parse(from);

  if (elapsedMs <= 0) {
    return unchangedIdleCareImpact(pet);
  }

  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const hungerDecayPerHour =
    options.hungerDecayPerHour ?? profile.care.hungerDecayPerHour;

  if (hungerDecayPerHour <= 0) {
    return unchangedIdleCareImpact(pet, elapsedHours);
  }

  const hunger = clampPetStat(
    pet.hunger - elapsedHours * hungerDecayPerHour,
    profile,
  );
  const happiness = clampPetStat(
    pet.happiness -
      calculateLowCareHappinessDecay(hunger, pet.energy, elapsedHours, profile),
    profile,
  );

  return {
    elapsedHours,
    hungerChanged: hunger - pet.hunger,
    happinessChanged: happiness - pet.happiness,
    energyChanged: 0,
    previousStats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: pet.energy,
    },
    nextStats: {
      hunger,
      happiness,
      energy: pet.energy,
    },
  };
}

export function calculateWakeUpEffects(
  pet: Pick<PetState, "hunger" | "happiness" | "energy">,
  sleepStartedAt: string,
  wakeAt: string,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): WakeUpEffectsCalculation {
  const elapsedMs = Math.max(0, Date.parse(wakeAt) - Date.parse(sleepStartedAt));
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const energy = clampPetStat(
    pet.energy + elapsedHours * profile.sleep.energyGainPerHour,
    profile,
  );
  const energyGained = energy - pet.energy;
  const happinessGained = Math.min(
    Math.floor(energyGained / profile.sleep.happinessEnergyStep),
    profile.sleep.maxHappinessGain,
  );
  const happiness = clampPetStat(pet.happiness + happinessGained, profile);
  const hunger = clampPetStat(
    pet.hunger - elapsedHours * profile.sleep.hungerDecayPerHour,
    profile,
  );

  return {
    startedAt: sleepStartedAt,
    endedAt: wakeAt,
    elapsedMinutes: elapsedMs / (60 * 1000),
    energyGained,
    hungerChanged: hunger - pet.hunger,
    happinessGained: happiness - pet.happiness,
    previousStats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: pet.energy,
    },
    nextStats: {
      hunger,
      happiness,
      energy,
    },
  };
}

export function calculateHonestyReward(
  session: Pick<
    FocusSession,
    "status" | "abandonmentReason" | "plannedDurationMinutes"
  >,
  dailyState: HonestyDailyState | null = null,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): HonestyRewardCalculation {
  const emptyReward = emptyStatAdjustments();

  if (
    session.status !== "abandoned" ||
    session.abandonmentReason !== "honest_confirmation"
  ) {
    return {
      eligible: false,
      reason: "not_honest_confirmation",
      reward: emptyReward,
    };
  }

  if (
    profile.honesty.limits.enabled &&
    session.plannedDurationMinutes < profile.honesty.limits.minSessionMinutes
  ) {
    return {
      eligible: false,
      reason: "below_minimum_duration",
      reward: emptyReward,
    };
  }

  if (
    profile.honesty.limits.enabled &&
    dailyState &&
    dailyState.honestyHeartsAwarded >= profile.honesty.limits.maxHeartsPerDay
  ) {
    return {
      eligible: false,
      reason: "daily_limit_reached",
      reward: emptyReward,
    };
  }

  return {
    eligible: true,
    reason: null,
    reward: { ...profile.honesty.reward },
  };
}

export function calculateMoodForStats(
  stats: Pick<PetState, "happiness" | "hunger" | "energy">,
  activityState: MoodActivityState | null = null,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): PetDisplayMood {
  if (activityState?.isWorking) {
    return "working";
  }

  if (activityState?.isSleeping) {
    return "sleeping";
  }

  const matchingRule = [...profile.mood.rules]
    .sort((left, right) => right.priority - left.priority)
    .find((rule) => moodRuleMatches(rule, stats));

  if (!matchingRule) {
    throw new Error("Pet mood rules must include a default rule.");
  }

  return matchingRule.mood;
}

export function calculateFoodEffects(
  itemId: BalanceFoodItemId | string,
  pet: Pick<PetState, "coins" | "hunger" | "happiness" | "energy">,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): FoodEffectsCalculation | null {
  const item = profile.shop.foodCatalog.find((food) => food.id === itemId);

  if (!item) {
    return null;
  }

  const nextHunger = clampPetStat(pet.hunger + item.hunger, profile);
  const nextHappiness = clampPetStat(pet.happiness + item.happiness, profile);
  const nextEnergy = clampPetStat(pet.energy + item.energy, profile);
  const nextCoins = Math.max(0, pet.coins - item.cost);

  return {
    item,
    canAfford: pet.coins >= item.cost,
    coinsSpent: item.cost,
    previousCoins: pet.coins,
    nextCoins,
    hungerGained: nextHunger - pet.hunger,
    happinessGained: nextHappiness - pet.happiness,
    energyGained: nextEnergy - pet.energy,
    previousStats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: pet.energy,
    },
    nextStats: {
      hunger: nextHunger,
      happiness: nextHappiness,
      energy: nextEnergy,
    },
  };
}

export function clampPetStat(
  value: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): number {
  return Math.min(profile.progression.maxPetStat, Math.max(0, value));
}

export function calculateLowCareHappinessDecay(
  hunger: number,
  energy: number,
  elapsedHours: number,
  profile: BalanceProfile,
): number {
  const threshold = profile.care.lowCareHappinessThreshold;
  const lowCarePressure =
    (Math.max(0, threshold - hunger) + Math.max(0, threshold - energy)) / 100;

  return Math.min(
    elapsedHours * lowCarePressure,
    elapsedHours * profile.care.maxLowCareHappinessDecayPerHour,
  );
}

function moodRuleMatches(
  rule: BalanceMoodRuleConfig,
  stats: Pick<PetState, "happiness" | "hunger" | "energy">,
): boolean {
  if (rule.comparison === "always") {
    return true;
  }

  if (!rule.metric || rule.value === null) {
    return false;
  }

  const statValue = stats[rule.metric];

  switch (rule.comparison) {
    case "lte":
      return statValue <= rule.value;
    case "gte":
      return statValue >= rule.value;
  }
}

function unchangedIdleCareImpact(
  pet: Pick<PetState, "hunger" | "happiness" | "energy">,
  elapsedHours = 0,
): IdleCareImpactCalculation {
  return {
    elapsedHours,
    hungerChanged: 0,
    happinessChanged: 0,
    energyChanged: 0,
    previousStats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: pet.energy,
    },
    nextStats: {
      hunger: pet.hunger,
      happiness: pet.happiness,
      energy: pet.energy,
    },
  };
}

function emptyStatAdjustments(): BalanceStatAdjustments {
  return {
    xp: 0,
    coins: 0,
    happiness: 0,
    hunger: 0,
    energy: 0,
    streak: 0,
    honestyHearts: 0,
  };
}
