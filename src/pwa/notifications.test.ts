import { afterEach, describe, expect, it, vi } from "vitest";

import { makeSession } from "../test/factories";

import {
  FOCUS_FINISHED_NOTIFICATION_BODY,
  FOCUS_FINISHED_NOTIFICATION_TITLE,
  canUseLocalNotifications,
  getNotificationPermission,
  requestLocalNotificationPermission,
  shouldScheduleFocusNotification,
  showFocusFinishedNotification,
} from "./notifications";

describe("local notification helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when Notification is unavailable", () => {
    vi.stubGlobal("Notification", undefined);

    expect(canUseLocalNotifications()).toBe(false);
    expect(getNotificationPermission()).toBe("unsupported");
  });

  it("requests permission and returns whether it was granted", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("Notification", { permission: "default", requestPermission });

    await expect(requestLocalNotificationPermission()).resolves.toBe(true);
    expect(requestPermission).toHaveBeenCalledOnce();
  });

  it("schedules only for enabled granted running sessions", () => {
    const runningSession = makeSession({ status: "running" });

    expect(
      shouldScheduleFocusNotification(true, "granted", runningSession),
    ).toBe(true);
    expect(
      shouldScheduleFocusNotification(false, "granted", runningSession),
    ).toBe(false);
    expect(shouldScheduleFocusNotification(true, "denied", runningSession)).toBe(
      false,
    );
    expect(shouldScheduleFocusNotification(true, "granted", null)).toBe(false);
    expect(
      shouldScheduleFocusNotification(
        true,
        "granted",
        makeSession({ status: "awaiting_confirmation" }),
      ),
    ).toBe(false);
  });

  it("uses trust-based reminder copy without verification language", () => {
    const copy = `${FOCUS_FINISHED_NOTIFICATION_TITLE} ${FOCUS_FINISHED_NOTIFICATION_BODY}`;

    expect(copy).not.toMatch(/verified|detected|completed automatically/i);
  });

  it("shows a focus finished notification when permission is granted", () => {
    const close = vi.fn();
    const focus = vi.fn();
    const NotificationMock = vi.fn(function NotificationMock(
      this: Notification,
      title: string,
      options?: NotificationOptions,
    ) {
      Object.assign(this, { close, title, ...options });
    });
    Object.assign(NotificationMock, {
      permission: "granted",
      requestPermission: vi.fn(),
    });
    vi.stubGlobal("Notification", NotificationMock);
    vi.stubGlobal("window", { focus });

    showFocusFinishedNotification("session-1");

    expect(NotificationMock).toHaveBeenCalledWith(
      FOCUS_FINISHED_NOTIFICATION_TITLE,
      expect.objectContaining({
        body: FOCUS_FINISHED_NOTIFICATION_BODY,
        data: { sessionId: "session-1" },
        tag: "petpomodoro-focus-session-1",
      }),
    );
  });

  it("uses provided localized reminder copy", () => {
    const NotificationMock = vi.fn(function NotificationMock() {
      return { close: vi.fn(), onclick: null };
    });
    Object.assign(NotificationMock, {
      permission: "granted",
      requestPermission: vi.fn(),
    });
    vi.stubGlobal("Notification", NotificationMock);

    showFocusFinishedNotification("session-1", {
      title: "Dostun seni bekliyor.",
      body: "Hazır olduğunda geri dön.",
    });

    expect(NotificationMock).toHaveBeenCalledWith(
      "Dostun seni bekliyor.",
      expect.objectContaining({ body: "Hazır olduğunda geri dön." }),
    );
  });
});
