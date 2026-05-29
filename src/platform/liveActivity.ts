import { LiveActivity } from "capacitor-live-activity";

import { isNativeApp } from "./runtime";
import type { FocusSession } from "../domain";

const ACTIVITY_PREFIX = "petpomodoro-focus-";

export type FocusLiveActivityPhase =
  | "running"
  | "awaiting_confirmation"
  | "completed"
  | "abandoned";

function activityIdForSession(sessionId: string): string {
  return `${ACTIVITY_PREFIX}${sessionId}`;
}

function phaseForSession(session: FocusSession): FocusLiveActivityPhase {
  switch (session.status) {
    case "awaiting_confirmation":
      return "awaiting_confirmation";
    case "completed":
      return "completed";
    case "abandoned":
      return "abandoned";
    case "idle":
    case "running":
      return "running";
  }
}

function buildContentState(session: FocusSession, phase: FocusLiveActivityPhase) {
  return {
    title: "Focus Session",
    phase,
    startedAt: session.startedAt,
    expectedEndAt: session.expectedEndAt,
    petEmoji: "🐾",
  };
}

export async function startFocusLiveActivity(
  session: FocusSession,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    const available = await LiveActivity.isAvailable();
    if (!available.value) {
      return;
    }

    await LiveActivity.startActivity({
      id: activityIdForSession(session.id),
      attributes: {
        sessionId: session.id,
        duration: String(session.plannedDurationMinutes),
      },
      contentState: buildContentState(session, "running"),
    });
  } catch {
    // Live Activities are a convenience, not a requirement.
  }
}

export async function updateFocusLiveActivity(
  session: FocusSession,
  phase = phaseForSession(session),
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    const running = await LiveActivity.isRunning({
      id: activityIdForSession(session.id),
    });
    if (!running.value) {
      return;
    }

    await LiveActivity.updateActivity({
      id: activityIdForSession(session.id),
      contentState: buildContentState(session, phase),
    });
  } catch {
    // Silently ignore.
  }
}

export async function endFocusLiveActivity(
  session: FocusSession,
  phase: Extract<FocusLiveActivityPhase, "completed" | "abandoned">,
): Promise<void> {
  return endLiveActivity(session, phase);
}

export async function clearFocusLiveActivity(
  session: FocusSession,
): Promise<void> {
  return endLiveActivity(session, "awaiting_confirmation", Date.now() / 1000);
}

async function endLiveActivity(
  session: FocusSession,
  phase: FocusLiveActivityPhase,
  dismissalDate?: number,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    const running = await LiveActivity.isRunning({
      id: activityIdForSession(session.id),
    });
    if (!running.value) {
      return;
    }

    await LiveActivity.endActivity({
      id: activityIdForSession(session.id),
      contentState: buildContentState(session, phase),
      ...(dismissalDate === undefined ? {} : { dismissalDate }),
    });
  } catch {
    // Silently ignore.
  }
}
