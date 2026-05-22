import type { FocusSession, PetState, RewardLedger } from "../domain";

export const baseNow = "2026-05-22T12:00:00.000Z";

export function makePet(overrides: Partial<PetState> = {}): PetState {
  return {
    id: "pet-1",
    name: "Momo",
    level: 1,
    xp: 0,
    mood: "calm",
    hunger: 100,
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
    rewardClaimedAt: null,
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
    xpAwarded: 25,
    createdAt: "2026-05-22T12:30:00.000Z",
    ...overrides,
  };
}
