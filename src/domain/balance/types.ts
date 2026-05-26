import type { PetMood } from "../types";

export type BalanceFoodItemId =
  | "berry-bowl"
  | "warm-soup"
  | "honey-toast"
  | "moon-milk";

export type BalanceShopItemCategory = "food";

export type MoodMetric = "happiness" | "hunger" | "energy";
export type MoodComparison = "lte" | "gte" | "always";

export interface BalanceStatAdjustments {
  xp: number;
  coins: number;
  happiness: number;
  hunger: number;
  energy: number;
  streak: number;
  honestyHearts: number;
}

export interface BalanceFocusStartRequirements {
  enabled: boolean;
  minEnergyBase: number;
  minEnergyPerMinute: number;
  minHungerBase: number;
  minHungerPerMinute: number;
}

export interface BalanceFocusConfig {
  baseCoinIntervalMinutes: number;
  xpPerFocusMinute: number;
  completionBonusPer25Minutes: number;
  happinessPer5Minutes: number;
  happinessMax: number;
  hungerDecayPerMinute: number;
  energyDecayPerMinute: number;
  completedReward: Omit<BalanceStatAdjustments, "xp" | "coins" | "happiness">;
  startRequirements: BalanceFocusStartRequirements;
}

export interface BalanceCareConfig {
  hungerDecayPerHour: number;
  appOpenHappinessDecayPerHour: number;
  maxAppOpenHappinessDecay: number;
  lowCareHappinessThreshold: number;
  maxLowCareHappinessDecayPerHour: number;
}

export interface BalanceSleepConfig {
  energyGainPerHour: number;
  maxEnergyGain: number;
  hungerDecayPerHour: number;
  happinessEnergyStep: number;
  maxHappinessGain: number;
}

export interface BalanceRescueActionConfig {
  enabled: boolean;
  energyGain: number;
  hungerChange: number;
  happinessGain: number;
  maxUsesPerDay: number;
  cooldownMinutes: number | null;
}

export interface BalanceRescueConfig {
  powerNap: BalanceRescueActionConfig;
  emergencySnack: BalanceRescueActionConfig;
}

export interface BalanceStreakFreezeConfig {
  enabled: boolean;
  costHonestyHearts: number;
  cooldownDays: number;
  maxFreezesPerMissedDay: number;
}

export interface BalanceStreakConfig {
  mode: "per_completed_session" | "daily_focus_minutes";
  dailyFocusGoalMinutes: number;
  freeze: BalanceStreakFreezeConfig;
}

export interface BalanceHonestyLimits {
  enabled: boolean;
  minSessionMinutes: number;
  maxHeartsPerDay: number;
}

export interface BalanceHonestyConfig {
  reward: BalanceStatAdjustments;
  limits: BalanceHonestyLimits;
}

export interface BalanceMoodRuleConfig {
  mood: PetMood;
  priority: number;
  metric: MoodMetric | null;
  comparison: MoodComparison;
  value: number | null;
}

export interface BalanceMoodConfig {
  rules: readonly BalanceMoodRuleConfig[];
}

export interface BalanceFoodItemConfig {
  id: BalanceFoodItemId;
  category: BalanceShopItemCategory;
  cost: number;
  hunger: number;
  happiness: number;
  energy: number;
}

export interface BalanceShopConfig {
  foodCatalog: readonly BalanceFoodItemConfig[];
}

export interface BalanceAchievementConfig {
  focusMinuteThresholds: readonly number[];
  streakThresholds: readonly number[];
  honestyHeartThresholds: readonly number[];
  careAchievementIds: readonly string[];
}

export interface BalanceProgressionConfig {
  xpPerLevel: number;
  maxPetStat: number;
}

export interface BalanceProfile {
  version: string;
  progression: BalanceProgressionConfig;
  focus: BalanceFocusConfig;
  care: BalanceCareConfig;
  sleep: BalanceSleepConfig;
  rescue: BalanceRescueConfig;
  streak: BalanceStreakConfig;
  honesty: BalanceHonestyConfig;
  mood: BalanceMoodConfig;
  shop: BalanceShopConfig;
  achievements: BalanceAchievementConfig;
}
