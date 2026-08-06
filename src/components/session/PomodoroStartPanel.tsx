import { useState, type ReactNode } from "react";

import {
  MAX_FOCUS_DURATION_MINUTES,
  MIN_FOCUS_DURATION_MINUTES,
  parseFocusDurationInput,
} from "../../domain";
import type { Translator } from "../../i18n";
import { CustomDurationSheet } from "./CustomDurationSheet";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface PomodoroStartPanelProps {
  disabled?: boolean;
  durations: number[];
  durationsDisabled?: boolean;
  onDurationChange: (duration: number) => void;
  onStart: (duration: number) => void;
  selectedDuration: number;
  startNotice?: ReactNode;
  t: Translator;
}

export function PomodoroStartPanel({
  disabled = false,
  durations,
  durationsDisabled = false,
  onDurationChange,
  onStart,
  selectedDuration,
  startNotice = null,
  t,
}: PomodoroStartPanelProps) {
  const [isCustomSheetOpen, setIsCustomSheetOpen] = useState(false);
  const [customDurationDraft, setCustomDurationDraft] = useState(
    String(selectedDuration),
  );
  const parsedCustomDuration = parseFocusDurationInput(customDurationDraft);
  const durationError =
    parsedCustomDuration === null ? t("durationError") : null;
  const isCustomSelected = !durations.includes(selectedDuration);

  const openCustomSheet = () => {
    setCustomDurationDraft(String(selectedDuration));
    setIsCustomSheetOpen(true);
  };

  const closeCustomSheet = () => {
    setCustomDurationDraft(String(selectedDuration));
    setIsCustomSheetOpen(false);
  };

  const adjustCustomDuration = (adjustment: number) => {
    if (parsedCustomDuration === null) {
      return;
    }

    const adjustedDuration = Math.min(
      MAX_FOCUS_DURATION_MINUTES,
      Math.max(MIN_FOCUS_DURATION_MINUTES, parsedCustomDuration + adjustment),
    );
    setCustomDurationDraft(String(adjustedDuration));
  };

  const applyCustomDuration = () => {
    if (parsedCustomDuration === null) {
      return;
    }

    onDurationChange(parsedCustomDuration);
    setIsCustomSheetOpen(false);
  };

  return (
    <>
      <Card className="space-y-5 border-rose-100 bg-white max-[359px]:p-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950 max-[359px]:text-2xl">
            {t("startTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("startInstructions")}
          </p>
        </div>
        <p className="text-sm leading-6 text-slate-600 max-[359px]:hidden">
          {t("startSupport")}
        </p>
        <div
          aria-label={t("focusDuration")}
          className="space-y-2"
          role="radiogroup"
        >
          <div className="grid grid-cols-4 gap-2">
            {durations.map((duration) => {
              const isSelected = duration === selectedDuration;

              return (
                <button
                  aria-checked={isSelected}
                  className={[
                    "min-h-12 whitespace-nowrap rounded-lg border px-1 text-sm font-semibold transition active:scale-[0.98] min-[360px]:px-2",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                    isSelected
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-rose-200 bg-white text-rose-800",
                  ].join(" ")}
                  disabled={durationsDisabled}
                  key={duration}
                  onClick={() => onDurationChange(duration)}
                  role="radio"
                  type="button"
                >
                  {t("durationShort", { minutes: duration })}
                </button>
              );
            })}
          </div>
          <button
            aria-pressed={isCustomSelected}
            className={[
              "flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-sm font-semibold transition active:scale-[0.99]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
              isCustomSelected
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-rose-200 bg-white text-rose-800",
            ].join(" ")}
            disabled={durationsDisabled}
            onClick={openCustomSheet}
            type="button"
          >
            <span>
              {isCustomSelected
                ? t("customDurationSelected", { minutes: selectedDuration })
                : t("customMinutes")}
            </span>
            <span aria-hidden="true" className="text-base">
              +
            </span>
          </button>
        </div>
        {startNotice}
        <Button
          className="min-h-14 w-full text-lg shadow-md shadow-rose-100"
          disabled={disabled}
          onClick={() => onStart(selectedDuration)}
        >
          {t("startFocus")}
        </Button>
      </Card>
      <CustomDurationSheet
        disabled={disabled}
        draftValue={customDurationDraft}
        durationError={durationError}
        isOpen={isCustomSheetOpen}
        onAdjust={adjustCustomDuration}
        onApply={applyCustomDuration}
        onChange={setCustomDurationDraft}
        onClose={closeCustomSheet}
        t={t}
      />
    </>
  );
}
