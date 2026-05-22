import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import { claimFocusReward, FOCUS_SESSION_XP_REWARD } from "./rewards";
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
      mood: "happy",
      updatedAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.session.rewardClaimedAt).toBe("2026-05-22T12:31:00.000Z");
    expect(result.reward).toEqual({
      id: "reward-1",
      sessionId: "session-1",
      petId: "pet-1",
      xpAwarded: FOCUS_SESSION_XP_REWARD,
      createdAt: "2026-05-22T12:31:00.000Z",
    });
  });

  it("does not reward abandoned sessions", () => {
    expect(() =>
      claimFocusReward({
        pet: makePet(),
        session: makeSession({ status: "abandoned" }),
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
  });
});
