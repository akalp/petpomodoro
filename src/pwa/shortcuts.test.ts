import { describe, expect, it } from "vitest";

import {
  START_NATIVE_TIMER_SHORTCUT_NAME,
  START_NATIVE_TIMER_SHORTCUT_URL,
  buildStartNativeTimerShortcutUrl,
  shouldRunStartNativeTimerShortcut,
} from "./shortcuts";

describe("Shortcut URL helpers", () => {
  it("keeps the Start Native Timer install URL stable", () => {
    expect(START_NATIVE_TIMER_SHORTCUT_URL).toBe(
      "https://www.icloud.com/shortcuts/ebbf43762a544157a75c0804372c82f2",
    );
  });

  it("keeps the Start Native Timer shortcut name stable", () => {
    expect(START_NATIVE_TIMER_SHORTCUT_NAME).toBe("PetPomodoro Start Timer");
  });

  it("builds a run URL with the selected duration as seconds input", () => {
    const url = buildStartNativeTimerShortcutUrl({
      plannedDurationMinutes: 25,
    });

    expect(url).toBe(
      "shortcuts://run-shortcut?name=PetPomodoro%20Start%20Timer&input=text&text=1500",
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
