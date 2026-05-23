import { useCallback, useEffect, useRef, useState } from "react";

import { AppShell } from "./components/layout/AppShell";
import { PetDashboard } from "./components/pet/PetDashboard";
import { InstallHint } from "./components/pwa/InstallHint";
import { ShortcutInstallHint } from "./components/pwa/ShortcutInstallHint";
import { AwaitingConfirmationScreen } from "./components/session/AwaitingConfirmationScreen";
import { PomodoroStartPanel } from "./components/session/PomodoroStartPanel";
import { RewardModal } from "./components/session/RewardModal";
import { RunningSessionScreen } from "./components/session/RunningSessionScreen";
import { SessionHistory } from "./components/session/SessionHistory";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { resetLocalData } from "./db";
import { isStandaloneDisplayMode } from "./pwa/installHints";
import {
  getNotificationPermission,
  requestLocalNotificationPermission,
  shouldScheduleFocusNotification,
  showFocusFinishedNotification,
  type LocalNotificationPermission,
} from "./pwa/notifications";
import {
  buildStartNativeTimerShortcutUrl,
  shouldRunStartNativeTimerShortcut,
} from "./pwa/shortcuts";
import { usePetStore, usePomodoroStore, useUiStore } from "./stores";

let appInitialization: Promise<void> | null = null;
const FOCUS_DURATIONS = [5, 15, 25, 50];

