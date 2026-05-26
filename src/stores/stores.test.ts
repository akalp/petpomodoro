import { describe, expect, it } from "vitest";

import {
  applyFocusSessionImpact,
  applyIdlePetDecay,
  applyStreakFreeze,
  applyEmergencySnack,
  applyPowerNap,
  buyFoodForPet,
  claimSessionReward,
  createDailyFocusState,
  createDefaultSettings,
  INSUFFICIENT_COINS_ERROR,
  PET_FOCUS_NEEDS_CARE_ERROR,
  PET_SLEEPING_CANNOT_EAT_ERROR,
  PET_SLEEPING_CANNOT_FOCUS_ERROR,
  rewardDateKeyForSession,
  startPetSleep,
  wakePetFromSleep,
  type AppSettings,
  type DailyFocusState,
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
import { createUiStore } from "./uiStore";

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

  it("persists a species selection on the current pet without resetting progress", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ coins: 9, xp: 64, streak: 2 }),
    });
    const petStore = createPetStore(repo.petDependencies);

    await petStore.getState().initializePet(now);
    const updated = await petStore.getState().changeSpecies("moowi", now);

    expect(updated).toMatchObject({
      id: "pet-1",
      speciesId: "moowi",
      name: "Moowi",
      customName: null,
      coins: 9,
      xp: 64,
      streak: 2,
      updatedAt: now,
    });
    expect(repo.pet).toEqual(updated);
    expect(petStore.getState().pet).toEqual(updated);
  });

  it("preserves and clears a custom name independently of species selection", async () => {
    const repo = createInMemoryRepositories({ pet: makePet() });
    const petStore = createPetStore(repo.petDependencies);

    await petStore.getState().initializePet(now);
    await petStore.getState().renamePet("Juniper", now);
    await petStore.getState().changeSpecies("moowi", now);

    expect(repo.pet).toMatchObject({
      speciesId: "moowi",
      name: "Juniper",
      customName: "Juniper",
    });

    await petStore.getState().renamePet("", now);
    expect(repo.pet).toMatchObject({
      speciesId: "moowi",
      name: "Moowi",
      customName: null,
    });
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
    expect(repo.pet?.coins).toBe(5);
    expect(repo.pet?.hunger).toBeCloseTo(94.67, 2);
    expect(repo.pet?.energy).toBe(73);
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("initializes an active elapsed session without double-counting idle decay", async () => {
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
    const settingsStore = createSettingsStore({
      loadOrCreateSettings: async (createdAt) => createDefaultSettings(createdAt),
      updateSettings: async (settings) => settings,
      readLegacySettings: () => ({}),
      clearLegacySettings: () => undefined,
      now: () => now,
    });
    const uiStore = createUiStore({
      petStore,
      pomodoroStore,
      settingsStore,
      now: () => now,
    });

    await uiStore.getState().initializeApp(now);

    expect(repo.pet?.coins).toBe(5);
    expect(repo.pet?.hunger).toBeCloseTo(94.67, 2);
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

  it("rejects starting a focus session while the pet is sleeping", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ sleepStartedAt: "2026-05-22T12:00:00.000Z" }),
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await petStore.getState().initializePet(now);

    await expect(
      pomodoroStore.getState().startSession(15, now),
    ).rejects.toThrow(PET_SLEEPING_CANNOT_FOCUS_ERROR);
    expect(repo.sessions.size).toBe(0);
  });

  it("rejects starting a focus session when care stats are too low", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ energy: 19, hunger: 12 }),
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });

    await petStore.getState().initializePet(now);

    await expect(
      pomodoroStore.getState().startSession(25, now),
    ).rejects.toThrow(PET_FOCUS_NEEDS_CARE_ERROR);
    expect(repo.sessions.size).toBe(0);
  });

  it("cancels a running session without a reward", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          status: "running",
          startedAt: "2026-05-22T12:20:00.000Z",
          expectedEndAt: "2026-05-22T12:45:00.000Z",
          focusImpactAppliedUntil: "2026-05-22T12:20:00.000Z",
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
    expect(repo.pet?.coins).toBe(2);
    expect(repo.pet?.hunger).toBe(98);
    expect(repo.pet?.energy).toBeCloseTo(77.2);
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
    const repeated = await pomodoroStore
      .getState()
      .confirmAbandoned("2026-05-22T12:31:00.000Z");

    expect(session.status).toBe("abandoned");
    expect(repeated.status).toBe("abandoned");
    expect(session.abandonmentReason).toBe("honest_confirmation");
    expect(session.abandonedAt).toBe(now);
    expect(repo.pet?.xp).toBe(0);
    expect(repo.pet?.coins).toBe(0);
    expect(repo.pet?.happiness).toBe(52);
    expect(repo.pet?.streak).toBe(0);
    expect(repo.pet?.honestyHearts).toBe(1);
    expect(repo.rewardLedger.size).toBe(1);
  });

  it("does not reward a five minute honest non-completion", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet(),
      sessions: [
        makeSession({
          plannedDurationMinutes: 5,
          expectedEndAt: "2026-05-22T12:05:00.000Z",
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
    await pomodoroStore.getState().confirmAbandoned(now);

    expect(repo.pet).toMatchObject({
      xp: 0,
      coins: 0,
      happiness: 50,
      streak: 0,
      honestyHearts: 0,
    });
    expect(petStore.getState().lastRewardSummary).toBeNull();
    expect(repo.rewardLedger.get("session-1")).toMatchObject({
      honestyHeartsAwarded: 0,
    });
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
    expect(repo.pet?.coins).toBe(7);
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
    expect(repo.pet?.coins).toBe(7);
    expect(repo.rewardLedger.size).toBe(1);
  });

  it("buys food through the pet store and records the purchase summary", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ coins: 10, hunger: 40, happiness: 30, energy: 20 }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);
    const result = await petStore.getState().buyFood("berry-bowl", now);

    expect(result.pet).toMatchObject({
      coins: 2,
      hunger: 50,
      happiness: 34,
      energy: 20,
    });
    expect(petStore.getState().pet).toEqual(result.pet);
    expect(petStore.getState().lastFoodPurchase).toMatchObject({
      item: { id: "berry-bowl" },
      coinsSpent: 8,
    });
  });

  it("applies a confirmed streak freeze through the pet store", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ streak: 2, honestyHearts: 3 }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);
    const result = await petStore.getState().useStreakFreeze("2026-05-21", now);

    expect(result.pet).toMatchObject({
      streak: 2,
      honestyHearts: 0,
      lastFreezeUsedAt: now,
    });
    expect(result.dailyFocusState).toMatchObject({
      dateKey: "2026-05-21",
      completedFocusMinutes: 0,
      streakFreezesUsed: 1,
    });
    expect(petStore.getState().pet).toEqual(result.pet);
  });

  it("starts and wakes pet sleep through the pet store", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({
        coins: 9,
        energy: 20,
        honestyHearts: 2,
        hunger: 100,
        streak: 3,
        xp: 42,
      }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);
    const sleeping = await petStore
      .getState()
      .startSleep("2026-05-22T13:00:00.000Z");

    expect(sleeping.sleepStartedAt).toBe("2026-05-22T13:00:00.000Z");
    expect(repo.pet?.sleepStartedAt).toBe("2026-05-22T13:00:00.000Z");

    const result = await petStore
      .getState()
      .wakeSleep("2026-05-22T14:00:00.000Z");

    expect(result.pet).toMatchObject({
      coins: 9,
      energy: 40,
      honestyHearts: 2,
      hunger: 96,
      sleepStartedAt: null,
      streak: 3,
      xp: 42,
    });
    expect(petStore.getState().lastSleepSummary).toMatchObject({
      energyGained: 20,
      hungerChanged: -4,
    });
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("uses rescue actions through the pet store without granting rewards", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ coins: 0, energy: 0, hunger: 0 }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);
    const snack = await petStore.getState().useEmergencySnack(now);
    const nap = await petStore
      .getState()
      .usePowerNap("2026-05-22T12:31:00.000Z");

    expect(snack.pet.hunger).toBe(12);
    expect(nap.pet).toMatchObject({
      coins: 0,
      energy: 18,
      hunger: 9,
      xp: 0,
      streak: 0,
      honestyHearts: 0,
    });
    expect(petStore.getState().lastEmergencySnackSummary?.hungerGained).toBe(12);
    expect(petStore.getState().lastPowerNapSummary).toMatchObject({
      energyGained: 18,
      hungerChanged: -3,
    });
    expect(repo.rewardLedger.size).toBe(0);
  });

  it("surfaces food purchase errors while the pet is sleeping", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({
        coins: 20,
        sleepStartedAt: "2026-05-22T12:00:00.000Z",
      }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);

    await expect(
      petStore.getState().buyFood("moon-milk", now),
    ).rejects.toThrow(PET_SLEEPING_CANNOT_EAT_ERROR);

    expect(repo.pet).toMatchObject({
      coins: 20,
      sleepStartedAt: "2026-05-22T12:00:00.000Z",
    });
  });

  it("preserves sleeping state during app hydration", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({
        sleepStartedAt: "2026-05-22T10:00:00.000Z",
        lastHungerUpdatedAt: "2026-05-22T10:00:00.000Z",
      }),
    });
    const petStore = createPetStore(repo.petDependencies);
    const pomodoroStore = createPomodoroStore({
      ...repo.pomodoroDependencies,
      petStore,
      now: () => now,
      createId: () => "session-new",
    });
    const settingsStore = createSettingsStore({
      loadOrCreateSettings: async (createdAt) => createDefaultSettings(createdAt),
      updateSettings: async (settings) => settings,
      readLegacySettings: () => ({}),
      clearLegacySettings: () => undefined,
      now: () => now,
    });
    const uiStore = createUiStore({
      petStore,
      pomodoroStore,
      settingsStore,
      now: () => now,
    });

    await uiStore.getState().initializeApp(now);

    expect(repo.pet).toMatchObject({
      sleepStartedAt: "2026-05-22T10:00:00.000Z",
      hunger: 100,
    });
    expect(petStore.getState().pet?.sleepStartedAt).toBe(
      "2026-05-22T10:00:00.000Z",
    );
  });

  it("surfaces food purchase errors without changing the pet", async () => {
    const repo = createInMemoryRepositories({
      pet: makePet({ coins: 1, hunger: 40 }),
    });
    const petStore = createPetStore({
      ...repo.petDependencies,
      now: () => now,
    });

    await petStore.getState().initializePet(now);

    await expect(
      petStore.getState().buyFood("moon-milk", now),
    ).rejects.toThrow(INSUFFICIENT_COINS_ERROR);

    expect(repo.pet).toMatchObject({ coins: 1, hunger: 40 });
    expect(petStore.getState().error).toBe(INSUFFICIENT_COINS_ERROR);
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
        language: "tr",
      }),
      clearLegacySettings: () => {
        legacyCleared = true;
      },
      now: () => now,
    });

    const hydrated = await store.getState().initializeSettings(now);
    const updated = await store.getState().updatePreferredDuration(90, now);
    const translated = await store.getState().setLanguage("en", now);
    const messages = await store
      .getState()
      .updateMotivationalMessages(["  You have this moment.  ", ""], now);

    expect(hydrated).toMatchObject({
      preferredDurationMinutes: 50,
      hasInstalledShortcut: true,
      hasEnabledFocusNotifications: true,
      language: "tr",
      motivationalMessages: [],
    });
    expect(updated.preferredDurationMinutes).toBe(90);
    expect(translated.language).toBe("en");
    expect(messages.motivationalMessages).toEqual(["You have this moment."]);
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
  const dailyFocus = new Map<string, DailyFocusState>();

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
    claimStoredSessionReward: async ({
      petId,
      sessionId,
      now: rewardNow,
      session: nextSession,
    }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const session = sessions.get(sessionId);

      if (!session) {
        throw new Error("Session not found.");
      }

      const rewardSession = nextSession ?? session;
      const existingReward = rewardLedger.get(sessionId);
      const dateKey = rewardDateKeyForSession(rewardSession, rewardNow);
      const dailyFocusKey = `${petId}:${dateKey}`;
      const dailyFocusState =
        dailyFocus.get(dailyFocusKey) ??
        createDailyFocusState({ petId, dateKey });

      if (rewardSession.rewardClaimedAt !== null || existingReward) {
        const result = claimSessionReward({
          pet,
          session: rewardSession,
          existingRewards: existingReward ? [existingReward] : [],
          dailyFocusState: existingReward ? null : dailyFocusState,
          now: rewardNow,
          rewardId: `reward-${sessionId}`,
        });
        sessions.set(sessionId, result.session);
        return result;
      }

      const impactResult = applyStoredImpactValues(pet, rewardSession, rewardNow);
      const result = claimSessionReward({
        pet: impactResult.pet,
        session: impactResult.session,
        existingRewards: existingReward ? [existingReward] : [],
        dailyFocusState,
        now: rewardNow,
        rewardId: `reward-${sessionId}`,
      });

      pet = result.pet;
      sessions.set(sessionId, result.session);

      if (result.reward) {
        if (result.dailyFocusState) {
          dailyFocus.set(dailyFocusKey, result.dailyFocusState);
        }
        rewardLedger.set(sessionId, result.reward);
      }

      return result;
    },
    applyStoredSessionImpact: async ({ petId, session, now: impactNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      if (!sessions.has(session.id)) {
        throw new Error("Session not found.");
      }

      const result = applyStoredImpactValues(pet, session, impactNow);
      pet = result.pet;
      sessions.set(session.id, result.session);
      return result;
    },
    applyStoredStreakFreeze: async ({ petId, dateKey, now: freezeNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const dailyFocusKey = `${petId}:${dateKey}`;
      const dailyFocusState =
        dailyFocus.get(dailyFocusKey) ??
        createDailyFocusState({ petId, dateKey });
      const result = applyStreakFreeze(pet, dailyFocusState, freezeNow);

      pet = result.pet;
      dailyFocus.set(dailyFocusKey, result.dailyFocusState);
      return result;
    },
    applyStoredPowerNap: async ({ petId, now: rescueNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const dailyFocusKey = `${petId}:2026-05-22`;
      const dailyFocusState =
        dailyFocus.get(dailyFocusKey) ??
        createDailyFocusState({ petId, dateKey: "2026-05-22" });
      const result = applyPowerNap(pet, dailyFocusState, rescueNow);

      pet = result.pet;
      dailyFocus.set(dailyFocusKey, result.dailyFocusState);
      return result;
    },
    applyStoredEmergencySnack: async ({ petId, now: rescueNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const dailyFocusKey = `${petId}:2026-05-22`;
      const dailyFocusState =
        dailyFocus.get(dailyFocusKey) ??
        createDailyFocusState({ petId, dateKey: "2026-05-22" });
      const result = applyEmergencySnack(pet, dailyFocusState, rescueNow);

      pet = result.pet;
      dailyFocus.set(dailyFocusKey, result.dailyFocusState);
      return result;
    },
    buyFoodForStoredPet: async ({ petId, foodId, now: foodNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const result = buyFoodForPet(pet, foodId, foodNow);
      pet = result.pet;
      return result;
    },
    startStoredPetSleep: async ({ petId, now: sleepNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      pet = startPetSleep(pet, sleepNow);
      return pet;
    },
    wakeStoredPetFromSleep: async ({ petId, now: sleepNow }) => {
      if (!pet || pet.id !== petId) {
        throw new Error("Pet not found.");
      }

      const result = wakePetFromSleep(pet, sleepNow);
      pet = result.pet;
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
    dailyFocus,
    petDependencies,
    pomodoroDependencies,
  };
}

function applyStoredImpactValues(
  pet: PetState,
  session: FocusSession,
  impactNow: string,
): { pet: PetState; session: FocusSession } {
  const focusResult = applyFocusSessionImpact(pet, session, impactNow);
  return {
    pet:
      focusResult.session.status === "running"
        ? focusResult.pet
        : applyIdlePetDecay(focusResult.pet, impactNow),
    session: focusResult.session,
  };
}
