import type { FocusSession } from "../domain";
import type { SupportedLanguage } from "../i18n";
import {
  updateFocusLiveActivity,
  type FocusLiveActivityPhase,
} from "./liveActivity";

const UPDATE_INTERVAL_MS = 60_000;

export type LiveActivityTimerHandle = ReturnType<typeof setInterval>;

function derivePhase(session: FocusSession): FocusLiveActivityPhase {
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

export function startLiveActivityTimer(
  getSession: () => FocusSession,
  language: SupportedLanguage,
): LiveActivityTimerHandle {
  return setInterval(() => {
    const session = getSession();
    void updateFocusLiveActivity(session, derivePhase(session), language);
  }, UPDATE_INTERVAL_MS);
}

export function stopLiveActivityTimer(
  handle: LiveActivityTimerHandle,
): void {
  clearInterval(handle);
}
