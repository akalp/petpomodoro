import type { ReactNode } from "react";

interface HomeScreenProps {
  focusPanel: ReactNode;
  installHint: ReactNode;
  petSummary: ReactNode;
  sessionHistory: ReactNode;
  shortcutInstallHint: ReactNode;
}

export function HomeScreen({
  focusPanel,
  installHint,
  petSummary,
  sessionHistory,
  shortcutInstallHint,
}: HomeScreenProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      {installHint}
      {shortcutInstallHint}
      {petSummary}
      {focusPanel}
      {sessionHistory}
    </section>
  );
}
