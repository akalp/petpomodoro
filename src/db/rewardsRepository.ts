import {
  claimSessionReward,
  FOCUS_SESSION_XP_REWARD,
  type ClaimFocusRewardResult,
  type RewardLedger,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export interface ClaimStoredFocusRewardInput {
  petId: string;
  sessionId: string;
  now: string;
  rewardId?: string;
  xpAwarded?: number;
}

export async function getRewardBySessionId(
  sessionId: string,
  database: PetPomodoroDatabase = defaultDb,
): Promise<RewardLedger | undefined> {
  return database.rewardLedger.where("sessionId").equals(sessionId).first();
}

export async function claimStoredFocusReward(
  {
    petId,
    sessionId,
    now,
    rewardId = crypto.randomUUID(),
    xpAwarded = FOCUS_SESSION_XP_REWARD,
  }: ClaimStoredFocusRewardInput,
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

      const result = claimSessionReward({
        pet,
        session,
        existingRewards: existingReward ? [existingReward] : [],
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
