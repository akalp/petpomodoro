import { SessionHistory } from "../../components/session/SessionHistory";
import type { FocusSession } from "../../domain";
import type { SupportedLanguage, Translator } from "../../i18n";

interface JournalScreenProps {
  isLoading: boolean;
  language: SupportedLanguage;
  sessions: FocusSession[];
  t: Translator;
}

export function JournalScreen({
  isLoading,
  language,
  sessions,
  t,
}: JournalScreenProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <SessionHistory
        isLoading={isLoading}
        language={language}
        sessions={sessions}
        t={t}
      />
    </section>
  );
}
