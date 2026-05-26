import {
  applyEmergencySnack,
  applyPowerNap,
  applyStreakFreeze,
  createDailyFocusState,
  normalizeDailyFocusState,
  normalizePetState,
  toLocalDateKey,
  type EmergencySnackResult,
  type PowerNapResult,
  type StreakFreezeResult,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export interface ApplyStoredStreakFreezeInput {
  petId: string;
  dateKey: string;
  now: string;
}

export interface ApplyStoredRescueInput {
  petId: string;
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

export async function applyStoredPowerNap(
  { petId, now }: ApplyStoredRescueInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PowerNapResult> {
  return applyStoredRescue(
    petId,
    now,
    (pet, dailyFocusState) => applyPowerNap(pet, dailyFocusState, now),
    database,
  );
}

export async function applyStoredEmergencySnack(
  { petId, now }: ApplyStoredRescueInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<EmergencySnackResult> {
  return applyStoredRescue(
    petId,
    now,
    (pet, dailyFocusState) => applyEmergencySnack(pet, dailyFocusState, now),
    database,
  );
}

async function applyStoredRescue<TResult extends {
  pet: ReturnType<typeof normalizePetState>;
  dailyFocusState: ReturnType<typeof normalizeDailyFocusState>;
}>(
  petId: string,
  now: string,
  applyAction: (
    pet: ReturnType<typeof normalizePetState>,
    dailyFocusState: ReturnType<typeof normalizeDailyFocusState>,
  ) => TResult,
  database: PetPomodoroDatabase,
): Promise<TResult> {
  const dateKey = toLocalDateKey(new Date(now));

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
    const result = applyAction(normalizePetState(pet), dailyFocusState);

    await database.pets.put(result.pet);
    await database.dailyFocus.put(result.dailyFocusState);

    return result;
  });
}
