import {
  createDefaultSettings,
  sanitizeMotivationalMessages,
  validateFocusDurationMinutes,
  type AppSettings,
  type SupportedLanguage,
} from "../domain";
import { normalizeLanguage } from "../i18n";

import { db as defaultDb, type PetPomodoroDatabase } from "./database";

export interface InitialSettingsValues {
  preferredDurationMinutes?: number;
  installedShortcutVersion?: number | null;
  language?: SupportedLanguage;
  motivationalMessages?: string[];
}

interface LegacyShortcutSettings {
  hasInstalledShortcut?: boolean;
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
    const language = normalizeLanguage(settings.language);
    const motivationalMessages = sanitizeMotivationalMessages(
      settings.motivationalMessages ?? [],
    );
    const legacySettings = settings as AppSettings & LegacyShortcutSettings;
    const installedShortcutVersion =
      settings.installedShortcutVersion === undefined
        ? legacySettings.hasInstalledShortcut
          ? 1
          : null
        : settings.installedShortcutVersion;

    if (
      settings.language !== language ||
      settings.installedShortcutVersion !== installedShortcutVersion ||
      legacySettings.hasInstalledShortcut !== undefined ||
      settings.motivationalMessages === undefined ||
      settings.motivationalMessages.length !== motivationalMessages.length ||
      settings.motivationalMessages.some(
        (message, index) => message !== motivationalMessages[index],
      )
    ) {
      const savedSettings = { ...legacySettings };
      delete savedSettings.hasInstalledShortcut;
      const upgradedSettings: AppSettings = {
        ...savedSettings,
        installedShortcutVersion,
        language,
        motivationalMessages,
      };
      await database.settings.put(upgradedSettings);
      return upgradedSettings;
    }

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
    installedShortcutVersion:
      initialValues.installedShortcutVersion ??
      defaults.installedShortcutVersion,
    language: initialValues.language ?? defaults.language,
    motivationalMessages: sanitizeMotivationalMessages(
      initialValues.motivationalMessages ?? defaults.motivationalMessages,
    ),
  };

  await database.settings.add(created);
  return created;
}

export async function updateSettings(
  settings: AppSettings,
  database: PetPomodoroDatabase = defaultDb,
): Promise<AppSettings> {
  validateFocusDurationMinutes(settings.preferredDurationMinutes);
  const normalizedSettings = {
    ...settings,
    language: normalizeLanguage(settings.language),
    motivationalMessages: sanitizeMotivationalMessages(
      settings.motivationalMessages,
    ),
  };
  await database.settings.put(normalizedSettings);
  return normalizedSettings;
}
