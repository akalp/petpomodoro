// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";

vi.mock("../alerts", () => ({
  scheduleEndNotification: vi.fn(async () => undefined),
  clearEndNotification: vi.fn(async () => undefined),
}));

vi.mock("../platform/liveActivity", () => ({
  startFocusLiveActivity: vi.fn(async () => undefined),
  endFocusLiveActivity: vi.fn(async () => undefined),
  clearFocusLiveActivity: vi.fn(async () => undefined),
}));

vi.mock("../platform/liveActivityTimer", () => ({
  startLiveActivityTimer: vi.fn(() => "live-activity-timer"),
  stopLiveActivityTimer: vi.fn(),
}));

vi.mock("../stores", () => {
  const makeSession = () => ({
    id: "session-1",
    status: "running",
    plannedDurationMinutes: 25,
    startedAt: new Date(Date.now()).toISOString(),
    expectedEndAt: new Date(Date.now() + 60_000).toISOString(),
    confirmedAt: null,
    abandonedAt: null,
    abandonmentReason: null,
    rewardClaimedAt: null,
    focusImpactAppliedUntil: new Date(Date.now()).toISOString(),
    focusCoinsAwarded: 0,
  });

  const usePomodoroStore = create(() => ({
    activeSession: null,
    loadRecentSessions: vi.fn(async () => []),
    startSession: vi.fn(async () => makeSession()),
    cancelSession: vi.fn(async () => ({ id: "session-1" })),
    confirmCompleted: vi.fn(async () => ({ id: "session-1" })),
    confirmAbandoned: vi.fn(async () => ({ id: "session-1" })),
  }));

  const usePetStore = create(() => ({
    loadDailyFocusOverview: vi.fn(async () => ({})),
  }));

  const useSettingsStore = create(() => ({
    settings: { language: "en" },
  }));

  return { usePomodoroStore, usePetStore, useSettingsStore };
});

import { scheduleEndNotification, clearEndNotification } from "../alerts";
import {
  startFocusLiveActivity,
  endFocusLiveActivity,
  clearFocusLiveActivity,
} from "../platform/liveActivity";
import {
  startLiveActivityTimer,
  stopLiveActivityTimer,
} from "../platform/liveActivityTimer";
import { usePomodoroStore } from "../stores";

import { useSessionHandlers } from "./useSessionHandlers";

describe("useSessionHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a session and schedules notification, live activity, and expiry cleanup", async () => {
    const { result, unmount } = renderHook(() => useSessionHandlers(vi.fn()));

    act(() => {
      result.current.handleStart(25, false, false, null);
    });

    await waitFor(() =>
      expect(usePomodoroStore.getState().startSession).toHaveBeenCalledWith(25),
    );
    await waitFor(() => expect(scheduleEndNotification).toHaveBeenCalledTimes(1));

    expect(startFocusLiveActivity).toHaveBeenCalledTimes(1);
    expect(startLiveActivityTimer).toHaveBeenCalledTimes(1);

    unmount();
    expect(stopLiveActivityTimer).toHaveBeenCalledTimes(1);
  });

  it("ends a running session and cleans up notification and live activity", async () => {
    const { result } = renderHook(() => useSessionHandlers(vi.fn()));

    act(() => {
      result.current.handleStart(25, false, false, null);
    });

    await waitFor(() =>
      expect(usePomodoroStore.getState().startSession).toHaveBeenCalled(),
    );
    await waitFor(() => expect(scheduleEndNotification).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleEnd();
    });

    await waitFor(() =>
      expect(usePomodoroStore.getState().cancelSession).toHaveBeenCalledTimes(1),
    );
    await waitFor(() => expect(clearEndNotification).toHaveBeenCalledTimes(1));

    expect(endFocusLiveActivity).toHaveBeenCalledWith(
      expect.objectContaining({ id: "session-1" }),
      "abandoned",
      "en",
    );
    expect(stopLiveActivityTimer).toHaveBeenCalledTimes(1);
  });

  it("clears live activity when the expiry timeout fires while awaiting confirmation", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useSessionHandlers(vi.fn()));

    act(() => {
      result.current.handleStart(25, false, false, null);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(usePomodoroStore.getState().startSession).toHaveBeenCalledTimes(1);
    expect(scheduleEndNotification).toHaveBeenCalledTimes(1);
    expect(startLiveActivityTimer).toHaveBeenCalledTimes(1);

    usePomodoroStore.setState({
      activeSession: {
        id: "session-1",
        status: "awaiting_confirmation",
        plannedDurationMinutes: 25,
        startedAt: new Date(Date.now()).toISOString(),
        expectedEndAt: new Date(Date.now() + 60_000).toISOString(),
        confirmedAt: null,
        abandonedAt: null,
        abandonmentReason: null,
        rewardClaimedAt: null,
        focusImpactAppliedUntil: new Date(Date.now()).toISOString(),
        focusCoinsAwarded: 0,
      },
    });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(clearFocusLiveActivity).toHaveBeenCalledTimes(1);
    expect(clearEndNotification).toHaveBeenCalledWith("session-1");
    expect(stopLiveActivityTimer).toHaveBeenCalledTimes(1);
  });
});
