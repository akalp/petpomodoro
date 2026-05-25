import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { PetDashboard } from "./PetDashboard";

describe("PetDashboard", () => {
  const sleepSummary = {
    startedAt: "2026-05-22T13:00:00.000Z",
    endedAt: "2026-05-22T14:05:00.000Z",
    elapsedMinutes: 65,
    energyGained: 19.5,
    hungerChanged: -4.3,
    happinessGained: 1,
    previousStats: {
      energy: 20,
      happiness: 50,
      hunger: 100,
    },
    nextStats: {
      energy: 39.5,
      happiness: 51,
      hunger: 95.7,
    },
  };

  it("shows a sleep action while the pet is awake", () => {
    const pet = makePet();
    const html = renderToStaticMarkup(
      <PetDashboard
        displayMood="calm"
        isFocusActive={false}
        isSleepDisabled={false}
        lastSleepSummary={null}
        onClearSleepSummary={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Let Momo rest");
    expect(html).toContain("A quiet nap helps Momo recover energy.");
  });

  it("shows wake action and rest metrics while the pet is sleeping", () => {
    const pet = makePet({
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
    });
    const html = renderToStaticMarkup(
      <PetDashboard
        displayMood="sleeping"
        isFocusActive={false}
        isSleepDisabled={false}
        lastSleepSummary={null}
        onClearSleepSummary={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        sleepPreview={sleepSummary}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Wake Momo");
    expect(html).toContain("Resting");
    expect(html).toContain("1h 05m");
    expect(html).toContain("Energy");
    expect(html).toContain("+19.5");
    expect(html).toContain("Hunger");
    expect(html).toContain("-4.3");
    expect(html).toContain("Happiness");
    expect(html).toContain("+1");
  });

  it("disables starting sleep while a focus session is active", () => {
    const pet = makePet();
    const html = renderToStaticMarkup(
      <PetDashboard
        displayMood="working"
        isFocusActive={true}
        isSleepDisabled={false}
        lastSleepSummary={null}
        onClearSleepSummary={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Rest waits until this focus session is finished.");
    expect(html).toContain("disabled");
  });

  it("shows a compact result after waking the pet", () => {
    const pet = makePet();
    const html = renderToStaticMarkup(
      <PetDashboard
        displayMood="calm"
        isFocusActive={false}
        isSleepDisabled={false}
        lastSleepSummary={sleepSummary}
        onClearSleepSummary={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Momo had a good rest.");
    expect(html).toContain("Energy +19.5, hunger -4.3, happiness +1.");
    expect(html).toContain("Continue");
  });
});
