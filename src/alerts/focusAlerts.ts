import { LocalNotifications } from "@capacitor/local-notifications";

import { isNativeApp } from "../platform";
import type { FocusSession } from "../domain";
import {
  DEFAULT_LANGUAGE,
  createNativeFocusCopy,
  type SupportedLanguage,
} from "../i18n";

function notificationIdForSession(sessionId: string): number {
  let hash = 5381;

  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 33) ^ sessionId.charCodeAt(i);
  }

  return hash >>> 0;
}

export async function scheduleEndNotification(
  session: FocusSession,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
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

    const copy = createNativeFocusCopy(language);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationIdForSession(session.id),
          title: copy.focusEndTitle,
          body: copy.focusEndBody,
          sound: "notification.caf",
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

export async function removeDeliveredEndNotification(
  sessionId: string,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    const id = notificationIdForSession(sessionId);
    const delivered = await LocalNotifications.getDeliveredNotifications();
    const notifications = delivered.notifications.filter(
      (notification) => notification.id === id,
    );

    if (notifications.length === 0) {
      return;
    }

    await LocalNotifications.removeDeliveredNotifications({ notifications });
  } catch {
    // Silently ignore.
  }
}

export async function clearEndNotification(sessionId: string): Promise<void> {
  await Promise.all([
    cancelEndNotification(sessionId),
    removeDeliveredEndNotification(sessionId),
  ]);
}

export { notificationIdForSession };
