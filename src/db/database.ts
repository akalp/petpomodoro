import Dexie, { type Table } from "dexie";

import type { FocusSession, PetState, RewardLedger } from "../domain";

export const DATABASE_NAME = "petpomodoro";

export class PetPomodoroDatabase extends Dexie {
  pets!: Table<PetState, string>;
  sessions!: Table<FocusSession, string>;
  rewardLedger!: Table<RewardLedger, string>;

  constructor(name = DATABASE_NAME) {
    super(name);

    this.version(1).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
    });
  }
}

export const db = new PetPomodoroDatabase();

export async function resetLocalData(
  database: PetPomodoroDatabase = db,
): Promise<void> {
  await database.delete();
  await database.open();
}
