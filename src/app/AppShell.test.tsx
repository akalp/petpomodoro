import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../i18n";
import { routePaths } from "../routes/routePaths";

import { AppShell } from "./AppShell";
import { primaryTabRoutes } from "./routeRegistry";

describe("AppShell", () => {
  it("renders primary navigation from the route registry", () => {
    const t = createTranslator("en");
    const html = renderShell(routePaths.pet);

    for (const route of primaryTabRoutes) {
      expect(html).toContain(`href="${route.path}"`);
      expect(html).toContain(t(route.labelKey));
    }
  });

  it("exposes the active route as the current page", () => {
    const html = renderShell(routePaths.shop);

    expect(html).toMatch(/<a aria-current="page"[^>]*href="\/shop"/);
    expect(html).toContain("Shop");
  });
});

function renderShell(initialEntry: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppShell t={createTranslator("en")}>
        <section>Route content</section>
      </AppShell>
    </MemoryRouter>,
  );
}
