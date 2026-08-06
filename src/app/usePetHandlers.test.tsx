// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";

vi.mock("../alerts", () => ({
  cancelAllCareNotifications: vi.fn(async () => undefined),
  clearEndNotification: vi.fn(async () => undefined),
}));

vi.mock("../platform/liveActivity", () => ({
  clearFocusLiveActivity: vi.fn(async () => undefined),
}));

vi.mock("../stores", () => {
  const usePetStore = create(() => ({
    renamePet: vi.fn(async () => ({})),
    changeSpecies: vi.fn(async () => ({})),
    buyFood: vi.fn(async () => ({})),
    startSleep: vi.fn(async () => ({})),
    wakeSleep: vi.fn(async () => ({})),
    usePowerNap: vi.fn(async () => ({})),
    useEmergencySnack: vi.fn(async () => ({})),
    useStreakFreeze: vi.fn(async () => ({})),
    loadDailyFocusOverview: vi.fn(async () => ({})),
  }));

  const usePomodoroStore = create<{ activeSession: { id: string } | null }>(() => ({
    activeSession: null,
  }));

  const useSettingsStore = create(() => ({
    updatePreferredDuration: vi.fn(async () => ({})),
    updateMotivationalMessages: vi.fn(async () => ({})),
  }));

  const useUiStore = create(() => ({
    resetAllLocalData: vi.fn(async () => undefined),
  }));

  return { usePetStore, usePomodoroStore, useSettingsStore, useUiStore };
});

import { cancelAllCareNotifications, clearEndNotification } from "../alerts";
import { clearFocusLiveActivity } from "../platform/liveActivity";
import { createTranslator } from "../i18n";
import type { FocusSession } from "../domain";
import { usePomodoroStore, useUiStore } from "../stores";

import { usePetHandlers } from "./usePetHandlers";

describe("usePetHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resets local data after confirmation", async () => {
    const activeSession: FocusSession = {
      id: "session-1",
      status: "running",
      plannedDurationMinutes: 25,
      startedAt: "2026-05-22T12:00:00.000Z",
      expectedEndAt: "2026-05-22T12:25:00.000Z",
      confirmedAt: null,
      abandonedAt: null,
      abandonmentReason: null,
      rewardClaimedAt: null,
      focusImpactAppliedUntil: "2026-05-22T12:00:00.000Z",
      focusCoinsAwarded: 0,
    };
    usePomodoroStore.setState({ activeSession });

    const resetInitialization = vi.fn();
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      usePetHandlers({ resetInitialization, onReset }),
    );

    const t = createTranslator("en");
    act(() => {
      result.current.handleResetLocalData(t, "en");
    });

    await waitFor(() =>
      expect(useUiStore.getState().resetAllLocalData).toHaveBeenCalledTimes(1),
    );

    expect(cancelAllCareNotifications).toHaveBeenCalledTimes(1);
    expect(clearEndNotification).toHaveBeenCalledWith("session-1");
    expect(clearFocusLiveActivity).toHaveBeenCalledTimes(1);
    expect(resetInitialization).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the reset is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() =>
      usePetHandlers({ resetInitialization: vi.fn() }),
    );

    act(() => {
      result.current.handleResetLocalData(createTranslator("en"), "en");
    });

    expect(useUiStore.getState().resetAllLocalData).not.toHaveBeenCalled();
    expect(cancelAllCareNotifications).not.toHaveBeenCalled();
  });
});
