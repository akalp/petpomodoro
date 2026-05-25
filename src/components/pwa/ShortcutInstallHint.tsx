import {
  isStandaloneDisplayMode,
  shouldShowIosShortcutInstallHint,
} from "../../pwa/installHints";
import type { Translator } from "../../i18n";
import { START_NATIVE_TIMER_SHORTCUT_URL } from "../../pwa/shortcuts";
import { Card } from "../ui/Card";

interface ShortcutInstallHintProps {
  hasInstalledShortcut: boolean;
  onInstallShortcut: () => void;
  t: Translator;
}

export function ShortcutInstallHint({
  hasInstalledShortcut,
  onInstallShortcut,
  t,
}: ShortcutInstallHintProps) {
  const shouldShow =
    typeof window === "undefined"
      ? false
      : shouldShowIosShortcutInstallHint(
          window.navigator.userAgent,
          isStandaloneDisplayMode(),
          hasInstalledShortcut,
          window.navigator.maxTouchPoints,
        );

  if (!shouldShow) {
    return null;
  }

  return (
    <Card className="border-teal-200 bg-teal-50">
      <p className="text-sm font-semibold text-teal-950">
        {t("shortcutInstallTitle")}
      </p>
      <p className="mt-2 text-sm leading-6 text-teal-950">
        {t("shortcutInstallBody")}
      </p>
      <a
        className={[
          "mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 py-3 text-center text-base font-semibold leading-tight transition active:scale-[0.99]",
          "bg-teal-700 text-white shadow-sm shadow-teal-100 hover:bg-teal-800 active:bg-teal-900",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
        ].join(" ")}
        href={START_NATIVE_TIMER_SHORTCUT_URL}
        onClick={onInstallShortcut}
        rel="noreferrer"
        target="_blank"
      >
        {t("installShortcut")}
      </a>
    </Card>
  );
}
