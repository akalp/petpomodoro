import { useRegisterSW } from "virtual:pwa-register/react";

import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface AppUpdatePromptProps {
  t: Translator;
}

export function AppUpdatePrompt({ t }: AppUpdatePromptProps) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <Card className="border-teal-200 bg-teal-50">
      <p className="text-sm font-semibold text-teal-950">
        {t("appUpdateTitle")}
      </p>
      <p className="mt-2 text-sm leading-6 text-teal-950">
        {t("appUpdateBody")}
      </p>
      <Button
        className="mt-4 w-full bg-teal-700 shadow-sm shadow-teal-100 hover:bg-teal-800 active:bg-teal-900"
        onClick={() => void updateServiceWorker(true)}
      >
        {t("updateNow")}
      </Button>
    </Card>
  );
}
