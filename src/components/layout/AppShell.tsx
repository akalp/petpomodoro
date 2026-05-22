import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-dvh bg-rose-50 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-5">
        <header className="flex items-center justify-between px-1 pt-2">
          <div>
            <p className="text-sm font-semibold text-rose-700">PetPomodoro</p>
            <p className="mt-1 text-sm text-slate-600">A gentle focus companion</p>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
