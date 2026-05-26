import type {
  DailyFocusState,
  FocusSession,
  PetState,
  RewardLedger,
} from "../domain";

export const baseNow = "2026-05-22T12:00:00.000Z";

export function makePet(overrides: Partial<PetState> = {}): PetState {
  return {
    id: "pet-1",
    speciesId: "momo",
    name: "Momo",
    customName: null,
    level: 1,
    xp: 0,
    mood: "calm",
    coins: 0,
    happiness: 50,
    hunger: 100,
    energy: 80,
    streak: 0,
    honestyHearts: 0,
    sleepStartedAt: null,
    lastHungerUpdatedAt: baseNow,
    lastAppOpenedAt: baseNow,
    createdAt: baseNow,
    updatedAt: baseNow,
    ...overrides,
  };
}

export function makeSession(
  overrides: Partial<FocusSession> = {},
): FocusSession {
  return {
    id: "session-1",
    status: "running",
    plannedDurationMinutes: 25,
    startedAt: baseNow,
    expectedEndAt: "2026-05-22T12:25:00.000Z",
    confirmedAt: null,
    abandonedAt: null,
    abandonmentReason: null,
    rewardClaimedAt: null,
    focusImpactAppliedUntil: baseNow,
    focusCoinsAwarded: 0,
    ...overrides,
  };
}

export function makeReward(
  overrides: Partial<RewardLedger> = {},
): RewardLedger {
  return {
    id: "reward-1",
    sessionId: "session-1",
    petId: "pet-1",
    rewardType: "focus_completed",
    xpAwarded: 25,
    coinsAwarded: 10,
    happinessAwarded: 8,
    hungerAwarded: 0,
    energyAwarded: 0,
    streakAwarded: 1,
    honestyHeartsAwarded: 0,
    createdAt: "2026-05-22T12:30:00.000Z",
    ...overrides,
  };
}

export function makeDailyFocusState(
  overrides: Partial<DailyFocusState> = {},
): DailyFocusState {
  return {
    petId: "pet-1",
    dateKey: "2026-05-22",
    completedFocusMinutes: 0,
    dailyGoalAwarded: false,
    honestyHeartsAwarded: 0,
    powerNapsUsed: 0,
    emergencySnacksUsed: 0,
    lastPowerNapAt: null,
    ...overrides,
  };
}
