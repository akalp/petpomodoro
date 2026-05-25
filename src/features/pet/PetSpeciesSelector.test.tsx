import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { PetSpeciesSelector } from "./PetSpeciesSelector";

describe("PetSpeciesSelector", () => {
  it("renders each available species and identifies the current choice", () => {
    const html = renderToStaticMarkup(
      <PetSpeciesSelector
        disabled={false}
        onSelectSpecies={() => undefined}
        pet={makePet({ speciesId: "moowi" })}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Momo");
    expect(html).toContain("Moowi");
    expect(html).toContain("A gentle little cow who cheers for calm focus.");
    expect(html).toContain('aria-label="Choose Moowi" aria-pressed="true"');
    expect(html).toContain("Selected");
  });
});
