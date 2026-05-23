import type { Translator } from "../../i18n";

interface AppTopBarProps {
  isSettingsDisabled?: boolean;
  isStoreDisabled?: boolean;
  onOpenSettings: () => void;
  onOpenStore: () => void;
  storeDisabledReason?: string;
  t: Translator;
}

export function AppTopBar({
  isSettingsDisabled = false,
  isStoreDisabled = false,
  onOpenSettings,
  onOpenStore,
  storeDisabledReason,
  t,
}: AppTopBarProps) {
  return (
    <header className="rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm shadow-rose-100/70 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-rose-700">PetPomodoro</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {t("topBarSupport")}
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-400 sm:min-w-20"
            disabled={isStoreDisabled}
            onClick={onOpenStore}
            title={isStoreDisabled ? storeDisabledReason : undefined}
            type="button"
          >
            {t("store")}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-100 bg-white px-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-400 sm:min-w-20"
            disabled={isSettingsDisabled}
            onClick={onOpenSettings}
            type="button"
          >
            {t("settings")}
          </button>
        </div>
      </div>
    </header>
  );
}
