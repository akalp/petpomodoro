import { isIosOrIpadosDevice } from "./installHints";

export interface NativeTimerShortcutUrlInput {
  plannedDurationMinutes: number;
}

const SHORTCUTS_RUN_SHORTCUT_URL = "shortcuts://run-shortcut";

export const START_NATIVE_TIMER_SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/ebbf43762a544157a75c0804372c82f2";
export const START_NATIVE_TIMER_SHORTCUT_NAME = "PetPomodoro Start Timer";

export function buildStartNativeTimerShortcutUrl({
  plannedDurationMinutes,
}: NativeTimerShortcutUrlInput): string {
  const params = new URLSearchParams({
    input: "text",
    text: String(plannedDurationMinutes * 60),
  });

  return `${SHORTCUTS_RUN_SHORTCUT_URL}?name=${encodeURIComponent(
    START_NATIVE_TIMER_SHORTCUT_NAME,
  )}&${params.toString()}`;
}

export function shouldRunStartNativeTimerShortcut(
  userAgent: string,
  isStandalone: boolean,
  hasInstalledShortcut: boolean,
  maxTouchPoints = 0,
): boolean {
  return (
    isIosOrIpadosDevice(userAgent, maxTouchPoints) &&
    isStandalone &&
    hasInstalledShortcut
  );
}
