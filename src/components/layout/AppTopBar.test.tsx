import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { AppTopBar } from "./AppTopBar";

describe("AppTopBar", () => {
  it("renders Store and Settings actions", () => {
    const html = renderToStaticMarkup(
      <AppTopBar
        onOpenSettings={() => undefined}
        onOpenStore={() => undefined}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("PetPomodoro");
    expect(html).toContain("Store");
    expect(html).toContain("Settings");
  });

  it("can disable Store while focus is active", () => {
    const html = renderToStaticMarkup(
      <AppTopBar
        isStoreDisabled
        onOpenSettings={() => undefined}
        onOpenStore={() => undefined}
        storeDisabledReason="Snacks wait until this focus session is finished."
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("disabled=\"\"");
    expect(html).toContain("Snacks wait until this focus session is finished.");
  });
});
