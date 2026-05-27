import {
  buyFoodForPet,
  type FoodItemId,
  type FoodPurchaseResult,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";
import { RepositoryError } from "./errors";

export interface BuyFoodInput {
  petId: string;
  foodId: FoodItemId;
  now: string;
}

export async function buyFoodForStoredPet(
  { petId, foodId, now }: BuyFoodInput,
  database: PetPomodoroDatabase = defaultDb,
): Promise<FoodPurchaseResult> {
  return database.transaction("rw", database.pets, async () => {
    const pet = await database.pets.get(petId);

    if (!pet) {
      throw new RepositoryError(`Pet not found: ${petId}`);
    }

    const result = buyFoodForPet(pet, foodId, now);
    await database.pets.put(result.pet);

    return result;
  });
}
