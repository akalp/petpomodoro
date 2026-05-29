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
import { usePomodoroStore, usePetStore } from "../stores";

let liveActivityTimer: LiveActivityTimerHandle | null = null;
let expiryTimeout: ReturnType<typeof setTimeout> | null = null;

export function useSessionHandlers(
  setCurrentTime: (time: number) => void,
) {
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const startSession = usePomodoroStore((state) => state.startSession);
  const cancelSession = usePomodoroStore((state) => state.cancelSession);
  const confirmCompleted = usePomodoroStore((state) => state.confirmCompleted);
  const confirmAbandoned = usePomodoroStore((state) => state.confirmAbandoned);
  const loadDailyFocusOverview = usePetStore((state) => state.loadDailyFocusOverview);

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
        void scheduleEndNotification(session);
        void startFocusLiveActivity(session);
        liveActivityTimer = startLiveActivityTimer(() => {
          return usePomodoroStore.getState().activeSession ?? session;
        });
        scheduleExpiryUpdate(session);
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
        void endFocusLiveActivity(session, "abandoned");
        clearExpiryTimeout();
        if (liveActivityTimer) {
          stopLiveActivityTimer(liveActivityTimer);
          liveActivityTimer = null;
        }
        return loadRecentSessions();
      })
      .catch(() => undefined);
  };

  const handleCompleted = () => {
    void confirmCompleted()
      .then((session) => {
        void clearEndNotification(session.id);
        void endFocusLiveActivity(session, "completed");
        clearExpiryTimeout();
        if (liveActivityTimer) {
          stopLiveActivityTimer(liveActivityTimer);
          liveActivityTimer = null;
        }
        return Promise.all([loadRecentSessions(), loadDailyFocusOverview()]);
      })
      .catch(() => undefined);
  };

  const handleAbandoned = () => {
    void confirmAbandoned()
      .then((session) => {
        void clearEndNotification(session.id);
        void endFocusLiveActivity(session, "abandoned");
        clearExpiryTimeout();
        if (liveActivityTimer) {
          stopLiveActivityTimer(liveActivityTimer);
          liveActivityTimer = null;
        }
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

function clearExpiryTimeout(): void {
  if (expiryTimeout !== null) {
    clearTimeout(expiryTimeout);
    expiryTimeout = null;
  }
}

function scheduleExpiryUpdate(session: {
  id: string;
  expectedEndAt: string;
}): void {
  clearExpiryTimeout();
  const delay = Date.parse(session.expectedEndAt) - Date.now();
  if (delay <= 0) {
    return;
  }
  expiryTimeout = setTimeout(() => {
    expiryTimeout = null;
    const current = usePomodoroStore.getState().activeSession;
    if (current?.status === "awaiting_confirmation") {
      void clearFocusLiveActivity(current);
      void clearEndNotification(current.id);
      if (liveActivityTimer) {
        stopLiveActivityTimer(liveActivityTimer);
        liveActivityTimer = null;
      }
    }
  }, delay);
}
