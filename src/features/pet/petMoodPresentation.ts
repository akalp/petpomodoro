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
