import { afterEach, describe, expect, it, vi } from "vitest";

const mockUpdate = vi.fn().mockResolvedValue(undefined);

vi.mock("./liveActivity", () => ({
  updateFocusLiveActivity: (...args: unknown[]) => mockUpdate(...args),
}));

import { startLiveActivityTimer, stopLiveActivityTimer } from "./liveActivityTimer";
import { makeSession } from "../test/factories";

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("startLiveActivityTimer", () => {
  it("calls updateFocusLiveActivity every 60 seconds", async () => {
    vi.useFakeTimers();
    const session = makeSession({ id: "sess-1" });
    const getter = vi.fn().mockReturnValue(session);

    const handle = startLiveActivityTimer(getter, "en");

    expect(mockUpdate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(mockUpdate).toHaveBeenCalledWith(session, "running", "en");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledTimes(2);

    stopLiveActivityTimer(handle);
  });

  it("returns a handle that can be stopped", async () => {
    vi.useFakeTimers();
    const session = makeSession();
    const getter = vi.fn().mockReturnValue(session);

    const handle = startLiveActivityTimer(getter, "en");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledOnce();

    stopLiveActivityTimer(handle);

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it("sends awaiting-confirmation phase when session is awaiting confirmation", async () => {
    vi.useFakeTimers();
    const session = makeSession({ id: "sess-1", status: "awaiting_confirmation" });
    const getter = vi.fn().mockReturnValue(session);

    const handle = startLiveActivityTimer(getter, "en");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledWith(session, "awaiting_confirmation", "en");

    stopLiveActivityTimer(handle);
  });

  it("reads latest session from getter on each tick", async () => {
    vi.useFakeTimers();
    const runningSession = makeSession({ id: "sess-1", status: "running" });
    const awaitingSession = makeSession({ id: "sess-1", status: "awaiting_confirmation" });
    const getter = vi.fn()
      .mockReturnValueOnce(runningSession)
      .mockReturnValueOnce(awaitingSession);

    const handle = startLiveActivityTimer(getter, "en");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledWith(runningSession, "running", "en");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledWith(awaitingSession, "awaiting_confirmation", "en");

    stopLiveActivityTimer(handle);
  });

  it("passes language to updateFocusLiveActivity", async () => {
    vi.useFakeTimers();
    const session = makeSession({ id: "sess-1" });
    const getter = vi.fn().mockReturnValue(session);

    const handle = startLiveActivityTimer(getter, "tr");

    vi.advanceTimersByTime(60_000);
    expect(mockUpdate).toHaveBeenCalledWith(session, "running", "tr");

    stopLiveActivityTimer(handle);
  });
});

describe("stopLiveActivityTimer", () => {
  it("stops the timer from firing", async () => {
    vi.useFakeTimers();
    const session = makeSession();
    const getter = vi.fn().mockReturnValue(session);

    const handle = startLiveActivityTimer(getter, "en");
    stopLiveActivityTimer(handle);

    vi.advanceTimersByTime(120_000);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
