import { describe, expect, it } from "vitest";

import { PetPomodoroDatabase } from "./database";

describe("PetPomodoroDatabase", () => {
  it("declares the Phase 2 local persistence schema", () => {
    const database = new PetPomodoroDatabase("petpomodoro-schema-test");

    expect(database.tables.map((table) => table.name).sort()).toEqual([
      "pets",
      "rewardLedger",
      "sessions",
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

    database.close();
  });
});

function indexNames(table: { schema: { indexes: readonly { name: string }[] } }) {
  return table.schema.indexes.map((index) => index.name).sort();
}

