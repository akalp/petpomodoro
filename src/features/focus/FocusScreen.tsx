import type { ReactNode } from "react";

interface FocusScreenProps {
  focusPanel: ReactNode;
  installHint: ReactNode;
  shortcutInstallHint: ReactNode;
}

export function FocusScreen({
  focusPanel,
  installHint,
  shortcutInstallHint,
}: FocusScreenProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      {installHint}
      {shortcutInstallHint}
      {focusPanel}
    </section>
  );
}
