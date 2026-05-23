import { motion, useReducedMotion } from "framer-motion";

import type { PetDisplayMood } from "../../domain";
import type { Translator } from "../../i18n";

interface PetAvatarProps {
  mood: PetDisplayMood;
  t: Translator;
}

const moodFace: Record<PetDisplayMood, string> = {
  calm: "^_^",
  happy: "*_*",
  sleepy: "-_-",
  working: "o_o",
};

export function PetAvatar({ mood, t }: PetAvatarProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? undefined
          : {
              rotate:
                mood === "happy"
                  ? [0, -2, 2, 0]
                  : mood === "working"
                    ? [0, -1, 0]
                    : [0, 1, 0],
              y:
                mood === "sleepy"
                  ? [0, 2, 0]
                  : mood === "working"
                    ? [0, -1, 0]
                    : [0, -3, 0],
            }
      }
      aria-label={t("petMoodAria", { mood: moodLabel(mood, t) })}
      className={[
        "relative mx-auto flex aspect-square w-40 items-center justify-center rounded-full shadow-inner",
        mood === "working"
          ? "bg-sky-100 shadow-sky-200"
          : "bg-teal-100 shadow-teal-200",
      ].join(" ")}
      role="img"
      transition={{
        duration: mood === "happy" ? 1.6 : mood === "working" ? 2.2 : 3,
        repeat: Infinity,
      }}
    >
      <div
        className={[
          "absolute top-8 h-9 w-24 rounded-full",
          mood === "working" ? "bg-sky-200/80" : "bg-rose-100/90",
        ].join(" ")}
      />
      <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-amber-100 text-slate-800 shadow-sm">
        <div className="absolute -left-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <div className="absolute -right-3 top-7 h-8 w-8 rounded-full bg-amber-100" />
        <span className="text-2xl font-bold tracking-normal">{moodFace[mood]}</span>
        <span className="mt-2 h-2 w-8 rounded-full bg-rose-300" />
      </div>
    </motion.div>
  );
}

function moodLabel(mood: PetDisplayMood, t: Translator): string {
  if (mood === "working") {
    return t("moodWorking");
  }

  if (mood === "happy") {
    return t("moodHappy");
  }

  if (mood === "sleepy") {
    return t("moodSleepy");
  }

  return t("moodCalm");
}
