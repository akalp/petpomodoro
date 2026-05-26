import {
  ACTIVE_BALANCE_PROFILE,
  calculateFocusReward,
  calculateHonestyReward,
} from "./balance";
import {
  applyCompletedFocusMinutesToDailyState,
  applyHonestyHeartToDailyState,
  createDailyFocusState,
  normalizeDailyFocusState,
} from "./dailyFocus";
import { toLocalDateKey } from "./dateKeys";
import { DomainError } from "./errors";
import { applyPetStatAdjustments } from "./pet";
import type {
  DailyFocusState,
  FocusSession,
  PetState,
  RewardLedger,
  RewardSummary,
} from "./types";

export const FOCUS_SESSION_XP_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.xpPerFocusMinute;
export const FOCUS_SESSION_COIN_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.completionBonusPer25Minutes;
export const FOCUS_SESSION_HAPPINESS_REWARD =
  ACTIVE_BALANCE_PROFILE.focus.happinessPer5Minutes;
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
export const MIN_HONESTY_SESSION_MINUTES =
  ACTIVE_BALANCE_PROFILE.honesty.limits.minSessionMinutes;
export const MAX_HONESTY_HEARTS_PER_DAY =
  ACTIVE_BALANCE_PROFILE.honesty.limits.maxHeartsPerDay;

export interface ClaimFocusRewardInput {
  pet: PetState;
  session: FocusSession;
  existingRewards: readonly RewardLedger[];
  dailyFocusState?: DailyFocusState | null;
  now: string;
  rewardId: string;
  xpAwarded?: number;
}

export interface ClaimFocusRewardResult {
  pet: PetState;
  session: FocusSession;
  dailyFocusState: DailyFocusState | null;
  reward: RewardLedger | null;
  summary: RewardSummary | null;
}

export function claimFocusReward({
  pet,
  session,
  existingRewards,
  dailyFocusState,
  now,
  rewardId,
  xpAwarded,
}: ClaimFocusRewardInput): ClaimFocusRewardResult {
  return claimSessionReward({
    pet,
    session,
    existingRewards,
    dailyFocusState,
    now,
    rewardId,
    completedXpAwarded: xpAwarded,
  });
}

export interface ClaimSessionRewardInput {
  pet: PetState;
  session: FocusSession;
  existingRewards: readonly RewardLedger[];
  dailyFocusState?: DailyFocusState | null;
  now: string;
  rewardId: string;
  completedXpAwarded?: number;
}

export function claimSessionReward({
  pet,
  session,
  existingRewards,
  dailyFocusState,
  now,
  rewardId,
  completedXpAwarded,
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
      dailyFocusState: dailyFocusState ?? null,
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

  const baseDailyFocusState = normalizeDailyFocusState(
    dailyFocusState ??
      createDailyFocusState({
        petId: pet.id,
        dateKey: rewardDateKeyForSession(session, now),
      }),
  );
  const { rewardValues, nextDailyFocusState } = rewardValuesForSession(
    session,
    baseDailyFocusState,
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
    dailyFocusState: nextDailyFocusState,
    reward,
    summary: hasPresentedReward(rewardValues)
      ? {
          ...rewardValues,
          previousLevel: pet.level,
          newLevel: nextPet.level,
          leveledUp: nextPet.level > pet.level,
        }
      : null,
  };
}

function hasPresentedReward(
  rewardValues: Omit<RewardSummary, "previousLevel" | "newLevel" | "leveledUp">,
): boolean {
  return (
    rewardValues.xpAwarded !== 0 ||
    rewardValues.coinsAwarded !== 0 ||
    rewardValues.happinessAwarded !== 0 ||
    rewardValues.hungerAwarded !== 0 ||
    rewardValues.energyAwarded !== 0 ||
    rewardValues.streakAwarded !== 0 ||
    rewardValues.honestyHeartsAwarded !== 0
  );
}

function rewardValuesForSession(
  session: FocusSession,
  dailyFocusState: DailyFocusState,
  completedXpAwarded: number | undefined,
): {
  rewardValues: Omit<RewardSummary, "previousLevel" | "newLevel" | "leveledUp">;
  nextDailyFocusState: DailyFocusState;
} {
  if (session.status === "completed") {
    const reward = calculateFocusReward(session.plannedDurationMinutes);
    const xpAwarded = completedXpAwarded ?? reward.xp;

    if (!Number.isFinite(xpAwarded) || xpAwarded <= 0) {
      throw new DomainError("Completed session XP must be greater than zero.");
    }

    const dailyResult = applyCompletedFocusMinutesToDailyState(
      dailyFocusState,
      session.plannedDurationMinutes,
    );

    return {
      rewardValues: {
        rewardType: "focus_completed",
        xpAwarded,
        coinsAwarded: reward.coins,
        happinessAwarded: reward.happiness,
        hungerAwarded: reward.hunger,
        energyAwarded: reward.energy,
        streakAwarded: dailyResult.streakAwarded,
        honestyHeartsAwarded: reward.honestyHearts,
      },
      nextDailyFocusState: dailyResult.dailyFocusState,
    };
  }

  if (session.status !== "abandoned") {
    throw new DomainError("Only completed or abandoned sessions can claim rewards.");
  }

  const honestyReward = calculateHonestyReward(session, dailyFocusState).reward;
  const nextDailyFocusState = applyHonestyHeartToDailyState(
    dailyFocusState,
    honestyReward.honestyHearts,
  );

  return {
    rewardValues: {
      rewardType: "honesty",
      xpAwarded: honestyReward.xp,
      coinsAwarded: honestyReward.coins,
      happinessAwarded: honestyReward.happiness,
      hungerAwarded: honestyReward.hunger,
      energyAwarded: honestyReward.energy,
      streakAwarded: honestyReward.streak,
      honestyHeartsAwarded: honestyReward.honestyHearts,
    },
    nextDailyFocusState,
  };
}

export function rewardDateKeyForSession(
  session: FocusSession,
  now: string,
): string {
  const rewardDate =
    session.status === "completed"
      ? session.expectedEndAt
      : session.abandonedAt ?? now;

  return toLocalDateKey(new Date(rewardDate));
}
