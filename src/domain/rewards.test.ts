import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import {
  claimFocusReward,
  claimSessionReward,
  FOCUS_SESSION_COIN_REWARD,
  FOCUS_SESSION_XP_REWARD,
  HONESTY_HEART_REWARD,
} from "./rewards";
import { makePet, makeReward, makeSession } from "../test/factories";

describe("focus rewards", () => {
  it("claims a reward for a completed session once", () => {
    const pet = makePet({ xp: 90, level: 1 });
    const session = makeSession({
      status: "completed",
      confirmedAt: "2026-05-22T12:30:00.000Z",
    });

    const result = claimFocusReward({
      pet,
      session,
      existingRewards: [],
      now: "2026-05-22T12:31:00.000Z",
      rewardId: "reward-1",
    });

    expect(result.pet).toMatchObject({
      xp: 90 + FOCUS_SESSION_XP_REWARD,
      level: 2,
      coins: FOCUS_SESSION_COIN_REWARD,
      happiness: 62,
      hunger: 100,
      energy: 80,
      streak: 1,
      honestyHearts: 0,
      mood: "happy",
      updatedAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.session.rewardClaimedAt).toBe("2026-05-22T12:31:00.000Z");
    expect(result.reward).toEqual({
      id: "reward-1",
      sessionId: "session-1",
      petId: "pet-1",
      rewardType: "focus_completed",
      xpAwarded: FOCUS_SESSION_XP_REWARD,
      coinsAwarded: FOCUS_SESSION_COIN_REWARD,
      happinessAwarded: 12,
      hungerAwarded: 0,
      energyAwarded: 0,
      streakAwarded: 1,
      honestyHeartsAwarded: 0,
      createdAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.summary).toMatchObject({
      rewardType: "focus_completed",
      xpAwarded: FOCUS_SESSION_XP_REWARD,
      previousLevel: 1,
      newLevel: 2,
      leveledUp: true,
    });
  });

  it("applies a small honesty heart reward for abandoned sessions", () => {
    const result = claimSessionReward({
      pet: makePet(),
      session: makeSession({
        status: "abandoned",
        abandonedAt: "2026-05-22T12:30:00.000Z",
        abandonmentReason: "honest_confirmation",
      }),
      existingRewards: [],
      now: "2026-05-22T12:31:00.000Z",
      rewardId: "reward-1",
    });

    expect(result.pet).toMatchObject({
      xp: 0,
      coins: 0,
      happiness: 54,
      energy: 85,
      streak: 0,
      honestyHearts: HONESTY_HEART_REWARD,
    });
    expect(result.reward).toMatchObject({
      rewardType: "honesty",
      xpAwarded: 0,
      honestyHeartsAwarded: HONESTY_HEART_REWARD,
    });
    expect(result.summary).toMatchObject({
      rewardType: "honesty",
      honestyHeartsAwarded: HONESTY_HEART_REWARD,
      leveledUp: false,
    });
  });

  it("does not reward sessions cancelled before confirmation", () => {
    expect(() =>
      claimSessionReward({
        pet: makePet(),
        session: makeSession({
          status: "abandoned",
          abandonedAt: "2026-05-22T12:10:00.000Z",
          abandonmentReason: "cancelled",
        }),
        existingRewards: [],
        now: "2026-05-22T12:31:00.000Z",
        rewardId: "reward-1",
      }),
    ).toThrow(DomainError);
  });

  it("does not reward sessions that are not terminal", () => {
    expect(() =>
      claimSessionReward({
        pet: makePet(),
        session: makeSession({ status: "awaiting_confirmation" }),
        existingRewards: [],
        now: "2026-05-22T12:31:00.000Z",
        rewardId: "reward-1",
      }),
    ).toThrow(DomainError);
  });

  it("rejects invalid reward amounts", () => {
    expect(() =>
      claimFocusReward({
        pet: makePet(),
        session: makeSession({ status: "completed" }),
        existingRewards: [],
        now: "2026-05-22T12:31:00.000Z",
        rewardId: "reward-1",
        xpAwarded: 0,
      }),
    ).toThrow(DomainError);
  });

  it("does not produce a duplicate reward when the session is already claimed", () => {
    const pet = makePet({ xp: 25, level: 1 });
    const session = makeSession({
      status: "completed",
      rewardClaimedAt: "2026-05-22T12:31:00.000Z",
    });

    const result = claimFocusReward({
      pet,
      session,
      existingRewards: [],
      now: "2026-05-22T12:32:00.000Z",
      rewardId: "reward-2",
    });

    expect(result.pet).toBe(pet);
    expect(result.session.rewardClaimedAt).toBe("2026-05-22T12:31:00.000Z");
    expect(result.reward).toBeNull();
    expect(result.summary).toBeNull();
  });

  it("does not produce a duplicate reward when a ledger row already exists", () => {
    const pet = makePet({ xp: 25, level: 1 });
    const session = makeSession({ status: "completed" });
    const existingReward = makeReward({
      createdAt: "2026-05-22T12:31:00.000Z",
    });

    const result = claimFocusReward({
      pet,
      session,
      existingRewards: [existingReward],
      now: "2026-05-22T12:32:00.000Z",
      rewardId: "reward-2",
    });

    expect(result.pet).toBe(pet);
    expect(result.session.rewardClaimedAt).toBe("2026-05-22T12:31:00.000Z");
    expect(result.reward).toBeNull();
    expect(result.summary).toBeNull();
  });
});
