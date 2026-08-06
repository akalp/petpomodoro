import { useEffect } from "react";

import { scheduleCareNotifications } from "../alerts";
import type { FocusSession, PetState } from "../domain";
import type { SupportedLanguage } from "../i18n";

interface UseCareNotificationsOptions {
  pet: PetState | null;
  activeSession: FocusSession | null;
  language: SupportedLanguage;
  hasHydrated: boolean;
}

export function useCareNotifications({
  pet,
  activeSession,
  language,
  hasHydrated,
}: UseCareNotificationsOptions) {
  useEffect(() => {
    if (!hasHydrated || !pet) {
      return;
    }

    void scheduleCareNotifications(pet, activeSession, language).catch(() => undefined);
  }, [activeSession, hasHydrated, pet, language]);
}
