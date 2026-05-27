import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { AppRoutes } from "./app/AppRoutes";
import { AppShell } from "./app/AppShell";
import { AppTopBar } from "./components/layout/AppTopBar";
import { InstallHint } from "./components/pwa/InstallHint";
import { ShortcutInstallHint } from "./components/pwa/ShortcutInstallHint";
import { RewardModal } from "./components/session/RewardModal";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Sheet } from "./components/ui/Sheet";
import { resetLocalData } from "./db";
import {
  calculateFocusStartEligibility,
  DEFAULT_FOCUS_DURATION_MINUTES,
  displayMoodForSession,
  FOCUS_PRESET_DURATION_MINUTES,
  isPetSleeping,
  previewPetSleep,
} from "./domain";
import {
  createTranslator,
  DEFAULT_LANGUAGE,
  localizeErrorMessage,
  type Translator,
} from "./i18n";
import {
  isIosOrIpadosDevice,
  isStandaloneDisplayMode,
} from "./pwa/installHints";
import {
  buildStartNativeTimerShortcutUrl,
  shouldRunStartNativeTimerShortcut,
} from "./pwa/shortcuts";
import {
  FocusBalanceStatus,
  FocusStartNotice,
} from "./features/focus/FocusBalanceStatus";
import { FocusScreen } from "./features/focus/FocusScreen";
import { FocusSessionSwitcher } from "./features/focus/FocusSessionSwitcher";
import { JournalScreen } from "./features/journal/JournalScreen";
import { PetScreen } from "./features/pet/PetScreen";
import { ShopScreen } from "./features/shop/ShopScreen";
import {
  usePetStore,
  usePomodoroStore,
  useSettingsStore,
  useUiStore,
} from "./stores";

let appInitialization: Promise<void> | null = null;
const FOCUS_DURATIONS = [...FOCUS_PRESET_DURATION_MINUTES];
const EMPTY_MOTIVATIONAL_MESSAGES: string[] = [];
type AppSheet = "settings" | null;

