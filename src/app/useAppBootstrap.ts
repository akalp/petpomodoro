import { useEffect, useRef } from "react";

import { usePomodoroStore, useUiStore } from "../stores";

let appInitialization: Promise<void> | null = null;

export function useAppBootstrap() {
  const hasHydrated = useUiStore((state) => state.hasHydrated);
  const isInitializing = useUiStore((state) => state.isInitializing);
  const initializeApp = useUiStore((state) => state.initializeApp);
  const loadRecentSessions = usePomodoroStore((state) => state.loadRecentSessions);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    appInitialization ??= initializeApp();

    void appInitialization
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  }, [initializeApp, loadRecentSessions]);

  return { hasHydrated, isInitializing, resetInitialization: () => { appInitialization = null; initializedRef.current = false; } };
}
