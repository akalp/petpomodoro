import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Sheet } from "./Sheet";

describe("Sheet", () => {
  it("renders an accessible secondary sheet with close affordance", () => {
    const html = renderToStaticMarkup(
      <Sheet
        closeLabel="Close"
        description="Sheet supporting copy."
        isOpen
        onClose={() => undefined}
        title="Sheet title"
      >
        <p>Sheet content</p>
      </Sheet>,
    );

    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("Sheet title");
    expect(html).toContain("Sheet supporting copy.");
    expect(html).toContain("Sheet content");
    expect(html).toContain("aria-label=\"Close\"");
    expect(html).toContain("data-testid=\"sheet-backdrop\"");
    expect(html).toContain("ui-sheet-backdrop");
    expect(html).toContain("ui-sheet-panel");
    expect(html).toContain("data-state=\"open\"");
  });

  it("does not render dialog markup when closed", () => {
    const html = renderToStaticMarkup(
      <Sheet
        closeLabel="Close"
        isOpen={false}
        onClose={() => undefined}
        title="Closed"
      >
        <p>Hidden content</p>
      </Sheet>,
    );

    expect(html).toBe("");
  });
});
