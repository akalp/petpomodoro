import {
  applyFocusSessionImpact,
  applyIdlePetDecay,
  claimSessionReward,
  createDailyFocusState,
  normalizeDailyFocusState,
  rewardDateKeyForSession,
  type ClaimFocusRewardResult,
  type DailyFocusState,
  type FocusSession,
  type FocusSessionStatus,
  type PetState,
  type RewardLedger,
} from "../domain";
import { createLocalId } from "../id";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export interface ClaimStoredSessionRewardInput {
  petId: string;
  sessionId: string;
  now: string;
  rewardId?: string;
  xpAwarded?: number;
  session?: FocusSession;
}

export interface ApplyStoredSessionImpactInput {
  petId: string;
  session: FocusSession;
  now: string;
}

export async function getRewardBySessionId(
  sessionId: string,
  database: PetPomodoroDatabase = defaultDb,
): Promise<RewardLedger | undefined> {
  return database.rewardLedger.where("sessionId").equals(sessionId).first();
}

export async function claimStoredSessionReward(
  {
    petId,
    sessionId,
    now,
    rewardId = createLocalId(),
    xpAwarded,
    session: nextSession,
  }: ClaimStoredSessionRewardInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<ClaimFocusRewardResult> {
  return database.transaction(
    "rw",
    database.pets,
    database.sessions,
    database.rewardLedger,
    database.dailyFocus,
    async () => {
      const [pet, session, existingReward] = await Promise.all([
        database.pets.get(petId),
        database.sessions.get(sessionId),
        getRewardBySessionId(sessionId, database),
      ]);

      if (!pet) {
        throw new RepositoryError(`Pet not found: ${petId}`);
      }

      if (!session) {
        throw new RepositoryError(`Focus session not found: ${sessionId}`);
      }

      const rewardSession = nextSession ?? session;

      if (rewardSession.id !== session.id) {
        throw new RepositoryError("Reward session id does not match stored session.");
      }

      const existingRewardList = existingReward ? [existingReward] : [];
      const dailyFocusState = existingReward
        ? null
        : await getOrCreateDailyFocusState(pet.id, rewardSession, now, database);

      if (rewardSession.rewardClaimedAt !== null || existingReward) {
        const result = claimSessionReward({
          pet,
          session: rewardSession,
          existingRewards: existingRewardList,
          dailyFocusState,
          now,
          rewardId,
          completedXpAwarded: xpAwarded,
        });

        await database.sessions.put(result.session);
        return result;
      }

      const impactResult = applyStoredSessionImpactValues(
        pet,
        mergeSessionImpactState(session, rewardSession),
        now,
      );
      const result = claimSessionReward({
        pet: impactResult.pet,
        session: impactResult.session,
        existingRewards: existingRewardList,
        dailyFocusState,
        now,
        rewardId,
        completedXpAwarded: xpAwarded,
      });

      await database.pets.put(result.pet);
      await database.sessions.put(result.session);

      if (result.reward) {
        if (result.dailyFocusState) {
          await database.dailyFocus.put(result.dailyFocusState);
        }
        await database.rewardLedger.add(result.reward);
      }

      return result;
    },
  );
}

async function getOrCreateDailyFocusState(
  petId: string,
  session: FocusSession,
  now: string,
  database: PetPomodoroDatabase,
): Promise<DailyFocusState> {
  const dateKey = rewardDateKeyForSession(session, now);
  const existingDailyState = await database.dailyFocus.get([petId, dateKey]);

  return normalizeDailyFocusState(
    existingDailyState ?? createDailyFocusState({ petId, dateKey }),
  );
}

export async function applyStoredSessionImpact(
  { petId, session: nextSession, now }: ApplyStoredSessionImpactInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<{ pet: PetState; session: FocusSession }> {
  return database.transaction("rw", database.pets, database.sessions, async () => {
    const [pet, session] = await Promise.all([
      database.pets.get(petId),
      database.sessions.get(nextSession.id),
    ]);

    if (!pet) {
      throw new RepositoryError(`Pet not found: ${petId}`);
    }

    if (!session) {
      throw new RepositoryError(`Focus session not found: ${nextSession.id}`);
    }

    const impactSession = mergeSessionImpactState(session, nextSession);
    const impactResult = applyStoredSessionImpactValues(pet, impactSession, now);

    await database.pets.put(impactResult.pet);
    await database.sessions.put(impactResult.session);

    return impactResult;
  });
}

function applyStoredSessionImpactValues(
  pet: PetState,
  session: FocusSession,
  now: string,
): { pet: PetState; session: FocusSession } {
  const focusResult = applyFocusSessionImpact(pet, session, now);
  const nextPet =
    focusResult.session.status === "running"
      ? focusResult.pet
      : applyIdlePetDecay(focusResult.pet, now);

  return {
    pet: nextPet,
    session: focusResult.session,
  };
}

function mergeSessionImpactState(
  persisted: FocusSession,
  intended: FocusSession,
): FocusSession {
  const advanced =
    sessionAdvanceRank(intended.status) >= sessionAdvanceRank(persisted.status)
      ? intended
      : persisted;

  return {
    ...persisted,
    status: advanced.status,
    abandonmentReason: advanced.abandonmentReason,
    confirmedAt: advanced.confirmedAt,
    abandonedAt: advanced.abandonedAt,
    rewardClaimedAt: advanced.rewardClaimedAt ?? persisted.rewardClaimedAt,
  };
}

function sessionAdvanceRank(status: FocusSessionStatus): number {
  switch (status) {
    case "awaiting_confirmation":
      return 1;
    case "completed":
    case "abandoned":
      return 2;
    default:
      return 0;
  }
}
