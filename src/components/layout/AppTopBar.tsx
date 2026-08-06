import type { Translator } from "../../i18n";

interface AppTopBarProps {
  isSettingsDisabled?: boolean;
  onOpenSettings: () => void;
  t: Translator;
}

export function AppTopBar({
  isSettingsDisabled = false,
  onOpenSettings,
  t,
}: AppTopBarProps) {
  return (
    <header className="rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm shadow-rose-100/70 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-700">PetPomodoro</p>
          <p className="mt-0.5 text-xs font-medium text-ink-500">
            {t("topBarSupport")}
          </p>
        </div>
        <button
          aria-label={t("settings")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-800 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-ink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          disabled={isSettingsDisabled}
          onClick={onOpenSettings}
          title={t("settings")}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9.7 4.1a2.3 2.3 0 0 1 4.6 0 2.3 2.3 0 0 0 3.3 1.9 2.3 2.3 0 0 1 2.3 4 2.3 2.3 0 0 0 0 3.9 2.3 2.3 0 0 1-2.3 4 2.3 2.3 0 0 0-3.3 1.9 2.3 2.3 0 0 1-4.6 0 2.3 2.3 0 0 0-3.3-1.9 2.3 2.3 0 0 1-2.3-4 2.3 2.3 0 0 0 0-3.9 2.3 2.3 0 0 1 2.3-4 2.3 2.3 0 0 0 3.3-1.9Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
