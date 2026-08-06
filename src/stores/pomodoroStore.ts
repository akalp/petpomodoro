import { create, type StoreApi, type UseBoundStore } from "zustand";

import {
  abandonFocusSession,
  canPetStartFocus,
  confirmFocusSession,
  createRunningSession,
  DEFAULT_FOCUS_DURATION_MINUTES,
  DomainError,
  isPetSleeping,
  PET_FOCUS_NEEDS_CARE_ERROR,
  PET_SLEEPING_CANNOT_FOCUS_ERROR,
  moveRunningSessionToAwaitingConfirmation,
  shouldPersistFocusSessionImpact,
  type FocusSession,
  type FocusSessionStatus,
} from "../domain";
import {
  createFocusSession,
  getActiveFocusSession,
  listRecentFocusSessions,
  updateFocusSession,
} from "../db";
import { createLocalId } from "../id";

import { errorMessage } from "./errors";
import { usePetStore, type PetStoreState } from "./petStore";

export interface PomodoroStoreDependencies {
  createFocusSession: typeof createFocusSession;
  getActiveFocusSession: typeof getActiveFocusSession;
  listRecentFocusSessions: typeof listRecentFocusSessions;
  updateFocusSession: typeof updateFocusSession;
  petStore: UseBoundStore<
    StoreApi<Pick<PetStoreState, "applyFocusImpact" | "applySessionReward" | "pet">>
  >;
  now: () => string;
  createId: () => string;
}

export interface PomodoroStoreState {
  activeSession: FocusSession | null;
  recentSessions: FocusSession[];
  isLoading: boolean;
  error: string | null;
  loadActiveSession: () => Promise<FocusSession | null>;
  restoreRunningSessionAfterAppLaunch: (now?: string) => Promise<FocusSession | null>;
  loadRecentSessions: (limit?: number) => Promise<FocusSession[]>;
  startSession: (
    plannedDurationMinutes?: number,
    now?: string,
  ) => Promise<FocusSession>;
  cancelSession: (now?: string) => Promise<FocusSession>;
  refreshSessionStatus: (now?: string) => Promise<FocusSession | null>;
  confirmCompleted: (now?: string) => Promise<FocusSession>;
  confirmAbandoned: (now?: string) => Promise<FocusSession>;
  resetAfterLocalDataReset: () => void;
  clearError: () => void;
}

const defaultDependencies: PomodoroStoreDependencies = {
  createFocusSession,
  getActiveFocusSession,
  listRecentFocusSessions,
  updateFocusSession,
  petStore: usePetStore,
  now: () => new Date().toISOString(),
  createId: createLocalId,
};

