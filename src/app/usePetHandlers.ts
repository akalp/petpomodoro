// Pet action handlers follow a fire-and-forget pattern.
// Store actions set error state in Zustand, which surfaces in the
// ErrorNotice banner. We swallow rejected promises to prevent
// unhandled rejection warnings in the UI layer.

import type { Translator } from "../i18n";
import { cancelAllCareNotifications, clearEndNotification } from "../alerts";
import { clearFocusLiveActivity } from "../platform/liveActivity";
import { usePetStore, usePomodoroStore, useSettingsStore, useUiStore } from "../stores";
import { resetLocalData } from "../db";

interface UsePetHandlersOptions {
  onReset?: () => void;
  resetInitialization: () => void;
  initializeApp: () => Promise<void>;
  loadRecentSessions: (limit?: number) => Promise<unknown>;
}

export function usePetHandlers({
  onReset,
  resetInitialization,
  initializeApp,
  loadRecentSessions,
}: UsePetHandlersOptions) {
  const renamePet = usePetStore((state) => state.renamePet);
  const changeSpecies = usePetStore((state) => state.changeSpecies);
  const buyFood = usePetStore((state) => state.buyFood);
  const startSleep = usePetStore((state) => state.startSleep);
  const wakeSleep = usePetStore((state) => state.wakeSleep);
  const applyPowerNapAction = usePetStore((state) => state.usePowerNap);
  const applyEmergencySnackAction = usePetStore((state) => state.useEmergencySnack);
  const applyStreakFreezeAction = usePetStore((state) => state.useStreakFreeze);
  const loadDailyFocusOverview = usePetStore((state) => state.loadDailyFocusOverview);
  const updatePreferredDuration = useSettingsStore((state) => state.updatePreferredDuration);
  const saveMotivationalMessages = useSettingsStore((state) => state.updateMotivationalMessages);
  const clearAfterLocalDataReset = useSettingsStore((state) => state.clearAfterLocalDataReset);

  const handlePetNameSave = (name: string) => {
    void renamePet(name).catch(() => undefined);
  };

  const handleMotivationalMessagesSave = (messages: string[]) => {
    void saveMotivationalMessages(messages).catch(() => undefined);
  };

  const handleSpeciesSelection = (
    speciesId: Parameters<typeof changeSpecies>[0],
  ) => {
    void changeSpecies(speciesId).catch(() => undefined);
  };

  const handleBuyFood = (foodId: Parameters<typeof buyFood>[0]) => {
    void buyFood(foodId).catch(() => undefined);
  };

  const handleStartSleep = (isFocusActive: boolean) => {
    if (isFocusActive) {
      return;
    }

    void startSleep().catch(() => undefined);
  };

  const handlePowerNap = (isFocusActive: boolean, petIsSleeping: boolean) => {
    if (isFocusActive || petIsSleeping) {
      return;
    }

    void applyPowerNapAction()
      .then(() => loadDailyFocusOverview())
      .catch(() => undefined);
  };

  const handleEmergencySnack = (isFocusActive: boolean, petIsSleeping: boolean) => {
    if (isFocusActive || petIsSleeping) {
      return;
    }

    void applyEmergencySnackAction()
      .then(() => loadDailyFocusOverview())
      .catch(() => undefined);
  };

  const handleStreakFreeze = (dateKey: string) => {
    void applyStreakFreezeAction(dateKey)
      .then(() => loadDailyFocusOverview())
      .catch(() => undefined);
  };

  const handleWakeSleep = () => {
    void wakeSleep().catch(() => undefined);
  };

  const handleResetLocalData = (t: Translator) => {
    const shouldReset = window.confirm(
      t("resetConfirmation"),
    );

    if (!shouldReset) {
      return;
    }

    void resetLocalData()
      .then(() => {
        const activeSession = usePomodoroStore.getState().activeSession;
        void cancelAllCareNotifications();
        if (activeSession) {
          void clearEndNotification(activeSession.id);
          void clearFocusLiveActivity(activeSession);
        }
        resetInitialization();
        onReset?.();
        usePetStore.setState({
          error: null,
          isLoading: false,
          lastFoodPurchase: null,
          lastRewardSummary: null,
          lastSleepSummary: null,
          lastPowerNapSummary: null,
          lastEmergencySnackSummary: null,
          dailyFocusToday: null,
          previousDailyFocusState: null,
          pet: null,
        });
        usePomodoroStore.setState({
          activeSession: null,
          error: null,
          isLoading: false,
          recentSessions: [],
        });
        clearAfterLocalDataReset();
        useUiStore.setState({
          error: null,
          hasHydrated: false,
          isInitializing: false,
        });
        return initializeApp().then(() => loadRecentSessions());
      })
      .catch(() => undefined);
  };

  return {
    handlePetNameSave,
    handleMotivationalMessagesSave,
    handleSpeciesSelection,
    handleBuyFood,
    handleStartSleep,
    handlePowerNap,
    handleEmergencySnack,
    handleStreakFreeze,
    handleWakeSleep,
    handleResetLocalData,
    updatePreferredDuration,
  };
}
