import {
  applyFocusSessionImpact,
  applyIdlePetDecay,
  claimSessionReward,
  type ClaimFocusRewardResult,
  type FocusSession,
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

      if (rewardSession.rewardClaimedAt !== null || existingReward) {
        const result = claimSessionReward({
          pet,
          session: rewardSession,
          existingRewards: existingRewardList,
          now,
          rewardId,
          completedXpAwarded: xpAwarded,
        });

        await database.sessions.put(result.session);
        return result;
      }

      const impactResult = applyStoredSessionImpactValues(pet, rewardSession, now);
      const result = claimSessionReward({
        pet: impactResult.pet,
        session: impactResult.session,
        existingRewards: existingRewardList,
        now,
        rewardId,
        completedXpAwarded: xpAwarded,
      });

      await database.pets.put(result.pet);
      await database.sessions.put(result.session);

      if (result.reward) {
        await database.rewardLedger.add(result.reward);
      }

      return result;
    },
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

    const impactResult = applyStoredSessionImpactValues(pet, nextSession, now);

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
