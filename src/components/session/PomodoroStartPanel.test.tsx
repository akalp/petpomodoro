import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTranslator } from "../../i18n";

import { PomodoroStartPanel } from "./PomodoroStartPanel";

describe("PomodoroStartPanel", () => {
  it("renders preset choices and a custom action", () => {
    const html = renderPanel(25);

    expect(html).toContain("5m");
    expect(html).toContain("15m");
    expect(html).toContain("25m");
    expect(html).toContain("50m");
    expect(html).toContain("Custom");
    expect(html).not.toContain('type="number"');
  });

  it("shows a selected non-preset duration through the custom action", () => {
    const html = renderPanel(37);

    expect(html).toContain("Custom - 37 min");
    expect(html).toMatch(/aria-pressed="true"[^>]*>[\s\S]*Custom - 37 min/);
  });
});

function renderPanel(selectedDuration: number) {
  return renderToStaticMarkup(
    <PomodoroStartPanel
      durations={[5, 15, 25, 50]}
      onDurationChange={() => undefined}
      onStart={() => undefined}
      selectedDuration={selectedDuration}
      t={createTranslator("en")}
    />,
  );
}
