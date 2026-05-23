import { DomainError } from "./errors";
import { applyPetStatAdjustments } from "./pet";
import type {
  FocusSession,
  PetState,
  RewardLedger,
  RewardSummary,
  RewardType,
} from "./types";

export const FOCUS_SESSION_XP_REWARD = 25;
export const FOCUS_SESSION_COIN_REWARD = 10;
export const FOCUS_SESSION_HAPPINESS_REWARD = 12;
export const FOCUS_SESSION_HUNGER_REWARD = 0;
export const FOCUS_SESSION_ENERGY_REWARD = 0;
export const HONESTY_HAPPINESS_REWARD = 4;
export const HONESTY_ENERGY_REWARD = 5;
export const HONESTY_HEART_REWARD = 1;

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
  summary: RewardSummary | null;
}

export function claimFocusReward({
  pet,
  session,
  existingRewards,
  now,
  rewardId,
  xpAwarded = FOCUS_SESSION_XP_REWARD,
}: ClaimFocusRewardInput): ClaimFocusRewardResult {
  return claimSessionReward({
    pet,
    session,
    existingRewards,
    now,
    rewardId,
    completedXpAwarded: xpAwarded,
  });
}

export interface ClaimSessionRewardInput {
  pet: PetState;
  session: FocusSession;
  existingRewards: readonly RewardLedger[];
  now: string;
  rewardId: string;
  completedXpAwarded?: number;
}

export function claimSessionReward({
  pet,
  session,
  existingRewards,
  now,
  rewardId,
  completedXpAwarded = FOCUS_SESSION_XP_REWARD,
}: ClaimSessionRewardInput): ClaimFocusRewardResult {
  if (session.status !== "completed" && session.status !== "abandoned") {
    throw new DomainError("Only completed or abandoned sessions can claim rewards.");
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
      summary: null,
    };
  }

  if (
    session.status === "abandoned" &&
    session.abandonmentReason !== "honest_confirmation"
  ) {
    throw new DomainError("Only honestly declined sessions can claim honesty rewards.");
  }

  const rewardValues = rewardValuesForSession(session.status, completedXpAwarded);
  const nextPet = applyPetStatAdjustments(
    pet,
    {
      xp: rewardValues.xpAwarded,
      coins: rewardValues.coinsAwarded,
      happiness: rewardValues.happinessAwarded,
      hunger: rewardValues.hungerAwarded,
      energy: rewardValues.energyAwarded,
      streak: rewardValues.streakAwarded,
      honestyHearts: rewardValues.honestyHeartsAwarded,
    },
    now,
  );

  const reward: RewardLedger = {
    id: rewardId,
    sessionId: session.id,
    petId: pet.id,
    rewardType: rewardValues.rewardType,
    xpAwarded: rewardValues.xpAwarded,
    coinsAwarded: rewardValues.coinsAwarded,
    happinessAwarded: rewardValues.happinessAwarded,
    hungerAwarded: rewardValues.hungerAwarded,
    energyAwarded: rewardValues.energyAwarded,
    streakAwarded: rewardValues.streakAwarded,
    honestyHeartsAwarded: rewardValues.honestyHeartsAwarded,
    createdAt: now,
  };

  return {
    pet: nextPet,
    session: {
      ...session,
      rewardClaimedAt: now,
    },
    reward,
    summary: {
      ...rewardValues,
      previousLevel: pet.level,
      newLevel: nextPet.level,
      leveledUp: nextPet.level > pet.level,
    },
  };
}

function rewardValuesForSession(
  status: "completed" | "abandoned",
  completedXpAwarded: number,
): Omit<RewardSummary, "previousLevel" | "newLevel" | "leveledUp"> {
  if (status === "completed") {
    if (!Number.isFinite(completedXpAwarded) || completedXpAwarded <= 0) {
      throw new DomainError("Completed session XP must be greater than zero.");
    }

    return {
      rewardType: "focus_completed",
      xpAwarded: completedXpAwarded,
      coinsAwarded: FOCUS_SESSION_COIN_REWARD,
      happinessAwarded: FOCUS_SESSION_HAPPINESS_REWARD,
      hungerAwarded: FOCUS_SESSION_HUNGER_REWARD,
      energyAwarded: FOCUS_SESSION_ENERGY_REWARD,
      streakAwarded: 1,
      honestyHeartsAwarded: 0,
    };
  }

  return {
    rewardType: "honesty" satisfies RewardType,
    xpAwarded: 0,
    coinsAwarded: 0,
    happinessAwarded: HONESTY_HAPPINESS_REWARD,
    hungerAwarded: 0,
    energyAwarded: HONESTY_ENERGY_REWARD,
    streakAwarded: 0,
    honestyHeartsAwarded: HONESTY_HEART_REWARD,
  };
}
