import {
  applyStreakFreeze,
  createDailyFocusState,
  normalizeDailyFocusState,
  type StreakFreezeResult,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export interface ApplyStoredStreakFreezeInput {
  petId: string;
  dateKey: string;
  now: string;
}

export async function applyStoredStreakFreeze(
  { petId, dateKey, now }: ApplyStoredStreakFreezeInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<StreakFreezeResult> {
  return database.transaction("rw", database.pets, database.dailyFocus, async () => {
    const [pet, storedDailyFocusState] = await Promise.all([
      database.pets.get(petId),
      database.dailyFocus.get([petId, dateKey]),
    ]);

    if (!pet) {
      throw new RepositoryError(`Pet not found: ${petId}`);
    }

    const dailyFocusState = normalizeDailyFocusState(
      storedDailyFocusState ?? createDailyFocusState({ petId, dateKey }),
    );
    const result = applyStreakFreeze(pet, dailyFocusState, now);

    await database.pets.put(result.pet);
    await database.dailyFocus.put(result.dailyFocusState);

    return result;
  });
}
