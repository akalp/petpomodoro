import { ACTIVE_BALANCE_PROFILE } from "./balance";
import { DomainError } from "./errors";
import { applyPetStatAdjustments } from "./pet";
import { toLocalDateKey } from "./dateKeys";
import type { DailyFocusState, PetState } from "./types";

export const DAILY_FOCUS_GOAL_MINUTES =
  ACTIVE_BALANCE_PROFILE.streak.dailyFocusGoalMinutes;
export const STREAK_FREEZE_COST_HONESTY_HEARTS =
  ACTIVE_BALANCE_PROFILE.streak.freeze.costHonestyHearts;
export const STREAK_FREEZE_COOLDOWN_DAYS =
  ACTIVE_BALANCE_PROFILE.streak.freeze.cooldownDays;
export const MAX_STREAK_FREEZES_PER_MISSED_DAY =
  ACTIVE_BALANCE_PROFILE.streak.freeze.maxFreezesPerMissedDay;
export const STREAK_FREEZE_DAY_NOT_MISSED_ERROR = "streak_freeze_day_not_missed";
export const STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR =
  "streak_freeze_insufficient_hearts";
export const STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR =
  "streak_freeze_cooldown_active";
export const STREAK_FREEZE_DAILY_LIMIT_ERROR =
  "streak_freeze_daily_limit_reached";

export interface CreateDailyFocusStateInput {
  petId: string;
  dateKey: string;
}

export interface DailyFocusProgressResult {
  dailyFocusState: DailyFocusState;
  streakAwarded: number;
}

export type StreakFreezeIneligibilityReason =
  | typeof STREAK_FREEZE_DAY_NOT_MISSED_ERROR
  | typeof STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR
  | typeof STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR
  | typeof STREAK_FREEZE_DAILY_LIMIT_ERROR;

export interface StreakFreezeEligibility {
  canApply: boolean;
  reasons: StreakFreezeIneligibilityReason[];
  costHonestyHearts: number;
  cooldownDays: number;
  maxFreezesPerMissedDay: number;
  cooldownAvailableAt: string | null;
}

export interface StreakFreezeResult {
  pet: PetState;
  dailyFocusState: DailyFocusState;
  honestyHeartsSpent: number;
}

export function createDailyFocusState({
  petId,
  dateKey,
}: CreateDailyFocusStateInput): DailyFocusState {
  return {
    petId,
    dateKey,
    completedFocusMinutes: 0,
    dailyGoalAwarded: false,
    honestyHeartsAwarded: 0,
    streakFreezesUsed: 0,
    lastStreakFreezeAt: null,
    powerNapsUsed: 0,
    emergencySnacksUsed: 0,
    lastPowerNapAt: null,
  };
}

export function normalizeDailyFocusState(
  dailyFocusState: DailyFocusState,
): DailyFocusState {
  return {
    ...dailyFocusState,
    completedFocusMinutes: Math.max(
      0,
      dailyFocusState.completedFocusMinutes ?? 0,
    ),
    dailyGoalAwarded: dailyFocusState.dailyGoalAwarded ?? false,
    honestyHeartsAwarded: Math.max(
      0,
      dailyFocusState.honestyHeartsAwarded ?? 0,
    ),
    streakFreezesUsed: Math.max(0, dailyFocusState.streakFreezesUsed ?? 0),
    lastStreakFreezeAt: dailyFocusState.lastStreakFreezeAt ?? null,
    powerNapsUsed: Math.max(0, dailyFocusState.powerNapsUsed ?? 0),
    emergencySnacksUsed: Math.max(
      0,
      dailyFocusState.emergencySnacksUsed ?? 0,
    ),
    lastPowerNapAt: dailyFocusState.lastPowerNapAt ?? null,
  };
}

