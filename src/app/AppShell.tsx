import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";
import type { Translator } from "../i18n";

interface AppShellProps {
  children: ReactNode;
  t: Translator;
}

export function AppShell({ children, t }: AppShellProps) {
  return (
    <main className="app-shell min-h-dvh bg-[linear-gradient(180deg,#fff7ed_0%,#fff1f2_48%,#ecfeff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col gap-4 pb-24 sm:gap-5">
        {children}
      </div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(244,63,94,0.12)] backdrop-blur"
      >
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {primaryTabRoutes.map((route) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "inline-flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold leading-none transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                  isActive
                    ? "bg-rose-100 text-rose-900"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-800",
                ].join(" ")
              }
              end
              key={route.id}
              to={route.path}
            >
              {route.icon ? (
                <RouteIcon className="size-5 shrink-0" name={route.icon.name} />
              ) : null}
              <span>{t(route.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </main>
  );
}
