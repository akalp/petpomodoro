import { DomainError } from "./errors";
import { addPetXp } from "./pet";
import type { FocusSession, PetState, RewardLedger } from "./types";

export const FOCUS_SESSION_XP_REWARD = 25;

export interface ClaimFocusRewardInput {
  pet: PetState;
  session: FocusSession;
  existingRewards: readonly RewardLedger[];
  now: string;
  rewardId: string;
  xpAwarded?: number;
}

export interface ClaimFocusRewardResult {
  pet: PetState;
  session: FocusSession;
  reward: RewardLedger | null;
}

export function claimFocusReward({
  pet,
  session,
  existingRewards,
  now,
  rewardId,
  xpAwarded = FOCUS_SESSION_XP_REWARD,
}: ClaimFocusRewardInput): ClaimFocusRewardResult {
  if (session.status !== "completed") {
    throw new DomainError("Only completed sessions can claim rewards.");
  }

  if (!Number.isFinite(xpAwarded) || xpAwarded <= 0) {
    throw new DomainError("Reward XP must be greater than zero.");
  }

  const existingReward = existingRewards.find(
    (reward) => reward.sessionId === session.id,
  );

  if (session.rewardClaimedAt !== null || existingReward) {
    return {
      pet,
      session: {
        ...session,
        rewardClaimedAt: session.rewardClaimedAt ?? existingReward?.createdAt ?? null,
      },
      reward: null,
    };
  }

  const reward: RewardLedger = {
    id: rewardId,
    sessionId: session.id,
    petId: pet.id,
    xpAwarded,
    createdAt: now,
  };

  return {
    pet: addPetXp(pet, xpAwarded, now),
    session: {
      ...session,
      rewardClaimedAt: now,
    },
    reward,
  };
}
