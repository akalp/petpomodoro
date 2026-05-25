import { motion } from "framer-motion";

import {
  FOOD_CATALOG,
  type FoodItem,
  type FoodItemId,
  type FoodPurchaseSummary,
  type PetState,
} from "../../domain";
import { FoodVisual } from "../../features/shop/FoodVisual";
import { FOOD_PRESENTATION } from "../../features/shop/foodPresentation";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PetShopProps {
  disabled: boolean;
  framed?: boolean;
  lastFoodPurchase: FoodPurchaseSummary | null;
  onBuyFood: (foodId: FoodItemId) => void;
  onClearPurchase: () => void;
  pet: PetState;
  showCoinBalance?: boolean;
  showHeader?: boolean;
  t: Translator;
}

export function PetShop({
  disabled,
  framed = true,
  lastFoodPurchase,
  onBuyFood,
  onClearPurchase,
  pet,
  showCoinBalance = true,
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
        {showHeader && showCoinBalance ? (
          <div className="hidden shrink-0 sm:block">
            <CoinBalance coins={pet.coins} t={t} variant="pill" />
          </div>
        ) : null}
      </div>

      {showHeader && showCoinBalance ? (
        <div className="sm:hidden">
          <CoinBalance coins={pet.coins} t={t} variant="bar" />
        </div>
      ) : null}

      {!showHeader && showCoinBalance ? (
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
              food: t(FOOD_PRESENTATION[lastFoodPurchase.item.id].nameKey),
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

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr">
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
        "flex min-h-60 min-w-0 flex-col rounded-lg border p-4 text-left transition active:scale-[0.99]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
          : "border-rose-100 bg-white text-slate-900 shadow-sm shadow-rose-100 hover:border-rose-200 hover:bg-rose-50",
      ].join(" ")}
      data-testid={`food-${food.id}`}
      disabled={disabled}
      onClick={() => onBuyFood(food.id)}
      type="button"
    >
      <div className="flex min-h-24 items-start gap-3">
        <FoodVisual disabled={disabled} foodId={food.id} />
        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-base font-semibold leading-tight",
              disabled ? "text-slate-500" : "text-slate-950",
            ].join(" ")}
          >
            {t(FOOD_PRESENTATION[food.id].nameKey)}
          </p>
          <p
            className={[
              "mt-1 text-sm leading-5",
              disabled ? "text-slate-500" : "text-slate-600",
            ].join(" ")}
          >
            {t(FOOD_PRESENTATION[food.id].descriptionKey)}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <StatBoost disabled={disabled} label={t("hunger")} value={food.hunger} />
        <StatBoost
          disabled={disabled}
          label={t("happiness")}
          value={food.happiness}
        />
        <StatBoost disabled={disabled} label={t("energy")} value={food.energy} />
      </dl>
      <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2 pt-4 text-sm font-semibold">
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

function StatBoost({
  disabled,
  label,
  value,
}: {
  disabled: boolean;
  label: string;
  value: number;
}) {
  return (
    <div
      className={[
        "rounded-md px-2 py-2",
        disabled ? "bg-white/70 text-slate-500" : "bg-slate-50 text-slate-700",
      ].join(" ")}
    >
      <dt
        className={[
          "min-h-7 text-[0.62rem] font-medium leading-tight",
          disabled ? "text-slate-400" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </dt>
      <dd className="mt-1 text-sm">{formatSigned(value)}</dd>
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
