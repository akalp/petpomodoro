import "fake-indexeddb/auto";

import Dexie from "dexie";
import { describe, expect, it } from "vitest";

import { makePet, makeReward, makeSession } from "../test/factories";
import { PetPomodoroDatabase } from "./database";

describe("PetPomodoroDatabase", () => {
  it("declares the Phase 2 local persistence schema", () => {
    const database = new PetPomodoroDatabase("petpomodoro-schema-test");

    expect(database.tables.map((table) => table.name).sort()).toEqual([
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
