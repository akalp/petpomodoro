import "fake-indexeddb/auto";

import Dexie from "dexie";
import { describe, expect, it } from "vitest";

import { makePet, makeReward, makeSession } from "../test/factories";
import { PetPomodoroDatabase } from "./database";

describe("PetPomodoroDatabase", () => {
  it("declares the Phase 2 local persistence schema", () => {
    const database = new PetPomodoroDatabase("petpomodoro-schema-test");

    expect(database.tables.map((table) => table.name).sort()).toEqual([
      "dailyFocus",
      "pets",
      "rewardLedger",
      "sessions",
      "settings",
    ]);

    expect(database.pets.schema.primKey.name).toBe("id");
    expect(indexNames(database.pets)).toEqual(["createdAt", "updatedAt"]);

    expect(database.sessions.schema.primKey.name).toBe("id");
    expect(indexNames(database.sessions)).toEqual([
      "expectedEndAt",
      "rewardClaimedAt",
      "startedAt",
      "status",
    ]);

    expect(database.rewardLedger.schema.primKey.name).toBe("id");
    expect(
      database.rewardLedger.schema.indexes.find(
        (index) => index.name === "sessionId",
      )?.unique,
    ).toBe(true);
    expect(indexNames(database.rewardLedger)).toEqual([
      "createdAt",
      "petId",
      "sessionId",
    ]);
    expect(database.settings.schema.primKey.name).toBe("id");
    expect(indexNames(database.settings)).toEqual(["updatedAt"]);
    expect(database.dailyFocus.schema.primKey.name).toBe("[petId+dateKey]");
    expect(indexNames(database.dailyFocus)).toEqual([
      "dailyGoalAwarded",
      "dateKey",
      "petId",
    ]);

    database.close();
  });

  it("upgrades version 1 sessions without changing existing history", async () => {
    const name = "petpomodoro-upgrade-test";
    const legacy = new Dexie(name);
    legacy.version(1).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
    });
    const legacySession: Record<string, unknown> = { ...makeSession() };
    delete legacySession.abandonmentReason;
    delete legacySession.focusImpactAppliedUntil;
    delete legacySession.focusCoinsAwarded;
    const legacyPet: Record<string, unknown> = { ...makePet() };
    delete legacyPet.lastAppOpenedAt;
    delete legacyPet.sleepStartedAt;
    delete legacyPet.speciesId;
    delete legacyPet.customName;

    await legacy.open();
    await legacy.table("pets").add(legacyPet);
    await legacy.table("sessions").add(legacySession);
    await legacy.table("rewardLedger").add(
      makeReward({
        rewardType: "honesty",
        xpAwarded: 0,
        honestyHeartsAwarded: 1,
      }),
    );
    legacy.close();

    const database = new PetPomodoroDatabase(name);
    await database.open();

    await expect(database.sessions.get("session-1")).resolves.toMatchObject({
      id: "session-1",
      abandonmentReason: null,
      focusImpactAppliedUntil: "2026-05-22T12:00:00.000Z",
      focusCoinsAwarded: 0,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      id: "pet-1",
      speciesId: "momo",
      customName: null,
      lastAppOpenedAt: "2026-05-22T12:00:00.000Z",
      sleepStartedAt: null,
    });
    await expect(database.rewardLedger.get("reward-1")).resolves.toMatchObject({
      rewardType: "honesty",
      honestyHeartsAwarded: 1,
    });
    expect(database.tables.map((table) => table.name)).toContain("settings");
    expect(database.tables.map((table) => table.name)).toContain("dailyFocus");

    await database.delete();
  });

  it("backfills daily focus state and normalizes legacy session-count streaks", async () => {
    const name = "petpomodoro-daily-focus-upgrade-test";
    const legacy = new Dexie(name);
    legacy.version(7).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
      settings: "id, updatedAt",
    });

    await legacy.open();
    await legacy.table("pets").add(makePet({ streak: 3 }));
    await legacy.table("sessions").bulkAdd([
      makeSession({
        id: "session-1",
        plannedDurationMinutes: 5,
        status: "completed",
        expectedEndAt: "2026-05-22T09:05:00.000Z",
        confirmedAt: "2026-05-22T09:06:00.000Z",
        rewardClaimedAt: "2026-05-22T09:06:00.000Z",
      }),
      makeSession({
        id: "session-2",
        plannedDurationMinutes: 20,
        status: "completed",
        expectedEndAt: "2026-05-22T10:20:00.000Z",
        confirmedAt: "2026-05-22T10:21:00.000Z",
        rewardClaimedAt: "2026-05-22T10:21:00.000Z",
      }),
      makeSession({
        id: "session-3",
        plannedDurationMinutes: 25,
        status: "completed",
        expectedEndAt: "2026-05-23T10:25:00.000Z",
        confirmedAt: "2026-05-23T10:26:00.000Z",
        rewardClaimedAt: "2026-05-23T10:26:00.000Z",
      }),
    ]);
    await legacy.table("rewardLedger").bulkAdd([
      makeReward({
        id: "reward-1",
        sessionId: "session-1",
        createdAt: "2026-05-22T09:06:00.000Z",
      }),
      makeReward({
        id: "reward-2",
        sessionId: "session-2",
        createdAt: "2026-05-22T10:21:00.000Z",
      }),
      makeReward({
        id: "reward-3",
        sessionId: "session-3",
        createdAt: "2026-05-23T10:26:00.000Z",
      }),
    ]);
    legacy.close();

    const database = new PetPomodoroDatabase(name);
    await database.open();

    await expect(database.dailyFocus.get(["pet-1", "2026-05-22"])).resolves.toMatchObject({
      completedFocusMinutes: 25,
      dailyGoalAwarded: true,
    });
    await expect(database.dailyFocus.get(["pet-1", "2026-05-23"])).resolves.toMatchObject({
      completedFocusMinutes: 25,
      dailyGoalAwarded: true,
    });
    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      streak: 2,
    });

    await database.delete();
  });

  it("upgrades an unnamed saved Moowi pet to use the Moowi display name", async () => {
    const name = "petpomodoro-custom-name-upgrade-test";
    const legacy = new Dexie(name);
    legacy.version(5).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
      settings: "id, updatedAt",
    });
    const oldMoowi: Record<string, unknown> = {
      ...makePet({ speciesId: "moowi" }),
    };
    delete oldMoowi.customName;

    await legacy.open();
    await legacy.table("pets").add(oldMoowi);
    legacy.close();

    const database = new PetPomodoroDatabase(name);
    await database.open();

    await expect(database.pets.get("pet-1")).resolves.toMatchObject({
      speciesId: "moowi",
      name: "Moowi",
      customName: null,
    });

    await database.delete();
  });

  it("backfills motivational messages for existing settings", async () => {
    const name = "petpomodoro-settings-message-upgrade-test";
    const legacy = new Dexie(name);
    legacy.version(6).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
      settings: "id, updatedAt",
    });
    await legacy.open();
    await legacy.table("settings").add({
      id: "local-settings",
      preferredDurationMinutes: 25,
      hasInstalledShortcut: false,
      hasEnabledFocusNotifications: false,
      language: "en",
      updatedAt: "2026-05-22T12:00:00.000Z",
    });
    legacy.close();

    const database = new PetPomodoroDatabase(name);
    await database.open();

    await expect(database.settings.get("local-settings")).resolves.toMatchObject({
      motivationalMessages: [],
    });

    await database.delete();
  });
});

function indexNames(table: { schema: { indexes: readonly { name: string }[] } }) {
  return table.schema.indexes.map((index) => index.name).sort();
}
