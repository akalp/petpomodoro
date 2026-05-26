import type { BalanceProfile } from "./types";

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
  version: "v1-current-baseline",
  progression: {
    xpPerLevel: 100,
    maxPetStat: 100,
  },
  focus: {
    baseCoinIntervalMinutes: 5,
    hungerDecayPerMinute: 0.2,
    energyDecayPerMinute: 0.28,
    completedReward: {
      xp: 25,
      coins: 10,
      happiness: 8,
      hunger: 0,
      energy: 0,
      streak: 1,
      honestyHearts: 0,
    },
    startRequirements: {
      enabled: false,
      minEnergyBase: 0,
      minEnergyPerMinute: 0,
      minHungerBase: 0,
      minHungerPerMinute: 0,
    },
  },
  care: {
    hungerDecayPerHour: 4,
    appOpenHappinessDecayPerHour: 0.25,
    maxAppOpenHappinessDecay: 6,
    lowCareHappinessThreshold: 50,
    maxLowCareHappinessDecayPerHour: 1,
  },
  sleep: {
    energyGainPerHour: 18,
    maxEnergyGain: 54,
    hungerDecayPerHour: 4,
    happinessEnergyStep: 15,
    maxHappinessGain: 4,
  },
  rescue: {
    powerNap: {
      enabled: false,
      energyGain: 0,
      hungerChange: 0,
      happinessGain: 0,
      maxUsesPerDay: 0,
      cooldownMinutes: null,
    },
    emergencySnack: {
      enabled: false,
      energyGain: 0,
      hungerChange: 0,
      happinessGain: 0,
      maxUsesPerDay: 0,
      cooldownMinutes: null,
    },
  },
  streak: {
    mode: "per_completed_session",
    dailyFocusGoalMinutes: 25,
    freeze: {
      enabled: false,
      costHonestyHearts: 0,
      cooldownDays: 0,
      maxFreezesPerMissedDay: 0,
    },
  },
  honesty: {
    reward: {
      ...NO_REWARD,
      happiness: 3,
      honestyHearts: 1,
    },
    limits: {
      enabled: false,
      minSessionMinutes: 0,
      maxHeartsPerDay: Number.POSITIVE_INFINITY,
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
