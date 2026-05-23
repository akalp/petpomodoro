import { useState } from "react";

import type { Translator } from "../../i18n";
import { isStandaloneDisplayMode, shouldShowIosInstallHint } from "../../pwa/installHints";
import { Card } from "../ui/Card";

interface InstallHintProps {
  t: Translator;
}

export function InstallHint({ t }: InstallHintProps) {
  const [shouldShow] = useState(() =>
    typeof window === "undefined"
      ? false
      : shouldShowIosInstallHint(
          window.navigator.userAgent,
          isStandaloneDisplayMode(),
        ),
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <Card className="border-rose-200 bg-rose-100">
      <p className="text-sm font-semibold text-rose-900">
        {t("installTitle")}
      </p>
      <p className="mt-2 text-sm leading-6 text-rose-900">
        {t("installBody")}
      </p>
    </Card>
  );
}
