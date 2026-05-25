import {
  focusSessionStateFromSession,
  idleFocusSessionState,
  reduceFocusSession,
} from "./focusSessionMachine";
import { DomainError } from "./errors";
import type { AbandonmentReason, FocusSession, FocusSessionStatus } from "./types";

export interface CreateRunningSessionInput {
  id: string;
  plannedDurationMinutes: number;
  now: string;
  currentStatus?: FocusSessionStatus;
}

export function createRunningSession({
  id,
  plannedDurationMinutes,
  now,
  currentStatus = "idle",
}: CreateRunningSessionInput): FocusSession {
  if (currentStatus !== "idle") {
    throw new DomainError("A focus session can only start from idle.");
  }

  const nextState = reduceFocusSession(idleFocusSessionState(), {
    type: "start",
    id,
    plannedDurationMinutes,
    now,
  });

  return sessionFromState(nextState);
}

export function moveRunningSessionToAwaitingConfirmation(
  session: FocusSession,
  now: string,
): FocusSession {
  return sessionFromState(
    reduceFocusSession(focusSessionStateFromSession(session), {
      type: "check_time",
      now,
    }),
  );
}

export function abandonFocusSession(
  session: FocusSession,
  abandonmentReason: AbandonmentReason,
  now: string,
): FocusSession {
  return sessionFromState(
    reduceFocusSession(focusSessionStateFromSession(session), {
      type: "abandon",
      abandonmentReason,
      now,
    }),
  );
}

export function confirmFocusSession(
  session: FocusSession,
  now: string,
): FocusSession {
  return sessionFromState(
    reduceFocusSession(focusSessionStateFromSession(session), {
      type: "confirm_completed",
      now,
    }),
  );
}

function sessionFromState(state: ReturnType<typeof reduceFocusSession>): FocusSession {
  if (!state.session) {
    throw new DomainError("Focus session transition did not return a session.");
  }

  return state.session;
}
