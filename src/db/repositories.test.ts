import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import {
  INSUFFICIENT_COINS_ERROR,
  POWER_NAP_COOLDOWN_ACTIVE_ERROR,
  type AppSettings,
  type DailyFocusState,
} from "../domain";
import { makePet, makeReward, makeSession } from "../test/factories";
import { PetPomodoroDatabase } from "./database";
import {
  createInitialPet,
  startStoredPetSleep,
  wakeStoredPetFromSleep,
} from "./petsRepository";
import {
  applyStoredEmergencySnack,
  applyStoredPowerNap,
  applyStoredStreakFreeze,
  getStoredDailyFocusState,
} from "./dailyFocusRepository";
import { claimStoredSessionReward } from "./rewardsRepository";
import { loadOrCreateSettings, updateSettings } from "./settingsRepository";
import { buyFoodForStoredPet } from "./shopRepository";

const databases: PetPomodoroDatabase[] = [];
const now = "2026-05-22T12:31:00.000Z";

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.delete()));
});

describe("Dexie repositories", () => {
  it("creates the default pet as Momo species", () => {
    expect(createInitialPet({ now })).toMatchObject({
      id: "local-pet",
      name: "Momo",
      customName: null,
      speciesId: "momo",
    });
  });

  it("creates and updates singleton settings", async () => {
    const database = makeDatabase("settings");
    const created = await loadOrCreateSettings(
      now,
      {
        preferredDurationMinutes: 90,
        installedShortcutVersion: 2,
      },
      database,
    );

    expect(created).toMatchObject({
      id: "local-settings",
      preferredDurationMinutes: 90,
      installedShortcutVersion: 2,
      language: "en",
      motivationalMessages: [],
    });

    const updated = await updateSettings(
      {
        ...created,
        motivationalMessages: ["  Keep going softly. "],
        preferredDurationMinutes: 45,
      },
      database,
    );
    expect(updated.motivationalMessages).toEqual(["Keep going softly."]);
    await expect(database.settings.get("local-settings")).resolves.toEqual(updated);
  });

  it("adds defaults when loading settings saved before newer fields", async () => {
    const database = makeDatabase("legacy-settings-language");
    const legacySettings: Omit<
      AppSettings,
      "language" | "motivationalMessages"
    > = {
      id: "local-settings",
      preferredDurationMinutes: 25,
      installedShortcutVersion: null,
      updatedAt: now,
    };
    await database.settings.add(legacySettings as AppSettings);

    const upgraded = await loadOrCreateSettings(now, {}, database);

    expect(upgraded.language).toBe("en");
    expect(upgraded.motivationalMessages).toEqual([]);
    await expect(database.settings.get("local-settings")).resolves.toMatchObject({
      language: "en",
      motivationalMessages: [],
    });
  });

  it("enforces one reward ledger record per session", async () => {
    const database = makeDatabase("unique-reward");

    await database.rewardLedger.add(makeReward());

    await expect(
      database.rewardLedger.add(makeReward({ id: "reward-2" })),
    ).rejects.toThrow();
  });

  it("applies completed and honest-confirmation rewards atomically once", async () => {
    const completedDatabase = makeDatabase("completion");
    await completedDatabase.pets.add(makePet());
    await completedDatabase.sessions.add(
      makeSession({ status: "completed", confirmedAt: now }),
    );

    const first = await claimStoredSessionReward(
      { petId: "pet-1", sessionId: "session-1", now, rewardId: "reward-1" },
      completedDatabase,
    );
    const second = await claimStoredSessionReward(
      {
        petId: "pet-1",
        sessionId: "session-1",
        now: "2026-05-22T12:32:00.000Z",
        rewardId: "reward-2",
      },
      completedDatabase,
    );

    expect(first.pet.xp).toBe(25);
    expect(first.pet.coins).toBe(7);
    expect(first.pet.hunger).toBeCloseTo(94.6);
    expect(first.pet.energy).toBe(73);
    expect(second.reward).toBeNull();
    expect(await completedDatabase.rewardLedger.count()).toBe(1);

    const honestyDatabase = makeDatabase("honesty");
    await honestyDatabase.pets.add(makePet());
    await honestyDatabase.sessions.add(
      makeSession({
        status: "abandoned",
        abandonedAt: now,
        abandonmentReason: "honest_confirmation",
      }),
    );

    const honesty = await claimStoredSessionReward(
      { petId: "pet-1", sessionId: "session-1", now, rewardId: "reward-1" },
      honestyDatabase,
    );
    const duplicateHonesty = await claimStoredSessionReward(
      {
        petId: "pet-1",
        sessionId: "session-1",
        now: "2026-05-22T12:32:00.000Z",
        rewardId: "reward-2",
      },
      honestyDatabase,
    );

    expect(honesty.pet.xp).toBe(0);
    expect(honesty.pet.coins).toBe(0);
    expect(honesty.pet.happiness).toBe(52);
    expect(honesty.pet.hunger).toBeCloseTo(94.6);
    expect(honesty.pet.energy).toBe(73);
    expect(honesty.pet.streak).toBe(0);
    expect(honesty.pet.honestyHearts).toBe(1);
    expect(honesty.reward).toMatchObject({
      rewardType: "honesty",
      xpAwarded: 0,
      coinsAwarded: 0,
      streakAwarded: 0,
      honestyHeartsAwarded: 1,
    });
    expect(duplicateHonesty.reward).toBeNull();
    expect(await honestyDatabase.rewardLedger.count()).toBe(1);
  });

  it("persists honesty eligibility and caps daily heart gain", async () => {
    const database = makeDatabase("honesty-daily-cap");
    await database.pets.add(makePet());
    await database.sessions.bulkAdd([
      makeSession({
        id: "honesty-short",
        plannedDurationMinutes: 5,
        expectedEndAt: "2026-05-22T12:05:00.000Z",
        status: "abandoned",
        abandonedAt: "2026-05-22T12:06:00.000Z",
        abandonmentReason: "honest_confirmation",
      }),
      ...Array.from({ length: 3 }, (_, index) =>
        makeSession({
          id: `honesty-eligible-${index + 1}`,
          plannedDurationMinutes: 15,
          expectedEndAt: `2026-05-22T12:${String(15 + index).padStart(
            2,
            "0",
          )}:00.000Z`,
          status: "abandoned",
          abandonedAt: `2026-05-22T12:${String(20 + index).padStart(
            2,
            "0",
          )}:00.000Z`,
          abandonmentReason: "honest_confirmation",
        }),
      ),
    ]);

    const short = await claimStoredSessionReward(
      {
        petId: "pet-1",
        sessionId: "honesty-short",
        now,
        rewardId: "reward-short",
      },
      database,
    );
    const eligibleHeartAwards: number[] = [];

    for (let index = 1; index <= 3; index += 1) {
      const result = await claimStoredSessionReward(
        {
          petId: "pet-1",
          sessionId: `honesty-eligible-${index}`,
          now,
          rewardId: `reward-eligible-${index}`,
        },
        database,
      );
      eligibleHeartAwards.push(result.reward?.honestyHeartsAwarded ?? 0);
    }

    expect(short.reward?.honestyHeartsAwarded).toBe(0);
    expect(short.summary).toBeNull();
    expect(eligibleHeartAwards).toEqual([1, 1, 0]);
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      xp: 0,
      coins: 0,
      happiness: 54,
      streak: 0,
      honestyHearts: 2,
    });
    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      honestyHeartsAwarded: 2,
      completedFocusMinutes: 0,
      dailyGoalAwarded: false,
    });
    expect(await database.rewardLedger.count()).toBe(4);
  });

  it("persists daily focus progress and awards streak once per local day", async () => {
    const database = makeDatabase("daily-focus");
    await database.pets.add(makePet());
    await database.sessions.bulkAdd(
      Array.from({ length: 5 }, (_, index) =>
        makeSession({
          id: `session-${index + 1}`,
          plannedDurationMinutes: 5,
          status: "completed",
          expectedEndAt: `2026-05-22T12:${String((index + 1) * 5).padStart(
            2,
            "0",
          )}:00.000Z`,
          confirmedAt: now,
        }),
      ),
    );

    for (let index = 0; index < 4; index += 1) {
      const result = await claimStoredSessionReward(
        {
          petId: "pet-1",
          sessionId: `session-${index + 1}`,
          now,
          rewardId: `reward-${index + 1}`,
        },
        database,
      );

      expect(result.reward?.streakAwarded).toBe(0);
    }

    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      completedFocusMinutes: 20,
      dailyGoalAwarded: false,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      streak: 0,
    });

    const fifth = await claimStoredSessionReward(
      {
        petId: "pet-1",
        sessionId: "session-5",
        now,
        rewardId: "reward-5",
      },
      database,
    );
    const duplicate = await claimStoredSessionReward(
      {
        petId: "pet-1",
        sessionId: "session-5",
        now: "2026-05-22T12:32:00.000Z",
        rewardId: "reward-duplicate",
      },
      database,
    );

    expect(fifth.reward?.streakAwarded).toBe(1);
    expect(duplicate.reward).toBeNull();
    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      completedFocusMinutes: 25,
      dailyGoalAwarded: true,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      streak: 1,
    });
    expect(await database.rewardLedger.count()).toBe(5);
  });

  it("persists a streak freeze once for a missed day", async () => {
    const database = makeDatabase("streak-freeze");
    await database.pets.add(makePet({ streak: 3, honestyHearts: 4 }));

    const result = await applyStoredStreakFreeze(
      {
        petId: "pet-1",
        dateKey: "2026-05-21",
        now: "2026-05-22T12:31:00.000Z",
      },
      database,
    );

    expect(result.pet).toMatchObject({
      streak: 3,
      honestyHearts: 1,
      xp: 0,
      coins: 0,
      lastFreezeUsedAt: "2026-05-22T12:31:00.000Z",
    });
    expect(result.dailyFocusState).toMatchObject({
      completedFocusMinutes: 0,
      dailyGoalAwarded: false,
      streakFreezesUsed: 1,
      lastStreakFreezeAt: "2026-05-22T12:31:00.000Z",
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      streak: 3,
      honestyHearts: 1,
      lastFreezeUsedAt: "2026-05-22T12:31:00.000Z",
    });
    await expect(database.dailyFocus.get(["pet-1", "2026-05-21"])).resolves.toMatchObject({
      streakFreezesUsed: 1,
      lastStreakFreezeAt: "2026-05-22T12:31:00.000Z",
    });

    await expect(
      applyStoredStreakFreeze(
        {
          petId: "pet-1",
          dateKey: "2026-05-21",
          now: "2026-05-22T12:32:00.000Z",
        },
        database,
      ),
    ).rejects.toThrow();
  });

  it("persists power nap care and prevents another nap during cooldown", async () => {
    const database = makeDatabase("power-nap");
    await database.pets.add(
      makePet({ coins: 0, energy: 10, happiness: 40, hunger: 12 }),
    );

    const first = await applyStoredPowerNap(
      { petId: "pet-1", now: "2026-05-22T12:31:00.000Z" },
      database,
    );

    expect(first.pet).toMatchObject({
      coins: 0,
      energy: 28,
      happiness: 41,
      hunger: 9,
      xp: 0,
      streak: 0,
    });
    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      powerNapsUsed: 1,
      lastPowerNapAt: "2026-05-22T12:31:00.000Z",
    });

    await expect(
      applyStoredPowerNap(
        { petId: "pet-1", now: "2026-05-22T13:00:00.000Z" },
        database,
      ),
    ).rejects.toThrow(POWER_NAP_COOLDOWN_ACTIVE_ERROR);
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      energy: 28,
      hunger: 9,
    });
  });

  it("persists one emergency snack for a no-coins hungry pet", async () => {
    const database = makeDatabase("emergency-snack");
    await database.pets.add(makePet({ coins: 0, energy: 0, hunger: 0 }));

    const result = await applyStoredEmergencySnack(
      { petId: "pet-1", now },
      database,
    );

    expect(result.pet).toMatchObject({
      coins: 0,
      energy: 0,
      hunger: 15,
      xp: 0,
      streak: 0,
      honestyHearts: 0,
    });
    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      emergencySnacksUsed: 1,
    });
  });

  it("normalizes daily focus rows saved before rescue counters existed", async () => {
    const database = makeDatabase("daily-focus-normalization");
    await database.dailyFocus.add({
      petId: "pet-1",
      dateKey: "2026-05-22",
      completedFocusMinutes: 10,
      dailyGoalAwarded: false,
      honestyHeartsAwarded: 1,
    } as DailyFocusState);

    const normalized = await getStoredDailyFocusState(
      { petId: "pet-1", dateKey: "2026-05-22" },
      database,
    );

    expect(normalized).toMatchObject({
      completedFocusMinutes: 10,
      dailyGoalAwarded: false,
      honestyHeartsAwarded: 1,
      streakFreezesUsed: 0,
      lastStreakFreezeAt: null,
      powerNapsUsed: 0,
      emergencySnacksUsed: 0,
      lastPowerNapAt: null,
    });
  });

  it("persists pet sleep start and wake actions", async () => {
    const database = makeDatabase("pet-sleep");
    await database.pets.add(makePet({ energy: 20, hunger: 100 }));

    const sleeping = await startStoredPetSleep(
      { petId: "pet-1", now: "2026-05-22T13:00:00.000Z" },
      database,
    );

    expect(sleeping.sleepStartedAt).toBe("2026-05-22T13:00:00.000Z");
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
    });

    const result = await wakeStoredPetFromSleep(
      { petId: "pet-1", now: "2026-05-22T14:00:00.000Z" },
      database,
    );

    expect(result.pet).toMatchObject({
      energy: 40,
      hunger: 96,
      sleepStartedAt: null,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      energy: 40,
      hunger: 96,
      sleepStartedAt: null,
    });
  });

  it("rolls back pet and session updates when the ledger insert fails", async () => {
    const database = makeDatabase("rollback");
    await database.pets.add(makePet());
    await database.sessions.add(
      makeSession({ status: "completed", confirmedAt: now }),
    );
    await database.rewardLedger.add(
      makeReward({ id: "duplicate-id", sessionId: "other-session" }),
    );

    await expect(
      claimStoredSessionReward(
        {
          petId: "pet-1",
          sessionId: "session-1",
          now,
          rewardId: "duplicate-id",
        },
        database,
      ),
    ).rejects.toThrow();

    await expect(database.pets.get("pet-1")).resolves.toMatchObject({ xp: 0 });
    await expect(database.sessions.get("session-1")).resolves.toMatchObject({
      rewardClaimedAt: null,
    });
  });

  it("persists food purchases in a pet transaction", async () => {
    const database = makeDatabase("food-purchase");
    await database.pets.add(
      makePet({ coins: 20, hunger: 40, happiness: 30, energy: 20 }),
    );

    const result = await buyFoodForStoredPet(
      { petId: "pet-1", foodId: "honey-toast", now },
      database,
    );

    expect(result.pet).toMatchObject({
      coins: 4,
      hunger: 54,
      happiness: 38,
      energy: 22,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      coins: 4,
      hunger: 54,
      happiness: 38,
      energy: 22,
    });
  });

  it("leaves the saved pet unchanged when food coins are insufficient", async () => {
    const database = makeDatabase("food-rollback");
    await database.pets.add(makePet({ coins: 11, hunger: 40 }));

    await expect(
      buyFoodForStoredPet(
        { petId: "pet-1", foodId: "warm-soup", now },
        database,
      ),
    ).rejects.toThrow(INSUFFICIENT_COINS_ERROR);

    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      coins: 11,
      hunger: 40,
    });
  });
});

function makeDatabase(suffix: string): PetPomodoroDatabase {
  const database = new PetPomodoroDatabase(`petpomodoro-repositories-${suffix}`);
  databases.push(database);
  return database;
}
