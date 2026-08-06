// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { create } from "zustand";

import type { PomodoroStoreState } from "../stores/pomodoroStore";
import type { UiStoreState } from "../stores/uiStore";

let mockInitializeApp = async () => undefined;

vi.mock("../stores", () => {
  const useUiStore = create<UiStoreState>((set) => ({
    hasHydrated: false,
    isInitializing: false,
    error: null,
    initializeApp: () => mockInitializeApp(),
    resetAllLocalData: async () => undefined,
    clearError: () => set({ error: null }),
  }));

  const usePomodoroStore = create<
    Pick<PomodoroStoreState, "loadRecentSessions">
  >(() => ({
    loadRecentSessions: async () => [],
  }));

  return { useUiStore, usePomodoroStore };
});

import { useAppBootstrap } from "./useAppBootstrap";
import { useUiStore } from "../stores";

describe("useAppBootstrap", () => {
  it("retries initialization after a transient failure and caches success", async () => {
    let attempts = 0;
    mockInitializeApp = async () => {
      attempts += 1;
      if (attempts === 1) {
        useUiStore.setState({ error: "boom", isInitializing: false });
        throw new Error("boom");
      }
      useUiStore.setState({ hasHydrated: true, isInitializing: false });
    };

    const { result } = renderHook(() => useAppBootstrap());

    await waitFor(() => expect(attempts).toBe(1));
    expect(result.current.hasHydrated).toBe(false);

    act(() => {
      result.current.resetInitialization();
    });

    await waitFor(() => expect(result.current.hasHydrated).toBe(true));
    expect(attempts).toBe(2);

    mockInitializeApp = async () => {
      attempts += 1;
    };
    renderHook(() => useAppBootstrap());
    await waitFor(() => expect(attempts).toBe(2));
  });
});