export function checkStreakFreezeEligibility(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  now: string,
): StreakFreezeEligibility {
  const normalizedDailyFocusState = normalizeDailyFocusState(dailyFocusState);
  const cooldownAvailableAt = nextStreakFreezeAvailableAt(pet.lastFreezeUsedAt);
  const reasons: StreakFreezeIneligibilityReason[] = [];

  if (!isMissedDailyFocusGoal(normalizedDailyFocusState, now)) {
    reasons.push(STREAK_FREEZE_DAY_NOT_MISSED_ERROR);
  }

  if (pet.honestyHearts < STREAK_FREEZE_COST_HONESTY_HEARTS) {
    reasons.push(STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR);
  }

  if (cooldownAvailableAt && Date.parse(now) < Date.parse(cooldownAvailableAt)) {
    reasons.push(STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR);
  }

  if (
    normalizedDailyFocusState.streakFreezesUsed >=
    MAX_STREAK_FREEZES_PER_MISSED_DAY
  ) {
    reasons.push(STREAK_FREEZE_DAILY_LIMIT_ERROR);
  }

  return {
    canApply: reasons.length === 0,
    reasons,
    costHonestyHearts: STREAK_FREEZE_COST_HONESTY_HEARTS,
    cooldownDays: STREAK_FREEZE_COOLDOWN_DAYS,
    maxFreezesPerMissedDay: MAX_STREAK_FREEZES_PER_MISSED_DAY,
    cooldownAvailableAt,
  };
}

export function applyStreakFreeze(
  pet: PetState,
  dailyFocusState: DailyFocusState,
  now: string,
): StreakFreezeResult {
  const eligibility = checkStreakFreezeEligibility(pet, dailyFocusState, now);

  if (!eligibility.canApply) {
    throw new DomainError(eligibility.reasons[0]);
  }

  const normalizedDailyFocusState = normalizeDailyFocusState(dailyFocusState);

  return {
    pet: {
      ...applyPetStatAdjustments(
        pet,
        { honestyHearts: -STREAK_FREEZE_COST_HONESTY_HEARTS },
        now,
      ),
      lastFreezeUsedAt: now,
      updatedAt: now,
    },
    dailyFocusState: {
      ...normalizedDailyFocusState,
      streakFreezesUsed: normalizedDailyFocusState.streakFreezesUsed + 1,
      lastStreakFreezeAt: now,
    },
    honestyHeartsSpent: STREAK_FREEZE_COST_HONESTY_HEARTS,
  };
}

export function applyCompletedFocusMinutesToDailyState(
  dailyFocusState: DailyFocusState,
  minutes: number,
): DailyFocusProgressResult {
  const completedFocusMinutes =
    dailyFocusState.completedFocusMinutes + Math.max(0, minutes);
  const reachedDailyGoal =
    DAILY_FOCUS_GOAL_MINUTES > 0 &&
    completedFocusMinutes >= DAILY_FOCUS_GOAL_MINUTES;
  const streakAwarded =
    reachedDailyGoal && !dailyFocusState.dailyGoalAwarded ? 1 : 0;

  return {
    dailyFocusState: {
      ...dailyFocusState,
      completedFocusMinutes,
      dailyGoalAwarded: dailyFocusState.dailyGoalAwarded || reachedDailyGoal,
    },
    streakAwarded,
  };
}

export function applyHonestyHeartToDailyState(
  dailyFocusState: DailyFocusState,
  honestyHeartsAwarded: number,
): DailyFocusState {
  return {
    ...dailyFocusState,
    honestyHeartsAwarded:
      dailyFocusState.honestyHeartsAwarded +
      Math.max(0, honestyHeartsAwarded),
  };
}

function isMissedDailyFocusGoal(
  dailyFocusState: DailyFocusState,
  now: string,
): boolean {
  return (
    dailyFocusState.dateKey < toLocalDateKey(new Date(now)) &&
    !dailyFocusState.dailyGoalAwarded &&
    dailyFocusState.completedFocusMinutes < DAILY_FOCUS_GOAL_MINUTES
  );
}

function nextStreakFreezeAvailableAt(lastFreezeUsedAt: string | null): string | null {
  if (!lastFreezeUsedAt) {
    return null;
  }

  const availableAt = new Date(Date.parse(lastFreezeUsedAt));
  availableAt.setUTCDate(availableAt.getUTCDate() + STREAK_FREEZE_COOLDOWN_DAYS);
  return availableAt.toISOString();
}
