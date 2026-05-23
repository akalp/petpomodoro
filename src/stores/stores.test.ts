import { describe, expect, it } from "vitest";

import {
  claimSessionReward,
  createDefaultSettings,
  type AppSettings,
  type FocusSession,
  type PetState,
  type RewardLedger,
} from "../domain";
import { makePet, makeSession } from "../test/factories";

import { createPetStore, type PetStoreDependencies } from "./petStore";
import {
  createPomodoroStore,
  type PomodoroStoreDependencies,
} from "./pomodoroStore";
import { createSettingsStore } from "./settingsStore";

const now = "2026-05-22T12:30:00.000Z";

describe("store workflows", () => {
  it("hydrates the default pet", async () => {
    const repo = createInMemoryRepositories();
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    const pet = await petStore.getState().initializePet(now);

    expect(pet.name).toBe("Momo");
    expect(petStore.getState().pet).toEqual(pet);
    expect(repo.pet?.id).toBe("local-pet");
  });

  it("restores an elapsed running session to awaiting confirmation without reward", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "running",
          expectedEndAt: "2026-05-22T12:25:00.000Z",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    const session = await pomodoroStore
      .getState()
      .restoreRunningSessionAfterAppLaunch(now);

    expect(session?.status).toBe("awaiting_confirmation");
    expect(repo.pet?.xp).toBe(0);
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("keeps a running session active before its expected end time", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "running",
          expectedEndAt: "2026-05-22T12:35:00.000Z",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await pomodoroStore.getState().loadActiveSession();
    const session = await pomodoroStore.getState().refreshSessionStatus(now);

    expect(session?.status).toBe("running");
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("starts and persists a focus session with the requested duration", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    const session = await pomodoroStore.getState().startSession(15, now);

    expect(session.status).toBe("running");
    expect(session.plannedDurationMinutes).toBe(15);
    expect(session.expectedEndAt).toBe("2026-05-22T12:45:00.000Z");
    expect(repo.sessions.get("session-new")).toEqual(session);
  });

  it("cancels a running session without a reward", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "running",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await pomodoroStore.getState().loadActiveSession();
    const session = await pomodoroStore.getState().cancelSession(now);

    expect(session.status).toBe("abandoned");
    expect(session.abandonmentReason).toBe("cancelled");
    expect(session.abandonedAt).toBe(now);
    expect(repo.pet?.xp).toBe(0);
    expect(repo.pet?.honestyHearts).toBe(0);
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("abandons an awaiting confirmation session with an honesty heart reward", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "awaiting_confirmation",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await pomodoroStore.getState().loadActiveSession();
    const session = await pomodoroStore.getState().confirmAbandoned(now);

    expect(session.status).toBe("abandoned");
    expect(session.abandonmentReason).toBe("honest_confirmation");
    expect(session.abandonedAt).toBe(now);
    expect(repo.pet?.xp).toBe(0);
    expect(repo.pet?.honestyHearts).toBe(1);
    expect(repo.rewardLedger.size).toBe(1);
  });

  it("confirms completion and applies the existing honesty reward path", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "awaiting_confirmation",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await petStore.getState().initializePet(now);
    await pomodoroStore.getState().loadActiveSession();

    const session = await pomodoroStore.getState().confirmCompleted(now);

    expect(session.status).toBe("completed");
    expect(session.confirmedAt).toBe(now);
    expect(repo.pet?.xp).toBe(25);
    expect(repo.pet?.coins).toBe(10);
    expect(repo.pet?.streak).toBe(1);
    expect(repo.rewardLedger.size).toBe(1);
  });

  it("starts a session using a saved custom duration", async () => {
    const repo = createInMemoryRepositories({ pet: makePet() });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-custom",
    });

    const session = await pomodoroStore.getState().startSession(90, now);

    expect(session.plannedDurationMinutes).toBe(90);
    expect(session.expectedEndAt).toBe("2026-05-22T14:00:00.000Z");
  });

  it("updates level when a completion reward crosses the next threshold", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ xp: 90, level: 1 }),
      sessions: [
        makeSession({
          status: "awaiting_confirmation",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await petStore.getState().initializePet(now);
    await pomodoroStore.getState().loadActiveSession();

    await pomodoroStore.getState().confirmCompleted(now);

    expect(repo.pet?.xp).toBe(115);
    expect(repo.pet?.level).toBe(2);
    expect(petStore.getState().lastRewardSummary).toMatchObject({
      leveledUp: true,
      previousLevel: 1,
      newLevel: 2,
    });
  });

  it("keeps completion reward idempotent across repeated confirmations", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "awaiting_confirmation",
        }),
      ],
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await petStore.getState().initializePet(now);
    await pomodoroStore.getState().loadActiveSession();

    const firstConfirmation = await pomodoroStore
      .getState()
      .confirmCompleted(now);
    const secondConfirmation = await pomodoroStore
      .getState()
      .confirmCompleted("2026-05-22T12:31:00.000Z");

    expect(firstConfirmation.status).toBe("completed");
    expect(secondConfirmation.status).toBe("completed");
    expect(repo.pet?.xp).toBe(25);
    expect(repo.rewardLedger.size).toBe(1);
  });
});

