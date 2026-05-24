export const routePaths = {
  pet: "/pet",
  focus: "/focus",
  shop: "/shop",
  journal: "/journal",
} as const;

export const legacyRoutePaths = {
  home: "/home",
} as const;

export const futureRoutePaths = {
  games: "/games",
  settings: "/settings",
} as const;

export type AppRouteId = keyof typeof routePaths;
export type AppRoutePath = (typeof routePaths)[AppRouteId];
export type FutureRouteId = keyof typeof futureRoutePaths;
export type FutureRoutePath = (typeof futureRoutePaths)[FutureRouteId];
