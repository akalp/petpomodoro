import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import {
  claimFocusReward,
  claimSessionReward,
  HONESTY_HEART_REWARD,
  HONESTY_HAPPINESS_REWARD,
  HONESTY_ENERGY_REWARD,
} from "./rewards";
import { makePet, makeReward, makeSession } from "../test/factories";

describe("focus rewards", () => {
  it("claims a duration-based reward for a completed session once", () => {
    const pet = makePet({ xp: 90, level: 1 });
    const session = makeSession({
      plannedDurationMinutes: 25,
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
      xp: 115,
      level: 2,
      coins: 2,
      happiness: 55,
      hunger: 100,
      energy: 80,
      streak: 1,
      honestyHearts: 0,
      mood: "calm",
      updatedAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.session.rewardClaimedAt).toBe("2026-05-22T12:31:00.000Z");
    expect(result.reward).toEqual({
      id: "reward-1",
      sessionId: "session-1",
      petId: "pet-1",
      rewardType: "focus_completed",
      xpAwarded: 25,
      coinsAwarded: 2,
      happinessAwarded: 5,
      hungerAwarded: 0,
      energyAwarded: 0,
      streakAwarded: 1,
      honestyHeartsAwarded: 0,
      createdAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.summary).toMatchObject({
      rewardType: "focus_completed",
      xpAwarded: 25,
      previousLevel: 1,
      newLevel: 2,
      leveledUp: true,
    });
  });

  it.each([
    { coinsAwarded: 0, happinessAwarded: 1, minutes: 5, xpAwarded: 5 },
    { coinsAwarded: 0, happinessAwarded: 3, minutes: 15, xpAwarded: 15 },
    { coinsAwarded: 2, happinessAwarded: 5, minutes: 25, xpAwarded: 25 },
    { coinsAwarded: 4, happinessAwarded: 10, minutes: 50, xpAwarded: 50 },
  ])(
    "uses v1 completion reward values for $minutes minutes",
    ({ coinsAwarded, happinessAwarded, minutes, xpAwarded }) => {
      const result = claimFocusReward({
        pet: makePet(),
        session: makeSession({
          plannedDurationMinutes: minutes,
          status: "completed",
        }),
        existingRewards: [],
        now: "2026-05-22T12:31:00.000Z",
        rewardId: "reward-1",
      });

      expect(result.summary).toMatchObject({
        rewardType: "focus_completed",
        xpAwarded,
        coinsAwarded,
        happinessAwarded,
      });
      expect(result.reward).toMatchObject({
        xpAwarded,
        coinsAwarded,
        happinessAwarded,
      });
    },
  );

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
      happiness: 50 + HONESTY_HAPPINESS_REWARD,
      energy: 80 + HONESTY_ENERGY_REWARD,
      streak: 0,
      honestyHearts: HONESTY_HEART_REWARD,
    });
    expect(result.reward).toMatchObject({
      rewardType: "honesty",
      xpAwarded: 0,
      happinessAwarded: HONESTY_HAPPINESS_REWARD,
      energyAwarded: HONESTY_ENERGY_REWARD,
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
