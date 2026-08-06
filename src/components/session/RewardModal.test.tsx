import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { RewardSummary } from "../../domain";
import { createTranslator } from "../../i18n";

import { RewardModal } from "./RewardModal";

describe("RewardModal", () => {
  it("renders an accessible dialog above mobile navigation and keeps long rewards scrollable", () => {
    const html = renderToStaticMarkup(
      <RewardModal
        onClose={() => undefined}
        summary={rewardSummary}
        t={createTranslator("en")}
      />,
    );

    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("fixed inset-0 z-50");
    expect(html).toContain("max-h-[calc(100dvh-2rem)]");
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("ui-reward-backdrop");
    expect(html).toContain("ui-reward-panel");
    expect(html).toContain("ui-level-pulse");
    expect(html).toContain("Continue");
    expect(html).toContain("aria-label=\"Close\"");
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
