import type { TargetAndTransition, Transition } from "framer-motion";

import type { PetDisplayMood } from "../../domain";

interface PetMotionProfile {
  animate: TargetAndTransition;
  transition: Transition;
}

export const PET_MOTION_BY_MOOD = {
  calm: {
    animate: { rotate: [0, 1, 0], y: [0, -3, 0] },
    transition: { duration: 3, repeat: Infinity },
  },
  happy: {
    animate: { rotate: [0, -2, 2, 0], y: [0, -3, 0] },
    transition: { duration: 1.6, repeat: Infinity },
  },
  hungry: {
    animate: { rotate: [0, 1, 0], y: [0, 2, 0] },
    transition: { duration: 3, repeat: Infinity },
  },
  tired: {
    animate: { rotate: [0, 1, 0], y: [0, 2, 0] },
    transition: { duration: 3, repeat: Infinity },
  },
  sad: {
    animate: { rotate: [0, 1, 0], y: [0, 2, 0] },
    transition: { duration: 3, repeat: Infinity },
  },
  working: {
    animate: { rotate: [0, -1, 0], y: [0, -1, 0] },
    transition: { duration: 2.2, repeat: Infinity },
  },
  sleeping: {
    animate: { rotate: [0, 0.5, 0], y: [0, 1, 0] },
    transition: { duration: 4.8, repeat: Infinity },
  },
} satisfies Record<PetDisplayMood, PetMotionProfile>;
