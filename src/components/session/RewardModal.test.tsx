import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { RewardSummary } from "../../domain";
import { createTranslator } from "../../i18n";

import { RewardModal } from "./RewardModal";

describe("RewardModal", () => {
  it("renders above mobile navigation and keeps long rewards scrollable", () => {
    const html = renderToStaticMarkup(
      <RewardModal
        onClose={() => undefined}
        summary={rewardSummary}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("bottom-28");
    expect(html).toContain("z-20");
    expect(html).toContain("md:z-50");
    expect(html).toContain("max-h-[calc(100dvh-8rem)]");
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("Continue");
  });
});

const rewardSummary: RewardSummary = {
  rewardType: "focus_completed",
  xpAwarded: 25,
  coinsAwarded: 10,
  happinessAwarded: 8,
  hungerAwarded: 2,
  energyAwarded: 1,
  streakAwarded: 1,
  honestyHeartsAwarded: 1,
  previousLevel: 1,
  newLevel: 2,
  leveledUp: true,
};
