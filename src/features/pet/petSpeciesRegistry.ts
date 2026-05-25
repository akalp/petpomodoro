import { DEFAULT_PET_SPECIES_ID, type PetSpeciesId } from "../../domain";

interface PetSpeciesDefinition {
  id: PetSpeciesId;
  name: string;
}

export const PET_SPECIES_REGISTRY = {
  [DEFAULT_PET_SPECIES_ID]: {
    id: DEFAULT_PET_SPECIES_ID,
    name: "Momo",
  },
} satisfies Record<PetSpeciesId, PetSpeciesDefinition>;
