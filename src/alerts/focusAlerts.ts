import { LocalNotifications } from "@capacitor/local-notifications";

import { isNativeApp } from "../platform";
import type { FocusSession } from "../domain";

function notificationIdForSession(sessionId: string): number {
  let hash = 5381;

  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 33) ^ sessionId.charCodeAt(i);
  }

  return hash >>> 0;
}

export async function scheduleEndNotification(
  session: FocusSession,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  const endAt = new Date(session.expectedEndAt);

  if (endAt.getTime() <= Date.now()) {
    return;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();

    if (permission.display !== "granted") {
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationIdForSession(session.id),
          title: "Focus time is up",
          body: "Your pet is waiting for you. Come back when you can.",
          schedule: { at: endAt },
        },
      ],
    });
  } catch {
    // Silently ignore — notifications are a convenience, not a requirement.
  }
}

export async function cancelEndNotification(
  sessionId: string,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationIdForSession(sessionId) }],
    });
  } catch {
    // Silently ignore.
  }
}

export { notificationIdForSession };
