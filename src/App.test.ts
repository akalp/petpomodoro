import { describe, expect, it } from "vitest";

import { formatCountdown, shufflePetMessages } from "./app/helpers";

describe("formatCountdown", () => {
  it("formats remaining time correctly", () => {
    const expectedEndAt = "2026-05-22T13:25:00.000Z";
    const nowMs = Date.parse("2026-05-22T13:22:30.000Z");
    expect(formatCountdown(expectedEndAt, nowMs)).toBe("2:30");
  });

  it("shows 0:00 when time has passed", () => {
    const expectedEndAt = "2026-05-22T13:25:00.000Z";
    const nowMs = Date.parse("2026-05-22T13:30:00.000Z");
    expect(formatCountdown(expectedEndAt, nowMs)).toBe("0:00");
  });

  it("pads single-digit seconds", () => {
    const expectedEndAt = "2026-05-22T13:25:00.000Z";
    const nowMs = Date.parse("2026-05-22T13:24:05.000Z");
    expect(formatCountdown(expectedEndAt, nowMs)).toBe("0:55");
  });
});

describe("shufflePetMessages", () => {
  it("returns all messages", () => {
    const messages = ["a", "b", "c"];
    const result = shufflePetMessages(messages, null);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(messages.sort());
  });

  it("avoids starting with the previous message", () => {
    const messages = ["a", "b", "c"];
    for (let i = 0; i < 20; i++) {
      const result = shufflePetMessages(messages, "a");
      expect(result[0]).not.toBe("a");
    }
  });

  it("does not mutate the original array", () => {
    const messages = ["a", "b", "c"];
    const original = [...messages];
    shufflePetMessages(messages, null);
    expect(messages).toEqual(original);
  });
});
