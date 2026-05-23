import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";
import { Drawer } from "../ui/Drawer";

import { PetShop } from "./PetShop";

describe("PetShop", () => {
  it("renders food choices with disabled states when coins are too low", () => {
    const html = renderToStaticMarkup(
      <PetShop
        disabled={false}
        lastFoodPurchase={null}
        onBuyFood={() => undefined}
        onClearPurchase={() => undefined}
        pet={makePet({ coins: 4 })}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Berry bowl");
    expect(html).toContain("Warm soup");
    expect(html).toContain("Honey toast");
    expect(html).toContain("Moon milk");
    expect(html).toContain("data-testid=\"food-warm-soup\" disabled=\"\"");
    expect(html).toContain("Need more coins");
  });

  it("renders inside the Store drawer without its duplicate header", () => {
    const html = renderToStaticMarkup(
      <Drawer
        description="Spend focus coins on a small bite for your pet."
        headerAction={<span>10 coins</span>}
        isOpen
        onClose={() => undefined}
        title="Pet snack shop"
      >
        <PetShop
          disabled={false}
          framed={false}
          lastFoodPurchase={null}
          onBuyFood={() => undefined}
          onClearPurchase={() => undefined}
          pet={makePet({ coins: 10 })}
          showCoinBalance={false}
          showHeader={false}
          t={createTranslator("en")}
        />
      </Drawer>,
    );

    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("data-testid=\"drawer-backdrop\"");
    expect(html).toContain("Pet snack shop");
    expect(html).toContain("10 coins");
    expect(html).toContain("Moon milk");
    expect(html).toContain("Feed");
  });
});
