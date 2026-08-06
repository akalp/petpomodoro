import { NavLink, useLocation } from "react-router-dom";

import type { Translator } from "../i18n";

import { primaryTabRoutes } from "./routeRegistry";
import { RouteIcon } from "./RouteIcon";
import { useActiveTabIndicator } from "./useActiveTabIndicator";

interface DesktopSideNavProps {
  t: Translator;
}

export function DesktopSideNav({ t }: DesktopSideNavProps) {
  const { pathname } = useLocation();
  const activePath =
    primaryTabRoutes.find((route) => route.path === pathname)?.path ??
    primaryTabRoutes[0].path;
  const { activeLinkRef, containerRef, indicatorStyle } =
    useActiveTabIndicator(activePath, "vertical");

  return (
    <aside className="hidden md:block md:w-36 lg:w-52">
      <nav
        aria-label={t("navigationPrimary")}
        className="sticky top-[max(1.25rem,env(safe-area-inset-top))] rounded-lg border border-white/80 bg-white/80 p-2 shadow-sm shadow-rose-100/70 backdrop-blur"
      >
        <div className="relative flex flex-col gap-1" ref={containerRef}>
          <span
            aria-hidden="true"
            className={[
              "ui-tab-indicator ui-tab-indicator--vertical absolute inset-x-0 top-0 rounded-lg bg-rose-100",
              indicatorStyle ? "" : "opacity-0",
            ].join(" ")}
            style={indicatorStyle ?? undefined}
          >
            <span className="absolute inset-y-3 left-1 h-auto w-1 rounded-full bg-rose-500" />
          </span>
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
              ref={route.path === activePath ? activeLinkRef : undefined}
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
