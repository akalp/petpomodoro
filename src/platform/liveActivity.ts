import { LiveActivity } from "capacitor-live-activity";

import { isNativeApp } from "./runtime";
import type { FocusSession } from "../domain";
import {
  DEFAULT_LANGUAGE,
  createNativeFocusCopy,
  type NativeFocusCopy,
  type SupportedLanguage,
} from "../i18n";

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

function buildContentState(
  session: FocusSession,
  phase: FocusLiveActivityPhase,
  copy: NativeFocusCopy,
) {
  let title: string;
  let support: string;
  let compact: string;

  switch (phase) {
    case "running":
      title = copy.runningTitle;
      support = copy.runningSupport;
      compact = copy.compactRunning;
      break;
    case "awaiting_confirmation":
      title = copy.awaitingTitle;
      support = copy.awaitingSupport;
      compact = copy.compactAwaiting;
      break;
    case "completed":
      title = copy.completedTitle;
      support = copy.completedSupport;
      compact = copy.compactCompleted;
      break;
    case "abandoned":
      title = copy.abandonedTitle;
      support = copy.abandonedSupport;
      compact = copy.compactAbandoned;
      break;
  }

  return {
    title,
    phase,
    startedAt: session.startedAt,
    expectedEndAt: session.expectedEndAt,
    petEmoji: "🐾",
    support,
    compact,
  };
}

export async function startFocusLiveActivity(
  session: FocusSession,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    const available = await LiveActivity.isAvailable();
    if (!available.value) {
      return;
    }

    const copy = createNativeFocusCopy(language);

    await LiveActivity.startActivity({
      id: activityIdForSession(session.id),
      attributes: {
        sessionId: session.id,
        duration: String(session.plannedDurationMinutes),
      },
      contentState: buildContentState(session, "running", copy),
    });
  } catch {
    // Live Activities are a convenience, not a requirement.
  }
}

export async function updateFocusLiveActivity(
  session: FocusSession,
  phase = phaseForSession(session),
  language: SupportedLanguage = DEFAULT_LANGUAGE,
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

    const copy = createNativeFocusCopy(language);

    await LiveActivity.updateActivity({
      id: activityIdForSession(session.id),
      contentState: buildContentState(session, phase, copy),
    });
  } catch {
    // Silently ignore.
  }
}

export async function endFocusLiveActivity(
  session: FocusSession,
  phase: Extract<FocusLiveActivityPhase, "completed" | "abandoned">,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): Promise<void> {
  return endLiveActivity(session, phase, undefined, language);
}

export async function clearFocusLiveActivity(
  session: FocusSession,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): Promise<void> {
  return endLiveActivity(session, "awaiting_confirmation", Date.now() / 1000, language);
}

async function endLiveActivity(
  session: FocusSession,
  phase: FocusLiveActivityPhase,
  dismissalDate?: number,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
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

    const copy = createNativeFocusCopy(language);

    await LiveActivity.endActivity({
      id: activityIdForSession(session.id),
      contentState: buildContentState(session, phase, copy),
      ...(dismissalDate === undefined ? {} : { dismissalDate }),
    });
  } catch {
    // Silently ignore.
  }
}
