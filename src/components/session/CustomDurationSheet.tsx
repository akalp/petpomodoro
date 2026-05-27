import { CUSTOM_DURATION_ADJUSTMENT_MINUTES } from "../../domain";
import type { Translator } from "../../i18n";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";

interface CustomDurationSheetProps {
  disabled?: boolean;
  draftValue: string;
  durationError: string | null;
  isOpen: boolean;
  onAdjust: (minutes: number) => void;
  onApply: () => void;
  onChange: (value: string) => void;
  onClose: () => void;
  t: Translator;
}

export function CustomDurationSheet({
  disabled = false,
  draftValue,
  durationError,
  isOpen,
  onAdjust,
  onApply,
  onChange,
  onClose,
  t,
}: CustomDurationSheetProps) {
  const actionsDisabled = disabled || durationError !== null;

  return (
    <Sheet
      closeLabel={t("close")}
      description={t("customDurationSupport")}
      isOpen={isOpen}
      onClose={onClose}
      title={t("customDurationTitle")}
    >
      <div className="space-y-5">
        <label
          className="block text-sm font-semibold text-slate-700"
          htmlFor="custom-duration"
        >
          {t("customMinutes")}
        </label>
        <div
          className={[
            "flex min-h-20 items-center rounded-lg border bg-rose-50/60 px-4 transition",
            durationError
              ? "border-rose-400"
              : "border-rose-200 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200",
          ].join(" ")}
        >
          <input
            aria-invalid={durationError !== null}
            className="min-w-0 flex-1 bg-transparent text-center text-4xl font-semibold tabular-nums text-slate-950 outline-none"
            disabled={disabled}
            id="custom-duration"
            inputMode="numeric"
            onChange={(event) => onChange(event.target.value)}
            pattern="[0-9]*"
            type="text"
            value={draftValue}
          />
          <span className="ml-3 text-sm font-semibold text-slate-600">
            {t("durationMinutesUnit")}
          </span>
        </div>
        {durationError ? (
          <p className="text-sm leading-6 text-rose-700">{durationError}</p>
        ) : null}
        <div
          aria-label={t("durationAdjustments")}
          className="grid grid-cols-4 gap-2"
          role="group"
        >
          {CUSTOM_DURATION_ADJUSTMENT_MINUTES.map((adjustment) => (
            <button
              aria-label={
                adjustment === -1
                  ? t("decreaseOneMinute")
                  : adjustment === 1
                    ? t("increaseOneMinute")
                    : adjustment < 0
                  ? t("decreaseMinutes", { minutes: Math.abs(adjustment) })
                  : t("increaseMinutes", { minutes: adjustment })
              }
              className="min-h-12 rounded-lg border border-rose-200 bg-white px-2 text-base font-semibold text-rose-800 transition active:scale-[0.98] disabled:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              disabled={actionsDisabled}
              key={adjustment}
              onClick={() => onAdjust(adjustment)}
              type="button"
            >
              {adjustment > 0 ? `+${adjustment}` : adjustment}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button disabled={disabled} onClick={onClose} variant="secondary">
            {t("cancel")}
          </Button>
          <Button disabled={actionsDisabled} onClick={onApply}>
            {t("useDuration")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
