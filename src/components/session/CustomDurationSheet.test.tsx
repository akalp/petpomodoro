import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { CustomDurationSheet } from "./CustomDurationSheet";

describe("CustomDurationSheet", () => {
  it("renders a mobile-friendly minute picker and adjustment actions", () => {
    const html = renderSheet("37", null);

    expect(html).toContain("Choose your focus time");
    expect(html.toLowerCase()).toContain('inputmode="numeric"');
    expect(html).toContain("minutes");
    expect(html).toContain("Decrease by 5 minutes");
    expect(html).toContain("Decrease by 1 minute");
    expect(html).toContain("Increase by 1 minute");
    expect(html).toContain("Increase by 5 minutes");
    expect(html).toContain("Use duration");
  });

  it("shows invalid draft feedback and disables picker actions", () => {
    const error = "Enter a whole number from 1 to 180 minutes.";
    const html = renderSheet("", error);

    expect(html).toContain(error);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toMatch(/disabled=""[^>]*>Use duration/);
    expect(html).toMatch(/disabled=""[^>]*>-5/);
  });
});

function renderSheet(draftValue: string, durationError: string | null) {
  return renderToStaticMarkup(
    <CustomDurationSheet
      draftValue={draftValue}
      durationError={durationError}
      isOpen
      onAdjust={() => undefined}
      onApply={() => undefined}
      onChange={() => undefined}
      onClose={() => undefined}
      t={createTranslator("en")}
    />,
  );
}
