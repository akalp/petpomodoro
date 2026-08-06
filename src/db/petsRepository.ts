import {
  DEFAULT_PET_SPECIES_ID,
  defaultPetNameForSpecies,
  normalizePetState,
  startPetSleep,
  wakePetFromSleep,
  type PetMood,
  type PetSleepResult,
  type PetState,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export const DEFAULT_PET_ID = "local-pet";
export const DEFAULT_PET_NAME = defaultPetNameForSpecies(DEFAULT_PET_SPECIES_ID);

export interface CreateInitialPetInput {
  now: string;
  id?: string;
  name?: string;
  mood?: PetMood;
}

export function createInitialPet({
  now,
  id = DEFAULT_PET_ID,
  name = DEFAULT_PET_NAME,
  mood = "calm",
}: CreateInitialPetInput): PetState {
  return {
    id,
    speciesId: DEFAULT_PET_SPECIES_ID,
    name,
    customName: name === DEFAULT_PET_NAME ? null : name,
    level: 1,
    xp: 0,
    mood,
    coins: 0,
    happiness: 50,
    hunger: 100,
    energy: 80,
    streak: 0,
    honestyHearts: 0,
    lastFreezeUsedAt: null,
    sleepStartedAt: null,
    lastHungerUpdatedAt: now,
    lastAppOpenedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getCurrentPet(
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState | undefined> {
  const defaultPet = await database.pets.get(DEFAULT_PET_ID);

  if (defaultPet) {
    return normalizePetState(defaultPet);
  }

  const pet = await database.pets.orderBy("createdAt").first();
  return pet ? normalizePetState(pet) : undefined;
}

export async function loadOrCreateDefaultPet(
  now: string,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState> {
  const currentPet = await getCurrentPet(database);

  if (currentPet) {
    const normalizedPet = normalizePetState(currentPet);
    if (normalizedPet !== currentPet) {
      await database.pets.put(normalizedPet);
    }
    return normalizedPet;
  }

  const pet = createInitialPet({ now });
  await database.pets.add(pet);
  return pet;
}

export async function savePet(
  pet: PetState,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState> {
  await database.pets.put(pet);
  return pet;
}

export async function updatePet(
  pet: PetState,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState> {
  await database.pets.put(pet);
  return pet;
}

export interface PetCareActionInput {
  petId: string;
  now: string;
}

export async function startStoredPetSleep(
  { petId, now }: PetCareActionInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState> {
  return database.transaction("rw", database.pets, async () => {
    const pet = await database.pets.get(petId);

    if (!pet) {
      throw new RepositoryError(`Pet not found: ${petId}`);
    }

    const nextPet = startPetSleep(normalizePetState(pet), now);
    await database.pets.put(nextPet);
    return nextPet;
  });
}

export async function wakeStoredPetFromSleep(
  { petId, now }: PetCareActionInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetSleepResult> {
  return database.transaction("rw", database.pets, async () => {
    const pet = await database.pets.get(petId);

    if (!pet) {
      throw new RepositoryError(`Pet not found: ${petId}`);
    }

    const result = wakePetFromSleep(normalizePetState(pet), now);
    await database.pets.put(result.pet);
    return result;
  });
}
