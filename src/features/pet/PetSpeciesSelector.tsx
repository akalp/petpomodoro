import type { PetSpeciesId, PetState } from "../../domain";
import type { Translator } from "../../i18n";

import { PetRenderer } from "./PetRenderer";
import { AVAILABLE_PET_SPECIES } from "./petSpeciesRegistry";

interface PetSpeciesSelectorProps {
  disabled: boolean;
  onSelectSpecies: (speciesId: PetSpeciesId) => void;
  pet: PetState;
  t: Translator;
}

export function PetSpeciesSelector({
  disabled,
  onSelectSpecies,
  pet,
  t,
}: PetSpeciesSelectorProps) {
  return (
    <div className="space-y-4">
      <fieldset disabled={disabled}>
        <legend className="text-lg font-semibold text-slate-950">
          {t("speciesTitle")}
        </legend>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {t("speciesSupport")}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {AVAILABLE_PET_SPECIES.map((species) => {
            const isSelected = pet.speciesId === species.id;

            return (
              <button
                aria-label={t(species.selectionLabelKey)}
                aria-pressed={isSelected}
                className={[
                  "flex min-h-28 items-center gap-3 rounded-lg border p-3 text-left transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
                  isSelected
                    ? "border-rose-300 bg-rose-50"
                    : "border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/50",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                ].join(" ")}
                key={species.id}
                onClick={() => onSelectSpecies(species.id)}
                type="button"
              >
                <span className="pet-species-preview shrink-0">
                  <PetRenderer
                    message=""
                    mood="calm"
                    preview
                    speciesId={species.id}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-950">
                      {t(species.nameKey)}
                    </span>
                    {isSelected ? (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">
                        {t("speciesSelected")}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-slate-600">
                    {t(species.shortDescriptionKey)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
