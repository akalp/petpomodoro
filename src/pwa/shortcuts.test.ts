import { describe, expect, it } from "vitest";

import {
  CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION,
  START_NATIVE_TIMER_SHORTCUT_NAME,
  START_NATIVE_TIMER_SHORTCUT_URL,
  buildStartNativeTimerShortcutUrl,
  isCurrentStartNativeTimerShortcutInstalled,
  shouldRunStartNativeTimerShortcut,
} from "./shortcuts";

describe("Shortcut URL helpers", () => {
  it("uses the current Start Native Timer install URL", () => {
    expect(START_NATIVE_TIMER_SHORTCUT_URL).toBe(
      "https://www.icloud.com/shortcuts/2ce1d9eff8494e2ba63379c41a1a36a9",
    );
  });

  it("keeps the Start Native Timer shortcut name stable", () => {
    expect(START_NATIVE_TIMER_SHORTCUT_NAME).toBe("PetPomodoro");
  });

  it("requires the current confirmed Shortcut version before launching it", () => {
    expect(CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION).toBe(3);
    expect(isCurrentStartNativeTimerShortcutInstalled(3)).toBe(true);
    expect(isCurrentStartNativeTimerShortcutInstalled(2)).toBe(false);
    expect(isCurrentStartNativeTimerShortcutInstalled(null)).toBe(false);
  });

  it("builds a run URL with the selected duration as seconds input", () => {
    const url = buildStartNativeTimerShortcutUrl({
      plannedDurationMinutes: 25,
    });

    expect(url).toBe(
      "shortcuts://run-shortcut?name=PetPomodoro&input=text&text=1500",
    );
  });

  it("only runs the native timer shortcut from an installed iOS PWA", () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";

    expect(shouldRunStartNativeTimerShortcut(userAgent, true, true)).toBe(true);
    expect(shouldRunStartNativeTimerShortcut(userAgent, true, false)).toBe(false);
    expect(shouldRunStartNativeTimerShortcut(userAgent, false, true)).toBe(false);
    expect(
      shouldRunStartNativeTimerShortcut(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        true,
        true,
      ),
    ).toBe(false);
  });

  it("runs the native timer shortcut from an installed iPadOS PWA", () => {
    const desktopModeIpadUserAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

    expect(
      shouldRunStartNativeTimerShortcut(
        desktopModeIpadUserAgent,
        true,
        true,
        5,
      ),
    ).toBe(true);
    expect(
      shouldRunStartNativeTimerShortcut(
        desktopModeIpadUserAgent,
        true,
        true,
        0,
      ),
    ).toBe(false);
  });
});
