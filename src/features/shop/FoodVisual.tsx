import type { FoodItemId } from "../../domain";

import "./food-art.css";

interface FoodVisualProps {
  disabled: boolean;
  foodId: FoodItemId;
}

export function FoodVisual({ disabled, foodId }: FoodVisualProps) {
  return (
    <span
      aria-hidden="true"
      className="food-visual"
      data-food={foodId}
      data-disabled={disabled}
    >
      <span className="food-visual__halo" />
      <span className="food-visual__steam">
        <span className="food-visual__steam-line food-visual__steam-line--one" />
        <span className="food-visual__steam-line food-visual__steam-line--two" />
      </span>
      <span className="food-visual__vessel">
        <span className="food-visual__fill" />
        <span className="food-visual__morsel food-visual__morsel--one" />
        <span className="food-visual__morsel food-visual__morsel--two" />
        <span className="food-visual__morsel food-visual__morsel--three" />
        <span className="food-visual__garnish" />
        <span className="food-visual__shine" />
      </span>
      <span className="food-visual__side-detail" />
    </span>
  );
}
