import { DomainError } from "./errors";
import { validateFocusDurationMinutes } from "./settings";
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

  validateFocusDurationMinutes(plannedDurationMinutes);

  return {
    id,
    status: "running",
    plannedDurationMinutes,
    startedAt: now,
    expectedEndAt: addMinutes(now, plannedDurationMinutes),
    confirmedAt: null,
    abandonedAt: null,
    abandonmentReason: null,
    rewardClaimedAt: null,
  };
}

export function moveRunningSessionToAwaitingConfirmation(
  session: FocusSession,
  now: string,
): FocusSession {
  if (session.status !== "running") {
    throw new DomainError("Only running sessions can be checked for completion time.");
  }

  if (Date.parse(now) < Date.parse(session.expectedEndAt)) {
    return session;
  }

  return {
    ...session,
    status: "awaiting_confirmation",
  };
}

export function abandonFocusSession(
  session: FocusSession,
  abandonmentReason: AbandonmentReason,
  now: string,
): FocusSession {
  if (session.status !== "running" && session.status !== "awaiting_confirmation") {
    throw new DomainError("Only running or awaiting confirmation sessions can be abandoned.");
  }

  if (session.status === "running" && abandonmentReason !== "cancelled") {
    throw new DomainError("A running session can only be cancelled.");
  }

  if (
    session.status === "awaiting_confirmation" &&
    abandonmentReason !== "honest_confirmation"
  ) {
    throw new DomainError("A session awaiting confirmation needs an honest answer.");
  }

  return {
    ...session,
    status: "abandoned",
    confirmedAt: null,
    abandonedAt: now,
    abandonmentReason,
    rewardClaimedAt: null,
  };
}

export function confirmFocusSession(
  session: FocusSession,
  now: string,
): FocusSession {
  if (session.status !== "awaiting_confirmation") {
    throw new DomainError("Only sessions awaiting confirmation can be completed.");
  }

  return {
    ...session,
    status: "completed",
    confirmedAt: now,
  };
}

function addMinutes(isoDate: string, minutes: number): string {
  return new Date(Date.parse(isoDate) + minutes * 60 * 1000).toISOString();
}
