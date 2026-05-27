import {
  ACTIVE_BALANCE_PROFILE,
  type BalanceFoodItemId,
  calculateFoodEffects,
} from "./balance";
import { DomainError } from "./errors";
import { applyPetStatAdjustments, isPetSleeping } from "./pet";
import type { PetState } from "./types";

export type ShopItemCategory = "food";

export type FoodItemId = BalanceFoodItemId;

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

export const FOOD_NOT_FOUND_ERROR = "food_not_found";
export const INSUFFICIENT_COINS_ERROR = "insufficient_coins";
export const PET_SLEEPING_CANNOT_EAT_ERROR = "pet_sleeping_cannot_eat";

export const FOOD_CATALOG =
  ACTIVE_BALANCE_PROFILE.shop.foodCatalog satisfies readonly FoodItem[];

export function buyFoodForPet(
  pet: PetState,
  foodId: FoodItemId,
  now: string,
): FoodPurchaseResult {
  if (isPetSleeping(pet)) {
    throw new DomainError(PET_SLEEPING_CANNOT_EAT_ERROR);
  }

  const effects = calculateFoodEffects(foodId, pet);

  if (!effects) {
    throw new DomainError(FOOD_NOT_FOUND_ERROR);
  }

  if (!effects.canAfford) {
    throw new DomainError(INSUFFICIENT_COINS_ERROR);
  }

  const nextPet = applyPetStatAdjustments(
    pet,
    {
      coins: -effects.coinsSpent,
      hunger: effects.item.hunger,
      happiness: effects.item.happiness,
      energy: effects.item.energy,
    },
    now,
  );

  return {
    pet: nextPet,
    summary: {
      item: effects.item,
      coinsSpent: effects.coinsSpent,
      previousCoins: effects.previousCoins,
      nextCoins: nextPet.coins,
      hungerGained: effects.hungerGained,
      happinessGained: effects.happinessGained,
      energyGained: effects.energyGained,
      previousStats: effects.previousStats,
      nextStats: effects.nextStats,
    },
  };
}
