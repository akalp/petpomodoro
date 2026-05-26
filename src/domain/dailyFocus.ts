import { ACTIVE_BALANCE_PROFILE } from "./balance";
import type { DailyFocusState } from "./types";

export const DAILY_FOCUS_GOAL_MINUTES =
  ACTIVE_BALANCE_PROFILE.streak.dailyFocusGoalMinutes;

export interface CreateDailyFocusStateInput {
  petId: string;
  dateKey: string;
}

export interface DailyFocusProgressResult {
  dailyFocusState: DailyFocusState;
  streakAwarded: number;
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
    powerNapsUsed: Math.max(0, dailyFocusState.powerNapsUsed ?? 0),
    emergencySnacksUsed: Math.max(
      0,
      dailyFocusState.emergencySnacksUsed ?? 0,
    ),
    lastPowerNapAt: dailyFocusState.lastPowerNapAt ?? null,
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
