import type { BalanceProfile } from "./types";

export const DAILY_FOCUS_GOAL_MINUTES = 25;
export const XP_PER_FOCUS_MINUTE = 1;
export const FOCUS_BASE_COIN_INTERVAL_MINUTES = 5;
export const FOCUS_COMPLETION_BONUS_PER_25_MINUTES = 2;
export const FOCUS_HAPPINESS_PER_5_MINUTES = 1;
export const FOCUS_HAPPINESS_MAX = 10;
export const FOCUS_HUNGER_DECAY_PER_MINUTE = 0.2;
export const FOCUS_ENERGY_DECAY_PER_MINUTE = 0.28;
export const HUNGER_DECAY_PER_HOUR = 4;
export const BASE_HAPPINESS_DECAY_PER_HOUR = 0.25;
export const LOW_HUNGER_HAPPINESS_THRESHOLD = 35;
export const LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR = 1;
export const LOW_ENERGY_HAPPINESS_THRESHOLD = 25;
export const LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR = 0.5;
export const CRITICAL_HUNGER_ENERGY_THRESHOLD = 20;
export const CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR = 2;
export const MIN_START_ENERGY_BASE = 5;
export const MIN_START_ENERGY_PER_MINUTE = 0.8;
export const MIN_START_HUNGER_BASE = 8;
export const MIN_START_HUNGER_PER_MINUTE = 0.5;
export const POWER_NAP_DURATION_MINUTES = 15;
export const POWER_NAP_ENERGY_GAIN = 18;
export const POWER_NAP_HUNGER_COST = 3;
export const POWER_NAP_HAPPINESS_GAIN = 1;
export const MAX_POWER_NAPS_PER_DAY = 2;
export const POWER_NAP_COOLDOWN_MINUTES = 120;
export const EMERGENCY_SNACK_HUNGER_GAIN = 12;
export const EMERGENCY_SNACK_HAPPINESS_GAIN = 0;
export const EMERGENCY_SNACK_ENERGY_GAIN = 0;
export const MAX_EMERGENCY_SNACKS_PER_DAY = 1;
export const HONESTY_HAPPINESS_REWARD = 2;
export const HONESTY_HEART_REWARD = 1;
export const MIN_HONESTY_SESSION_MINUTES = 15;
export const MAX_HONESTY_HEARTS_PER_DAY = 2;

const NO_REWARD = {
  xp: 0,
  coins: 0,
  happiness: 0,
  hunger: 0,
  energy: 0,
  streak: 0,
  honestyHearts: 0,
} as const;

