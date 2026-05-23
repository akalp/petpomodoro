import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders an accessible dialog with title, description, and close action", () => {
    const html = renderToStaticMarkup(
      <Modal
        closeLabel="Close"
        description="Dialog supporting copy."
        isOpen
        onClose={() => undefined}
        title="Dialog title"
      >
        <p>Dialog content</p>
      </Modal>,
    );

    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("Dialog title");
    expect(html).toContain("Dialog supporting copy.");
    expect(html).toContain("aria-label=\"Close\"");
    expect(html).toContain("Dialog content");
  });

  it("does not render dialog markup when closed", () => {
    const html = renderToStaticMarkup(
      <Modal
        closeLabel="Close"
        isOpen={false}
        onClose={() => undefined}
        title="Closed"
      >
        <p>Hidden content</p>
      </Modal>,
    );

    expect(html).toBe("");
  });
});
