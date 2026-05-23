import type { FocusSession } from "../domain";

export type LocalNotificationPermission =
  | NotificationPermission
  | "unsupported";

export const FOCUS_FINISHED_NOTIFICATION_TITLE = "Your pet is waiting.";
export const FOCUS_FINISHED_NOTIFICATION_BODY =
  "Come back to PetPomodoro when you're ready to check in.";

export function canUseLocalNotifications(): boolean {
  return getNotificationConstructor() !== null;
}

export function getNotificationPermission(): LocalNotificationPermission {
  const NotificationConstructor = getNotificationConstructor();

  return NotificationConstructor?.permission ?? "unsupported";
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const NotificationConstructor = getNotificationConstructor();

  if (!NotificationConstructor) {
    return false;
  }

  const permission = await NotificationConstructor.requestPermission();
  return permission === "granted";
}

export function shouldScheduleFocusNotification(
  isEnabled: boolean,
  permission: LocalNotificationPermission,
  activeSession: FocusSession | null,
): boolean {
  return isEnabled && permission === "granted" && activeSession?.status === "running";
}

export function showFocusFinishedNotification(sessionId: string): void {
  const NotificationConstructor = getNotificationConstructor();

  if (!NotificationConstructor || NotificationConstructor.permission !== "granted") {
    return;
  }

  const notification = new NotificationConstructor(
    FOCUS_FINISHED_NOTIFICATION_TITLE,
    {
      body: FOCUS_FINISHED_NOTIFICATION_BODY,
      data: { sessionId },
      tag: `petpomodoro-focus-${sessionId}`,
    },
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

function getNotificationConstructor(): typeof Notification | null {
  return typeof Notification === "undefined" ? null : Notification;
}
