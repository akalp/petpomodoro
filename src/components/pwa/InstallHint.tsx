import { useState } from "react";

import { isStandaloneDisplayMode, shouldShowIosInstallHint } from "../../pwa/installHints";
import { Card } from "../ui/Card";

export function InstallHint() {
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
        For the coziest experience, add PetPomodoro to your Home Screen from Safari.
      </p>
      <p className="mt-2 text-sm leading-6 text-rose-900">
        Open the share menu, then choose Add to Home Screen. After the first load,
        PetPomodoro is designed to keep working offline.
      </p>
    </Card>
  );
}