export const BALANCE_PROFILE_V1 = {
  version: "v1-cozy-balanced",
  progression: {
    xpPerLevel: 100,
    maxPetStat: 100,
  },
  focus: {
    baseCoinIntervalMinutes: FOCUS_BASE_COIN_INTERVAL_MINUTES,
    xpPerFocusMinute: XP_PER_FOCUS_MINUTE,
    completionBonusPer25Minutes: FOCUS_COMPLETION_BONUS_PER_25_MINUTES,
    happinessPer5Minutes: FOCUS_HAPPINESS_PER_5_MINUTES,
    happinessMax: FOCUS_HAPPINESS_MAX,
    hungerDecayPerMinute: FOCUS_HUNGER_DECAY_PER_MINUTE,
    energyDecayPerMinute: FOCUS_ENERGY_DECAY_PER_MINUTE,
    completedReward: {
      hunger: 0,
      energy: 0,
      streak: 0,
      honestyHearts: 0,
    },
    startRequirements: {
      enabled: true,
      minEnergyBase: MIN_START_ENERGY_BASE,
      minEnergyPerMinute: MIN_START_ENERGY_PER_MINUTE,
      minHungerBase: MIN_START_HUNGER_BASE,
      minHungerPerMinute: MIN_START_HUNGER_PER_MINUTE,
    },
  },
  care: {
    hungerDecayPerHour: HUNGER_DECAY_PER_HOUR,
    baseHappinessDecayPerHour: BASE_HAPPINESS_DECAY_PER_HOUR,
    maxAppOpenHappinessDecay: 6,
    lowHungerHappinessThreshold: LOW_HUNGER_HAPPINESS_THRESHOLD,
    lowHungerHappinessDecayPerHour: LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR,
    lowEnergyHappinessThreshold: LOW_ENERGY_HAPPINESS_THRESHOLD,
    lowEnergyHappinessDecayPerHour: LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR,
    criticalHungerEnergyThreshold: CRITICAL_HUNGER_ENERGY_THRESHOLD,
    criticalHungerEnergyDecayPerHour: CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR,
  },
  sleep: {
    energyGainPerHour: 20,
    hungerDecayPerHour: 4,
    happinessEnergyStep: 20,
    maxHappinessGain: 8,
  },
  rescue: {
    powerNap: {
      enabled: true,
      durationMinutes: POWER_NAP_DURATION_MINUTES,
      energyGain: POWER_NAP_ENERGY_GAIN,
      hungerChange: -POWER_NAP_HUNGER_COST,
      happinessGain: POWER_NAP_HAPPINESS_GAIN,
      maxUsesPerDay: MAX_POWER_NAPS_PER_DAY,
      cooldownMinutes: POWER_NAP_COOLDOWN_MINUTES,
    },
    emergencySnack: {
      enabled: true,
      durationMinutes: null,
      energyGain: EMERGENCY_SNACK_ENERGY_GAIN,
      hungerChange: EMERGENCY_SNACK_HUNGER_GAIN,
      happinessGain: EMERGENCY_SNACK_HAPPINESS_GAIN,
      maxUsesPerDay: MAX_EMERGENCY_SNACKS_PER_DAY,
      cooldownMinutes: null,
    },
  },
  streak: {
    mode: "daily_focus_minutes",
    dailyFocusGoalMinutes: DAILY_FOCUS_GOAL_MINUTES,
    freeze: {
      enabled: true,
      costHonestyHearts: 3,
      cooldownDays: 7,
      maxFreezesPerMissedDay: 1,
    },
  },
  honesty: {
    reward: {
      ...NO_REWARD,
      happiness: HONESTY_HAPPINESS_REWARD,
      honestyHearts: HONESTY_HEART_REWARD,
    },
    limits: {
      enabled: true,
      minSessionMinutes: MIN_HONESTY_SESSION_MINUTES,
      maxHeartsPerDay: MAX_HONESTY_HEARTS_PER_DAY,
    },
  },
  mood: {
    rules: [
      {
        mood: "hungry",
        priority: 100,
        metric: "hunger",
        comparison: "lte",
        value: 25,
      },
      {
        mood: "tired",
        priority: 90,
        metric: "energy",
        comparison: "lte",
        value: 15,
      },
      {
        mood: "sad",
        priority: 80,
        metric: "happiness",
        comparison: "lte",
        value: 25,
      },
      {
        mood: "happy",
        priority: 40,
        metric: "happiness",
        comparison: "gte",
        value: 60,
      },
      {
        mood: "calm",
        priority: 0,
        metric: null,
        comparison: "always",
        value: null,
      },
    ],
  },
  shop: {
    foodCatalog: [
      {
        id: "berry-bowl",
        category: "food",
        cost: 3,
        hunger: 12,
        happiness: 6,
        energy: 0,
      },
      {
        id: "warm-soup",
        category: "food",
        cost: 5,
        hunger: 22,
        happiness: 4,
        energy: 0,
      },
      {
        id: "honey-toast",
        category: "food",
        cost: 6,
        hunger: 14,
        happiness: 10,
        energy: 4,
      },
      {
        id: "moon-milk",
        category: "food",
        cost: 7,
        hunger: 8,
        happiness: 6,
        energy: 16,
      },
    ],
  },
  achievements: {
    focusMinuteThresholds: [],
    streakThresholds: [],
    honestyHeartThresholds: [],
    careAchievementIds: [],
  },
} as const satisfies BalanceProfile;
