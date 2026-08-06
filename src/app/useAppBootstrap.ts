import { useCallback, useEffect, useRef, useState } from "react";

import { usePomodoroStore, useUiStore } from "../stores";

let appInitialization: Promise<void> | null = null;

export function useAppBootstrap() {
  const hasHydrated = useUiStore((state) => state.hasHydrated);
  const isInitializing = useUiStore((state) => state.isInitializing);
  const initializeApp = useUiStore((state) => state.initializeApp);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const initializedRef = useRef(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    appInitialization ??= initializeApp();

    void appInitialization
      .then(() => loadRecentSessions())
      .catch(() => {
        appInitialization = null;
        initializedRef.current = false;
      });
  }, [attempt, initializeApp, loadRecentSessions]);

  const resetInitialization = useCallback(() => {
    appInitialization = null;
    initializedRef.current = false;
    setAttempt((current) => current + 1);
  }, []);

  return { hasHydrated, isInitializing, resetInitialization };
}