export function createPomodoroStore(
  dependencies: PomodoroStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<PomodoroStoreState>> {
  let refreshInFlight: Promise<FocusSession | null> | null = null;

  return create<PomodoroStoreState>((set, get) => {
    const runRefreshSessionStatus = async (now: string): Promise<FocusSession | null> => {
      const activeSession =
        get().activeSession ?? (await dependencies.getActiveFocusSession()) ?? null;

      if (!activeSession) {
        set({ activeSession: null });
        return null;
      }

      if (activeSession.status !== "running") {
        const impactResult = await dependencies.petStore
          .getState()
          .applyFocusImpact(activeSession, now);
        set({ activeSession: impactResult.session });
        return impactResult.session;
      }

      try {
        const nextSession = moveRunningSessionToAwaitingConfirmation(
          activeSession,
          now,
        );

        if (
          nextSession === activeSession &&
          !shouldPersistFocusSessionImpact(activeSession, now)
        ) {
          set({ activeSession, error: null });
          return activeSession;
        }

        set({ isLoading: true, error: null });
        const impactResult = await dependencies.petStore
          .getState()
          .applyFocusImpact(nextSession, now);
        const recentSessions = await dependencies.listRecentFocusSessions(10);
        set({
          activeSession: impactResult.session,
          recentSessions,
          isLoading: false,
        });
        return impactResult.session;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    };

    return {
    activeSession: null,
    recentSessions: [],
    isLoading: false,
    error: null,

    loadActiveSession: async () => {
      set({ isLoading: true, error: null });

      try {
        const activeSession = (await dependencies.getActiveFocusSession()) ?? null;
        set({ activeSession, isLoading: false });
        return activeSession;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    restoreRunningSessionAfterAppLaunch: async (now = dependencies.now()) => {
      const activeSession = await get().loadActiveSession();

      if (!activeSession) {
        return null;
      }

      if (activeSession.status !== "running") {
        const impactResult = await dependencies.petStore
          .getState()
          .applyFocusImpact(activeSession, now);
        set({ activeSession: impactResult.session });
        return impactResult.session;
      }

      return get().refreshSessionStatus(now);
    },

    loadRecentSessions: async (limit = 10) => {
      set({ isLoading: true, error: null });

      try {
        const recentSessions = await dependencies.listRecentFocusSessions(limit);
        set({ recentSessions, isLoading: false });
        return recentSessions;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    startSession: async (
      plannedDurationMinutes = DEFAULT_FOCUS_DURATION_MINUTES,
      now = dependencies.now(),
    ) => {
      set({ isLoading: true, error: null });

      try {
        const pet = dependencies.petStore.getState().pet;

        if (pet && isPetSleeping(pet)) {
          throw new DomainError(PET_SLEEPING_CANNOT_FOCUS_ERROR);
        }

        if (pet && !canPetStartFocus(pet, plannedDurationMinutes)) {
          throw new DomainError(PET_FOCUS_NEEDS_CARE_ERROR);
        }

        const currentStatus = activeStatus(get().activeSession);
        const session = createRunningSession({
          id: dependencies.createId(),
          plannedDurationMinutes,
          now,
          currentStatus,
        });
        const savedSession = await dependencies.createFocusSession(session);
        const recentSessions = await dependencies.listRecentFocusSessions(10);
        set({ activeSession: savedSession, recentSessions, isLoading: false });
        return savedSession;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    cancelSession: async (now = dependencies.now()) => {
      const activeSession = requireActiveSession(get().activeSession);
      set({ isLoading: true, error: null });

      try {
        const abandonedSession = abandonFocusSession(
          activeSession,
          "cancelled",
          now,
        );
        const impactResult = await dependencies.petStore
          .getState()
          .applyFocusImpact(abandonedSession, now);
        const recentSessions = await dependencies.listRecentFocusSessions(10);
        set({
          activeSession: impactResult.session,
          recentSessions,
          isLoading: false,
        });
        return impactResult.session;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    refreshSessionStatus: (now = dependencies.now()) => {
      if (refreshInFlight) {
        return refreshInFlight;
      }

      const refreshPromise = runRefreshSessionStatus(now).finally(() => {
        refreshInFlight = null;
      });
      refreshInFlight = refreshPromise;

      return refreshPromise;
    },

    confirmCompleted: async (now = dependencies.now()) => {
      const activeSession = requireActiveSession(get().activeSession);
      set({ isLoading: true, error: null });

      try {
        const completedSession =
          activeSession.status === "completed"
            ? activeSession
            : confirmFocusSession(activeSession, now);
        const rewardResult = await dependencies.petStore
          .getState()
          .applySessionReward(completedSession, now);

        set({
          activeSession: rewardResult.session,
          recentSessions: await dependencies.listRecentFocusSessions(10),
          isLoading: false,
        });

        return rewardResult.session;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    confirmAbandoned: async (now = dependencies.now()) => {
      const activeSession = requireActiveSession(get().activeSession);
      set({ isLoading: true, error: null });

      try {
        const abandonedSession =
          activeSession.status === "abandoned" &&
          activeSession.abandonmentReason === "honest_confirmation"
            ? activeSession
            : abandonFocusSession(activeSession, "honest_confirmation", now);
        const rewardResult = await dependencies.petStore
          .getState()
          .applySessionReward(abandonedSession, now);
        const recentSessions = await dependencies.listRecentFocusSessions(10);
        set({
          activeSession: rewardResult.session,
          recentSessions,
          isLoading: false,
        });
        return rewardResult.session;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    clearError: () => set({ error: null }),

    resetAfterLocalDataReset: () =>
      set({
        activeSession: null,
        error: null,
        isLoading: false,
        recentSessions: [],
      }),
    };
  });
}

function activeStatus(session: FocusSession | null): FocusSessionStatus {
  if (!session || session.status === "completed" || session.status === "abandoned") {
    return "idle";
  }

  return session.status;
}

function requireActiveSession(session: FocusSession | null): FocusSession {
  if (!session) {
    throw new Error("No active focus session is loaded.");
  }

  return session;
}

export const usePomodoroStore = createPomodoroStore();
