import { DomainError } from "./errors";
import type { AppSettings } from "./types";

export const DEFAULT_FOCUS_DURATION_MINUTES = 25;
export const MIN_FOCUS_DURATION_MINUTES = 1;
export const MAX_FOCUS_DURATION_MINUTES = 180;

export function validateFocusDurationMinutes(duration: number): number {
  if (
    !Number.isInteger(duration) ||
    duration < MIN_FOCUS_DURATION_MINUTES ||
    duration > MAX_FOCUS_DURATION_MINUTES
  ) {
    throw new DomainError(
      `Focus duration must be a whole number from ${MIN_FOCUS_DURATION_MINUTES} to ${MAX_FOCUS_DURATION_MINUTES} minutes.`,
    );
  }

  return duration;
}

export function parseFocusDurationInput(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const duration = Number(value);

  try {
    return validateFocusDurationMinutes(duration);
  } catch {
    return null;
  }
}

export function createDefaultSettings(now: string): AppSettings {
  return {
    id: "local-settings",
    preferredDurationMinutes: DEFAULT_FOCUS_DURATION_MINUTES,
    hasInstalledShortcut: false,
    hasEnabledFocusNotifications: false,
    language: "en",
    updatedAt: now,
  };
}
