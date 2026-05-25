import type { ReactNode } from "react";

interface FocusScreenProps {
  focusPanel: ReactNode;
  shortcutInstallHint: ReactNode;
}

export function FocusScreen({
  focusPanel,
  shortcutInstallHint,
}: FocusScreenProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      {shortcutInstallHint}
      {focusPanel}
    </section>
  );
}
