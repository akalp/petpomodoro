import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";
import { makePet } from "../../test/factories";

import { PetStats } from "./PetStats";

describe("PetStats", () => {
  it("renders summary stats without duplicating the dashboard level badge", () => {
    const html = renderToStaticMarkup(
      <PetStats displayMood="calm" pet={makePet({ level: 3 })} t={createTranslator("en")} />,
    );

    expect(html).toContain("XP progress");
    expect(html).toContain("Mood");
    expect(html).toContain("Calm");
    expect(html).toContain("Coins");
    expect(html).toContain("Streak");
    expect(html).not.toContain(">Level<");
  });

  it("uses one summary column by default and a compact larger-screen grid", () => {
    const html = renderToStaticMarkup(
      <PetStats displayMood="working" pet={makePet()} t={createTranslator("en")} />,
    );

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-3");
    expect(html).toContain("Working");
  });
});
