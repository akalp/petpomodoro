// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";

import type { FocusSession } from "../domain";

vi.mock("../alerts", () => ({
  clearEndNotification: vi.fn(async () => undefined),
}));

vi.mock("../platform/liveActivity", () => ({
  clearFocusLiveActivity: vi.fn(async () => undefined),
}));

vi.mock("../stores", () => {
  const usePomodoroStore = create<{
    activeSession: FocusSession | null;
    refreshSessionStatus: () => Promise<FocusSession | null>;
    loadRecentSessions: () => Promise<unknown[]>;
  }>(() => ({
    activeSession: null,
    refreshSessionStatus: vi.fn(async () => null),
    loadRecentSessions: vi.fn(async () => []),
  }));

  const usePetStore = create<{
    pet: { sleepStartedAt: string | null } | null;
    updateAppOpenDecay: () => Promise<unknown>;
  }>(() => ({
    pet: null,
    updateAppOpenDecay: vi.fn(async () => null),
  }));

  const useSettingsStore = create(() => ({
    settings: { language: "en" },
  }));

  return { usePomodoroStore, usePetStore, useSettingsStore };
});

import { clearEndNotification } from "../alerts";
import { clearFocusLiveActivity } from "../platform/liveActivity";
import { usePomodoroStore, usePetStore } from "../stores";

import { useAppTimer } from "./useAppTimer";

describe("useAppTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not tick when no session is running and the pet is awake", () => {
    usePomodoroStore.setState({
      activeSession: null,
      refreshSessionStatus: vi.fn(async () => null),
    });
    usePetStore.setState({ pet: null });

    renderHook(() => useAppTimer(true));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(usePomodoroStore.getState().refreshSessionStatus).not.toHaveBeenCalled();
  });

  it("refreshes while a session runs without reloading history every tick", async () => {
    const runningSession: FocusSession = {
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
    const refreshSessionStatus = vi.fn(async () => runningSession);
    usePomodoroStore.setState({
      activeSession: runningSession,
      refreshSessionStatus,
    });
    usePetStore.setState({ pet: null });

    const { unmount } = renderHook(() => useAppTimer(true));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(refreshSessionStatus).toHaveBeenCalled();
    expect(usePomodoroStore.getState().loadRecentSessions).not.toHaveBeenCalled();

    unmount();
  });

  it("clears live activity and notification when the session awaits confirmation", async () => {
    const awaitingSession: FocusSession = {
      id: "session-1",
      status: "awaiting_confirmation",
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
    usePomodoroStore.setState({
      activeSession: awaitingSession,
      refreshSessionStatus: vi.fn(async () => awaitingSession),
    });
    usePetStore.setState({ pet: null });

    renderHook(() => useAppTimer(true));

    await act(async () => {
      await Promise.resolve();
    });

    expect(clearFocusLiveActivity).toHaveBeenCalledTimes(1);
    expect(clearEndNotification).toHaveBeenCalledWith("session-1");
  });
});
