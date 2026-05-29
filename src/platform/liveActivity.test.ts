import { afterEach, describe, expect, it, vi } from "vitest";

const {
  mockIsAvailable,
  mockIsRunning,
  mockStartActivity,
  mockUpdateActivity,
  mockEndActivity,
} = vi.hoisted(() => ({
  mockIsAvailable: vi.fn(),
  mockIsRunning: vi.fn(),
  mockStartActivity: vi.fn(),
  mockUpdateActivity: vi.fn(),
  mockEndActivity: vi.fn(),
}));

vi.mock("capacitor-live-activity", () => ({
  LiveActivity: {
    isAvailable: mockIsAvailable,
    isRunning: mockIsRunning,
    startActivity: mockStartActivity,
    updateActivity: mockUpdateActivity,
    endActivity: mockEndActivity,
  },
}));

let nativeApp = true;

vi.mock("./runtime", () => ({
  get isNativeApp() {
    return nativeApp;
  },
}));

import {
  startFocusLiveActivity,
  updateFocusLiveActivity,
  endFocusLiveActivity,
  clearFocusLiveActivity,
} from "./liveActivity";
import { makeSession } from "../test/factories";

afterEach(() => {
  vi.clearAllMocks();
  nativeApp = true;
});

describe("startFocusLiveActivity", () => {
  it("starts a live activity with correct parameters", async () => {
    const future = new Date(Date.now() + 600_000).toISOString();
    const session = makeSession({ id: "sess-1", expectedEndAt: future });
    mockIsAvailable.mockResolvedValue({ value: true });
    mockStartActivity.mockResolvedValue(undefined);

    await startFocusLiveActivity(session);

    expect(mockStartActivity).toHaveBeenCalledOnce();
    const call = mockStartActivity.mock.calls[0][0];
    expect(call.id).toBe("petpomodoro-focus-sess-1");
    expect(call.attributes.sessionId).toBe("sess-1");
    expect(call.contentState.title).toBe("Focus Session");
    expect(call.contentState.phase).toBe("running");
    expect(call.contentState.startedAt).toBe(session.startedAt);
    expect(call.contentState.expectedEndAt).toBe(session.expectedEndAt);
    expect(call.contentState.petEmoji).toBe("🐾");
  });

  it("does not start in the browser/PWA", async () => {
    nativeApp = false;
    const session = makeSession();

    await startFocusLiveActivity(session);

    expect(mockIsAvailable).not.toHaveBeenCalled();
    expect(mockStartActivity).not.toHaveBeenCalled();
  });

  it("does not start if not available on device", async () => {
    const session = makeSession();
    mockIsAvailable.mockResolvedValue({ value: false });

    await startFocusLiveActivity(session);

    expect(mockStartActivity).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    const session = makeSession();
    mockIsAvailable.mockRejectedValue(new Error("native error"));

    await expect(startFocusLiveActivity(session)).resolves.toBeUndefined();
  });
});

