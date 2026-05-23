import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import {
  abandonFocusSession,
  confirmFocusSession,
  createRunningSession,
  moveRunningSessionToAwaitingConfirmation,
} from "./sessions";
import { makeSession } from "../test/factories";

describe("focus session transitions", () => {
  it("creates a running session from idle with planned timestamps", () => {
    const session = createRunningSession({
      id: "session-1",
      plannedDurationMinutes: 25,
      now: "2026-05-22T12:00:00.000Z",
    });

    expect(session).toEqual({
      id: "session-1",
      status: "running",
      plannedDurationMinutes: 25,
      startedAt: "2026-05-22T12:00:00.000Z",
      expectedEndAt: "2026-05-22T12:25:00.000Z",
      confirmedAt: null,
      abandonedAt: null,
      abandonmentReason: null,
      rewardClaimedAt: null,
    });
  });

  it("keeps a running session running before the expected end time", () => {
    const session = makeSession();

    expect(
      moveRunningSessionToAwaitingConfirmation(
        session,
        "2026-05-22T12:24:59.000Z",
      ),
    ).toBe(session);
  });

  it("moves a running session to awaiting confirmation at the expected end time", () => {
    const session = makeSession();

    const updated = moveRunningSessionToAwaitingConfirmation(
      session,
      "2026-05-22T12:25:00.000Z",
    );

    expect(updated).toEqual({
      ...session,
      status: "awaiting_confirmation",
    });
  });

  it("abandons a running session without reward data", () => {
    const session = makeSession();
    const abandoned = abandonFocusSession(
      session,
      "cancelled",
      "2026-05-22T12:10:00.000Z",
    );

    expect(abandoned).toMatchObject({
      status: "abandoned",
      confirmedAt: null,
      abandonedAt: "2026-05-22T12:10:00.000Z",
      abandonmentReason: "cancelled",
      rewardClaimedAt: null,
    });
  });

  it("abandons an awaiting confirmation session without reward data", () => {
    const session = makeSession({ status: "awaiting_confirmation" });
    const abandoned = abandonFocusSession(
      session,
      "honest_confirmation",
      "2026-05-22T12:30:00.000Z",
    );

    expect(abandoned).toMatchObject({
      status: "abandoned",
      confirmedAt: null,
      abandonedAt: "2026-05-22T12:30:00.000Z",
      abandonmentReason: "honest_confirmation",
      rewardClaimedAt: null,
    });
  });

  it("confirms an awaiting confirmation session", () => {
    const session = makeSession({ status: "awaiting_confirmation" });
    const completed = confirmFocusSession(session, "2026-05-22T12:30:00.000Z");

    expect(completed).toMatchObject({
      status: "completed",
      confirmedAt: "2026-05-22T12:30:00.000Z",
      abandonedAt: null,
      rewardClaimedAt: null,
    });
  });

  it("rejects invalid session transitions", () => {
    expect(() =>
      createRunningSession({
        id: "session-1",
        plannedDurationMinutes: 25,
        now: "2026-05-22T12:00:00.000Z",
        currentStatus: "running",
      }),
    ).toThrow(DomainError);

    expect(() =>
      createRunningSession({
        id: "session-1",
        plannedDurationMinutes: 0,
        now: "2026-05-22T12:00:00.000Z",
      }),
    ).toThrow(DomainError);

    expect(() =>
      createRunningSession({
        id: "session-1",
        plannedDurationMinutes: 181,
        now: "2026-05-22T12:00:00.000Z",
      }),
    ).toThrow(DomainError);

    expect(() =>
      moveRunningSessionToAwaitingConfirmation(
        makeSession({ status: "completed" }),
        "2026-05-22T12:30:00.000Z",
      ),
    ).toThrow(DomainError);

    expect(() =>
      abandonFocusSession(
        makeSession({ status: "completed" }),
        "cancelled",
        "2026-05-22T12:30:00.000Z",
      ),
    ).toThrow(DomainError);

    expect(() =>
      abandonFocusSession(
        makeSession({ status: "running" }),
        "honest_confirmation",
        "2026-05-22T12:30:00.000Z",
      ),
    ).toThrow(DomainError);

    expect(() =>
      confirmFocusSession(
        makeSession({ status: "running" }),
        "2026-05-22T12:30:00.000Z",
      ),
    ).toThrow(DomainError);
  });
});
