import type { ReactNode } from "react";

import { AwaitingConfirmationScreen } from "../../components/session/AwaitingConfirmationScreen";
import { PomodoroStartPanel } from "../../components/session/PomodoroStartPanel";
import { RunningSessionScreen } from "../../components/session/RunningSessionScreen";
import type { FocusSession } from "../../domain";
import type { SupportedLanguage, Translator } from "../../i18n";

interface FocusSessionSwitcherProps {
  activeSession: FocusSession | null;
  countdownLabel: string | null;
  disabled: boolean;
  durations: number[];
  language: SupportedLanguage;
  onAbandoned: () => void;
  onCompleted: () => void;
  onDurationChange: (duration: number) => void;
  onEnd: () => void;
  onStart: (duration: number) => void;
  selectedDuration: number;
  startDisabled: boolean;
  startNotice?: ReactNode;
  t: Translator;
}

export function FocusSessionSwitcher({
  activeSession,
  countdownLabel,
  disabled,
  durations,
  language,
  onAbandoned,
  onCompleted,
  onDurationChange,
  onEnd,
  onStart,
  selectedDuration,
  startDisabled,
  startNotice = null,
  t,
}: FocusSessionSwitcherProps) {
  if (activeSession?.status === "running") {
    return (
      <RunningSessionScreen
        countdownLabel={countdownLabel ?? "0:00"}
        disabled={disabled}
        language={language}
        onEnd={onEnd}
        session={activeSession}
        t={t}
      />
    );
  }

  if (activeSession?.status === "awaiting_confirmation") {
    return (
      <AwaitingConfirmationScreen
        disabled={disabled}
        onAbandoned={onAbandoned}
        onCompleted={onCompleted}
        session={activeSession}
        t={t}
      />
    );
  }

  return (
    <PomodoroStartPanel
      disabled={startDisabled}
      durations={durations}
      onDurationChange={onDurationChange}
      onStart={onStart}
      selectedDuration={selectedDuration}
      startNotice={startNotice}
      t={t}
    />
  );
}
