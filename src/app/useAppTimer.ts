import { useCallback, useEffect, useState } from "react";

import { clearEndNotification } from "../alerts";
import { usePetStore, usePomodoroStore } from "../stores";
import { clearFocusLiveActivity } from "../platform/liveActivity";

export function useAppTimer(hasHydrated: boolean) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const activeSession = usePomodoroStore((state) => state.activeSession);
  const refreshSessionStatus = usePomodoroStore((state) => state.refreshSessionStatus);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const updateAppOpenDecay = usePetStore((state) => state.updateAppOpenDecay);
  const pet = usePetStore((state) => state.pet);

  const petIsSleeping = pet ? pet.sleepStartedAt !== null : false;

  const refreshSession = useCallback(async (now = new Date().toISOString()) => {
    const session = await refreshSessionStatus(now);
    if (session?.status === "awaiting_confirmation") {
      void clearFocusLiveActivity(session);
      void clearEndNotification(session.id);
    }
    void loadRecentSessions();
  }, [loadRecentSessions, refreshSessionStatus]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const handleFocus = () => {
      const now = new Date().toISOString();
      setCurrentTime(Date.parse(now));
      void updateAppOpenDecay(now)
        .then(() => refreshSession(now))
        .catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = new Date().toISOString();
        setCurrentTime(Date.parse(now));
        void updateAppOpenDecay(now)
          .then(() => refreshSession(now))
          .catch(() => undefined);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasHydrated, refreshSession, updateAppOpenDecay]);

  useEffect(() => {
    if (!hasHydrated || activeSession?.status !== "awaiting_confirmation") {
      return;
    }

    void clearFocusLiveActivity(activeSession);
    void clearEndNotification(activeSession.id);
  }, [activeSession, hasHydrated]);

  useEffect(() => {
    if (activeSession?.status !== "running" && !petIsSleeping) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
      if (activeSession?.status === "running") {
        void refreshSession();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeSession?.status, petIsSleeping, refreshSession]);

  return { currentTime, setCurrentTime };
}
