import Dexie, { type Table } from "dexie";

import {
  DAILY_FOCUS_GOAL_MINUTES,
  DEFAULT_PET_SPECIES_ID,
  createDailyFocusState,
  defaultPetNameForSpecies,
  rewardDateKeyForSession,
  toLocalDateKey,
} from "../domain";
import type {
  AppSettings,
  DailyFocusState,
  FocusSession,
  PetState,
  RewardLedger,
} from "../domain";

export const DATABASE_NAME = "petpomodoro";

interface RetiredFocusNotificationSettings {
  hasEnabledFocusNotifications?: boolean;
}

interface LegacyShortcutSettings {
  hasInstalledShortcut?: boolean;
  installedShortcutVersion?: number | null;
}

export class PetPomodoroDatabase extends Dexie {
  pets!: Table<PetState, string>;
  sessions!: Table<FocusSession, string>;
  rewardLedger!: Table<RewardLedger, string>;
  settings!: Table<AppSettings, string>;
  dailyFocus!: Table<DailyFocusState, [string, string]>;

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

    this.version(7)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
      })
      .upgrade((transaction) =>
        transaction
          .table("settings")
          .toCollection()
          .modify((settings: Partial<AppSettings>) => {
            settings.motivationalMessages ??= [];
          }),
      );

    this.version(8)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
        dailyFocus: "[petId+dateKey], petId, dateKey, dailyGoalAwarded",
      })
      .upgrade(async (transaction) => {
        const [pets, sessions, rewards] = await Promise.all([
          transaction.table("pets").toArray() as Promise<PetState[]>,
          transaction.table("sessions").toArray() as Promise<FocusSession[]>,
          transaction.table("rewardLedger").toArray() as Promise<RewardLedger[]>,
        ]);
        const sessionsById = new Map(
          sessions.map((session) => [session.id, session]),
        );
        const dailyStates = new Map<string, DailyFocusState>();

        for (const reward of rewards) {
          const session = sessionsById.get(reward.sessionId);
          const dateKey = session
            ? rewardDateKeyForSession(session, reward.createdAt)
            : toLocalDateKey(new Date(reward.createdAt));
          const stateKey = `${reward.petId}:${dateKey}`;
          const dailyState =
            dailyStates.get(stateKey) ??
            createDailyFocusState({ petId: reward.petId, dateKey });

          if (reward.rewardType === "focus_completed" && session) {
            dailyState.completedFocusMinutes += Math.max(
              0,
              session.plannedDurationMinutes ?? 0,
            );
          }

          if (reward.rewardType === "honesty") {
            dailyState.honestyHeartsAwarded += Math.max(
              0,
              reward.honestyHeartsAwarded ?? 0,
            );
          }

          dailyState.dailyGoalAwarded =
            DAILY_FOCUS_GOAL_MINUTES > 0 &&
            dailyState.completedFocusMinutes >= DAILY_FOCUS_GOAL_MINUTES;
          dailyStates.set(stateKey, dailyState);
        }

        if (dailyStates.size > 0) {
          await transaction.table("dailyFocus").bulkPut([...dailyStates.values()]);
        }

        const successfulDaysByPetId = new Map<string, number>();
        for (const dailyState of dailyStates.values()) {
          if (dailyState.dailyGoalAwarded) {
            successfulDaysByPetId.set(
              dailyState.petId,
              (successfulDaysByPetId.get(dailyState.petId) ?? 0) + 1,
            );
          }
        }

        await Promise.all(
          pets.map((pet) =>
            transaction.table("pets").put({
              ...pet,
              streak: successfulDaysByPetId.get(pet.id) ?? 0,
            }),
          ),
        );
      });

    this.version(9)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
        dailyFocus: "[petId+dateKey], petId, dateKey, dailyGoalAwarded",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("pets")
          .toCollection()
          .modify((pet: Partial<PetState>) => {
            pet.lastFreezeUsedAt ??= null;
          });

        await transaction
          .table("dailyFocus")
          .toCollection()
          .modify((dailyFocusState: Partial<DailyFocusState>) => {
            dailyFocusState.streakFreezesUsed ??= 0;
            dailyFocusState.lastStreakFreezeAt ??= null;
          });
      });

    this.version(10)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
        dailyFocus: "[petId+dateKey], petId, dateKey, dailyGoalAwarded",
      })
      .upgrade((transaction) =>
        transaction
          .table("settings")
          .toCollection()
          .modify((settings: RetiredFocusNotificationSettings) => {
            delete settings.hasEnabledFocusNotifications;
          }),
      );

    this.version(11)
      .stores({
        pets: "id, createdAt, updatedAt",
        sessions: "id, status, startedAt, expectedEndAt, rewardClaimedAt",
        rewardLedger: "id, &sessionId, petId, createdAt",
        settings: "id, updatedAt",
        dailyFocus: "[petId+dateKey], petId, dateKey, dailyGoalAwarded",
      })
      .upgrade((transaction) =>
        transaction
          .table("settings")
          .toCollection()
          .modify((settings: LegacyShortcutSettings) => {
            if (settings.installedShortcutVersion === undefined) {
              settings.installedShortcutVersion = settings.hasInstalledShortcut
                ? 1
                : null;
            }

            delete settings.hasInstalledShortcut;
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
