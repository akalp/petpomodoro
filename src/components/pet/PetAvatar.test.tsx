import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { PetAvatar } from "./PetAvatar";

describe("PetAvatar", () => {
  it("keeps its mood label while exposing renderer variant hooks", () => {
    const html = renderToStaticMarkup(
      <PetAvatar mood="working" t={createTranslator("en")} />,
    );

    expect(html).toContain('aria-label="Pet mood: Working"');
    expect(html).toContain('data-mood="working"');
    expect(html).toContain('data-species="momo"');
    expect(html).toContain("One gentle step at a time.");
  });

  it("renders the sleeping display mood", () => {
    const html = renderToStaticMarkup(
      <PetAvatar mood="sleeping" t={createTranslator("en")} />,
    );

    expect(html).toContain('aria-label="Pet mood: Sleeping"');
    expect(html).toContain('data-mood="sleeping"');
  });
});
