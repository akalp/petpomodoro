import { isIosOrIpadosDevice } from "./installHints";

export interface NativeTimerShortcutUrlInput {
  plannedDurationMinutes: number;
}

const SHORTCUTS_RUN_SHORTCUT_URL = "shortcuts://run-shortcut";

export const CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION = 3;
export const START_NATIVE_TIMER_SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/2ce1d9eff8494e2ba63379c41a1a36a9";
export const START_NATIVE_TIMER_SHORTCUT_NAME = "PetPomodoro";

export function isCurrentStartNativeTimerShortcutInstalled(
  installedShortcutVersion: number | null,
): boolean {
  return installedShortcutVersion === CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION;
}

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
