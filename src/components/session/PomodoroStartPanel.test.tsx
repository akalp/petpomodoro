// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createTranslator } from "../../i18n";

import { PomodoroStartPanel } from "./PomodoroStartPanel";

describe("PomodoroStartPanel", () => {
  it("renders preset choices and a custom action", () => {
    renderPanel(25);

    expect(screen.getByText("5m")).toBeTruthy();
    expect(screen.getByText("15m")).toBeTruthy();
    expect(screen.getByText("25m")).toBeTruthy();
    expect(screen.getByText("50m")).toBeTruthy();
    expect(screen.getByText(/Custom/)).toBeTruthy();
  });

  it("shows a selected non-preset duration through the custom action", () => {
    renderPanel(37);

    expect(screen.getByText("Custom - 37 min")).toBeTruthy();
  });

  it("calls onStart when the start button is clicked", async () => {
    const onStart = vi.fn();
    render(
      <PomodoroStartPanel
        durations={[5, 15, 25, 50]}
        onDurationChange={() => undefined}
        onStart={onStart}
        selectedDuration={25}
        t={createTranslator("en")}
      />,
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    await userEvent.click(startButton);

    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledWith(25);
  });

  it("calls onDurationChange when a preset is selected", async () => {
    const onDurationChange = vi.fn();
    render(
      <PomodoroStartPanel
        durations={[5, 15, 25, 50]}
        onDurationChange={onDurationChange}
        onStart={() => undefined}
        selectedDuration={25}
        t={createTranslator("en")}
      />,
    );

    const button15 = screen.getByText("15m");
    await userEvent.click(button15);

    expect(onDurationChange).toHaveBeenCalledOnce();
    expect(onDurationChange).toHaveBeenCalledWith(15);
  });

  it("disables the start button when disabled prop is true", () => {
    render(
      <PomodoroStartPanel
        disabled
        durations={[5, 15, 25, 50]}
        onDurationChange={() => undefined}
        onStart={() => undefined}
        selectedDuration={25}
        t={createTranslator("en")}
      />,
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    expect(startButton).toBeDisabled();
  });
});

function renderPanel(selectedDuration: number) {
  return render(
    <PomodoroStartPanel
      durations={[5, 15, 25, 50]}
      onDurationChange={() => undefined}
      onStart={() => undefined}
      selectedDuration={selectedDuration}
      t={createTranslator("en")}
    />,
  );
}
