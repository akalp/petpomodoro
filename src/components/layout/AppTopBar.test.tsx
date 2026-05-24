import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { AppTopBar } from "./AppTopBar";

describe("AppTopBar", () => {
  it("renders Settings without a primary Store action", () => {
    const html = renderToStaticMarkup(
      <AppTopBar
        onOpenSettings={() => undefined}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("PetPomodoro");
    expect(html).toContain("Settings");
    expect(html).not.toContain("Store");
  });

  it("can disable Settings while the app is hydrating", () => {
    const html = renderToStaticMarkup(
      <AppTopBar
        isSettingsDisabled
        onOpenSettings={() => undefined}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("disabled=\"\"");
  });
});
