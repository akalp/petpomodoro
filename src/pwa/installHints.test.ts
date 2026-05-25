import { describe, expect, it } from "vitest";

import {
  isIosOrIpadosDevice,
  shouldShowIosInstallHint,
  shouldShowIosShortcutInstallHint,
} from "./installHints";

describe("iOS install hints", () => {
  const ipadOsDesktopUserAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

  it("recognizes iPadOS when Safari uses a desktop-style user agent", () => {
    expect(isIosOrIpadosDevice(ipadOsDesktopUserAgent, 5)).toBe(true);
    expect(isIosOrIpadosDevice(ipadOsDesktopUserAgent, 0)).toBe(false);
  });

  it("shows the hint for Safari on iOS when not installed", () => {
    expect(
      shouldShowIosInstallHint(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        false,
      ),
    ).toBe(true);
  });

  it("hides the hint after standalone installation", () => {
    expect(
      shouldShowIosInstallHint(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        true,
      ),
    ).toBe(false);
  });

  it("hides the hint outside iOS Safari", () => {
    expect(
      shouldShowIosInstallHint(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        false,
      ),
    ).toBe(false);
  });

  it("shows the hint for iPadOS Safari in desktop browsing mode", () => {
    expect(shouldShowIosInstallHint(ipadOsDesktopUserAgent, false, 5)).toBe(
      true,
    );
  });

  it("shows the shortcut hint after iOS Home Screen installation", () => {
    expect(
      shouldShowIosShortcutInstallHint(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        true,
        false,
      ),
    ).toBe(true);
  });

  it("hides the shortcut hint before iOS Home Screen installation", () => {
    expect(
      shouldShowIosShortcutInstallHint(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        false,
        false,
      ),
    ).toBe(false);
  });

  it("hides the shortcut hint when the user already installed it", () => {
    expect(
      shouldShowIosShortcutInstallHint(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        true,
        true,
      ),
    ).toBe(false);
  });

  it("hides the shortcut hint outside iOS", () => {
    expect(
      shouldShowIosShortcutInstallHint(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        true,
        false,
      ),
    ).toBe(false);
  });

  it("shows the shortcut hint for an installed iPadOS PWA", () => {
    expect(
      shouldShowIosShortcutInstallHint(ipadOsDesktopUserAgent, true, false, 5),
    ).toBe(true);
  });
});
