import { describe, expect, it } from "vitest";

import { DEFAULT_PET_SPECIES_ID } from "../../domain";

import { AVAILABLE_PET_SPECIES, PET_SPECIES_REGISTRY } from "./petSpeciesRegistry";

describe("pet species registry", () => {
  it("keeps Momo as the default and makes Moowi available locally", () => {
    expect(DEFAULT_PET_SPECIES_ID).toBe("momo");
    expect(AVAILABLE_PET_SPECIES.map((species) => species.id)).toEqual([
      "momo",
      "moowi",
    ]);
    expect(PET_SPECIES_REGISTRY.moowi).toMatchObject({
      animal: "cow",
      availableByDefault: true,
      nameKey: "speciesMoowiName",
    });
  });
});
