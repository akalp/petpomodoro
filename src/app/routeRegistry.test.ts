import { describe, expect, it } from "vitest";

import { getRouteForPathname, primaryTabRoutes } from "./routeRegistry";
import { futureRoutePaths, routePaths } from "../routes/routePaths";

describe("route registry", () => {
  it("defines the MVP primary tabs in shell order", () => {
    expect(primaryTabRoutes.map((route) => route.id)).toEqual([
      "home",
      "pet",
      "shop",
      "journal",
    ]);
    expect(primaryTabRoutes.map((route) => route.path)).toEqual([
      routePaths.home,
      routePaths.pet,
      routePaths.shop,
      routePaths.journal,
    ]);
  });

  it("defines icons for every current primary tab", () => {
    expect(
      primaryTabRoutes.map((route) => [route.id, route.icon?.name]),
    ).toEqual([
      ["home", "home"],
      ["pet", "pet"],
      ["shop", "shop"],
      ["journal", "journal"],
    ]);
  });

  it("keeps planned routes out of the primary tab registry", () => {
    const primaryPaths: readonly string[] = primaryTabRoutes.map(
      (route) => route.path,
    );

    expect(futureRoutePaths.games).toBe("/games");
    expect(futureRoutePaths.settings).toBe("/settings");
    expect(primaryPaths).not.toContain(futureRoutePaths.games);
    expect(primaryPaths).not.toContain(futureRoutePaths.settings);
  });

  it("derives a route entry from the current pathname", () => {
    expect(getRouteForPathname("/shop")?.id).toBe("shop");
    expect(getRouteForPathname("/unknown")).toBeNull();
  });
});
