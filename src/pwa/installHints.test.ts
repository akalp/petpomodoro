import { describe, expect, it } from "vitest";

import { shouldShowIosInstallHint } from "./installHints";

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
});
