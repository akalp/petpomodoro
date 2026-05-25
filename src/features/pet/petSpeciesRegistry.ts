import { DEFAULT_PET_SPECIES_ID, type PetSpeciesId } from "../../domain";
import type { MessageKey } from "../../i18n";

export interface PetSpeciesDefinition {
  readonly id: PetSpeciesId;
  readonly animal: "cat" | "cow";
  readonly tone: "cozy-soft-companion";
  readonly availableByDefault: true;
  readonly nameKey: MessageKey;
  readonly shortDescriptionKey: MessageKey;
  readonly selectionLabelKey: MessageKey;
}

export const PET_SPECIES_REGISTRY = {
  [DEFAULT_PET_SPECIES_ID]: {
    id: DEFAULT_PET_SPECIES_ID,
    animal: "cat",
    tone: "cozy-soft-companion",
    availableByDefault: true,
    nameKey: "speciesMomoName",
    shortDescriptionKey: "speciesMomoDescription",
    selectionLabelKey: "speciesMomoSelectionLabel",
  },
  moowi: {
    id: "moowi",
    animal: "cow",
    tone: "cozy-soft-companion",
    availableByDefault: true,
    nameKey: "speciesMoowiName",
    shortDescriptionKey: "speciesMoowiDescription",
    selectionLabelKey: "speciesMoowiSelectionLabel",
  },
} satisfies Record<PetSpeciesId, PetSpeciesDefinition>;

export const AVAILABLE_PET_SPECIES = Object.values(PET_SPECIES_REGISTRY);
