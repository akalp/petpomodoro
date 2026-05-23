import { useState } from "react";

import type { PetState } from "../../domain";
import type { LocalNotificationPermission } from "../../pwa/notifications";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SettingsPanelProps {
  disabled?: boolean;
  durations: number[];
  hasEnabledFocusNotifications: boolean;
  hasInstalledShortcut: boolean;
  notificationNotice: string | null;
  notificationPermission: LocalNotificationPermission;
  onDurationChange: (duration: number) => void;
  onFocusNotificationsChange: (hasEnabledFocusNotifications: boolean) => void;
  onPetNameSave: (name: string) => void;
  onResetLocalData: () => void;
  onShortcutInstalledChange: (hasInstalledShortcut: boolean) => void;
  pet: PetState | null;
  selectedDuration: number;
}

export function SettingsPanel({
  disabled = false,
  durations,
  hasEnabledFocusNotifications,
  hasInstalledShortcut,
  notificationNotice,
  notificationPermission,
  onDurationChange,
  onFocusNotificationsChange,
  onPetNameSave,
  onResetLocalData,
  onShortcutInstalledChange,
  pet,
  selectedDuration,
}: SettingsPanelProps) {
  const [resetArmed, setResetArmed] = useState(false);

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Gentle preferences for this device.
        </p>
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
          Pet name
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
            Save
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Preferred focus time
        </p>
        <div
          aria-label="Preferred Pomodoro duration"
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
                {duration}m
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          iOS Shortcut
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          This only remembers whether this device should hide the Shortcut install
          hint.
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
          I installed shortcut already.
        </label>
      </div>

      <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Local reminders</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          PetPomodoro can send a local reminder if this app is still allowed to
          run when focus time ends.
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
          Notify me when focus time is done.
        </label>
        {notificationNotice ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {notificationNotice}
          </p>
        ) : hasEnabledFocusNotifications && notificationPermission === "granted" ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Local reminders are on for this device.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Reset local data</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          This clears the pet, sessions, and rewards saved on this device.
        </p>
        <label className="mt-3 flex min-h-12 items-center gap-3 text-sm font-medium text-slate-700">
          <input
            checked={resetArmed}
            className="h-5 w-5 accent-rose-600"
            disabled={disabled}
            onChange={(event) => setResetArmed(event.target.checked)}
            type="checkbox"
          />
          I understand this clears local progress.
        </label>
        <Button
          className="mt-3 w-full"
          disabled={disabled || !resetArmed}
          onClick={onResetLocalData}
          variant="secondary"
        >
          Reset this device
        </Button>
      </div>
    </Card>
  );
}
