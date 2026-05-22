import type { FocusSession } from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";

const ACTIVE_SESSION_STATUSES = ["running", "awaiting_confirmation"] as const;

export async function createFocusSession(
  session: FocusSession,
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession> {
  await database.sessions.add(session);
  return session;
}

export async function getActiveFocusSession(
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession | undefined> {
  const activeSessions = await database.sessions
    .where("status")
    .anyOf(ACTIVE_SESSION_STATUSES)
    .toArray();

  return activeSessions.sort(compareNewestStartedAt)[0];
}

export async function getRunningFocusSession(
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession | undefined> {
  const runningSessions = await database.sessions
    .where("status")
    .equals("running")
    .toArray();

  return runningSessions.sort(compareNewestStartedAt)[0];
}

export async function getFocusSessionById(
  id: string,
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession | undefined> {
  return database.sessions.get(id);
}

export async function updateFocusSession(
  session: FocusSession,
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession> {
  await database.sessions.put(session);
  return session;
}

export async function listRecentFocusSessions(
  limit = 10,
  database: PetPomodoroDatabase = defaultDb,
): Promise<FocusSession[]> {
  return database.sessions
    .orderBy("startedAt")
    .reverse()
    .limit(limit)
    .toArray();
}

function compareNewestStartedAt(a: FocusSession, b: FocusSession): number {
  return Date.parse(b.startedAt) - Date.parse(a.startedAt);
}

