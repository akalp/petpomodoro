import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import type { FocusSessionStatus, PetDisplayMood } from "../domain";

import { shufflePetMessages } from "./helpers";

interface UsePetMessageOptions {
  hasHydrated: boolean;
  motivationalMessages: string[];
  activeSessionStatus?: FocusSessionStatus | null;
  displayMood?: PetDisplayMood | null;
}

export function usePetMessage({
  hasHydrated,
  motivationalMessages,
  activeSessionStatus,
  displayMood,
}: UsePetMessageOptions) {
  const location = useLocation();
  const [selectedPetMessage, setSelectedPetMessage] = useState<string | null>(null);
  const petMessageQueue = useRef<string[]>([]);
  const petMessageKey = useRef("");
  const lastPetMessage = useRef<string | null>(null);

  const motivationalMessageKey = motivationalMessages.join("\n");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!hasHydrated || motivationalMessages.length === 0) {
        petMessageQueue.current = [];
        petMessageKey.current = motivationalMessageKey;
        lastPetMessage.current = null;
        setSelectedPetMessage(null);
        return;
      }

      if (petMessageKey.current !== motivationalMessageKey) {
        petMessageQueue.current = [];
        petMessageKey.current = motivationalMessageKey;
      }

      if (petMessageQueue.current.length === 0) {
        petMessageQueue.current = shufflePetMessages(
          motivationalMessages,
          lastPetMessage.current,
        );
      }

      const nextMessage =
        petMessageQueue.current.shift() ?? motivationalMessages[0];
      lastPetMessage.current = nextMessage;
      setSelectedPetMessage(nextMessage);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeSessionStatus,
    displayMood,
    hasHydrated,
    location.pathname,
    motivationalMessageKey,
    motivationalMessages,
  ]);

  return selectedPetMessage;
}
