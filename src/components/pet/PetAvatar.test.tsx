import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { PetAvatar } from "./PetAvatar";

describe("PetAvatar", () => {
  it("keeps its mood label while exposing renderer variant hooks", () => {
    const html = renderToStaticMarkup(
      <PetAvatar
        message="One gentle step at a time."
        mood="working"
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain('aria-label="Pet mood: Working"');
    expect(html).toContain('data-mood="working"');
    expect(html).toContain('data-species="momo"');
    expect(html).toContain('class="pet-art__figure-motion"');
    expect(html).toContain("One gentle step at a time.");
  });

  it("renders the sleeping display mood", () => {
    const html = renderToStaticMarkup(
      <PetAvatar
        message="Rest softly."
        mood="sleeping"
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain('aria-label="Pet mood: Sleeping"');
    expect(html).toContain('data-mood="sleeping"');
  });

  it("renders exhausted care with its distinct accessible label", () => {
    const html = renderToStaticMarkup(
      <PetAvatar
        message="Rest may help."
        mood="exhausted"
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain('aria-label="Pet mood: Exhausted"');
    expect(html).toContain('data-mood="exhausted"');
  });

  it("renders the Moowi species through the shared CSS-art renderer", () => {
    const html = renderToStaticMarkup(
      <PetAvatar
        message="A custom note."
        mood="happy"
        speciesId="moowi"
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain('data-species="moowi"');
    expect(html).toContain('data-mood="happy"');
    expect(html).toContain('class="pet-art__muzzle"');
  });

  it("renders a supplied custom pet message", () => {
    const html = renderToStaticMarkup(
      <PetAvatar
        message="Your tiny focus counts."
        mood="calm"
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Your tiny focus counts.");
  });
});
