import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makeDailyFocusState, makePet } from "../../test/factories";

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
        dailyFocusToday={makeDailyFocusState()}
        displayMood="calm"
        isFocusActive={false}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={null}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        petMessage="Your tiny focus counts."
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Let Momo rest");
    expect(html).toContain("A quiet nap helps Momo recover energy.");
    expect(html).toContain("Your tiny focus counts.");
  });

  it("shows wake action and rest metrics while the pet is sleeping", () => {
    const pet = makePet({
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
    });
    const html = renderToStaticMarkup(
      <PetDashboard
        dailyFocusToday={makeDailyFocusState()}
        displayMood="sleeping"
        isFocusActive={false}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={null}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        petMessage="Rest softly."
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
        dailyFocusToday={makeDailyFocusState()}
        displayMood="working"
        isFocusActive={true}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={null}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        petMessage="Keep going gently."
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
        dailyFocusToday={makeDailyFocusState()}
        displayMood="calm"
        isFocusActive={false}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={sleepSummary}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={pet}
        petMessage="Welcome back."
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Momo had a good rest.");
    expect(html).toContain("Energy +19.5, hunger -4.3, happiness +1.");
    expect(html).toContain("Continue");
  });

  it("offers rescue actions when a no-coins pet needs care", () => {
    const html = renderToStaticMarkup(
      <PetDashboard
        dailyFocusToday={makeDailyFocusState()}
        displayMood="hungry"
        isFocusActive={false}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={null}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={makePet({ coins: 0, hunger: 5, energy: 2 })}
        petMessage="A soft reset is here."
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Power nap");
    expect(html).toContain("Take power nap");
    expect(html).toContain("Emergency snack");
    expect(html).toContain("Offer snack");
  });

  it("explains rescue cooldowns and daily limits", () => {
    const html = renderToStaticMarkup(
      <PetDashboard
        dailyFocusToday={makeDailyFocusState({
          emergencySnacksUsed: 1,
          lastPowerNapAt: "2026-05-27T11:30:00.000Z",
          powerNapsUsed: 2,
        })}
        displayMood="hungry"
        isFocusActive={false}
        isSleepDisabled={false}
        lastEmergencySnackSummary={null}
        lastPowerNapSummary={null}
        lastSleepSummary={null}
        onClearEmergencySnackSummary={() => undefined}
        onClearPowerNapSummary={() => undefined}
        onClearSleepSummary={() => undefined}
        onEmergencySnack={() => undefined}
        onPowerNap={() => undefined}
        onStartSleep={() => undefined}
        onWakeSleep={() => undefined}
        pet={makePet({ coins: 0, hunger: 5, energy: 2 })}
        petMessage="A soft reset is here."
        sleepPreview={null}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("Power Nap is done for today.");
    expect(html).toContain("Emergency Snack is done for today.");
  });
});
