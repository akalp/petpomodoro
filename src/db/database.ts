import Dexie, { type Table } from "dexie";

import {
  DEFAULT_PET_SPECIES_ID,
  defaultPetNameForSpecies,
} from "../domain";
import type {
  AppSettings,
  FocusSession,
  PetState,
  RewardLedger,
} from "../domain";

export const DATABASE_NAME = "petpomodoro";

export class PetPomodoroDatabase extends Dexie {
  pets!: Table<PetState, string>;
  sessions!: Table<FocusSession, string>;
  rewardLedger!: Table<RewardLedger, string>;
  settings!: Table<AppSettings, string>;

  constructor(name = DATABASE_NAME) {
    super(name);

    this.version(1).stores({
      pets: "id, createdAt, updatedAt",
      sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
      rewardLedger: "id, &sessionId, petId, createdAt",
    });

    this.version(2)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade((transaction) =>
        transaction
          .table("sessions")
          .toCollection()
          .modify((session: Partial<FocusSession>) => {
            session.abandonmentReason ??= null;
          }),
      );

    this.version(3)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("pets")
          .toCollection()
          .modify((pet: Partial<PetState>) => {
            pet.lastAppOpenedAt ??= pet.lastHungerUpdatedAt ?? pet.updatedAt;
          });

        await transaction
          .table("sessions")
          .toCollection()
          .modify((session: Partial<FocusSession>) => {
            session.focusImpactAppliedUntil ??= session.startedAt;
            session.focusCoinsAwarded ??= 0;
          });
      });

    this.version(4)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade((transaction) =>
        transaction
          .table("pets")
          .toCollection()
          .modify((pet: Partial<PetState>) => {
            pet.sleepStartedAt ??= null;
          }),
      );

    this.version(5)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade((transaction) =>
        transaction
          .table("pets")
          .toCollection()
          .modify((pet: Partial<PetState>) => {
            pet.speciesId ??= DEFAULT_PET_SPECIES_ID;
          }),
      );

    this.version(6)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade((transaction) =>
        transaction
          .table("pets")
          .toCollection()
          .modify((pet: Partial<PetState>) => {
            const speciesId = pet.speciesId ?? DEFAULT_PET_SPECIES_ID;
            const legacyDefaultName = defaultPetNameForSpecies(DEFAULT_PET_SPECIES_ID);
            if (pet.customName === undefined) {
              pet.customName =
                pet.name === legacyDefaultName ? null : (pet.name ?? null);
            }
            pet.name =
              pet.customName ?? defaultPetNameForSpecies(speciesId);
          }),
      );
  }
}

export const db = new PetPomodoroDatabase();

export async function resetLocalData(
  database: PetPomodoroDatabase = db,
): Promise<void> {
  await database.delete();
  await database.open();
}
