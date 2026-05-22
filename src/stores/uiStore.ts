import { create, type StoreApi, type UseBoundStore } from "zustand";

import { errorMessage } from "./errors";
import { usePetStore, type PetStoreState } from "./petStore";
import { usePomodoroStore, type PomodoroStoreState } from "./pomodoroStore";

export interface UiStoreDependencies {
  petStore: UseBoundStore<
    StoreApi<Pick<PetStoreState, "initializePet" | "updateDecayOnOpen">>
  >;
  pomodoroStore: UseBoundStore<
    StoreApi<Pick<PomodoroStoreState, "restoreRunningSessionAfterAppLaunch">>
  >;
  now: () => string;
}

export interface UiStoreState {
  hasHydrated: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeApp: (now?: string) => Promise<void>;
  clearError: () => void;
}

const defaultDependencies: UiStoreDependencies = {
  petStore: usePetStore,
  pomodoroStore: usePomodoroStore,
  now: () => new Date().toISOString(),
};

export function createUiStore(
  dependencies: UiStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<UiStoreState>> {
  return create<UiStoreState>((set) => ({
    hasHydrated: false,
    isInitializing: false,
    error: null,

    initializeApp: async (now = dependencies.now()) => {
      set({ isInitializing: true, error: null });

      try {
        await dependencies.petStore.getState().initializePet(now);
        await dependencies.petStore.getState().updateDecayOnOpen(now);
        await dependencies.pomodoroStore
          .getState()
          .restoreRunningSessionAfterAppLaunch(now);
        set({ hasHydrated: true, isInitializing: false });
      } catch (error) {
        set({ error: errorMessage(error), isInitializing: false });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
  }));
}

export const useUiStore = createUiStore();

