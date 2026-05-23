import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("renders an accessible dialog with title, description, and header action", () => {
    const html = renderToStaticMarkup(
      <Drawer
        description="Drawer supporting copy."
        headerAction={<span>Header action</span>}
        isOpen
        onClose={() => undefined}
        title="Drawer title"
      >
        <p>Drawer content</p>
      </Drawer>,
    );

    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("Drawer title");
    expect(html).toContain("Drawer supporting copy.");
    expect(html).toContain("Header action");
    expect(html).toContain("Drawer content");
    expect(html).toContain("data-testid=\"drawer-backdrop\"");
  });

  it("does not render dialog markup when closed", () => {
    const html = renderToStaticMarkup(
      <Drawer
        isOpen={false}
        onClose={() => undefined}
        title="Closed"
      >
        <p>Hidden content</p>
      </Drawer>,
    );

    expect(html).toBe("");
  });
});