export function App() {
  const [selectedDuration, setSelectedDuration] = useState(() =>
    readPreferredDuration(),
  );
  const [hasInstalledShortcut, setHasInstalledShortcut] = useState(() =>
    readHasInstalledShortcut(),
  );
  const [hasEnabledFocusNotifications, setHasEnabledFocusNotifications] =
    useState(() => readHasEnabledFocusNotifications());
  const [notificationPermission, setNotificationPermission] =
    useState<LocalNotificationPermission>(() => getNotificationPermission());
  const [notificationNotice, setNotificationNotice] = useState<string | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const notifiedSessionIds = useRef(new Set<string>());
  const pet = usePetStore((state) => state.pet);
  const petError = usePetStore((state) => state.error);
  const lastRewardSummary = usePetStore((state) => state.lastRewardSummary);
  const clearLastRewardSummary = usePetStore(
    (state) => state.clearLastRewardSummary,
  );
  const renamePet = usePetStore((state) => state.renamePet);
  const activeSession = usePomodoroStore((state) => state.activeSession);
  const recentSessions = usePomodoroStore((state) => state.recentSessions);
  const pomodoroError = usePomodoroStore((state) => state.error);
  const isSessionLoading = usePomodoroStore((state) => state.isLoading);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const startSession = usePomodoroStore((state) => state.startSession);
  const cancelSession = usePomodoroStore((state) => state.cancelSession);
  const refreshSessionStatus = usePomodoroStore(
    (state) => state.refreshSessionStatus,
  );
  const confirmCompleted = usePomodoroStore((state) => state.confirmCompleted);
  const confirmAbandoned = usePomodoroStore((state) => state.confirmAbandoned);
  const hasHydrated = useUiStore((state) => state.hasHydrated);
  const isInitializing = useUiStore((state) => state.isInitializing);
  const uiError = useUiStore((state) => state.error);
  const initializeApp = useUiStore((state) => state.initializeApp);

  const setPreferredDuration = (duration: number) => {
    setSelectedDuration(duration);
    savePreferredDuration(duration);
  };

  const setShortcutInstalled = (isInstalled: boolean) => {
    setHasInstalledShortcut(isInstalled);
    saveHasInstalledShortcut(isInstalled);
  };

  const setFocusNotificationsEnabled = async (isEnabled: boolean) => {
    if (!isEnabled) {
      setHasEnabledFocusNotifications(false);
      saveHasEnabledFocusNotifications(false);
      setNotificationNotice(null);
      setNotificationPermission(getNotificationPermission());
      return;
    }

    const isGranted = await requestLocalNotificationPermission();
    const nextPermission = getNotificationPermission();
    setNotificationPermission(nextPermission);

    if (isGranted) {
      setHasEnabledFocusNotifications(true);
      saveHasEnabledFocusNotifications(true);
      setNotificationNotice(null);
      return;
    }

    setHasEnabledFocusNotifications(false);
    saveHasEnabledFocusNotifications(false);
    setNotificationNotice(
      nextPermission === "unsupported"
        ? "Notifications are not available on this device."
        : "Notifications are off for this device.",
    );
  };

  useEffect(() => {
    appInitialization ??= initializeApp();

    void appInitialization
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  }, [initializeApp, loadRecentSessions]);

  const refreshSession = useCallback(() => {
    void refreshSessionStatus()
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  }, [loadRecentSessions, refreshSessionStatus]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const handleFocus = () => {
      setCurrentTime(Date.now());
      setNotificationPermission(getNotificationPermission());
      refreshSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setCurrentTime(Date.now());
        setNotificationPermission(getNotificationPermission());
        refreshSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasHydrated, refreshSession]);

  useEffect(() => {
    if (activeSession?.status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
      refreshSession();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeSession?.status, refreshSession]);

  useEffect(() => {
    const scheduledSession = activeSession;

    if (
      !shouldScheduleFocusNotification(
        hasEnabledFocusNotifications,
        notificationPermission,
        scheduledSession,
      )
    ) {
      return;
    }

    if (!scheduledSession) {
      return;
    }

    const notificationDelayMs =
      Date.parse(scheduledSession.expectedEndAt) - Date.now();

    if (notificationDelayMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (notifiedSessionIds.current.has(scheduledSession.id)) {
        return;
      }

      notifiedSessionIds.current.add(scheduledSession.id);
      setCurrentTime(Date.now());
      void refreshSessionStatus(scheduledSession.expectedEndAt)
        .then(() => loadRecentSessions())
        .catch(() => undefined);
      showFocusFinishedNotification(scheduledSession.id);
    }, notificationDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeSession,
    hasEnabledFocusNotifications,
    loadRecentSessions,
    notificationPermission,
    refreshSessionStatus,
  ]);

  const isBusy = isInitializing || isSessionLoading;
  const error = uiError ?? petError ?? pomodoroError;

  const handleStart = (duration: number) => {
    setCurrentTime(Date.now());
    void startSession(duration)
      .then((session) => {
        void loadRecentSessions();
        runStartNativeTimerShortcut(
          session.plannedDurationMinutes,
          hasInstalledShortcut,
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
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  };

  const handleAbandoned = () => {
    void confirmAbandoned()
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  };

  const handlePetNameSave = (name: string) => {
    void renamePet(name).catch(() => undefined);
  };

  const handleResetLocalData = () => {
    const shouldReset = window.confirm(
      "Reset the pet, sessions, and rewards saved on this device?",
    );

    if (!shouldReset) {
      return;
    }

    void resetLocalData()
      .then(() => {
        appInitialization = null;
        usePetStore.setState({
          error: null,
          isLoading: false,
          lastRewardSummary: null,
          pet: null,
        });
        usePomodoroStore.setState({
          activeSession: null,
          error: null,
          isLoading: false,
          recentSessions: [],
        });
        useUiStore.setState({
          error: null,
          hasHydrated: false,
          isInitializing: false,
        });
        appInitialization = initializeApp();
        return appInitialization.then(() => loadRecentSessions());
      })
      .catch(() => undefined);
  };

  return (
    <AppShell>
      {error ? <ErrorNotice message={error} /> : null}
      {!hasHydrated && isInitializing ? <LoadingCard /> : null}
      <InstallHint />
      <ShortcutInstallHint
        hasInstalledShortcut={hasInstalledShortcut}
        onInstallShortcut={() => setShortcutInstalled(true)}
      />
      <PetDashboard pet={pet} />
      {activeSession?.status === "running" ? (
        <RunningSessionScreen
          countdownLabel={formatCountdown(activeSession.expectedEndAt, currentTime)}
          disabled={isBusy}
          onEnd={handleEnd}
          session={activeSession}
        />
      ) : activeSession?.status === "awaiting_confirmation" ? (
        <AwaitingConfirmationScreen
          disabled={isBusy}
          onAbandoned={handleAbandoned}
          onCompleted={handleCompleted}
          session={activeSession}
        />
      ) : (
        <PomodoroStartPanel
          disabled={isBusy || !hasHydrated}
          durations={FOCUS_DURATIONS}
          onDurationChange={setPreferredDuration}
          onStart={handleStart}
          selectedDuration={selectedDuration}
        />
      )}
      {lastRewardSummary ? (
        <RewardModal
          onClose={clearLastRewardSummary}
          summary={lastRewardSummary}
        />
      ) : null}
      <SessionHistory isLoading={isBusy && hasHydrated} sessions={recentSessions} />
      <SettingsPanel
        disabled={isBusy || !hasHydrated}
        durations={FOCUS_DURATIONS}
        hasEnabledFocusNotifications={hasEnabledFocusNotifications}
        hasInstalledShortcut={hasInstalledShortcut}
        notificationNotice={notificationNotice}
        notificationPermission={notificationPermission}
        onDurationChange={setPreferredDuration}
        onFocusNotificationsChange={(isEnabled) => {
          void setFocusNotificationsEnabled(isEnabled);
        }}
        onPetNameSave={handlePetNameSave}
        onResetLocalData={handleResetLocalData}
        onShortcutInstalledChange={setShortcutInstalled}
        pet={pet}
        selectedDuration={selectedDuration}
      />
    </AppShell>
  );
}

const PREFERRED_DURATION_KEY = "petpomodoro.preferredDuration";
const HAS_INSTALLED_SHORTCUT_KEY = "petpomodoro.hasInstalledShortcut";
const HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY =
  "petpomodoro.hasEnabledFocusNotifications";

function readPreferredDuration(): number {
  try {
    const savedDuration = Number(
      window.localStorage.getItem(PREFERRED_DURATION_KEY),
    );

    return FOCUS_DURATIONS.includes(savedDuration) ? savedDuration : 25;
  } catch {
    return 25;
  }
}

function savePreferredDuration(duration: number): void {
  try {
    window.localStorage.setItem(PREFERRED_DURATION_KEY, String(duration));
  } catch {
    // IndexedDB holds core app data. This preference can safely fall back to 25m.
  }
}

function readHasInstalledShortcut(): boolean {
  try {
    return window.localStorage.getItem(HAS_INSTALLED_SHORTCUT_KEY) === "true";
  } catch {
    return false;
  }
}

function saveHasInstalledShortcut(isInstalled: boolean): void {
  try {
    window.localStorage.setItem(
      HAS_INSTALLED_SHORTCUT_KEY,
      String(isInstalled),
    );
  } catch {
    // This only controls whether the optional Shortcut hint is shown.
  }
}

function readHasEnabledFocusNotifications(): boolean {
  try {
    return (
      window.localStorage.getItem(HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY) === "true"
    );
  } catch {
    return false;
  }
}

function saveHasEnabledFocusNotifications(isEnabled: boolean): void {
  try {
    window.localStorage.setItem(
      HAS_ENABLED_FOCUS_NOTIFICATIONS_KEY,
      String(isEnabled),
    );
  } catch {
    // This only controls whether optional local reminders are scheduled.
  }
}

function runStartNativeTimerShortcut(
  plannedDurationMinutes: number,
  hasInstalledShortcut: boolean,
): void {
  if (
    !shouldRunStartNativeTimerShortcut(
      window.navigator.userAgent,
      isStandaloneDisplayMode(),
      hasInstalledShortcut,
    )
  ) {
    return;
  }

  window.location.href = buildStartNativeTimerShortcutUrl({
    plannedDurationMinutes,
  });
}

function formatCountdown(expectedEndAt: string, nowMs: number): string {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((Date.parse(expectedEndAt) - nowMs) / 1000),
  );
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function LoadingCard() {
  return (
    <Card className="space-y-3 text-sm leading-6 text-slate-600">
      <div className="h-3 w-24 animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-full animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-rose-100" />
      <p>Your cozy focus companion is getting ready.</p>
    </Card>
  );
}

function ErrorNotice({ message }: { message: string }) {
  const clearUiError = useUiStore((state) => state.clearError);
  const clearPetError = usePetStore((state) => state.clearError);
  const clearPomodoroError = usePomodoroStore((state) => state.clearError);

  const clearErrors = () => {
    clearUiError();
    clearPetError();
    clearPomodoroError();
  };

  return (
    <Card className="border-rose-200 bg-rose-100">
      <p className="text-sm font-semibold text-rose-900">
        Something got in the way.
      </p>
      <p className="mt-2 text-sm leading-6 text-rose-900">{message}</p>
      <p className="mt-2 text-sm leading-6 text-rose-900">
        If local storage is blocked or full, PetPomodoro cannot safely save
        progress. Nothing is sent to a server.
      </p>
      <Button className="mt-4" onClick={clearErrors} variant="secondary">
        Continue
      </Button>
    </Card>
  );
}
