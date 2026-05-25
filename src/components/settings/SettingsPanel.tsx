import { useState } from "react";

import type { PetSpeciesId, PetState, SupportedLanguage } from "../../domain";
import { PetSpeciesSelector } from "../../features/pet/PetSpeciesSelector";
import { PET_SPECIES_REGISTRY } from "../../features/pet/petSpeciesRegistry";
import type { Translator } from "../../i18n";
import type { LocalNotificationPermission } from "../../pwa/notifications";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SettingsPanelProps {
  disabled?: boolean;
  framed?: boolean;
  hasEnabledFocusNotifications: boolean;
  hasInstalledShortcut: boolean;
  notificationNotice: "unavailable" | "off" | null;
  notificationPermission: LocalNotificationPermission;
  onFocusNotificationsChange: (hasEnabledFocusNotifications: boolean) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onPetNameSave: (name: string) => void;
  onSelectSpecies: (speciesId: PetSpeciesId) => void;
  onResetLocalData: () => void;
  onShortcutInstalledChange: (hasInstalledShortcut: boolean) => void;
  pet: PetState | null;
  showHeader?: boolean;
  supportsIosFeatures: boolean;
  language: SupportedLanguage;
  t: Translator;
}

export function SettingsPanel({
  disabled = false,
  framed = true,
  hasEnabledFocusNotifications,
  hasInstalledShortcut,
  notificationNotice,
  notificationPermission,
  onFocusNotificationsChange,
  onLanguageChange,
  onPetNameSave,
  onSelectSpecies,
  onResetLocalData,
  onShortcutInstalledChange,
  pet,
  showHeader = true,
  supportsIosFeatures,
  language,
  t,
}: SettingsPanelProps) {
  const [resetArmed, setResetArmed] = useState(false);

  const content = (
    <>
      {showHeader ? (
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{t("settings")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t("settingsSupport")}
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          className="block text-sm font-semibold text-slate-700"
          htmlFor="language"
        >
          {t("language")}
        </label>
        <p className="text-sm leading-6 text-slate-600">{t("languageSupport")}</p>
        <select
          className="min-h-12 w-full rounded-lg border border-rose-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          disabled={disabled}
          id="language"
          onChange={(event) =>
            onLanguageChange(event.target.value as SupportedLanguage)
          }
          value={language}
        >
          <option value="en">{t("english")}</option>
          <option value="tr">{t("turkish")}</option>
        </select>
      </div>

      {pet ? (
        <PetSpeciesSelector
          disabled={disabled}
          onSelectSpecies={onSelectSpecies}
          pet={pet}
          t={t}
        />
      ) : null}

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onPetNameSave(String(formData.get("petName") ?? ""));
        }}
      >
        <label
          className="text-sm font-semibold text-slate-700"
          htmlFor="pet-name"
        >
          {t("petName")}
        </label>
        <p className="text-sm leading-6 text-slate-600">
          {t("petNameSupport")}
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="min-h-12 rounded-lg border border-rose-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            disabled={disabled || !pet}
            id="pet-name"
            key={`${pet?.speciesId ?? "pet"}:${pet?.customName ?? ""}`}
            maxLength={24}
            name="petName"
            placeholder={
              pet ? t(PET_SPECIES_REGISTRY[pet.speciesId].nameKey) : "Momo"
            }
            defaultValue={pet?.customName ?? ""}
          />
          <Button disabled={disabled || !pet} type="submit" variant="secondary">
            {t("save")}
          </Button>
        </div>
      </form>

      {supportsIosFeatures ? (
        <>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t("shortcutTitle")}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("shortcutSettingsSupport")}
            </p>
            <label className="mt-3 flex min-h-12 items-center gap-3 text-sm font-medium text-slate-700">
              <input
                checked={hasInstalledShortcut}
                className="h-5 w-5 accent-teal-600"
                disabled={disabled}
                onChange={(event) =>
                  onShortcutInstalledChange(event.target.checked)
                }
                type="checkbox"
              />
              {t("installedShortcut")}
            </label>
          </div>

          <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{t("remindersTitle")}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("remindersSupport")}
            </p>
            <label className="mt-3 flex min-h-12 items-center gap-3 text-sm font-medium text-slate-700">
              <input
                checked={hasEnabledFocusNotifications}
                className="h-5 w-5 accent-sky-600"
                disabled={disabled}
                onChange={(event) =>
                  onFocusNotificationsChange(event.target.checked)
                }
                type="checkbox"
              />
              {t("notifyAtEnd")}
            </label>
            {notificationNotice ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {notificationNotice === "unavailable"
                  ? t("notificationsUnavailable")
                  : t("notificationsOff")}
              </p>
            ) : hasEnabledFocusNotifications && notificationPermission === "granted" ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t("remindersOn")}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">{t("resetTitle")}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {t("resetSupport")}
        </p>
        <label className="mt-3 flex min-h-12 items-center gap-3 text-sm font-medium text-slate-700">
          <input
            checked={resetArmed}
            className="h-5 w-5 accent-rose-600"
            disabled={disabled}
            onChange={(event) => setResetArmed(event.target.checked)}
            type="checkbox"
          />
          {t("resetAcknowledgment")}
        </label>
        <Button
          className="mt-3 w-full"
          disabled={disabled || !resetArmed}
          onClick={onResetLocalData}
          variant="secondary"
        >
          {t("resetDevice")}
        </Button>
      </div>
    </>
  );

  if (!framed) {
    return <div className="space-y-5">{content}</div>;
  }

  return (
    <Card className="space-y-5">
      {content}
    </Card>
  );
}
