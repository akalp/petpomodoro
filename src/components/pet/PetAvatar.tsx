import { motion, useReducedMotion } from "framer-motion";

import type { PetDisplayMood } from "../../domain";
import {
  PET_AVATAR_PRESENTATION_BY_MOOD,
  PET_MOOD_COPY,
} from "../../features/pet/petMoodPresentation";
import { PET_MOTION_BY_MOOD } from "../../features/pet/petMotion";
import type { Translator } from "../../i18n";

interface PetAvatarProps {
  mood: PetDisplayMood;
  t: Translator;
}

export function PetAvatar({ mood, t }: PetAvatarProps) {
  const shouldReduceMotion = useReducedMotion();
  const appearance = PET_AVATAR_PRESENTATION_BY_MOOD[mood];
  const motionProfile = PET_MOTION_BY_MOOD[mood];

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : motionProfile.animate}
      aria-label={t("petMoodAria", { mood: t(PET_MOOD_COPY[mood]) })}
      className={[
        "relative mx-auto flex aspect-square w-40 items-center justify-center rounded-full shadow-inner",
        appearance.containerClassName,
      ].join(" ")}
      role="img"
      transition={motionProfile.transition}
    >
      <div
        className={[
          "absolute top-8 h-9 w-24 rounded-full",
          appearance.accentClassName,
        ].join(" ")}
      />
      <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-amber-100 text-slate-800 shadow-sm">
        <div className="absolute -left-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <div className="absolute -right-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <span className="text-2xl font-bold tracking-normal">{appearance.face}</span>
        <span className="mt-2 h-2 w-8 rounded-full bg-rose-300" />
      </div>
    </motion.div>
  );
}
