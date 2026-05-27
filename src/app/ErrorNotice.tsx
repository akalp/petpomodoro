import type { Translator } from "../i18n";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePetStore, usePomodoroStore, useSettingsStore, useUiStore } from "../stores";

interface ErrorNoticeProps {
  message: string;
  onRetry?: () => void;
  t: Translator;
}

export function ErrorNotice({ message, onRetry, t }: ErrorNoticeProps) {
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
      <div className="mt-4 flex gap-3">
        {onRetry ? (
          <Button onClick={onRetry} variant="primary">
            {t("retry")}
          </Button>
        ) : null}
        <Button onClick={clearErrors} variant="secondary">
          {t("continue")}
        </Button>
      </div>
    </Card>
  );
}
