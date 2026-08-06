import { useEffect, useMemo, useState } from "react";

import { AppRoutes } from "./app/AppRoutes";
import { AppShell } from "./app/AppShell";
import { formatCountdown } from "./app/helpers";
import { ErrorNotice } from "./app/ErrorNotice";
import { LoadingCard } from "./app/LoadingCard";
import { useAppBootstrap } from "./app/useAppBootstrap";
import { useAppTimer } from "./app/useAppTimer";
import { useCareNotifications } from "./app/useCareNotifications";
import { usePetHandlers } from "./app/usePetHandlers";
import { usePetMessage } from "./app/usePetMessage";
import { useSessionHandlers } from "./app/useSessionHandlers";
import { AppTopBar } from "./components/layout/AppTopBar";
import { AppUpdatePrompt } from "./components/pwa/AppUpdatePrompt";
import { InstallHint } from "./components/pwa/InstallHint";
import { ShortcutInstallHint } from "./components/pwa/ShortcutInstallHint";
import { RewardModal } from "./components/session/RewardModal";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Sheet } from "./components/ui/Sheet";
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
} from "./i18n";
import {
  isIosOrIpadosDevice,
} from "./pwa/installHints";
import { isNativeApp } from "./platform";
import {
  CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION,
  isCurrentStartNativeTimerShortcutInstalled,
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

const FOCUS_DURATIONS = [...FOCUS_PRESET_DURATION_MINUTES];
const EMPTY_MOTIVATIONAL_MESSAGES: string[] = [];
type AppSheet = "settings" | null;

export function App() {
  const [activeSheet, setActiveSheet] = useState<AppSheet>(null);
  const [selectedDurationOverride, setSelectedDurationOverride] = useState<
    number | null
  >(
    null,
  );

  const { hasHydrated, isInitializing, resetInitialization } = useAppBootstrap();
  const { currentTime, setCurrentTime } = useAppTimer(hasHydrated);

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

  const activeSession = usePomodoroStore((state) => state.activeSession);
  const recentSessions = usePomodoroStore((state) => state.recentSessions);
  const pomodoroError = usePomodoroStore((state) => state.error);
  const isSessionLoading = usePomodoroStore((state) => state.isLoading);

  const settings = useSettingsStore((state) => state.settings);
  const settingsError = useSettingsStore((state) => state.error);
  const saveInstalledShortcutVersion = useSettingsStore(
    (state) => state.setInstalledShortcutVersion,
  );
  const saveLanguage = useSettingsStore((state) => state.setLanguage);
  const uiError = useUiStore((state) => state.error);

  const { handleStart, handleEnd, handleCompleted, handleAbandoned } =
    useSessionHandlers(setCurrentTime);
  const {
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
  } = usePetHandlers({
    onReset: () => setSelectedDurationOverride(null),
    resetInitialization,
  });

  const persistedDuration =
    settings?.preferredDurationMinutes ?? DEFAULT_FOCUS_DURATION_MINUTES;
  const selectedDuration = selectedDurationOverride ?? persistedDuration;
  const installedShortcutVersion = settings?.installedShortcutVersion ?? null;
  const hasInstalledShortcut = isCurrentStartNativeTimerShortcutInstalled(
    installedShortcutVersion,
  );
  const motivationalMessages =
    settings?.motivationalMessages ?? EMPTY_MOTIVATIONAL_MESSAGES;
  const supportsIosFeatures =
    !isNativeApp &&
    typeof window !== "undefined" &&
    isIosOrIpadosDevice(
      window.navigator.userAgent,
      window.navigator.maxTouchPoints,
    );
  const language = settings?.language ?? DEFAULT_LANGUAGE;
  const t = useMemo(() => createTranslator(language), [language]);
  const isFocusActive =
    activeSession?.status === "running" ||
    activeSession?.status === "awaiting_confirmation";
  const petIsSleeping = pet ? isPetSleeping(pet) : false;
  const focusStartEligibility = useMemo(
    () => (pet ? calculateFocusStartEligibility(pet, selectedDuration) : null),
    [pet, selectedDuration],
  );
  const focusNeedsCare =
    !petIsSleeping &&
    focusStartEligibility !== null &&
    !focusStartEligibility.canStart;
  const displayMood = useMemo(
    () =>
      pet
        ? displayMoodForSession(
            pet.mood,
            activeSession?.status ?? null,
            petIsSleeping,
          )
        : null,
    [pet, activeSession?.status, petIsSleeping],
  );
  const sleepPreview = useMemo(
    () =>
      pet && petIsSleeping
        ? previewPetSleep(pet, new Date(currentTime).toISOString())
        : null,
    [pet, petIsSleeping, currentTime],
  );
  const selectedPetMessage = usePetMessage({
    hasHydrated,
    motivationalMessages,
    activeSessionStatus: activeSession?.status ?? null,
    displayMood,
  });
  const petMessage = selectedPetMessage ?? t("petEncouragement");
  useCareNotifications({ pet, activeSession, language, hasHydrated });

  const setPreferredDuration = (duration: number) => {
    setSelectedDurationOverride(duration);
    void updatePreferredDuration(duration).catch(() => undefined);
  };

  const setShortcutInstalled = (isInstalled: boolean) => {
    void saveInstalledShortcutVersion(
      isInstalled ? CURRENT_START_NATIVE_TIMER_SHORTCUT_VERSION : null,
    ).catch(() => undefined);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const isBusy = isInitializing || isSessionLoading || isPetLoading;
  const error = uiError ?? petError ?? pomodoroError ?? settingsError;

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
        durationsDisabled={isBusy || !hasHydrated || petIsSleeping}
        language={language}
        onAbandoned={handleAbandoned}
        onCompleted={handleCompleted}
        onDurationChange={setPreferredDuration}
        onEnd={handleEnd}
        onStart={(duration) => handleStart(duration, petIsSleeping, focusNeedsCare, installedShortcutVersion)}
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
      installHint={isNativeApp ? null : <InstallHint t={t} />}
      isFocusActive={isFocusActive}
      isSleepDisabled={isBusy || !hasHydrated}
      lastEmergencySnackSummary={lastEmergencySnackSummary}
      lastPowerNapSummary={lastPowerNapSummary}
      lastSleepSummary={lastSleepSummary}
      now={new Date(currentTime).toISOString()}
      onClearEmergencySnackSummary={clearLastEmergencySnackSummary}
      onClearPowerNapSummary={clearLastPowerNapSummary}
      onClearSleepSummary={clearLastSleepSummary}
      onEmergencySnack={() => handleEmergencySnack(isFocusActive, petIsSleeping)}
      onPowerNap={() => handlePowerNap(isFocusActive, petIsSleeping)}
      onStartSleep={() => handleStartSleep(isFocusActive)}
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
        onOpenSettings={() => { if (hasHydrated) setActiveSheet("settings"); }}
        t={t}
      />
      {!isNativeApp && <AppUpdatePrompt t={t} />}
      {error ? (
        <ErrorNotice
          message={localizeErrorMessage(error, t)}
          onRetry={!hasHydrated && !isInitializing ? resetInitialization : undefined}
          t={t}
        />
      ) : null}
      {!hasHydrated && isInitializing ? <LoadingCard t={t} /> : null}
      <AppRoutes
        focus={
          <FocusScreen
            focusPanel={focusPanel}
            shortcutInstallHint={
              isNativeApp ? null : (
                <ShortcutInstallHint
                  installedShortcutVersion={installedShortcutVersion}
                  onConfirmInstalledShortcut={() => setShortcutInstalled(true)}
                  t={t}
                />
              )
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
        onClose={() => setActiveSheet(null)}
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
          onResetLocalData={() => handleResetLocalData(t, language)}
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
