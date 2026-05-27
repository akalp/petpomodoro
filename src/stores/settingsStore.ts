import { create, type StoreApi, type UseBoundStore } from "zustand";

import {
  parseFocusDurationInput,
  sanitizeMotivationalMessages,
  validateFocusDurationMinutes,
  type AppSettings,
  type SupportedLanguage,
} from "../domain";
import { loadOrCreateSettings, updateSettings } from "../db";
import { normalizeLanguage } from "../i18n";

import { errorMessage } from "./errors";

const PREFERRED_DURATION_KEY = "petpomodoro.preferredDuration";
const HAS_INSTALLED_SHORTCUT_KEY = "petpomodoro.hasInstalledShortcut";
const RETIRED_FOCUS_NOTIFICATIONS_KEY =
  "petpomodoro.hasEnabledFocusNotifications";
const LANGUAGE_KEY = "petpomodoro.language";

export interface SettingsStoreDependencies {
  loadOrCreateSettings: typeof loadOrCreateSettings;
  updateSettings: typeof updateSettings;
  readLegacySettings: () => {
    preferredDurationMinutes?: number;
    installedShortcutVersion?: number | null;
    language?: SupportedLanguage;
  };
  clearLegacySettings: () => void;
  now: () => string;
}

export interface SettingsStoreState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  initializeSettings: (now?: string) => Promise<AppSettings>;
  updatePreferredDuration: (duration: number, now?: string) => Promise<AppSettings>;
  setInstalledShortcutVersion: (
    installedShortcutVersion: number | null,
    now?: string,
  ) => Promise<AppSettings>;
  setLanguage: (language: SupportedLanguage, now?: string) => Promise<AppSettings>;
  updateMotivationalMessages: (
    messages: string[],
    now?: string,
  ) => Promise<AppSettings>;
  clearAfterLocalDataReset: () => void;
  clearError: () => void;
}

const defaultDependencies: SettingsStoreDependencies = {
  loadOrCreateSettings,
  updateSettings,
  readLegacySettings,
  clearLegacySettings,
  now: () => new Date().toISOString(),
};

export function createSettingsStore(
  dependencies: SettingsStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<SettingsStoreState>> {
  return create<SettingsStoreState>((set, get) => ({
    settings: null,
    isLoading: false,
    error: null,

    initializeSettings: async (now = dependencies.now()) => {
      set({ isLoading: true, error: null });

      try {
        const settings = await dependencies.loadOrCreateSettings(
          now,
          dependencies.readLegacySettings(),
        );
        dependencies.clearLegacySettings();
        set({ settings, isLoading: false });
        return settings;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    updatePreferredDuration: async (duration, now = dependencies.now()) => {
      validateFocusDurationMinutes(duration);
      return persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({ ...settings, preferredDurationMinutes: duration, updatedAt: now }),
        now,
      );
    },

    setInstalledShortcutVersion: async (
      installedShortcutVersion,
      now = dependencies.now(),
    ) =>
      persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({ ...settings, installedShortcutVersion, updatedAt: now }),
        now,
      ),

    setLanguage: async (language, now = dependencies.now()) =>
      persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({
          ...settings,
          language,
          updatedAt: now,
        }),
        now,
      ),

    updateMotivationalMessages: async (messages, now = dependencies.now()) => {
      const motivationalMessages = sanitizeMotivationalMessages(messages);

      return persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({
          ...settings,
          motivationalMessages,
          updatedAt: now,
        }),
        now,
      );
    },

    clearAfterLocalDataReset: () => {
      dependencies.clearLegacySettings();
      set({ settings: null, error: null, isLoading: false });
    },

    clearError: () => set({ error: null }),
  }));
}

async function persistSettings(
  get: () => SettingsStoreState,
  set: (state: Partial<SettingsStoreState>) => void,
  dependencies: SettingsStoreDependencies,
  update: (settings: AppSettings) => AppSettings,
  now: string,
): Promise<AppSettings> {
  const settings = get().settings ?? (await get().initializeSettings(now));
  set({ isLoading: true, error: null });

  try {
    const savedSettings = await dependencies.updateSettings(update(settings));
    set({ settings: savedSettings, isLoading: false });
    return savedSettings;
  } catch (error) {
    set({ error: errorMessage(error), isLoading: false });
    throw error;
  }
}

function readLegacySettings() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedDuration = window.localStorage.getItem(PREFERRED_DURATION_KEY);
    const savedShortcut = window.localStorage.getItem(HAS_INSTALLED_SHORTCUT_KEY);
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);

    return {
      preferredDurationMinutes:
        savedDuration === null
          ? undefined
          : (parseFocusDurationInput(savedDuration) ?? undefined),
      installedShortcutVersion:
        savedShortcut === null ? undefined : savedShortcut === "true" ? 1 : null,
      language: normalizeLanguage(savedLanguage ?? window.navigator.language),
    };
  } catch {
    return {};
  }
}

function clearLegacySettings(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(PREFERRED_DURATION_KEY);
    window.localStorage.removeItem(HAS_INSTALLED_SHORTCUT_KEY);
    window.localStorage.removeItem(RETIRED_FOCUS_NOTIFICATIONS_KEY);
    window.localStorage.removeItem(LANGUAGE_KEY);
  } catch {
    // Settings already live in IndexedDB; blocked legacy storage does not block use.
  }
}

export const useSettingsStore = createSettingsStore();
