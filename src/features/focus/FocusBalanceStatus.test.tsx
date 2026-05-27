import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateFocusStartEligibility } from "../../domain";
import { createTranslator } from "../../i18n";
import { makeDailyFocusState, makePet } from "../../test/factories";

import { FocusBalanceStatus, FocusStartNotice } from "./FocusBalanceStatus";

const now = "2026-05-22T12:30:00.000Z";

describe("FocusBalanceStatus", () => {
  it("explains low energy with a next step", () => {
    const pet = makePet({ energy: 2, hunger: 80 });
    const html = renderStartNotice({
      focusStartEligibility: calculateFocusStartEligibility(pet, 25),
      pet,
    });

    expect(html).toContain("Momo is too sleepy for this focus.");
    expect(html).toContain("Try a Power Nap or Rest time first.");
  });

  it("explains low hunger with a next step", () => {
    const pet = makePet({ energy: 80, hunger: 2 });
    const html = renderStartNotice({
      focusStartEligibility: calculateFocusStartEligibility(pet, 25),
      pet,
    });

    expect(html).toContain("Momo needs a bite before this focus.");
    expect(html).toContain("Try the Shop or Emergency Snack.");
  });

  it("explains when both hunger and energy are low", () => {
    const pet = makePet({ energy: 2, hunger: 2 });
    const html = renderStartNotice({
      focusStartEligibility: calculateFocusStartEligibility(pet, 25),
      pet,
    });

    expect(html).toContain("Momo needs food and rest before this focus.");
    expect(html).toContain("Try a snack, then a nap.");
  });

  it("shows daily goal progress in minutes", () => {
    const html = renderStatus({
      dailyFocusToday: makeDailyFocusState({ completedFocusMinutes: 10 }),
    });

    expect(html).toContain("Daily focus goal");
    expect(html).toContain("10 of 25 minutes with your pet today.");
    expect(html).toContain("10 / 25");
  });

  it("offers a streak freeze for a missed previous day", () => {
    const html = renderStatus({
      pet: makePet({ honestyHearts: 3 }),
      previousDailyFocusState: makeDailyFocusState({
        dateKey: "2026-05-21",
        completedFocusMinutes: 0,
      }),
    });

    expect(html).toContain("Streak freeze ready");
    expect(html).toContain("Use 3 Honesty Hearts");
    expect(html).toContain("Use freeze");
  });

  it("explains when streak freeze needs more Honesty Hearts", () => {
    const html = renderStatus({
      pet: makePet({ honestyHearts: 0 }),
      previousDailyFocusState: makeDailyFocusState({
        dateKey: "2026-05-21",
        completedFocusMinutes: 0,
      }),
    });

    expect(html).toContain("Streak freeze needs Honesty Hearts");
    expect(html).toContain("Honest check-ins can bring hearts back.");
  });
});

function renderStatus(
  overrides: Partial<Parameters<typeof FocusBalanceStatus>[0]> = {},
) {
  const pet = overrides.pet ?? makePet();

  return renderToStaticMarkup(
    <FocusBalanceStatus
      dailyFocusToday={makeDailyFocusState()}
      disabled={false}
      now={now}
      onStreakFreeze={() => undefined}
      pet={pet}
      previousDailyFocusState={null}
      t={createTranslator("en")}
      {...overrides}
    />,
  );
}

function renderStartNotice(
  overrides: Partial<Parameters<typeof FocusStartNotice>[0]> = {},
) {
  const pet = overrides.pet ?? makePet();

  return renderToStaticMarkup(
    <FocusStartNotice
      focusStartEligibility={calculateFocusStartEligibility(pet, 25)}
      isPetSleeping={false}
      pet={pet}
      t={createTranslator("en")}
      {...overrides}
    />,
  );
}
