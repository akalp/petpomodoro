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
    expect(html).toContain("Choose your pet companion");
    expect(html).toContain('data-species="moowi"');
    expect(html).toContain("Leave blank to use your companion");
    expect(html).not.toContain("iOS Shortcut");
    expect(html).not.toContain("Local reminders");
  });

  it("renders Shortcut and reminder controls on iOS and iPadOS", () => {
    const html = renderPanel(true);

    expect(html).toContain("iOS Shortcut");
    expect(html).toContain("Local reminders");
  });
});

function renderPanel(supportsIosFeatures: boolean) {
  return renderToStaticMarkup(
    <SettingsPanel
      customDurationInput="25"
      disabled={false}
      durationError={null}
      durations={[5, 15, 25, 50]}
      framed={false}
      hasEnabledFocusNotifications={false}
      hasInstalledShortcut={false}
      language="en"
      notificationNotice={null}
      notificationPermission="unsupported"
      onCustomDurationChange={() => undefined}
      onCustomDurationCommit={() => undefined}
      onDurationChange={() => undefined}
      onFocusNotificationsChange={() => undefined}
      onLanguageChange={() => undefined}
      onPetNameSave={() => undefined}
      onSelectSpecies={() => undefined}
      onResetLocalData={() => undefined}
      onShortcutInstalledChange={() => undefined}
      pet={makePet()}
      selectedDuration={25}
      showHeader={false}
      supportsIosFeatures={supportsIosFeatures}
      t={createTranslator("en")}
    />,
  );
}
