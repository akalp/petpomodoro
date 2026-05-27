import { ACTIVE_BALANCE_PROFILE } from "./balance";
import type {
  BalanceAchievementCareEvent,
  BalanceProfile,
} from "./balance";

export type AchievementCategory =
  | "focus_minutes"
  | "daily_streak"
  | "honesty_hearts"
  | "care"
  | "rescue";

export type AchievementMetric =
  | "totalFocusMinutes"
  | "currentDailyStreak"
  | "honestyHearts";

export type AchievementCareEvent = BalanceAchievementCareEvent;
export type AchievementId = `${AchievementCategory}_${string}`;

export interface BaseAchievementRule {
  id: AchievementId;
  category: AchievementCategory;
}

export interface ThresholdAchievementRule extends BaseAchievementRule {
  kind: "threshold";
  metric: AchievementMetric;
  threshold: number;
}

export interface EventAchievementRule extends BaseAchievementRule {
  kind: "event";
  event: AchievementCareEvent;
}

export type AchievementRule =
  | ThresholdAchievementRule
  | EventAchievementRule;

export interface AchievementProgressSnapshot {
  totalFocusMinutes: number;
  currentDailyStreak: number;
  honestyHearts: number;
  careEvents: readonly AchievementCareEvent[];
}

export interface AchievementEvaluationResult {
  unlockedIds: AchievementId[];
  newlyUnlockedIds: AchievementId[];
  newlyUnlockedRules: AchievementRule[];
}

export function buildAchievementRules(
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): AchievementRule[] {
  return [
    ...profile.achievements.focusMinuteThresholds.map((threshold) =>
      thresholdRule("focus_minutes", "totalFocusMinutes", threshold),
    ),
    ...profile.achievements.dailyStreakThresholds.map((threshold) =>
      thresholdRule("daily_streak", "currentDailyStreak", threshold),
    ),
    ...profile.achievements.honestyHeartThresholds.map((threshold) =>
      thresholdRule("honesty_hearts", "honestyHearts", threshold),
    ),
    ...profile.achievements.careEvents.map(eventRule),
  ];
}

export function evaluateAchievementRule(
  rule: AchievementRule,
  progress: AchievementProgressSnapshot,
): boolean {
  if (rule.kind === "event") {
    return progress.careEvents.includes(rule.event);
  }

  return progress[rule.metric] >= rule.threshold;
}

export function evaluateAchievementUnlocks(
  progress: AchievementProgressSnapshot,
  previouslyUnlockedIds: readonly AchievementId[] = [],
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): AchievementEvaluationResult {
  const previousUnlocks = new Set(previouslyUnlockedIds);
  const satisfiedRules = buildAchievementRules(profile).filter((rule) =>
    evaluateAchievementRule(rule, progress),
  );
  const unlockedIds = uniqueAchievementIds([
    ...previouslyUnlockedIds,
    ...satisfiedRules.map((rule) => rule.id),
  ]);
  const newlyUnlockedRules = satisfiedRules.filter(
    (rule) => !previousUnlocks.has(rule.id),
  );

  return {
    unlockedIds,
    newlyUnlockedIds: newlyUnlockedRules.map((rule) => rule.id),
    newlyUnlockedRules,
  };
}

function thresholdRule(
  category: Extract<
    AchievementCategory,
    "focus_minutes" | "daily_streak" | "honesty_hearts"
  >,
  metric: AchievementMetric,
  threshold: number,
): ThresholdAchievementRule {
  return {
    id: `${category}_${threshold}`,
    category,
    kind: "threshold",
    metric,
    threshold,
  };
}

function eventRule(event: AchievementCareEvent): EventAchievementRule {
  const category: Extract<AchievementCategory, "care" | "rescue"> =
    event === "first_power_nap" || event === "first_emergency_snack"
      ? "rescue"
      : "care";

  return {
    id: `${category}_${event}`,
    category,
    kind: "event",
    event,
  };
}

function uniqueAchievementIds(ids: readonly AchievementId[]): AchievementId[] {
  return [...new Set(ids)];
}
