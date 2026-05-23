import { create, type StoreApi, type UseBoundStore } from "zustand";

import {
  parseFocusDurationInput,
  validateFocusDurationMinutes,
  type AppSettings,
} from "../domain";
import { loadOrCreateSettings, updateSettings } from "../db";

import { errorMessage } from "./errors";

const PREFERRED_DURATION_KEY = "petpomodoro.preferredDuration";
const HAS_INSTALLED_SHORTCUT_KEY = "petpomodoro.hasInstalledShortcut";
const HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY =
  "petpomodoro.hasEnabledFocusNotifications";

export interface SettingsStoreDependencies {
  loadOrCreateSettings: typeof loadOrCreateSettings;
  updateSettings: typeof updateSettings;
  readLegacySettings: () => {
    preferredDurationMinutes?: number;
    hasInstalledShortcut?: boolean;
    hasEnabledFocusNotifications?: boolean;
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
  setShortcutInstalled: (isInstalled: boolean, now?: string) => Promise<AppSettings>;
  setFocusNotificationsEnabled: (
    isEnabled: boolean,
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

    setShortcutInstalled: async (isInstalled, now = dependencies.now()) =>
      persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({ ...settings, hasInstalledShortcut: isInstalled, updatedAt: now }),
        now,
      ),

    setFocusNotificationsEnabled: async (isEnabled, now = dependencies.now()) =>
      persistSettings(
        get,
        set,
        dependencies,
        (settings) => ({
          ...settings,
          hasEnabledFocusNotifications: isEnabled,
          updatedAt: now,
        }),
        now,
      ),

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
    const savedNotifications = window.localStorage.getItem(
      HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY,
    );

    return {
      preferredDurationMinutes:
        savedDuration === null
          ? undefined
          : (parseFocusDurationInput(savedDuration) ?? undefined),
      hasInstalledShortcut:
        savedShortcut === null ? undefined : savedShortcut === "true",
      hasEnabledFocusNotifications:
        savedNotifications === null ? undefined : savedNotifications === "true",
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
    window.localStorage.removeItem(HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY);
  } catch {
    // Settings already live in IndexedDB; blocked legacy storage does not block use.
  }
}

export const useSettingsStore = createSettingsStore();
