import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";

interface DesktopSideNavProps {
  t: Translator;
}

export function DesktopSideNav({ t }: DesktopSideNavProps) {
  return (
    <aside className="hidden md:block md:w-36 lg:w-52">
      <nav
        aria-label="Primary"
        className="sticky top-[max(1.25rem,env(safe-area-inset-top))] rounded-lg border border-white/80 bg-white/80 p-2 shadow-sm shadow-rose-100/70 backdrop-blur"
      >
        <div className="flex flex-col gap-1">
          {primaryTabRoutes.map((route) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "relative inline-flex min-h-14 items-center justify-start gap-3 overflow-hidden rounded-lg px-3 text-sm font-semibold transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                  isActive
                    ? "text-rose-900"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-800",
                ].join(" ")
              }
              end
              key={route.id}
              to={route.path}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      className="absolute inset-0 rounded-lg bg-rose-100"
                      layoutId="desktop-primary-tab"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  ) : null}
                  {route.icon ? (
                    <RouteIcon
                      className="relative size-5 shrink-0"
                      name={route.icon.name}
                    />
                  ) : null}
                  <span className="relative truncate">
                    {t(route.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
