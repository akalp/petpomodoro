import { afterEach, describe, expect, it, vi } from "vitest";

const { mockSchedule, mockCancel, mockRequestPermissions } = vi.hoisted(() => ({
  mockSchedule: vi.fn(),
  mockCancel: vi.fn(),
  mockRequestPermissions: vi.fn(),
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: mockSchedule,
    cancel: mockCancel,
    requestPermissions: mockRequestPermissions,
  },
}));

let nativeApp = true;

vi.mock("../platform", () => ({
  get isNativeApp() {
    return nativeApp;
  },
}));

import {
  cancelEndNotification,
  notificationIdForSession,
  scheduleEndNotification,
} from "./focusAlerts";
import { makeSession } from "../test/factories";

afterEach(() => {
  vi.clearAllMocks();
  nativeApp = true;
});

describe("notificationIdForSession", () => {
  it("returns a consistent numeric id for the same session id", () => {
    const id = "abc123";

    expect(notificationIdForSession(id)).toBe(notificationIdForSession(id));
  });

  it("returns different ids for different session ids", () => {
    expect(notificationIdForSession("aaa")).not.toBe(
      notificationIdForSession("bbb"),
    );
  });

  it("returns an unsigned 32-bit integer", () => {
    const id = notificationIdForSession("test-session");

    expect(id).toBeGreaterThanOrEqual(0);
    expect(id).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(id)).toBe(true);
  });
});

describe("scheduleEndNotification", () => {
  it("schedules a notification at the session expected end time", async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const session = makeSession({ id: "sess-1", expectedEndAt: future });

    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleEndNotification(session);

    expect(mockRequestPermissions).toHaveBeenCalledOnce();
    expect(mockSchedule).toHaveBeenCalledOnce();

    const call = mockSchedule.mock.calls[0][0];
    expect(call.notifications[0].id).toBe(notificationIdForSession("sess-1"));
    expect(call.notifications[0].title).toBe("Focus time is up");
    expect(call.notifications[0].body).toBe(
      "Your pet is waiting for you. Come back when you can.",
    );
    expect(call.notifications[0].sound).toBe("notification.caf");
    expect(call.notifications[0].schedule.at).toEqual(new Date(future));
  });

  it("does not schedule in the browser/PWA", async () => {
    nativeApp = false;
    const session = makeSession();

    await scheduleEndNotification(session);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule if the expected end time is in the past", async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const session = makeSession({ expectedEndAt: past });

    await scheduleEndNotification(session);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule if permission is denied", async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const session = makeSession({ expectedEndAt: future });

    mockRequestPermissions.mockResolvedValue({ display: "denied" });

    await scheduleEndNotification(session);

    expect(mockRequestPermissions).toHaveBeenCalledOnce();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const session = makeSession({ expectedEndAt: future });

    mockRequestPermissions.mockRejectedValue(new Error("native error"));

    await expect(scheduleEndNotification(session)).resolves.toBeUndefined();
  });
});

describe("cancelEndNotification", () => {
  it("cancels the notification by derived id", async () => {
    await cancelEndNotification("sess-1");

    expect(mockCancel).toHaveBeenCalledOnce();
    expect(mockCancel).toHaveBeenCalledWith({
      notifications: [{ id: notificationIdForSession("sess-1") }],
    });
  });

  it("does not cancel in the browser/PWA", async () => {
    nativeApp = false;

    await cancelEndNotification("sess-1");

    expect(mockCancel).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    mockCancel.mockRejectedValue(new Error("native error"));

    await expect(cancelEndNotification("sess-1")).resolves.toBeUndefined();
  });
});
