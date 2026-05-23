import { describe, expect, it } from "vitest";

import {
  buildShortcutUrl,
  clearShortcutReturn,
  parseShortcutReturn,
} from "./shortcuts";

describe("Shortcut URL helpers", () => {
  it("builds a return URL with the completed session id", () => {
    const url = buildShortcutUrl({
      baseUrl: "https://petpomodoro.local/?source=homescreen",
      completedSessionId: "session-1",
    });

    expect(url).toBe(
      "https://petpomodoro.local/?source=homescreen&completedSessionId=session-1",
    );
  });

  it("parses a Shortcut return without completing the session", () => {
    expect(
      parseShortcutReturn(
        "https://petpomodoro.local/?completedSessionId=session-1",
      ),
    ).toEqual({
      completedSessionId: "session-1",
    });
  });

  it("clears Shortcut return params from the current route", () => {
    expect(
      clearShortcutReturn(
        "https://petpomodoro.local/?completedSessionId=session-1&tab=home#pet",
      ),
    ).toBe("/?tab=home#pet");
  });
});