describe("settings workflows", () => {
  it("migrates legacy preferences once and persists custom durations", async () => {
    let settings: AppSettings | undefined;
    let legacyCleared = false;
    const store = createSettingsStore({
      loadOrCreateSettings: async (createdAt, initialValues) => {
        settings ??= { ...createDefaultSettings(createdAt), ...initialValues };
        return settings;
      },
      updateSettings: async (nextSettings) => {
        settings = nextSettings;
        return nextSettings;
      },
      readLegacySettings: () => ({
        preferredDurationMinutes: 50,
        hasInstalledShortcut: true,
        hasEnabledFocusNotifications: true,
      }),
      clearLegacySettings: () => {
        legacyCleared = true;
      },
      now: () => now,
    });

    const hydrated = await store.getState().initializeSettings(now);
    const updated = await store.getState().updatePreferredDuration(90, now);

    expect(hydrated).toMatchObject({
      preferredDurationMinutes: 50,
      hasInstalledShortcut: true,
      hasEnabledFocusNotifications: true,
    });
    expect(updated.preferredDurationMinutes).toBe(90);
    expect(legacyCleared).toBe(true);
  });

  it("clears hydrated settings state when local data is reset", async () => {
    const store = createSettingsStore({
      loadOrCreateSettings: async (createdAt) => createDefaultSettings(createdAt),
      updateSettings: async (settings) => settings,
      readLegacySettings: () => ({}),
      clearLegacySettings: () => undefined,
      now: () => now,
    });

    await store.getState().initializeSettings(now);
    store.getState().clearAfterLocalDataReset();

    expect(store.getState().settings).toBeNull();
  });
});

interface InMemoryRepositoryState {
  pet?: PetState;
  sessions?: FocusSession[];
}

function createInMemoryRepositories(state: InMemoryRepositoryState = {}) {
  let pet = state.pet;
  const sessions = new Map(
    (state.sessions ?? []).map((session) => [session.id, session]),
  );
  const rewardLedger = new Map<string, RewardLedger>();

  const petDependencies: PetStoreDependencies = {
    getCurrentPet: async () => pet,
    loadOrCreateDefaultPet: async (createdAt) => {
      pet ??= makePet({
        id: "local-pet",
        createdAt,
        updatedAt: createdAt,
      });
      return pet;
    },
    updatePet: async (nextPet) => {
      pet = nextPet;
      return nextPet;
    },
    claimStoredSessionReward: async ({ petId, sessionId, now: rewardNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const session = sessions.get(sessionId);

      if (!session) {
        throw new Error("Session not found.");
      }

      const existingReward = rewardLedger.get(sessionId);
      const result = claimSessionReward({
        pet,
        session,
        existingRewards: existingReward ? [existingReward] : [],
        now: rewardNow,
        rewardId: `reward-${sessionId}`,
      });

      pet = result.pet;
      sessions.set(sessionId, result.session);

      if (result.reward) {
        rewardLedger.set(sessionId, result.reward);
      }

      return result;
    },
    now: () => now,
  };

  const pomodoroDependencies: Omit<
    PomodoroStoreDependencies,
    "petStore" | "now" | "createId"
  > = {
    createFocusSession: async (session) => {
      sessions.set(session.id, session);
      return session;
    },
    getActiveFocusSession: async () => {
      return [...sessions.values()]
        .filter(
          (session) =>
            session.status === "running" ||
            session.status === "awaiting_confirmation",
        )
        .sort(
          (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
        )[0];
    },
    listRecentFocusSessions: async (limit = 10) => {
      return [...sessions.values()]
        .sort(
          (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
        )
        .slice(0, limit);
    },
    updateFocusSession: async (session) => {
      sessions.set(session.id, session);
      return session;
    },
  };

  return {
    get pet() {
      return pet;
    },
    sessions,
    rewardLedger,
    petDependencies,
    pomodoroDependencies,
  };
}
