import { NavLink, useLocation } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";
import { useActiveTabIndicator } from "./useActiveTabIndicator";

interface MobileBottomTabBarProps {
  t: Translator;
}

export function MobileBottomTabBar({ t }: MobileBottomTabBarProps) {
  const { pathname } = useLocation();
  const activePath =
    primaryTabRoutes.find((route) => route.path === pathname)?.path ??
    primaryTabRoutes[0].path;
  const { activeLinkRef, containerRef, indicatorStyle } =
    useActiveTabIndicator(activePath, "horizontal");

  return (
    <nav
      aria-label={t("navigationPrimary")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(244,63,94,0.12)] backdrop-blur md:hidden"
    >
      <div
        className="relative mx-auto grid max-w-xl grid-cols-4 gap-2"
        ref={containerRef}
      >
        <span
          aria-hidden="true"
          className={[
            "ui-tab-indicator ui-tab-indicator--horizontal absolute inset-y-0 left-0 rounded-lg bg-brand-100",
            indicatorStyle ? "" : "opacity-0",
          ].join(" ")}
          style={indicatorStyle ?? undefined}
        >
          <span className="absolute top-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-brand-500" />
        </span>
        {primaryTabRoutes.map((route) => (
          <NavLink
            className={({ isActive }) =>
              [
                "relative z-10 inline-flex min-h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-1 text-xs font-semibold leading-none transition-colors duration-200",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                isActive
                  ? "text-brand-900"
                  : "text-ink-600 hover:bg-brand-50 hover:text-brand-800",
              ].join(" ")
            }
            end
            key={route.id}
            ref={route.path === activePath ? activeLinkRef : undefined}
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