export function App() {
  const location = useLocation();
  const [activeSheet, setActiveSheet] = useState<AppSheet>(null);
  const [selectedDurationOverride, setSelectedDurationOverride] = useState<
    number | null
  >(
    null,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedPetMessage, setSelectedPetMessage] = useState<string | null>(
    null,
  );
  const petMessageQueue = useRef<string[]>([]);
  const petMessageKey = useRef("");
  const lastPetMessage = useRef<string | null>(null);
  const pet = usePetStore((state) => state.pet);
  const petError = usePetStore((state) => state.error);
  const lastRewardSummary = usePetStore((state) => state.lastRewardSummary);
  const lastFoodPurchase = usePetStore((state) => state.lastFoodPurchase);
  const lastSleepSummary = usePetStore((state) => state.lastSleepSummary);
  const lastPowerNapSummary = usePetStore((state) => state.lastPowerNapSummary);
  const lastEmergencySnackSummary = usePetStore(
    (state) => state.lastEmergencySnackSummary,
  );
  const dailyFocusToday = usePetStore((state) => state.dailyFocusToday);
  const previousDailyFocusState = usePetStore(
    (state) => state.previousDailyFocusState,
  );
  const isPetLoading = usePetStore((state) => state.isLoading);
  const clearLastRewardSummary = usePetStore(
    (state) => state.clearLastRewardSummary,
  );
  const clearLastFoodPurchase = usePetStore(
    (state) => state.clearLastFoodPurchase,
  );
  const clearLastSleepSummary = usePetStore(
    (state) => state.clearLastSleepSummary,
  );
  const clearLastPowerNapSummary = usePetStore(
    (state) => state.clearLastPowerNapSummary,
  );
  const clearLastEmergencySnackSummary = usePetStore(
    (state) => state.clearLastEmergencySnackSummary,
  );
  const buyFood = usePetStore((state) => state.buyFood);
  const applyPowerNapAction = usePetStore((state) => state.usePowerNap);
  const applyEmergencySnackAction = usePetStore(
    (state) => state.useEmergencySnack,
  );
  const applyStreakFreezeAction = usePetStore((state) => state.useStreakFreeze);
  const loadDailyFocusOverview = usePetStore(
    (state) => state.loadDailyFocusOverview,
  );
  const startSleep = usePetStore((state) => state.startSleep);
  const wakeSleep = usePetStore((state) => state.wakeSleep);
  const renamePet = usePetStore((state) => state.renamePet);
  const changeSpecies = usePetStore((state) => state.changeSpecies);
  const updateAppOpenDecay = usePetStore((state) => state.updateAppOpenDecay);
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
  const saveLanguage = useSettingsStore((state) => state.setLanguage);
  const saveMotivationalMessages = useSettingsStore(
    (state) => state.updateMotivationalMessages,
  );
  const clearAfterLocalDataReset = useSettingsStore(
    (state) => state.clearAfterLocalDataReset,
  );
  const hasHydrated = useUiStore((state) => state.hasHydrated);
  const isInitializing = useUiStore((state) => state.isInitializing);
  const uiError = useUiStore((state) => state.error);
  const initializeApp = useUiStore((state) => state.initializeApp);

  const persistedDuration =
    settings?.preferredDurationMinutes ?? DEFAULT_FOCUS_DURATION_MINUTES;
  const selectedDuration = selectedDurationOverride ?? persistedDuration;
  const hasInstalledShortcut = settings?.hasInstalledShortcut ?? false;
  const motivationalMessages =
    settings?.motivationalMessages ?? EMPTY_MOTIVATIONAL_MESSAGES;
  const motivationalMessageKey = motivationalMessages.join("\n");
  const supportsIosFeatures =
    typeof window !== "undefined" &&
    isIosOrIpadosDevice(
      window.navigator.userAgent,
      window.navigator.maxTouchPoints,
    );
  const language = settings?.language ?? DEFAULT_LANGUAGE;
  const t = createTranslator(language);
  const isFocusActive =
    activeSession?.status === "running" ||
    activeSession?.status === "awaiting_confirmation";
  const petIsSleeping = pet ? isPetSleeping(pet) : false;
  const focusStartEligibility = pet
    ? calculateFocusStartEligibility(pet, selectedDuration)
    : null;
  const focusNeedsCare =
    !petIsSleeping &&
    focusStartEligibility !== null &&
    !focusStartEligibility.canStart;
  const displayMood = pet
    ? displayMoodForSession(
        pet.mood,
        activeSession?.status ?? null,
        petIsSleeping,
      )
    : null;
  const sleepPreview =
    pet && petIsSleeping
      ? previewPetSleep(pet, new Date(currentTime).toISOString())
      : null;
  const petMessage = selectedPetMessage ?? t("petEncouragement");

  const setPreferredDuration = (duration: number) => {
    setSelectedDurationOverride(duration);
    void updatePreferredDuration(duration).catch(() => undefined);
  };

  const setShortcutInstalled = (isInstalled: boolean) => {
    void saveShortcutInstalled(isInstalled).catch(() => undefined);
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!hasHydrated || motivationalMessages.length === 0) {
        petMessageQueue.current = [];
        petMessageKey.current = motivationalMessageKey;
        lastPetMessage.current = null;
        setSelectedPetMessage(null);
        return;
      }

      if (petMessageKey.current !== motivationalMessageKey) {
        petMessageQueue.current = [];
        petMessageKey.current = motivationalMessageKey;
      }

      if (petMessageQueue.current.length === 0) {
        petMessageQueue.current = shufflePetMessages(
          motivationalMessages,
          lastPetMessage.current,
        );
      }

      const nextMessage =
        petMessageQueue.current.shift() ?? motivationalMessages[0];
      lastPetMessage.current = nextMessage;
      setSelectedPetMessage(nextMessage);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeSession?.status,
    displayMood,
    hasHydrated,
    location.pathname,
    motivationalMessageKey,
    motivationalMessages,
  ]);

  const refreshSession = useCallback((now = new Date().toISOString()) => {
    void refreshSessionStatus(now)
      .then(() => loadRecentSessions())
      .catch(() => undefined);
  }, [loadRecentSessions, refreshSessionStatus]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const handleFocus = () => {
      const now = new Date().toISOString();
      setCurrentTime(Date.parse(now));
      void updateAppOpenDecay(now)
        .then(() => refreshSession(now))
        .catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = new Date().toISOString();
        setCurrentTime(Date.parse(now));
        void updateAppOpenDecay(now)
          .then(() => refreshSession(now))
          .catch(() => undefined);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasHydrated, refreshSession, updateAppOpenDecay]);

  useEffect(() => {
    if (activeSession?.status !== "running" && !petIsSleeping) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
      if (activeSession?.status === "running") {
        refreshSession();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeSession?.status, petIsSleeping, refreshSession]);

  const isBusy = isInitializing || isSessionLoading || isPetLoading;
  const error = uiError ?? petError ?? pomodoroError ?? settingsError;

  const handleStart = (duration: number) => {
    if (petIsSleeping || focusNeedsCare) {
      return;
    }

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
      .then(() => Promise.all([loadRecentSessions(), loadDailyFocusOverview()]))
      .catch(() => undefined);
  };

  const handleAbandoned = () => {
    void confirmAbandoned()
      .then(() => Promise.all([loadRecentSessions(), loadDailyFocusOverview()]))
      .catch(() => undefined);
  };

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

  const handleStartSleep = () => {
    if (isFocusActive) {
      return;
    }

    void startSleep().catch(() => undefined);
  };

  const handlePowerNap = () => {
    if (isFocusActive || petIsSleeping) {
      return;
    }

    void applyPowerNapAction()
      .then(() => loadDailyFocusOverview())
      .catch(() => undefined);
  };

  const handleEmergencySnack = () => {
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

  const openSettings = () => {
    if (hasHydrated) {
      setActiveSheet("settings");
    }
  };

  const closeSheet = () => setActiveSheet(null);

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
        setSelectedDurationOverride(null);
        useUiStore.setState({
          error: null,
          hasHydrated: false,
          isInitializing: false,
        });
        setSelectedPetMessage(null);
        petMessageQueue.current = [];
        lastPetMessage.current = null;
        appInitialization = initializeApp();
        return appInitialization.then(() => loadRecentSessions());
      })
      .catch(() => undefined);
  };

  const focusPanel = (
    <>
      <FocusSessionSwitcher
        activeSession={activeSession}
        countdownLabel={
          activeSession?.status === "running"
            ? formatCountdown(activeSession.expectedEndAt, currentTime)
            : null
        }
        disabled={isBusy}
        durations={FOCUS_DURATIONS}
        language={language}
        onAbandoned={handleAbandoned}
        onCompleted={handleCompleted}
        onDurationChange={setPreferredDuration}
        onEnd={handleEnd}
        onStart={handleStart}
        selectedDuration={selectedDuration}
        startDisabled={isBusy || !hasHydrated || petIsSleeping || focusNeedsCare}
        startNotice={
          <FocusStartNotice
            focusStartEligibility={focusStartEligibility}
            isPetSleeping={petIsSleeping}
            pet={pet}
            t={t}
          />
        }
        t={t}
      />
      <FocusBalanceStatus
        dailyFocusToday={dailyFocusToday}
        disabled={isBusy || !hasHydrated}
        now={new Date(currentTime).toISOString()}
        onStreakFreeze={handleStreakFreeze}
        pet={pet}
        previousDailyFocusState={previousDailyFocusState}
        t={t}
      />
    </>
  );
  const petScreen = (
    <PetScreen
      displayMood={displayMood}
      dailyFocusToday={dailyFocusToday}
      installHint={<InstallHint t={t} />}
      isFocusActive={isFocusActive}
      isSleepDisabled={isBusy || !hasHydrated}
      lastEmergencySnackSummary={lastEmergencySnackSummary}
      lastPowerNapSummary={lastPowerNapSummary}
      lastSleepSummary={lastSleepSummary}
      onClearEmergencySnackSummary={clearLastEmergencySnackSummary}
      onClearPowerNapSummary={clearLastPowerNapSummary}
      onClearSleepSummary={clearLastSleepSummary}
      onEmergencySnack={handleEmergencySnack}
      onPowerNap={handlePowerNap}
      onStartSleep={handleStartSleep}
      onWakeSleep={handleWakeSleep}
      pet={pet}
      petMessage={petMessage}
      sleepPreview={sleepPreview}
      t={t}
    />
  );
  const journalScreen = (
    <JournalScreen
      isLoading={isBusy && hasHydrated}
      language={language}
      sessions={recentSessions}
      t={t}
    />
  );

  return (
    <AppShell t={t}>
      <AppTopBar
        isSettingsDisabled={!hasHydrated}
        onOpenSettings={openSettings}
        t={t}
      />
      {error ? <ErrorNotice message={localizeErrorMessage(error, t)} t={t} /> : null}
      {!hasHydrated && isInitializing ? <LoadingCard t={t} /> : null}
      <AppRoutes
        focus={
          <FocusScreen
            focusPanel={focusPanel}
            shortcutInstallHint={
              <ShortcutInstallHint
                hasInstalledShortcut={hasInstalledShortcut}
                onInstallShortcut={() => setShortcutInstalled(true)}
                t={t}
              />
            }
          />
        }
        journal={journalScreen}
        pet={petScreen}
        shop={
          <ShopScreen
            disabled={isBusy || !hasHydrated || isFocusActive || petIsSleeping}
            isFocusActive={isFocusActive}
            isPetSleeping={petIsSleeping}
            lastFoodPurchase={lastFoodPurchase}
            onBuyFood={handleBuyFood}
            onClearPurchase={clearLastFoodPurchase}
            pet={pet}
            t={t}
          />
        }
      />
      {lastRewardSummary ? (
        <RewardModal
          onClose={clearLastRewardSummary}
          summary={lastRewardSummary}
          t={t}
        />
      ) : null}
      <Sheet
        closeLabel={t("close")}
        description={t("settingsSupport")}
        isOpen={activeSheet === "settings"}
        onClose={closeSheet}
        title={t("settings")}
      >
        <SettingsPanel
          disabled={isBusy || !hasHydrated}
          framed={false}
          hasInstalledShortcut={hasInstalledShortcut}
          language={language}
          motivationalMessages={motivationalMessages}
          onLanguageChange={(nextLanguage) => {
            void saveLanguage(nextLanguage).catch(() => undefined);
          }}
          onMotivationalMessagesSave={handleMotivationalMessagesSave}
          onPetNameSave={handlePetNameSave}
          onSelectSpecies={handleSpeciesSelection}
          onResetLocalData={handleResetLocalData}
          onShortcutInstalledChange={setShortcutInstalled}
          pet={pet}
          showHeader={false}
          supportsIosFeatures={supportsIosFeatures}
          t={t}
        />
      </Sheet>
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
      window.navigator.maxTouchPoints,
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

function shufflePetMessages(
  messages: string[],
  previousMessage: string | null,
): string[] {
  const shuffledMessages = [...messages];

  for (let index = shuffledMessages.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledMessages[index], shuffledMessages[swapIndex]] = [
      shuffledMessages[swapIndex],
      shuffledMessages[index],
    ];
  }

  if (shuffledMessages.length > 1 && shuffledMessages[0] === previousMessage) {
    [shuffledMessages[0], shuffledMessages[1]] = [
      shuffledMessages[1],
      shuffledMessages[0],
    ];
  }

  return shuffledMessages;
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
