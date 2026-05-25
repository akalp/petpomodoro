import { useState } from "react";

import {
  MAX_MOTIVATIONAL_MESSAGE_LENGTH,
  MAX_MOTIVATIONAL_MESSAGES,
  type PetSpeciesId,
  type PetState,
  type SupportedLanguage,
} from "../../domain";
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
  onMotivationalMessagesSave: (messages: string[]) => void;
  onPetNameSave: (name: string) => void;
  onSelectSpecies: (speciesId: PetSpeciesId) => void;
  onResetLocalData: () => void;
  onShortcutInstalledChange: (hasInstalledShortcut: boolean) => void;
  pet: PetState | null;
  showHeader?: boolean;
  supportsIosFeatures: boolean;
  language: SupportedLanguage;
  motivationalMessages: string[];
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
  onMotivationalMessagesSave,
  onPetNameSave,
  onSelectSpecies,
  onResetLocalData,
  onShortcutInstalledChange,
  pet,
  showHeader = true,
  supportsIosFeatures,
  language,
  motivationalMessages,
  t,
}: SettingsPanelProps) {
  const [resetArmed, setResetArmed] = useState(false);
  const [messageDrafts, setMessageDrafts] = useState<string[]>(() =>
    motivationalMessages.length > 0 ? motivationalMessages : [""],
  );

  const updateMessageDraft = (index: number, value: string) => {
    setMessageDrafts((drafts) =>
      drafts.map((draft, draftIndex) => (draftIndex === index ? value : draft)),
    );
  };

  const removeMessageDraft = (index: number) => {
    setMessageDrafts((drafts) => {
      const nextDrafts = drafts.filter((_, draftIndex) => draftIndex !== index);
      return nextDrafts.length > 0 ? nextDrafts : [""];
    });
  };

  const addMessageDraft = () => {
    setMessageDrafts((drafts) =>
      drafts.length < MAX_MOTIVATIONAL_MESSAGES ? [...drafts, ""] : drafts,
    );
  };

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

      <section className="space-y-3 rounded-2xl bg-white text-left">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {t("petMessagesTitle")}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t("petMessagesSupport")}
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onMotivationalMessagesSave(messageDrafts);
          }}
        >
          {messageDrafts.map((message, index) => (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              key={index}
            >
              <label className="sr-only" htmlFor={`pet-message-${index}`}>
                {t("petMessageLabel", { number: index + 1 })}
              </label>
              <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200 transition-within:ring-2 transition-within:ring-rose-200">
                <textarea
                  className="min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-transparent bg-slate-50 px-3 py-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-rose-200 focus:bg-white focus:ring-2 focus:ring-rose-100 sm:px-4 sm:placeholder:text-base"
                  disabled={disabled}
                  id={`pet-message-${index}`}
                  maxLength={MAX_MOTIVATIONAL_MESSAGE_LENGTH}
                  onChange={(event) => updateMessageDraft(index, event.target.value)}
                  placeholder={t("petMessagePlaceholder")}
                  rows={2}
                  value={message}
                />
                <button
                  aria-label={t("removePetMessage", { number: index + 1 })}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:text-slate-200 disabled:hover:bg-transparent"
                  disabled={
                    disabled ||
                    (messageDrafts.length === 1 && message.trim().length === 0)
                  }
                  onClick={() => removeMessageDraft(index)}
                  type="button"
                >
                  <TrashIcon />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-end">
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                  {t("petMessageCharacters", {
                    count: message.length,
                    max: MAX_MOTIVATIONAL_MESSAGE_LENGTH,
                  })}
                </span>
              </div>
            </div>
          ))}
          <p className="text-sm leading-6 text-slate-600">
            {t("petMessagesLimit", { max: MAX_MOTIVATIONAL_MESSAGES })}
          </p>
          <div className="grid gap-2">
            <Button
              className="gap-2 rounded-2xl border-rose-100 bg-white shadow-sm"
              disabled={disabled || messageDrafts.length >= MAX_MOTIVATIONAL_MESSAGES}
              onClick={addMessageDraft}
              variant="secondary"
            >
              <PlusIcon />
              {t("addPetMessage")}
            </Button>
            <Button className="gap-2 rounded-2xl shadow-md shadow-rose-200" disabled={disabled} type="submit">
              <CheckIcon />
              {t("savePetMessages")}
            </Button>
          </div>
        </form>
      </section>

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

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
