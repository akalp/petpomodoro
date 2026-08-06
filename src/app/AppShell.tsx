import type { ReactNode } from "react";

import type { Translator } from "../i18n";

import { DesktopSideNav } from "./DesktopSideNav";
import { MobileBottomTabBar } from "./MobileBottomTabBar";

interface AppShellProps {
  children: ReactNode;
  t: Translator;
}

export function AppShell({ children, t }: AppShellProps) {
  return (
    <main className="app-shell min-h-dvh bg-[linear-gradient(180deg,#fff7ed_0%,#fff1f2_48%,#ecfeff_100%)] text-ink-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl gap-5">
        <DesktopSideNav t={t} />
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex w-full max-w-xl flex-col gap-4 pb-28 sm:gap-5 md:pb-4">
            {children}
          </div>
        </div>
      </div>
      <MobileBottomTabBar t={t} />
    </main>
  );
}
