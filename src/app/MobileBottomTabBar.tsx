import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";

interface MobileBottomTabBarProps {
  t: Translator;
}

export function MobileBottomTabBar({ t }: MobileBottomTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(244,63,94,0.12)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
        {primaryTabRoutes.map((route) => (
          <NavLink
            className={({ isActive }) =>
              [
                "relative inline-flex min-h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-1 text-xs font-semibold leading-none transition",
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
                    layoutId="mobile-primary-tab"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                ) : null}
                {route.icon ? (
                  <RouteIcon
                    className="relative size-5 shrink-0"
                    name={route.icon.name}
                  />
                ) : null}
                <span className="relative truncate">{t(route.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
