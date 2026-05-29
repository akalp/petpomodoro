import {
  isCurrentStartNativeTimerShortcutInstalled,
  shouldRunStartNativeTimerShortcut,
  buildStartNativeTimerShortcutUrl,
} from "../pwa/shortcuts";
import { isStandaloneDisplayMode } from "../pwa/installHints";
import { isNativeApp } from "../platform";
import { usePomodoroStore, usePetStore } from "../stores";

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
        runStartNativeTimerShortcut(
          session.plannedDurationMinutes,
          isCurrentStartNativeTimerShortcutInstalled(installedShortcutVersion),
        );
      })
      .catch(() => undefined);
  };

  const handleEnd = () => {
    void cancelSession()
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  };

  const handleCompleted = () => {
    void confirmCompleted()
      .then(() => Promise.all([loadRecentSessions(), loadDailyFocusOverview()]))
      .catch(() => undefined);
  };

  const handleAbandoned = () => {
    void confirmAbandoned()
      .then(() => Promise.all([loadRecentSessions(), loadDailyFocusOverview()]))
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
