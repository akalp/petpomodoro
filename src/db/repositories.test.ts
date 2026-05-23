import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import type { AppSettings } from "../domain";
import { makePet, makeReward, makeSession } from "../test/factories";
import { PetPomodoroDatabase } from "./database";
import { claimStoredSessionReward } from "./rewardsRepository";
import { loadOrCreateSettings, updateSettings } from "./settingsRepository";

const databases: PetPomodoroDatabase[] = [];
const now = "2026-05-22T12:31:00.000Z";

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.delete()));
});

describe("Dexie repositories", () => {
  it("creates and updates singleton settings", async () => {
    const database = makeDatabase("settings");
    const created = await loadOrCreateSettings(
      now,
      {
        preferredDurationMinutes: 90,
        hasInstalledShortcut: true,
        hasEnabledFocusNotifications: true,
      },
      database,
    );

    expect(created).toMatchObject({
      id: "local-settings",
      preferredDurationMinutes: 90,
      hasInstalledShortcut: true,
      hasEnabledFocusNotifications: true,
      language: "en",
    });

    const updated = await updateSettings(
      { ...created, preferredDurationMinutes: 45 },
      database,
    );
    await expect(database.settings.get("local-settings")).resolves.toEqual(updated);
  });

  it("adds a default language when loading settings saved before i18n", async () => {
    const database = makeDatabase("legacy-settings-language");
    const legacySettings: Omit<AppSettings, "language"> = {
      id: "local-settings",
      preferredDurationMinutes: 25,
      hasInstalledShortcut: false,
      hasEnabledFocusNotifications: false,
      updatedAt: now,
    };
    await database.settings.add(legacySettings as AppSettings);

    const upgraded = await loadOrCreateSettings(now, {}, database);

    expect(upgraded.language).toBe("en");
    await expect(database.settings.get("local-settings")).resolves.toMatchObject({
      language: "en",
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

    expect(honesty.pet.honestyHearts).toBe(1);
    expect(honesty.reward?.rewardType).toBe("honesty");
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
});

function makeDatabase(suffix: string): PetPomodoroDatabase {
  const database = new PetPomodoroDatabase(`petpomodoro-repositories-${suffix}`);
  databases.push(database);
  return database;
}
