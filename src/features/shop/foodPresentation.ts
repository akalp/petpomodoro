import type { FoodItemId } from "../../domain";
import type { MessageKey } from "../../i18n";

export interface FoodPresentation {
  readonly nameKey: MessageKey;
  readonly descriptionKey: MessageKey;
}

export const FOOD_PRESENTATION = {
  "berry-bowl": {
    nameKey: "foodBerryBowl",
    descriptionKey: "foodBerryBowlDescription",
  },
  "warm-soup": {
    nameKey: "foodWarmSoup",
    descriptionKey: "foodWarmSoupDescription",
  },
  "honey-toast": {
    nameKey: "foodHoneyToast",
    descriptionKey: "foodHoneyToastDescription",
  },
  "moon-milk": {
    nameKey: "foodMoonMilk",
    descriptionKey: "foodMoonMilkDescription",
  },
} satisfies Record<FoodItemId, FoodPresentation>;
