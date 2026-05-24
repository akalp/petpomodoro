import { PetShop } from "../../components/pet/PetShop";
import { Card } from "../../components/ui/Card";
import type { FoodItemId, FoodPurchaseSummary, PetState } from "../../domain";
import type { Translator } from "../../i18n";

interface ShopScreenProps {
  disabled: boolean;
  isFocusActive: boolean;
  lastFoodPurchase: FoodPurchaseSummary | null;
  onBuyFood: (foodId: FoodItemId) => void;
  onClearPurchase: () => void;
  pet: PetState | null;
  t: Translator;
}

export function ShopScreen({
  disabled,
  isFocusActive,
  lastFoodPurchase,
  onBuyFood,
  onClearPurchase,
  pet,
  t,
}: ShopScreenProps) {
  if (!pet) {
    return null;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      {isFocusActive ? (
        <Card className="border-amber-100 bg-amber-50 text-sm font-medium leading-6 text-amber-950">
          {t("shopUnavailableDuringFocus")}
        </Card>
      ) : null}
      <PetShop
        disabled={disabled}
        lastFoodPurchase={lastFoodPurchase}
        onBuyFood={onBuyFood}
        onClearPurchase={onClearPurchase}
        pet={pet}
        t={t}
      />
    </section>
  );
}
