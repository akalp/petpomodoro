import { describe, expect, it } from "vitest";

import {
  shouldShowIosInstallHint,
  shouldShowIosShortcutInstallHint,
} from "./installHints";

describe("iOS install hints", () => {
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
});
