import { useState } from "react";

import type { PetState, SupportedLanguage } from "../../domain";
import type { Translator } from "../../i18n";
import type { LocalNotificationPermission } from "../../pwa/notifications";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SettingsPanelProps {
  disabled?: boolean;
  durations: number[];
  framed?: boolean;
  hasEnabledFocusNotifications: boolean;
  hasInstalledShortcut: boolean;
  notificationNotice: "unavailable" | "off" | null;
  notificationPermission: LocalNotificationPermission;
  customDurationInput: string;
  durationError: string | null;
  onCustomDurationChange: (value: string) => void;
  onCustomDurationCommit: (value: string) => void;
  onDurationChange: (duration: number) => void;
  onFocusNotificationsChange: (hasEnabledFocusNotifications: boolean) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onPetNameSave: (name: string) => void;
  onResetLocalData: () => void;
  onShortcutInstalledChange: (hasInstalledShortcut: boolean) => void;
  pet: PetState | null;
  selectedDuration: number;
  showHeader?: boolean;
  supportsIosFeatures: boolean;
  language: SupportedLanguage;
  t: Translator;
}

export function SettingsPanel({
  disabled = false,
  durations,
  framed = true,
  hasEnabledFocusNotifications,
  hasInstalledShortcut,
  notificationNotice,
  notificationPermission,
  customDurationInput,
  durationError,
  onCustomDurationChange,
  onCustomDurationCommit,
  onDurationChange,
  onFocusNotificationsChange,
  onLanguageChange,
  onPetNameSave,
  onResetLocalData,
  onShortcutInstalledChange,
  pet,
  selectedDuration,
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
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="min-h-12 rounded-lg border border-rose-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            disabled={disabled || !pet}
            id="pet-name"
            key={pet?.name ?? "pet-name"}
            maxLength={24}
            name="petName"
            placeholder="Momo"
            defaultValue={pet?.name ?? ""}
          />
          <Button disabled={disabled || !pet} type="submit" variant="secondary">
            {t("save")}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          {t("preferredFocusTime")}
        </p>
        <div
          aria-label={t("preferredDurationAria")}
          className="grid grid-cols-4 gap-2"
          role="group"
        >
          {durations.map((duration) => {
            const isSelected = duration === selectedDuration;

            return (
              <button
                aria-pressed={isSelected}
                className={[
                  "min-h-12 rounded-lg border px-2 text-sm font-semibold transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                  isSelected
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-rose-200 bg-white text-slate-700",
                ].join(" ")}
                disabled={disabled}
                key={duration}
                onClick={() => onDurationChange(duration)}
                type="button"
              >
                {t("durationShort", { minutes: duration })}
              </button>
            );
          })}
        </div>
        <label
          className="block text-sm font-semibold text-slate-700"
          htmlFor="settings-custom-duration"
        >
          {t("customMinutes")}
        </label>
        <input
          aria-invalid={durationError !== null}
          className="min-h-12 w-full rounded-lg border border-rose-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          disabled={disabled}
          id="settings-custom-duration"
          inputMode="numeric"
          min={1}
          max={180}
          onBlur={(event) => onCustomDurationCommit(event.currentTarget.value)}
          onChange={(event) => onCustomDurationChange(event.target.value)}
          type="number"
          value={customDurationInput}
        />
        {durationError ? (
          <p className="text-sm leading-6 text-rose-700">{durationError}</p>
        ) : null}
      </div>

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
