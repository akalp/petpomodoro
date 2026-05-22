import { useEffect } from "react";

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

export function App() {
  const pet = usePetStore((state) => state.pet);
  const petError = usePetStore((state) => state.error);
  const activeSession = usePomodoroStore((state) => state.activeSession);
  const recentSessions = usePomodoroStore((state) => state.recentSessions);
  const pomodoroError = usePomodoroStore((state) => state.error);
  const isSessionLoading = usePomodoroStore((state) => state.isLoading);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const startSession = usePomodoroStore((state) => state.startSession);
  const cancelSession = usePomodoroStore((state) => state.cancelSession);
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

  const isBusy = isInitializing || isSessionLoading;
  const error = uiError ?? petError ?? pomodoroError;

  const handleStart = () => {
    void startSession()
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  };

  const handleEnd = () => {
    void cancelSession()
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
          disabled={isBusy}
          onEnd={handleEnd}
          session={activeSession}
        />
      ) : activeSession?.status === "awaiting_confirmation" ? (
        <AwaitingConfirmationScreen disabled={isBusy} session={activeSession} />
      ) : (
        <PomodoroStartPanel disabled={isBusy || !hasHydrated} onStart={handleStart} />
      )}
      <SessionHistory sessions={recentSessions} />
      <SettingsPanel />
    </AppShell>
  );
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
