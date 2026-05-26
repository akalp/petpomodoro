import type { PetDisplayMood } from "../../domain";
import type { Translator } from "../../i18n";
import { PetAvatar } from "../../components/pet/PetAvatar";

import { PET_MOOD_COPY } from "./petMoodPresentation";

const SHOWCASE_MOODS = [
  "calm",
  "happy",
  "hungry",
  "exhausted",
  "tired",
  "sad",
  "working",
  "sleeping",
] satisfies readonly PetDisplayMood[];

interface PetMoodShowcaseProps {
  t: Translator;
}

export function PetMoodShowcase({ t }: PetMoodShowcaseProps) {
  return (
    <section className="space-y-5" data-testid="pet-mood-showcase">
      <header className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
          Momo mood studio
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          CSS-art mood preview
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Development preview for animation and expression review.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SHOWCASE_MOODS.map((mood) => (
          <article
            className="overflow-hidden rounded-3xl bg-white px-3 pb-4 pt-3 text-center shadow-sm"
            key={mood}
          >
            <p className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-slate-700">
              {t(PET_MOOD_COPY[mood])}
            </p>
            <PetAvatar message={t("petEncouragement")} mood={mood} t={t} />
          </article>
        ))}
      </div>
    </section>
  );
}
