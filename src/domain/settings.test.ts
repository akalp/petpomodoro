import { describe, expect, it } from "vitest";

import { DomainError } from "./errors";
import {
  MAX_MOTIVATIONAL_MESSAGE_LENGTH,
  MAX_MOTIVATIONAL_MESSAGES,
  createDefaultSettings,
  sanitizeMotivationalMessages,
} from "./settings";

describe("settings domain", () => {
  it("creates default settings without custom pet messages", () => {
    expect(createDefaultSettings("2026-05-22T12:30:00.000Z")).toMatchObject({
      motivationalMessages: [],
    });
  });

  it("trims messages and drops empty rows", () => {
    expect(
      sanitizeMotivationalMessages([
        "  One gentle note.  ",
        "",
        "   ",
        "Another small step.",
      ]),
    ).toEqual(["One gentle note.", "Another small step."]);
  });

  it("rejects duplicate messages after normalization", () => {
    expect(() =>
      sanitizeMotivationalMessages(["One gentle step", "one   gentle step"]),
    ).toThrow(DomainError);
  });

  it("rejects messages over the saved limit", () => {
    expect(() =>
      sanitizeMotivationalMessages(
        Array.from({ length: MAX_MOTIVATIONAL_MESSAGES + 1 }, (_, index) =>
          `Message ${index}`,
        ),
      ),
    ).toThrow(DomainError);
  });

  it("rejects messages over the character limit", () => {
    expect(() =>
      sanitizeMotivationalMessages([
        "x".repeat(MAX_MOTIVATIONAL_MESSAGE_LENGTH + 1),
      ]),
    ).toThrow(DomainError);
  });
});
