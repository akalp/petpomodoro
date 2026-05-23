import { DomainError } from "./errors";
import { applyPetStatAdjustments } from "./pet";
import type { PetState } from "./types";

export type ShopItemCategory = "food";

export type FoodItemId =
  | "berry-bowl"
  | "warm-soup"
  | "honey-toast"
  | "moon-milk";

export interface FoodItem {
  id: FoodItemId;
  category: ShopItemCategory;
  cost: number;
  hunger: number;
  happiness: number;
  energy: number;
}

export interface FoodPurchaseSummary {
  item: FoodItem;
  coinsSpent: number;
  previousCoins: number;
  nextCoins: number;
  hungerGained: number;
  happinessGained: number;
  energyGained: number;
  previousStats: Pick<PetState, "hunger" | "happiness" | "energy">;
  nextStats: Pick<PetState, "hunger" | "happiness" | "energy">;
}

export interface FoodPurchaseResult {
  pet: PetState;
  summary: FoodPurchaseSummary;
}

export const FOOD_NOT_FOUND_ERROR = "Food item not found.";
export const INSUFFICIENT_COINS_ERROR = "Not enough coins for this food.";

export const FOOD_CATALOG: readonly FoodItem[] = [
  {
    id: "berry-bowl",
    category: "food",
    cost: 3,
    hunger: 12,
    happiness: 6,
    energy: 0,
  },
  {
    id: "warm-soup",
    category: "food",
    cost: 5,
    hunger: 22,
    happiness: 4,
    energy: 0,
  },
  {
    id: "honey-toast",
    category: "food",
    cost: 6,
    hunger: 14,
    happiness: 10,
    energy: 4,
  },
  {
    id: "moon-milk",
    category: "food",
    cost: 7,
    hunger: 8,
    happiness: 6,
    energy: 16,
  },
] as const;

export function buyFoodForPet(
  pet: PetState,
  foodId: FoodItemId | string,
  now: string,
): FoodPurchaseResult {
  const item = FOOD_CATALOG.find((food) => food.id === foodId);

  if (!item) {
    throw new DomainError(FOOD_NOT_FOUND_ERROR);
  }

  if (pet.coins < item.cost) {
    throw new DomainError(INSUFFICIENT_COINS_ERROR);
  }

  const nextPet = applyPetStatAdjustments(
    pet,
    {
      coins: -item.cost,
      hunger: item.hunger,
      happiness: item.happiness,
      energy: item.energy,
    },
    now,
  );

  return {
    pet: nextPet,
    summary: {
      item,
      coinsSpent: item.cost,
      previousCoins: pet.coins,
      nextCoins: nextPet.coins,
      hungerGained: nextPet.hunger - pet.hunger,
      happinessGained: nextPet.happiness - pet.happiness,
      energyGained: nextPet.energy - pet.energy,
      previousStats: {
        hunger: pet.hunger,
        happiness: pet.happiness,
        energy: pet.energy,
      },
      nextStats: {
        hunger: nextPet.hunger,
        happiness: nextPet.happiness,
        energy: nextPet.energy,
      },
    },
  };
}
