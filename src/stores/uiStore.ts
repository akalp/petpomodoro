import { create, type StoreApi, type UseBoundStore } from "zustand";

import { scheduleCareNotifications } from "../alerts";
import { resetLocalData } from "../db";
import { DEFAULT_LANGUAGE } from "../i18n";
import { errorMessage } from "./errors";
import { usePetStore, type PetStoreState } from "./petStore";
import { usePomodoroStore, type PomodoroStoreState } from "./pomodoroStore";
import { useSettingsStore, type SettingsStoreState } from "./settingsStore";

export interface UiStoreDependencies {
  petStore: UseBoundStore<
    StoreApi<
      Pick<
        PetStoreState,
        | "initializePet"
        | "loadDailyFocusOverview"
        | "updateAppOpenDecay"
        | "updateDecayOnOpen"
        | "resetAfterLocalDataReset"
        | "pet"
      >
    >
  >;
  pomodoroStore: UseBoundStore<
    StoreApi<
      Pick<
        PomodoroStoreState,
        | "activeSession"
        | "restoreRunningSessionAfterAppLaunch"
        | "loadRecentSessions"
        | "resetAfterLocalDataReset"
      >
    >
  >;
  settingsStore: UseBoundStore<
    StoreApi<Pick<SettingsStoreState, "initializeSettings" | "clearAfterLocalDataReset" | "settings">>
  >;
  now: () => string;
  resetLocalData: typeof resetLocalData;
}

export interface UiStoreState {
  hasHydrated: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeApp: (now?: string) => Promise<void>;
  resetAllLocalData: (now?: string) => Promise<void>;
  clearError: () => void;
}

const defaultDependencies: UiStoreDependencies = {
  petStore: usePetStore,
  pomodoroStore: usePomodoroStore,
  settingsStore: useSettingsStore,
  now: () => new Date().toISOString(),
  resetLocalData,
};

export function createUiStore(
  dependencies: UiStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<UiStoreState>> {
  return create<UiStoreState>((set, get) => ({
    hasHydrated: false,
    isInitializing: false,
    error: null,

    initializeApp: async (now = dependencies.now()) => {
      set({ isInitializing: true, error: null });

      try {
        await dependencies.settingsStore.getState().initializeSettings(now);
        await dependencies.petStore.getState().initializePet(now);
        await dependencies.petStore.getState().updateAppOpenDecay(now);
        const activeSession = await dependencies.pomodoroStore
          .getState()
          .restoreRunningSessionAfterAppLaunch(now);
        if (!activeSession) {
          await dependencies.petStore.getState().updateDecayOnOpen(now);
        }
        await dependencies.petStore.getState().loadDailyFocusOverview(now);
        const currentPet = dependencies.petStore.getState().pet;

        if (currentPet) {
          const language = dependencies.settingsStore.getState().settings?.language ?? DEFAULT_LANGUAGE;
          void scheduleCareNotifications(currentPet, activeSession, language);
        }

        set({ hasHydrated: true, isInitializing: false });
      } catch (error) {
        set({ error: errorMessage(error), isInitializing: false });
        throw error;
      }
    },

    resetAllLocalData: async (now = dependencies.now()) => {
      set({ hasHydrated: false, isInitializing: true, error: null });

      try {
        await dependencies.resetLocalData();
        dependencies.petStore.getState().resetAfterLocalDataReset();
        dependencies.pomodoroStore.getState().resetAfterLocalDataReset();
        dependencies.settingsStore.getState().clearAfterLocalDataReset();
        await dependencies.pomodoroStore.getState().loadRecentSessions();
        await get().initializeApp(now);
      } catch (error) {
        set({ error: errorMessage(error), isInitializing: false });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
  }));
}

export const useUiStore = createUiStore();
