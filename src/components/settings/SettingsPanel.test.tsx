import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("renders general controls without iOS-only features off platform", () => {
    const html = renderPanel(false);

    expect(html).toContain("Language");
    expect(html).toContain("Reset local data");
    expect(html).toContain("Pet name");
    expect(html).toContain("Pet messages");
    expect(html).toContain("Write little notes your pet can say.");
    expect(html).toContain("Keep breathing.");
    expect(html).toContain("Add message");
    expect(html).toContain("Save messages");
    expect(html).toContain("Choose your pet companion");
    expect(html).toContain('data-species="moowi"');
    expect(html).toContain("Leave blank to use your companion");
    expect(html).not.toContain("Custom");
    expect(html).not.toContain("Preferred focus time");
    expect(html).not.toContain("iOS Shortcut");
    expect(html).not.toContain("Local reminders");
  });

  it("renders the Shortcut control without reminders on iOS and iPadOS", () => {
    const html = renderPanel(true);

    expect(html).toContain("iOS Shortcut");
    expect(html).not.toContain("Local reminders");
  });
});

function renderPanel(supportsIosFeatures: boolean) {
  return renderToStaticMarkup(
    <SettingsPanel
      disabled={false}
      framed={false}
      hasInstalledShortcut={false}
      language="en"
      motivationalMessages={["Keep breathing."]}
      onLanguageChange={() => undefined}
      onMotivationalMessagesSave={() => undefined}
      onPetNameSave={() => undefined}
      onSelectSpecies={() => undefined}
      onResetLocalData={() => undefined}
      onShortcutInstalledChange={() => undefined}
      pet={makePet()}
      showHeader={false}
      supportsIosFeatures={supportsIosFeatures}
      t={createTranslator("en")}
    />,
  );
}
