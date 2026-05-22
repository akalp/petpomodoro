import { useCallback, useEffect, useState } from "react";

import { AppShell } from "./components/layout/AppShell";
import { PetDashboard } from "./components/pet/PetDashboard";
import { AwaitingConfirmationScreen } from "./components/session/AwaitingConfirmationScreen";
import { PomodoroStartPanel } from "./components/session/PomodoroStartPanel";
import { RunningSessionScreen } from "./components/session/RunningSessionScreen";
import { SessionHistory } from "./components/session/SessionHistory";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { usePetStore, usePomodoroStore, useUiStore } from "./stores";

let appInitialization: Promise<void> | null = null;
const FOCUS_DURATIONS = [5, 15, 25, 50];

export function App() {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const pet = usePetStore((state) => state.pet);
  const petError = usePetStore((state) => state.error);
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
      refreshSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setCurrentTime(Date.now());
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

  const isBusy = isInitializing || isSessionLoading;
  const error = uiError ?? petError ?? pomodoroError;

  const handleStart = (duration: number) => {
    setCurrentTime(Date.now());
    void startSession(duration)
      .then(() => loadRecentSessions())
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

  return (
    <AppShell>
      {error ? <ErrorNotice message={error} /> : null}
      {!hasHydrated && isInitializing ? <LoadingCard /> : null}
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
          onDurationChange={setSelectedDuration}
          onStart={handleStart}
          selectedDuration={selectedDuration}
        />
      )}
      <SessionHistory sessions={recentSessions} />
      <SettingsPanel />
    </AppShell>
  );
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
    <Card className="text-sm leading-6 text-slate-600">
      Your cozy focus companion is getting ready.
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
      <Button className="mt-4" onClick={clearErrors} variant="secondary">
        Continue
      </Button>
    </Card>
  );
}
