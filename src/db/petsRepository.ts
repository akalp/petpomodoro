import type { PetMood, PetState } from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";

export const DEFAULT_PET_ID = "local-pet";
export const DEFAULT_PET_NAME = "Momo";

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
    name,
    level: 1,
    xp: 0,
    mood,
    hunger: 100,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getCurrentPet(
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState | undefined> {
  const defaultPet = await database.pets.get(DEFAULT_PET_ID);

  if (defaultPet) {
    return defaultPet;
  }

  return database.pets.orderBy("createdAt").first();
}

export async function loadOrCreateDefaultPet(
  now: string,
  database: PetPomodoroDatabase = defaultDb,
): Promise<PetState> {
  const currentPet = await getCurrentPet(database);

  if (currentPet) {
    return currentPet;
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

