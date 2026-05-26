import {
  ACTIVE_BALANCE_PROFILE,
  calculateMoodForStats,
  type BalanceMoodRuleConfig,
} from "./balance";
import type { PetMood, PetState } from "./types";

export type PetMoodStats = Pick<PetState, "happiness" | "hunger" | "energy">;

export interface PetMoodRule {
  mood: PetMood;
  priority: number;
  matches: (stats: PetMoodStats) => boolean;
}

export const PET_MOOD_RULES =
  ACTIVE_BALANCE_PROFILE.mood.rules.map(createMoodRule) satisfies PetMoodRule[];

export function resolvePetMood(stats: PetMoodStats): PetMood {
  const mood = calculateMoodForStats(stats);

  if (mood === "working" || mood === "sleeping") {
    throw new Error("Care mood calculation cannot return a display-only mood.");
  }

  return mood;
}

function createMoodRule(rule: BalanceMoodRuleConfig): PetMoodRule {
  return {
    mood: rule.mood,
    priority: rule.priority,
    matches: (stats) => moodRuleMatches(rule, stats),
  };
}

function moodRuleMatches(
  rule: BalanceMoodRuleConfig,
  stats: PetMoodStats,
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
