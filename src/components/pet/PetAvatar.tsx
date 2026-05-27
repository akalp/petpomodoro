import {
  DEFAULT_PET_SPECIES_ID,
  type PetDisplayMood,
  type PetSpeciesId,
} from "../../domain";
import { PetRenderer } from "../../features/pet/PetRenderer";
import { PET_MOOD_COPY } from "../../features/pet/petMoodPresentation";
import type { Translator } from "../../i18n";

interface PetAvatarProps {
  message: string;
  mood: PetDisplayMood;
  speciesId?: PetSpeciesId;
  t: Translator;
}

export function PetAvatar({
  message,
  mood,
  speciesId = DEFAULT_PET_SPECIES_ID,
  t,
}: PetAvatarProps) {
  return (
    <div
      aria-label={t("petMoodAria", { mood: t(PET_MOOD_COPY[mood]) })}
      className="relative mx-auto flex h-[15.5rem] w-full max-w-64 items-end justify-center"
      role="img"
    >
      <PetRenderer
        message={message}
        mood={mood}
        renderFigure={(figure) => (
          <span className="pet-art__figure-motion">{figure}</span>
        )}
        speciesId={speciesId}
      />
    </div>
  );
}
