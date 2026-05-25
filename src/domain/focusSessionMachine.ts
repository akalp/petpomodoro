import { DomainError } from "./errors";
import { validateFocusDurationMinutes } from "./settings";
import type { AbandonmentReason, FocusSession, FocusSessionStatus } from "./types";

type ActiveFocusSessionStatus = Exclude<FocusSessionStatus, "idle">;

export type FocusSessionMachineState =
  | { status: "idle"; session: null }
  | {
      status: ActiveFocusSessionStatus;
      session: FocusSession;
    };

export type FocusSessionMachineEvent =
  | {
      type: "start";
      id: string;
      plannedDurationMinutes: number;
      now: string;
    }
  | {
      type: "check_time";
      now: string;
    }
  | {
      type: "abandon";
      abandonmentReason: AbandonmentReason;
      now: string;
    }
  | {
      type: "confirm_completed";
      now: string;
    };

export const FOCUS_SESSION_TRANSITIONS = {
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
} as const satisfies Record<
  FocusSessionMachineEvent["type"],
  {
    from: readonly FocusSessionStatus[];
    to: readonly FocusSessionStatus[];
  }
>;

export function idleFocusSessionState(): FocusSessionMachineState {
  return {
    status: "idle",
    session: null,
  };
}

export function focusSessionStateFromSession(
  session: FocusSession,
): FocusSessionMachineState {
  return {
    status: activeSessionStatus(session.status),
    session,
  };
}

export function reduceFocusSession(
  state: FocusSessionMachineState,
  event: FocusSessionMachineEvent,
): FocusSessionMachineState {
  ensureAllowedTransition(state.status, event.type);

  switch (event.type) {
    case "start":
      return startSession(event);
    case "check_time":
      return checkTime(requireSession(state, event.type), event.now);
    case "abandon":
      return abandonSession(
        requireSession(state, event.type),
        event.abandonmentReason,
        event.now,
      );
    case "confirm_completed":
      return confirmCompleted(requireSession(state, event.type), event.now);
  }
}

function startSession(
  event: Extract<FocusSessionMachineEvent, { type: "start" }>,
): FocusSessionMachineState {
  validateFocusDurationMinutes(event.plannedDurationMinutes);

  return {
    status: "running",
    session: {
      id: event.id,
      status: "running",
      plannedDurationMinutes: event.plannedDurationMinutes,
      startedAt: event.now,
      expectedEndAt: addMinutes(event.now, event.plannedDurationMinutes),
      confirmedAt: null,
      abandonedAt: null,
      abandonmentReason: null,
      rewardClaimedAt: null,
      focusImpactAppliedUntil: event.now,
      focusCoinsAwarded: 0,
    },
  };
}

function checkTime(session: FocusSession, now: string): FocusSessionMachineState {
  if (Date.parse(now) < Date.parse(session.expectedEndAt)) {
    return {
      status: "running",
      session,
    };
  }

  const nextSession: FocusSession = {
    ...session,
    status: "awaiting_confirmation",
  };

  return {
    status: "awaiting_confirmation",
    session: nextSession,
  };
}

function abandonSession(
  session: FocusSession,
  abandonmentReason: AbandonmentReason,
  now: string,
): FocusSessionMachineState {
  if (session.status === "running" && abandonmentReason !== "cancelled") {
    throw new DomainError("A running session can only be cancelled.");
  }

  if (
    session.status === "awaiting_confirmation" &&
    abandonmentReason !== "honest_confirmation"
  ) {
    throw new DomainError("A session awaiting confirmation needs an honest answer.");
  }

  const nextSession: FocusSession = {
    ...session,
    status: "abandoned",
    confirmedAt: null,
    abandonedAt: now,
    abandonmentReason,
    rewardClaimedAt: null,
  };

  return {
    status: "abandoned",
    session: nextSession,
  };
}

function confirmCompleted(
  session: FocusSession,
  now: string,
): FocusSessionMachineState {
  const nextSession: FocusSession = {
    ...session,
    status: "completed",
    confirmedAt: now,
  };

  return {
    status: "completed",
    session: nextSession,
  };
}

function requireSession(
  state: FocusSessionMachineState,
  eventType: FocusSessionMachineEvent["type"],
): FocusSession {
  if (!state.session) {
    throw new DomainError(errorMessageForInvalidTransition(eventType));
  }

  return state.session;
}

function ensureAllowedTransition(
  from: FocusSessionStatus,
  eventType: FocusSessionMachineEvent["type"],
): void {
  const allowedFrom: readonly FocusSessionStatus[] =
    FOCUS_SESSION_TRANSITIONS[eventType].from;

  if (!allowedFrom.includes(from)) {
    throw new DomainError(errorMessageForInvalidTransition(eventType));
  }
}

function activeSessionStatus(status: FocusSessionStatus): ActiveFocusSessionStatus {
  if (status === "idle") {
    throw new DomainError("Idle is not a persisted focus session status.");
  }

  return status;
}

function errorMessageForInvalidTransition(
  eventType: FocusSessionMachineEvent["type"],
): string {
  switch (eventType) {
    case "start":
      return "A focus session can only start from idle.";
    case "check_time":
      return "Only running sessions can be checked for completion time.";
    case "abandon":
      return "Only running or awaiting confirmation sessions can be abandoned.";
    case "confirm_completed":
      return "Only sessions awaiting confirmation can be completed.";
  }
}

function addMinutes(isoDate: string, minutes: number): string {
  return new Date(Date.parse(isoDate) + minutes * 60 * 1000).toISOString();
}
