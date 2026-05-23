import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import {
  DEFAULT_FOCUS_DURATION_MINUTES,
  parseFocusDurationInput,
} from "./domain";
import {
  createTranslator,
  DEFAULT_LANGUAGE,
  localizeErrorMessage,
  type Translator,
} from "./i18n";
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
import {
  usePetStore,
  usePomodoroStore,
  useSettingsStore,
  useUiStore,
} from "./stores";

let appInitialization: Promise<void> | null = null;
const FOCUS_DURATIONS = [5, 15, 25, 50];

export function App() {
  const [customDurationDraft, setCustomDurationDraft] = useState<string | null>(
    null,
  );
  const [isDurationInvalid, setIsDurationInvalid] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<LocalNotificationPermission>(() => getNotificationPermission());
  const [notificationNotice, setNotificationNotice] = useState<
    "unavailable" | "off" | null
  >(
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
  const settings = useSettingsStore((state) => state.settings);
  const settingsError = useSettingsStore((state) => state.error);
  const updatePreferredDuration = useSettingsStore(
    (state) => state.updatePreferredDuration,
  );
  const saveShortcutInstalled = useSettingsStore(
    (state) => state.setShortcutInstalled,
  );
  const saveFocusNotificationsEnabled = useSettingsStore(
    (state) => state.setFocusNotificationsEnabled,
  );
  const saveLanguage = useSettingsStore((state) => state.setLanguage);
  const clearAfterLocalDataReset = useSettingsStore(
    (state) => state.clearAfterLocalDataReset,
  );
  const hasHydrated = useUiStore((state) => state.hasHydrated);
  const isInitializing = useUiStore((state) => state.isInitializing);
  const uiError = useUiStore((state) => state.error);
  const initializeApp = useUiStore((state) => state.initializeApp);

  const persistedDuration =
    settings?.preferredDurationMinutes ?? DEFAULT_FOCUS_DURATION_MINUTES;
  const selectedDuration =
    customDurationDraft === null
      ? persistedDuration
      : (parseFocusDurationInput(customDurationDraft) ?? persistedDuration);
  const hasInstalledShortcut = settings?.hasInstalledShortcut ?? false;
  const hasEnabledFocusNotifications =
    settings?.hasEnabledFocusNotifications ?? false;
  const customDurationInput =
    customDurationDraft ?? String(selectedDuration);
  const language = settings?.language ?? DEFAULT_LANGUAGE;
  const t = createTranslator(language);
  const durationError = isDurationInvalid ? t("durationError") : null;
  const notificationCopy = useMemo(() => {
    const translate = createTranslator(language);

    return {
      body: translate("notificationBody"),
      title: translate("notificationTitle"),
    };
  }, [language]);

  const setPreferredDuration = (duration: number) => {
    setCustomDurationDraft(String(duration));
    setIsDurationInvalid(false);
    void updatePreferredDuration(duration).catch(() => undefined);
  };

  const setShortcutInstalled = (isInstalled: boolean) => {
    void saveShortcutInstalled(isInstalled).catch(() => undefined);
  };

  const setFocusNotificationsEnabled = async (isEnabled: boolean) => {
    if (!isEnabled) {
      await saveFocusNotificationsEnabled(false);
      setNotificationNotice(null);
      setNotificationPermission(getNotificationPermission());
      return;
    }

    const isGranted = await requestLocalNotificationPermission();
    const nextPermission = getNotificationPermission();
    setNotificationPermission(nextPermission);

    if (isGranted) {
      await saveFocusNotificationsEnabled(true);
      setNotificationNotice(null);
      return;
    }

    await saveFocusNotificationsEnabled(false);
    setNotificationNotice(
      nextPermission === "unsupported" ? "unavailable" : "off",
    );
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDurationDraft(value);
    const duration = parseFocusDurationInput(value);

    if (duration === null) {
      setIsDurationInvalid(true);
      return;
    }

    setIsDurationInvalid(false);
  };

  const commitCustomDuration = (value: string) => {
    const duration = parseFocusDurationInput(value);

    if (duration !== null) {
      void updatePreferredDuration(duration).catch(() => undefined);
    }
  };

  useEffect(() => {
    appInitialization ??= initializeApp();

    void appInitialization
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  }, [initializeApp, loadRecentSessions]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
      showFocusFinishedNotification(scheduledSession.id, notificationCopy);
    }, notificationDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeSession,
    hasEnabledFocusNotifications,
    loadRecentSessions,
    notificationPermission,
    notificationCopy,
    refreshSessionStatus,
  ]);

  const isBusy = isInitializing || isSessionLoading;
  const error = uiError ?? petError ?? pomodoroError ?? settingsError;

  const handleStart = (duration: number) => {
    setCurrentTime(Date.now());
    void updatePreferredDuration(duration).catch(() => undefined);
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
      t("resetConfirmation"),
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
        clearAfterLocalDataReset();
        setCustomDurationDraft(null);
        setIsDurationInvalid(false);
        setNotificationNotice(null);
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
      {error ? <ErrorNotice message={localizeErrorMessage(error, t)} t={t} /> : null}
      {!hasHydrated && isInitializing ? <LoadingCard t={t} /> : null}
      <InstallHint t={t} />
      <ShortcutInstallHint
        hasInstalledShortcut={hasInstalledShortcut}
        onInstallShortcut={() => setShortcutInstalled(true)}
        t={t}
      />
      <PetDashboard pet={pet} t={t} />
      {activeSession?.status === "running" ? (
        <RunningSessionScreen
          countdownLabel={formatCountdown(activeSession.expectedEndAt, currentTime)}
          disabled={isBusy}
          language={language}
          onEnd={handleEnd}
          session={activeSession}
          t={t}
        />
      ) : activeSession?.status === "awaiting_confirmation" ? (
        <AwaitingConfirmationScreen
          disabled={isBusy}
          onAbandoned={handleAbandoned}
          onCompleted={handleCompleted}
          session={activeSession}
          t={t}
        />
      ) : (
        <PomodoroStartPanel
          disabled={isBusy || !hasHydrated}
          customDurationInput={customDurationInput}
          durationError={durationError}
          durations={FOCUS_DURATIONS}
          onCustomDurationChange={handleCustomDurationChange}
          onCustomDurationCommit={commitCustomDuration}
          onDurationChange={setPreferredDuration}
          onStart={handleStart}
          selectedDuration={selectedDuration}
          t={t}
        />
      )}
      {lastRewardSummary ? (
        <RewardModal
          onClose={clearLastRewardSummary}
          summary={lastRewardSummary}
          t={t}
        />
      ) : null}
      <SessionHistory
        isLoading={isBusy && hasHydrated}
        language={language}
        sessions={recentSessions}
        t={t}
      />
      <SettingsPanel
        disabled={isBusy || !hasHydrated}
        customDurationInput={customDurationInput}
        durationError={durationError}
        durations={FOCUS_DURATIONS}
        hasEnabledFocusNotifications={hasEnabledFocusNotifications}
        hasInstalledShortcut={hasInstalledShortcut}
        notificationNotice={notificationNotice}
        notificationPermission={notificationPermission}
        language={language}
        onCustomDurationChange={handleCustomDurationChange}
        onCustomDurationCommit={commitCustomDuration}
        onDurationChange={setPreferredDuration}
        onFocusNotificationsChange={(isEnabled) => {
          void setFocusNotificationsEnabled(isEnabled).catch(() => undefined);
        }}
        onLanguageChange={(nextLanguage) => {
          void saveLanguage(nextLanguage).catch(() => undefined);
        }}
        onPetNameSave={handlePetNameSave}
        onResetLocalData={handleResetLocalData}
        onShortcutInstalledChange={setShortcutInstalled}
        pet={pet}
        selectedDuration={selectedDuration}
        t={t}
      />
    </AppShell>
  );
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

function LoadingCard({ t }: { t: Translator }) {
  return (
    <Card className="space-y-3 text-sm leading-6 text-slate-600">
      <div className="h-3 w-24 animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-full animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-rose-100" />
      <p>{t("loading")}</p>
    </Card>
  );
}

function ErrorNotice({ message, t }: { message: string; t: Translator }) {
  const clearUiError = useUiStore((state) => state.clearError);
  const clearPetError = usePetStore((state) => state.clearError);
  const clearPomodoroError = usePomodoroStore((state) => state.clearError);
  const clearSettingsError = useSettingsStore((state) => state.clearError);

  const clearErrors = () => {
    clearUiError();
    clearPetError();
    clearPomodoroError();
    clearSettingsError();
  };

  return (
    <Card className="border-rose-200 bg-rose-100">
      <p className="text-sm font-semibold text-rose-900">
        {t("errorTitle")}
      </p>
      <p className="mt-2 text-sm leading-6 text-rose-900">{message}</p>
      <p className="mt-2 text-sm leading-6 text-rose-900">
        {t("errorStorageSupport")}
      </p>
      <Button className="mt-4" onClick={clearErrors} variant="secondary">
        {t("continue")}
      </Button>
    </Card>
  );
}
