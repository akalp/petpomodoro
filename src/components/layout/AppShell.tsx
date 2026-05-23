import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell min-h-dvh bg-[linear-gradient(180deg,#fff7ed_0%,#fff1f2_48%,#ecfeff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4 pb-2 sm:gap-5">
        {children}
      </div>
    </main>
  );
}
