import type { MessageKey } from "../i18n";
import {
  routePaths,
  type AppRouteId,
  type AppRoutePath,
} from "../routes/routePaths";

export type RouteIconName = "pet" | "focus" | "shop" | "journal";
export type RouteFeatureStatus = "available" | "planned";

export interface AppRouteRegistryEntry {
  id: AppRouteId;
  path: AppRoutePath;
  labelKey: MessageKey;
  icon?: {
    name: RouteIconName;
  };
  isPrimaryTab: boolean;
  order: number;
  featureStatus: RouteFeatureStatus;
}

export const appRouteRegistry = [
  {
    id: "pet",
    path: routePaths.pet,
    labelKey: "petTab",
    icon: { name: "pet" },
    isPrimaryTab: true,
    order: 10,
    featureStatus: "available",
  },
  {
    id: "focus",
    path: routePaths.focus,
    labelKey: "focusTab",
    icon: { name: "focus" },
    isPrimaryTab: true,
    order: 20,
    featureStatus: "available",
  },
  {
    id: "shop",
    path: routePaths.shop,
    labelKey: "shopTab",
    icon: { name: "shop" },
    isPrimaryTab: true,
    order: 30,
    featureStatus: "available",
  },
  {
    id: "journal",
    path: routePaths.journal,
    labelKey: "journalTab",
    icon: { name: "journal" },
    isPrimaryTab: true,
    order: 40,
    featureStatus: "available",
  },
] as const satisfies readonly AppRouteRegistryEntry[];

export const primaryTabRoutes = appRouteRegistry
  .filter((route) => route.isPrimaryTab)
  .sort((left, right) => left.order - right.order);

export function getRouteForPathname(pathname: string) {
  return appRouteRegistry.find((route) => route.path === pathname) ?? null;
}
