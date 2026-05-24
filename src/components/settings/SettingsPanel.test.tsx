import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("renders language and reset controls for the settings sheet", () => {
    const html = renderToStaticMarkup(
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
        onResetLocalData={() => undefined}
        onShortcutInstalledChange={() => undefined}
        pet={makePet()}
        selectedDuration={25}
        showHeader={false}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Language");
    expect(html).toContain("Reset local data");
    expect(html).toContain("Pet name");
  });
});
