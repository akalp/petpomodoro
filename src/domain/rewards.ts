import {
  ACTIVE_BALANCE_PROFILE,
  calculateFocusReward,
  calculateHonestyReward,
} from "./balance";
import { DomainError } from "./errors";
import { applyPetStatAdjustments } from "./pet";
import type {
  FocusSession,
  PetState,
  RewardLedger,
  RewardSummary,
} from "./types";

export const FOCUS_SESSION_XP_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completedReward.xp;
export const FOCUS_SESSION_COIN_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completedReward.coins;
export const FOCUS_SESSION_HAPPINESS_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completedReward.happiness;
export const FOCUS_SESSION_HUNGER_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completedReward.hunger;
export const FOCUS_SESSION_ENERGY_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completedReward.energy;
export const HONESTY_HAPPINESS_REWARD =
  ACTIVE_BALANCE_PROFILE.honesty.reward.happiness;
export const HONESTY_ENERGY_REWARD =
  ACTIVE_BALANCE_PROFILE.honesty.reward.energy;
export const HONESTY_HEART_REWARD =
  ACTIVE_BALANCE_PROFILE.honesty.reward.honestyHearts;

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

  const rewardValues = rewardValuesForSession(
    session,
    completedXpAwarded,
  );
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
  session: FocusSession,
  completedXpAwarded: number,
): Omit<RewardSummary, "previousLevel" | "newLevel" | "leveledUp"> {
  if (session.status === "completed") {
    if (!Number.isFinite(completedXpAwarded) || completedXpAwarded <= 0) {
      throw new DomainError("Completed session XP must be greater than zero.");
    }
    const reward = calculateFocusReward(session.plannedDurationMinutes);

    return {
      rewardType: "focus_completed",
      xpAwarded: completedXpAwarded,
      coinsAwarded: reward.coins,
      happinessAwarded: reward.happiness,
      hungerAwarded: reward.hunger,
      energyAwarded: reward.energy,
      streakAwarded: reward.streak,
      honestyHeartsAwarded: reward.honestyHearts,
    };
  }

  if (session.status !== "abandoned") {
    throw new DomainError("Only completed or abandoned sessions can claim rewards.");
  }

  const honestyReward = calculateHonestyReward(session).reward;

  return {
    rewardType: "honesty",
    xpAwarded: honestyReward.xp,
    coinsAwarded: honestyReward.coins,
    happinessAwarded: honestyReward.happiness,
    hungerAwarded: honestyReward.hunger,
    energyAwarded: honestyReward.energy,
    streakAwarded: honestyReward.streak,
    honestyHeartsAwarded: honestyReward.honestyHearts,
  };
}
