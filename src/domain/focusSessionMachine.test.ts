import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import {
  FOCUS_SESSION_TRANSITIONS,
  focusSessionStateFromSession,
  idleFocusSessionState,
  reduceFocusSession,
} from "./focusSessionMachine";
import { makeSession } from "../test/factories";

describe("focus session machine", () => {
  it("documents allowed transition endpoints", () => {
    expect(FOCUS_SESSION_TRANSITIONS).toEqual({
      start: {
        from: ["idle"],
        to: ["running"],
      },
      check_time: {
        from: ["running"],
        to: ["running", "awaiting_confirmation"],
      },
      abandon: {
        from: ["running", "awaiting_confirmation"],
        to: ["abandoned"],
      },
      confirm_completed: {
        from: ["awaiting_confirmation"],
        to: ["completed"],
      },
    });
  });

  it("starts a session from idle", () => {
    const nextState = reduceFocusSession(idleFocusSessionState(), {
      type: "start",
      id: "session-1",
      plannedDurationMinutes: 25,
      now: "2026-05-22T12:00:00.000Z",
    });

    expect(nextState).toEqual({
      status: "running",
      session: {
        id: "session-1",
        status: "running",
        plannedDurationMinutes: 25,
        startedAt: "2026-05-22T12:00:00.000Z",
        expectedEndAt: "2026-05-22T12:25:00.000Z",
        confirmedAt: null,
        abandonedAt: null,
        abandonmentReason: null,
        rewardClaimedAt: null,
        focusImpactAppliedUntil: "2026-05-22T12:00:00.000Z",
        focusCoinsAwarded: 0,
      },
    });
  });

  it("keeps a running session running before expected end", () => {
    const session = makeSession();

    const nextState = reduceFocusSession(focusSessionStateFromSession(session), {
      type: "check_time",
      now: "2026-05-22T12:24:59.000Z",
    });

    expect(nextState).toEqual({
      status: "running",
      session,
    });
    expect(nextState.session).toBe(session);
  });

  it("moves a running session to awaiting confirmation at expected end", () => {
    const session = makeSession();

    const nextState = reduceFocusSession(focusSessionStateFromSession(session), {
      type: "check_time",
      now: "2026-05-22T12:25:00.000Z",
    });

    expect(nextState).toEqual({
      status: "awaiting_confirmation",
      session: {
        ...session,
        status: "awaiting_confirmation",
      },
    });
  });

  it("requires honest confirmation before completion", () => {
    const session = makeSession({ status: "awaiting_confirmation" });

    const nextState = reduceFocusSession(focusSessionStateFromSession(session), {
      type: "confirm_completed",
      now: "2026-05-22T12:30:00.000Z",
    });

    expect(nextState.session).toMatchObject({
      status: "completed",
      confirmedAt: "2026-05-22T12:30:00.000Z",
      abandonedAt: null,
    });
  });

  it("abandons running sessions as cancelled", () => {
    const session = makeSession();

    const nextState = reduceFocusSession(focusSessionStateFromSession(session), {
      type: "abandon",
      abandonmentReason: "cancelled",
      now: "2026-05-22T12:10:00.000Z",
    });

    expect(nextState.session).toMatchObject({
      status: "abandoned",
      confirmedAt: null,
      abandonedAt: "2026-05-22T12:10:00.000Z",
      abandonmentReason: "cancelled",
      rewardClaimedAt: null,
    });
  });

  it("abandons awaiting confirmation sessions as honest confirmation", () => {
    const session = makeSession({ status: "awaiting_confirmation" });

    const nextState = reduceFocusSession(focusSessionStateFromSession(session), {
      type: "abandon",
      abandonmentReason: "honest_confirmation",
      now: "2026-05-22T12:30:00.000Z",
    });

    expect(nextState.session).toMatchObject({
      status: "abandoned",
      confirmedAt: null,
      abandonedAt: "2026-05-22T12:30:00.000Z",
      abandonmentReason: "honest_confirmation",
      rewardClaimedAt: null,
    });
  });

  it("rejects invalid transitions", () => {
    expect(() =>
      reduceFocusSession(focusSessionStateFromSession(makeSession()), {
        type: "start",
        id: "session-2",
        plannedDurationMinutes: 25,
        now: "2026-05-22T12:00:00.000Z",
      }),
    ).toThrow(DomainError);

    expect(() =>
      reduceFocusSession(
        focusSessionStateFromSession(makeSession({ status: "completed" })),
        {
          type: "check_time",
          now: "2026-05-22T12:30:00.000Z",
        },
      ),
    ).toThrow(DomainError);

    expect(() =>
      reduceFocusSession(
        focusSessionStateFromSession(makeSession({ status: "completed" })),
        {
          type: "abandon",
          abandonmentReason: "cancelled",
          now: "2026-05-22T12:30:00.000Z",
        },
      ),
    ).toThrow(DomainError);

    expect(() =>
      reduceFocusSession(focusSessionStateFromSession(makeSession()), {
        type: "confirm_completed",
        now: "2026-05-22T12:30:00.000Z",
      }),
    ).toThrow(DomainError);
  });

  it("rejects mismatched abandonment answers", () => {
    expect(() =>
      reduceFocusSession(focusSessionStateFromSession(makeSession()), {
        type: "abandon",
        abandonmentReason: "honest_confirmation",
        now: "2026-05-22T12:30:00.000Z",
      }),
    ).toThrow(DomainError);

    expect(() =>
      reduceFocusSession(
        focusSessionStateFromSession(
          makeSession({ status: "awaiting_confirmation" }),
        ),
        {
          type: "abandon",
          abandonmentReason: "cancelled",
          now: "2026-05-22T12:30:00.000Z",
        },
      ),
    ).toThrow(DomainError);
  });
});
