import { useCallback, useEffect, useRef } from "react";

import {
  scheduleEndNotification,
  clearEndNotification,
} from "../alerts";
import {
  isCurrentStartNativeTimerShortcutInstalled,
  shouldRunStartNativeTimerShortcut,
  buildStartNativeTimerShortcutUrl,
} from "../pwa/shortcuts";
import { isStandaloneDisplayMode } from "../pwa/installHints";
import { isNativeApp } from "../platform";
import {
  startFocusLiveActivity,
  endFocusLiveActivity,
  clearFocusLiveActivity,
} from "../platform/liveActivity";
import {
  startLiveActivityTimer,
  stopLiveActivityTimer,
} from "../platform/liveActivityTimer";
import type { LiveActivityTimerHandle } from "../platform/liveActivityTimer";
import { DEFAULT_LANGUAGE } from "../i18n";
import type { SupportedLanguage } from "../i18n";
import { usePomodoroStore, usePetStore, useSettingsStore } from "../stores";

export function useSessionHandlers(
  setCurrentTime: (time: number) => void,
) {
  const liveActivityTimerRef = useRef<LiveActivityTimerHandle | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const startSession = usePomodoroStore((state) => state.startSession);
  const cancelSession = usePomodoroStore((state) => state.cancelSession);
  const confirmCompleted = usePomodoroStore((state) => state.confirmCompleted);
  const confirmAbandoned = usePomodoroStore((state) => state.confirmAbandoned);
  const loadDailyFocusOverview = usePetStore((state) => state.loadDailyFocusOverview);
  const language = useSettingsStore((state) => state.settings?.language ?? DEFAULT_LANGUAGE);

  const stopLiveActivity = useCallback(() => {
    if (liveActivityTimerRef.current) {
      stopLiveActivityTimer(liveActivityTimerRef.current);
      liveActivityTimerRef.current = null;
    }
  }, []);

  const clearExpiryTimeout = useCallback(() => {
    if (expiryTimeoutRef.current !== null) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
  }, []);

  const scheduleExpiryUpdate = useCallback((session: {
    id: string;
    expectedEndAt: string;
  }, nextLanguage: SupportedLanguage) => {
    clearExpiryTimeout();
    const delay = Date.parse(session.expectedEndAt) - Date.now();
    if (delay <= 0) {
      return;
    }
    expiryTimeoutRef.current = setTimeout(() => {
      expiryTimeoutRef.current = null;
      const current = usePomodoroStore.getState().activeSession;
      if (current?.status === "awaiting_confirmation") {
        void clearFocusLiveActivity(current, nextLanguage);
        void clearEndNotification(current.id);
        stopLiveActivity();
      }
    }, delay);
  }, [clearExpiryTimeout, stopLiveActivity]);

  useEffect(() => {
    return () => {
      clearExpiryTimeout();
      stopLiveActivity();
    };
  }, [clearExpiryTimeout, stopLiveActivity]);

  const handleStart = (
    duration: number,
    petIsSleeping: boolean,
    focusNeedsCare: boolean,
    installedShortcutVersion: number | null,
  ) => {
    if (petIsSleeping || focusNeedsCare) {
      return;
    }

    setCurrentTime(Date.now());
    void startSession(duration)
      .then((session) => {
        void loadRecentSessions();
        void scheduleEndNotification(session, language);
        void startFocusLiveActivity(session, language);
        liveActivityTimerRef.current = startLiveActivityTimer(() => {
          return usePomodoroStore.getState().activeSession ?? session;
        }, language);
        scheduleExpiryUpdate(session, language);
        runStartNativeTimerShortcut(
          session.plannedDurationMinutes,
          isCurrentStartNativeTimerShortcutInstalled(installedShortcutVersion),
        );
      })
      .catch(() => undefined);
  };

  const handleEnd = () => {
    void cancelSession()
      .then((session) => {
        void clearEndNotification(session.id);
        void endFocusLiveActivity(session, "abandoned", language);
        clearExpiryTimeout();
        stopLiveActivity();
        return loadRecentSessions();
      })
      .catch(() => undefined);
  };

  const handleCompleted = () => {
    void confirmCompleted()
      .then((session) => {
        void clearEndNotification(session.id);
        void endFocusLiveActivity(session, "completed", language);
        clearExpiryTimeout();
        stopLiveActivity();
        return Promise.all([loadRecentSessions(), loadDailyFocusOverview()]);
      })
      .catch(() => undefined);
  };

  const handleAbandoned = () => {
    void confirmAbandoned()
      .then((session) => {
        void clearEndNotification(session.id);
        void endFocusLiveActivity(session, "abandoned", language);
        clearExpiryTimeout();
        stopLiveActivity();
        return Promise.all([loadRecentSessions(), loadDailyFocusOverview()]);
      })
      .catch(() => undefined);
  };

  return { handleStart, handleEnd, handleCompleted, handleAbandoned };
}

function runStartNativeTimerShortcut(
  plannedDurationMinutes: number,
  hasInstalledShortcut: boolean,
): void {
  if (isNativeApp) {
    return;
  }

  if (
    !shouldRunStartNativeTimerShortcut(
      window.navigator.userAgent,
      isStandaloneDisplayMode(),
      hasInstalledShortcut,
      window.navigator.maxTouchPoints,
    )
  ) {
    return;
  }

  window.location.href = buildStartNativeTimerShortcutUrl({
    plannedDurationMinutes,
  });
}
