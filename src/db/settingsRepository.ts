import {
  createDefaultSettings,
  validateFocusDurationMinutes,
  type AppSettings,
} from "../domain";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";

export interface InitialSettingsValues {
  preferredDurationMinutes?: number;
  hasInstalledShortcut?: boolean;
  hasEnabledFocusNotifications?: boolean;
}

export async function getSettings(
  database: PetPomodoroDatabase = defaultDb,
): Promise<AppSettings | undefined> {
  return database.settings.get("local-settings");
}

export async function loadOrCreateSettings(
  now: string,
  initialValues: InitialSettingsValues = {},
  database: PetPomodoroDatabase = defaultDb,
): Promise<AppSettings> {
  const settings = await getSettings(database);

  if (settings) {
    return settings;
  }

  const defaults = createDefaultSettings(now);
  const preferredDurationMinutes =
    initialValues.preferredDurationMinutes === undefined
      ? defaults.preferredDurationMinutes
      : validateFocusDurationMinutes(initialValues.preferredDurationMinutes);
  const created: AppSettings = {
    ...defaults,
    preferredDurationMinutes,
    hasInstalledShortcut:
      initialValues.hasInstalledShortcut ?? defaults.hasInstalledShortcut,
    hasEnabledFocusNotifications:
      initialValues.hasEnabledFocusNotifications ??
      defaults.hasEnabledFocusNotifications,
  };

  await database.settings.add(created);
  return created;
}

export async function updateSettings(
  settings: AppSettings,
  database: PetPomodoroDatabase = defaultDb,
): Promise<AppSettings> {
  validateFocusDurationMinutes(settings.preferredDurationMinutes);
  await database.settings.put(settings);
  return settings;
}
