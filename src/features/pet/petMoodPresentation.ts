import type { PetDisplayMood } from "../../domain";
import type { MessageKey } from "../../i18n";

export const PET_MOOD_COPY = {
  calm: "moodCalm",
  happy: "moodHappy",
  hungry: "moodHungry",
  tired: "moodTired",
  sad: "moodSad",
  working: "moodWorking",
} satisfies Record<PetDisplayMood, MessageKey>;

interface PetAvatarPresentation {
  face: string;
  containerClassName: string;
  accentClassName: string;
}

export const PET_AVATAR_PRESENTATION_BY_MOOD = {
  calm: {
    face: "^_^",
    containerClassName: "bg-teal-100 shadow-teal-200",
    accentClassName: "bg-rose-100/90",
  },
  happy: {
    face: "*_*",
    containerClassName: "bg-teal-100 shadow-teal-200",
    accentClassName: "bg-rose-100/90",
  },
  hungry: {
    face: "u_u",
    containerClassName: "bg-teal-100 shadow-teal-200",
    accentClassName: "bg-rose-100/90",
  },
  tired: {
    face: "-_-",
    containerClassName: "bg-teal-100 shadow-teal-200",
    accentClassName: "bg-rose-100/90",
  },
  sad: {
    face: ";_;",
    containerClassName: "bg-teal-100 shadow-teal-200",
    accentClassName: "bg-rose-100/90",
  },
  working: {
    face: "o_o",
    containerClassName: "bg-sky-100 shadow-sky-200",
    accentClassName: "bg-sky-200/80",
  },
} satisfies Record<PetDisplayMood, PetAvatarPresentation>;
