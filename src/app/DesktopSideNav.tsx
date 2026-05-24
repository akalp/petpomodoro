import { motion, useReducedMotion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";

interface DesktopSideNavProps {
  t: Translator;
}

export function DesktopSideNav({ t }: DesktopSideNavProps) {
  const { pathname } = useLocation();
  const activeIndex = Math.max(
    primaryTabRoutes.findIndex((route) => route.path === pathname),
    0,
  );
  const shouldReduceMotion = useReducedMotion();
  const selectionTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };
  const indicatorY = `calc(${activeIndex * 100}% + ${activeIndex * 0.25}rem)`;

  return (
    <aside className="hidden md:block md:w-36 lg:w-52">
      <nav
        aria-label="Primary"
        className="sticky top-[max(1.25rem,env(safe-area-inset-top))] rounded-lg border border-white/80 bg-white/80 p-2 shadow-sm shadow-rose-100/70 backdrop-blur"
      >
        <div className="relative flex flex-col gap-1">
          <motion.span
            animate={{ y: indicatorY }}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-14 rounded-lg bg-rose-100"
            initial={false}
            transition={selectionTransition}
          >
            <span className="absolute inset-y-3 left-1 h-auto w-1 rounded-full bg-rose-500" />
          </motion.span>
          {primaryTabRoutes.map((route) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "relative z-10 inline-flex min-h-14 items-center justify-start gap-3 overflow-hidden rounded-lg py-1 pr-3 pl-4 text-sm font-semibold transition-colors duration-200",
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
              {route.icon ? (
                <RouteIcon
                  className="relative size-5 shrink-0"
                  name={route.icon.name}
                />
              ) : null}
              <span className="relative truncate">
                {t(route.labelKey)}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
