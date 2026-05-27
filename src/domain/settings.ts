import { DomainError } from "./errors";
import type { AppSettings } from "./types";
import { ACTIVE_BALANCE_PROFILE } from "./balance";

export const DEFAULT_FOCUS_DURATION_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.defaultDurationMinutes;
export const MIN_FOCUS_DURATION_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.minDurationMinutes;
export const MAX_FOCUS_DURATION_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.maxDurationMinutes;
export const FOCUS_PRESET_DURATION_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.presetDurationMinutes;
export const CUSTOM_DURATION_ADJUSTMENT_MINUTES =
  ACTIVE_BALANCE_PROFILE.focus.customDurationAdjustmentMinutes;
export const MAX_MOTIVATIONAL_MESSAGES = 6;
export const MAX_MOTIVATIONAL_MESSAGE_LENGTH = 88;

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

export function sanitizeMotivationalMessages(messages: string[]): string[] {
  if (messages.length > MAX_MOTIVATIONAL_MESSAGES) {
    throw new DomainError(
      `Save up to ${MAX_MOTIVATIONAL_MESSAGES} pet messages.`,
    );
  }

  const seenMessages = new Set<string>();
  const sanitizedMessages: string[] = [];

  for (const message of messages) {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      continue;
    }

    if (trimmedMessage.length > MAX_MOTIVATIONAL_MESSAGE_LENGTH) {
      throw new DomainError(
        `Pet messages must be ${MAX_MOTIVATIONAL_MESSAGE_LENGTH} characters or fewer.`,
      );
    }

    const normalizedMessage = trimmedMessage.toLocaleLowerCase().replace(/\s+/g, " ");

    if (seenMessages.has(normalizedMessage)) {
      throw new DomainError("Pet messages should each feel a little different.");
    }

    seenMessages.add(normalizedMessage);
    sanitizedMessages.push(trimmedMessage);
  }

  return sanitizedMessages;
}

export function createDefaultSettings(now: string): AppSettings {
  return {
    id: "local-settings",
    preferredDurationMinutes: DEFAULT_FOCUS_DURATION_MINUTES,
    hasInstalledShortcut: false,
    language: "en",
    motivationalMessages: [],
    updatedAt: now,
  };
}
