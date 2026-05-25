import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { ShopScreen } from "./ShopScreen";

describe("ShopScreen", () => {
  it("shows why snacks are disabled while the pet is sleeping", () => {
    const html = renderToStaticMarkup(
      <ShopScreen
        disabled
        isFocusActive={false}
        isPetSleeping
        lastFoodPurchase={null}
        onBuyFood={() => undefined}
        onClearPurchase={() => undefined}
        pet={makePet()}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Snacks wait until Momo wakes up.");
    expect(html).toContain("data-testid=\"food-berry-bowl\" disabled=\"\"");
  });
});
