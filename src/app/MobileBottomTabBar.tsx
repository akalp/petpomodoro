import { motion, useReducedMotion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";

interface MobileBottomTabBarProps {
  t: Translator;
}

export function MobileBottomTabBar({ t }: MobileBottomTabBarProps) {
  const { pathname } = useLocation();
  const activeIndex = Math.max(
    primaryTabRoutes.findIndex((route) => route.path === pathname),
    0,
  );
  const shouldReduceMotion = useReducedMotion();
  const selectionTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };
  const indicatorX = `calc(${activeIndex * 100}% + ${activeIndex * 0.5}rem)`;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(244,63,94,0.12)] backdrop-blur md:hidden"
    >
      <div className="relative mx-auto grid max-w-xl grid-cols-4 gap-2">
        <motion.span
          animate={{ x: indicatorX }}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[calc((100%_-_1.5rem)/4)] rounded-lg bg-rose-100"
          initial={false}
          transition={selectionTransition}
        >
          <span className="absolute top-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-rose-500" />
        </motion.span>
        {primaryTabRoutes.map((route) => (
          <NavLink
            className={({ isActive }) =>
              [
                "relative z-10 inline-flex min-h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-1 text-xs font-semibold leading-none transition-colors duration-200",
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
            <span className="relative truncate">{t(route.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
