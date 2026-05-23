import { motion } from "framer-motion";

import {
  FOOD_CATALOG,
  type FoodItem,
  type FoodItemId,
  type FoodPurchaseSummary,
  type PetState,
} from "../../domain";
import type { MessageKey, Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PetShopProps {
  disabled: boolean;
  framed?: boolean;
  lastFoodPurchase: FoodPurchaseSummary | null;
  onBuyFood: (foodId: FoodItemId) => void;
  onClearPurchase: () => void;
  pet: PetState;
  showHeader?: boolean;
  t: Translator;
}

const foodCopy: Record<
  FoodItemId,
  { name: MessageKey; description: MessageKey }
> = {
  "berry-bowl": {
    name: "foodBerryBowl",
    description: "foodBerryBowlDescription",
  },
  "warm-soup": {
    name: "foodWarmSoup",
    description: "foodWarmSoupDescription",
  },
  "honey-toast": {
    name: "foodHoneyToast",
    description: "foodHoneyToastDescription",
  },
  "moon-milk": {
    name: "foodMoonMilk",
    description: "foodMoonMilkDescription",
  },
};

export function PetShop({
  disabled,
  framed = true,
  lastFoodPurchase,
  onBuyFood,
  onClearPurchase,
  pet,
  showHeader = true,
  t,
}: PetShopProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {showHeader ? (
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {t("shopTitle")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("shopSupport")}
            </p>
          </div>
        ) : null}
        {showHeader ? <CoinBalance coins={pet.coins} t={t} variant="pill" /> : null}
      </div>

      {!showHeader ? (
        <CoinBalance coins={pet.coins} t={t} variant="bar" />
      ) : null}

      {lastFoodPurchase ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950"
          initial={{ opacity: 0, y: 6 }}
        >
          <p className="font-semibold">
            {t("foodBought", {
              food: t(foodCopy[lastFoodPurchase.item.id].name),
            })}
          </p>
          <p>
            {t("foodBoughtSupport", {
              hunger: formatSigned(lastFoodPurchase.hungerGained),
              happiness: formatSigned(lastFoodPurchase.happinessGained),
              energy: formatSigned(lastFoodPurchase.energyGained),
            })}
          </p>
          <Button
            className="mt-3 min-h-10 px-4 py-2 text-sm"
            onClick={onClearPurchase}
            variant="secondary"
          >
            {t("continue")}
          </Button>
        </motion.div>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {FOOD_CATALOG.map((food) => (
          <FoodButton
            disabled={disabled || pet.coins < food.cost}
            food={food}
            key={food.id}
            onBuyFood={onBuyFood}
            petCoins={pet.coins}
            t={t}
          />
        ))}
      </div>
    </>
  );

  if (!framed) {
    return (
      <div className="space-y-4" data-testid="pet-shop">
        {content}
      </div>
    );
  }

  return (
    <Card className="space-y-4" data-testid="pet-shop">
      {content}
    </Card>
  );
}

interface FoodButtonProps {
  disabled: boolean;
  food: FoodItem;
  onBuyFood: (foodId: FoodItemId) => void;
  petCoins: number;
  t: Translator;
}

function FoodButton({
  disabled,
  food,
  onBuyFood,
  petCoins,
  t,
}: FoodButtonProps) {
  const hasEnoughCoins = petCoins >= food.cost;

  return (
    <button
      className={[
        "min-h-44 min-w-0 rounded-lg border p-4 text-left transition active:scale-[0.99]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400"
          : "border-rose-100 bg-white text-slate-900 shadow-sm shadow-rose-100 hover:border-rose-200 hover:bg-rose-50",
      ].join(" ")}
      data-testid={`food-${food.id}`}
      disabled={disabled}
      onClick={() => onBuyFood(food.id)}
      type="button"
    >
      <div className="flex items-start gap-3">
        <FoodVisual foodId={food.id} isDisabled={disabled} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-tight">
            {t(foodCopy[food.id].name)}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {t(foodCopy[food.id].description)}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <StatBoost label={t("hunger")} value={food.hunger} />
        <StatBoost label={t("happiness")} value={food.happiness} />
        <StatBoost label={t("energy")} value={food.energy} />
      </dl>
      <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 text-sm font-semibold">
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-amber-900">
          {t("foodCost", { coins: food.cost })}
        </span>
        <span
          className={[
            "min-w-0 text-right leading-tight",
            hasEnoughCoins ? "text-rose-700" : "text-slate-400",
          ].join(" ")}
        >
          {hasEnoughCoins ? t("feedPet") : t("foodNotEnoughCoins")}
        </span>
      </div>
    </button>
  );
}

function CoinBalance({
  coins,
  t,
  variant,
}: {
  coins: number;
  t: Translator;
  variant: "bar" | "pill";
}) {
  if (variant === "bar") {
    return (
      <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-amber-950">
        <span className="text-sm font-semibold text-amber-900">
          {t("coins")}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-950">
          {coins}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex min-w-0 items-center justify-between gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
      <span className="truncate">{t("shopCoinBalance", { coins })}</span>
    </div>
  );
}

function StatBoost({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-2 text-slate-700">
      <dt className="min-h-7 text-[0.62rem] font-medium leading-tight text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{formatSigned(value)}</dd>
    </div>
  );
}

function FoodVisual({
  foodId,
  isDisabled,
}: {
  foodId: FoodItemId;
  isDisabled: boolean;
}) {
  const opacityClass = isDisabled ? "opacity-50" : "";

  if (foodId === "berry-bowl") {
    return (
      <div
        aria-hidden="true"
        className={`relative h-16 w-16 shrink-0 rounded-full bg-rose-100 ${opacityClass}`}
      >
        <div className="absolute bottom-3 left-2 h-8 w-12 rounded-b-full rounded-t-md bg-sky-200" />
        <div className="absolute left-4 top-5 h-4 w-4 rounded-full bg-rose-500" />
        <div className="absolute left-7 top-3 h-4 w-4 rounded-full bg-fuchsia-500" />
        <div className="absolute right-3 top-6 h-4 w-4 rounded-full bg-red-500" />
      </div>
    );
  }

  if (foodId === "warm-soup") {
    return (
      <div
        aria-hidden="true"
        className={`relative h-16 w-16 shrink-0 rounded-full bg-orange-100 ${opacityClass}`}
      >
        <div className="absolute bottom-3 left-2 h-7 w-12 rounded-b-full rounded-t-md bg-amber-300" />
        <div className="absolute left-5 top-4 h-6 w-6 rounded-full bg-orange-300" />
        <div className="absolute left-4 top-2 h-1 w-2 rounded-full bg-orange-400" />
        <div className="absolute right-5 top-1 h-1 w-2 rounded-full bg-orange-400" />
      </div>
    );
  }

  if (foodId === "honey-toast") {
    return (
      <div
        aria-hidden="true"
        className={`relative h-16 w-16 shrink-0 rounded-full bg-yellow-100 ${opacityClass}`}
      >
        <div className="absolute bottom-3 left-3 h-10 w-10 rounded-lg bg-amber-200 shadow-inner shadow-amber-300" />
        <div className="absolute left-5 top-5 h-6 w-6 rounded-md bg-yellow-400" />
        <div className="absolute right-4 top-7 h-2 w-2 rounded-full bg-amber-600" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative h-16 w-16 shrink-0 rounded-full bg-indigo-100 ${opacityClass}`}
    >
      <div className="absolute bottom-3 left-4 h-9 w-8 rounded-b-xl rounded-t-md bg-slate-100 shadow-inner shadow-indigo-200" />
      <div className="absolute left-6 top-3 h-2 w-4 rounded-full bg-white" />
      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-300" />
      <div className="absolute right-5 top-6 h-1.5 w-1.5 rounded-full bg-indigo-400" />
    </div>
  );
}

function formatSigned(value: number): string {
  return value > 0 ? `+${formatStat(value)}` : formatStat(value);
}

function formatStat(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
