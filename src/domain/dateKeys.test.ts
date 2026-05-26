import { describe, expect, it } from "vitest";

import { toLocalDateKey } from "./dateKeys";

describe("local date keys", () => {
  it("formats a local calendar date as YYYY-MM-DD", () => {
    expect(toLocalDateKey(new Date(2026, 4, 6, 23, 30))).toBe("2026-05-06");
  });
});
