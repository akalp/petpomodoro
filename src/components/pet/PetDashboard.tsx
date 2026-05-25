import type { PetDisplayMood, PetSleepSummary, PetState } from "../../domain";
import type { Translator } from "../../i18n";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

import { PetAvatar } from "./PetAvatar";
import { PetSleepControl } from "./PetSleepControl";
import { PetStats } from "./PetStats";

interface PetDashboardProps {
  displayMood: PetDisplayMood | null;
  isFocusActive: boolean;
  isSleepDisabled: boolean;
  lastSleepSummary: PetSleepSummary | null;
  onClearSleepSummary: () => void;
  onStartSleep: () => void;
  onWakeSleep: () => void;
  pet: PetState | null;
  sleepPreview: PetSleepSummary | null;
  t: Translator;
}

export function PetDashboard({
  displayMood,
  isFocusActive,
  isSleepDisabled,
  lastSleepSummary,
  onClearSleepSummary,
  onStartSleep,
  onWakeSleep,
  pet,
  sleepPreview,
  t,
}: PetDashboardProps) {
  if (!pet) {
    return (
      <Card className="text-center">
        <div className="mx-auto h-32 w-32 animate-pulse rounded-full bg-rose-100" />
        <p className="mt-5 text-lg font-semibold text-slate-900">
          {t("meetPet")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t("startSmallSession")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5 text-center">
      <div className="flex items-center justify-between gap-3 text-left">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {pet.name}
          </h1>
        </div>
        <Badge>{t("levelValue", { level: pet.level })}</Badge>
      </div>
      <PetAvatar
        mood={displayMood ?? pet.mood}
        speciesId={pet.speciesId}
        t={t}
      />
      <PetStats displayMood={displayMood ?? pet.mood} pet={pet} t={t} />
      <PetSleepControl
        disabled={isSleepDisabled}
        isFocusActive={isFocusActive}
        lastSleepSummary={lastSleepSummary}
        onClearSleepSummary={onClearSleepSummary}
        onStartSleep={onStartSleep}
        onWakeSleep={onWakeSleep}
        pet={pet}
        sleepPreview={sleepPreview}
        t={t}
      />
    </Card>
  );
}