describe("updateFocusLiveActivity", () => {
  it("updates a running live activity", async () => {
    const future = new Date(Date.now() + 600_000).toISOString();
    const session = makeSession({ id: "sess-1", expectedEndAt: future });
    mockIsRunning.mockResolvedValue({ value: true });
    mockUpdateActivity.mockResolvedValue(undefined);

    await updateFocusLiveActivity(session);

    expect(mockUpdateActivity).toHaveBeenCalledOnce();
    const call = mockUpdateActivity.mock.calls[0][0];
    expect(call.id).toBe("petpomodoro-focus-sess-1");
    expect(call.contentState.phase).toBe("running");
    expect(call.contentState.startedAt).toBe(session.startedAt);
    expect(call.contentState.expectedEndAt).toBe(session.expectedEndAt);
  });

  it("does not update in the browser/PWA", async () => {
    nativeApp = false;
    const session = makeSession();

    await updateFocusLiveActivity(session);

    expect(mockIsRunning).not.toHaveBeenCalled();
    expect(mockUpdateActivity).not.toHaveBeenCalled();
  });

  it("does not update if activity is not running", async () => {
    const session = makeSession();
    mockIsRunning.mockResolvedValue({ value: false });

    await updateFocusLiveActivity(session);

    expect(mockUpdateActivity).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    const session = makeSession();
    mockIsRunning.mockRejectedValue(new Error("native error"));

    await expect(updateFocusLiveActivity(session)).resolves.toBeUndefined();
  });

  it("sends awaiting-confirmation phase when session is awaiting confirmation", async () => {
    const future = new Date(Date.now() - 1000).toISOString();
    const session = makeSession({
      id: "sess-1",
      expectedEndAt: future,
      status: "awaiting_confirmation",
    });
    mockIsRunning.mockResolvedValue({ value: true });
    mockUpdateActivity.mockResolvedValue(undefined);

    await updateFocusLiveActivity(session, "awaiting_confirmation");

    expect(mockUpdateActivity).toHaveBeenCalledOnce();
    const call = mockUpdateActivity.mock.calls[0][0];
    expect(call.contentState.phase).toBe("awaiting_confirmation");
  });
});

describe("endFocusLiveActivity", () => {
  it("ends a running live activity with completed phase", async () => {
    const future = new Date(Date.now() + 600_000).toISOString();
    const session = makeSession({ id: "sess-1", expectedEndAt: future });
    mockIsRunning.mockResolvedValue({ value: true });
    mockEndActivity.mockResolvedValue(undefined);

    await endFocusLiveActivity(session, "completed");

    expect(mockEndActivity).toHaveBeenCalledOnce();
    const call = mockEndActivity.mock.calls[0][0];
    expect(call.id).toBe("petpomodoro-focus-sess-1");
    expect(call.contentState.phase).toBe("completed");
  });

  it("ends a running live activity with abandoned phase", async () => {
    const session = makeSession({ id: "sess-1" });
    mockIsRunning.mockResolvedValue({ value: true });
    mockEndActivity.mockResolvedValue(undefined);

    await endFocusLiveActivity(session, "abandoned");

    const call = mockEndActivity.mock.calls[0][0];
    expect(call.contentState.phase).toBe("abandoned");
  });

  it("does not end in the browser/PWA", async () => {
    nativeApp = false;
    const session = makeSession();

    await endFocusLiveActivity(session, "completed");

    expect(mockIsRunning).not.toHaveBeenCalled();
    expect(mockEndActivity).not.toHaveBeenCalled();
  });

  it("does not end if activity is not running", async () => {
    const session = makeSession();
    mockIsRunning.mockResolvedValue({ value: false });

    await endFocusLiveActivity(session, "completed");

    expect(mockEndActivity).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    const session = makeSession();
    mockIsRunning.mockRejectedValue(new Error("native error"));

    await expect(
      endFocusLiveActivity(session, "completed"),
    ).resolves.toBeUndefined();
  });
});

describe("clearFocusLiveActivity", () => {
  it("ends the live activity immediately with awaiting-confirmation phase", async () => {
    const session = makeSession({ id: "sess-1", status: "awaiting_confirmation" });
    mockIsRunning.mockResolvedValue({ value: true });
    mockEndActivity.mockResolvedValue(undefined);

    await clearFocusLiveActivity(session);

    expect(mockEndActivity).toHaveBeenCalledOnce();
    const call = mockEndActivity.mock.calls[0][0];
    expect(call.id).toBe("petpomodoro-focus-sess-1");
    expect(call.contentState.phase).toBe("awaiting_confirmation");
    expect(call.dismissalDate).toBeTypeOf("number");
    expect(call.dismissalDate).toBeLessThanOrEqual(Date.now() / 1000);
  });

  it("does not clear in the browser/PWA", async () => {
    nativeApp = false;
    const session = makeSession();

    await clearFocusLiveActivity(session);

    expect(mockIsRunning).not.toHaveBeenCalled();
    expect(mockEndActivity).not.toHaveBeenCalled();
  });
});
