export interface ShortcutUrlInput {
  baseUrl: string;
  completedSessionId: string;
}

export interface ShortcutReturn {
  completedSessionId: string | null;
}

const COMPLETED_SESSION_PARAM = "completedSessionId";

export const START_NATIVE_TIMER_SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/ebbf43762a544157a75c0804372c82f2";

export function buildShortcutUrl({
  baseUrl,
  completedSessionId,
}: ShortcutUrlInput): string {
  const url = new URL(baseUrl);
  url.searchParams.set(COMPLETED_SESSION_PARAM, completedSessionId);
  return url.toString();
}

export function parseShortcutReturn(url: string): ShortcutReturn {
  const parsedUrl = new URL(url);

  return {
    completedSessionId: parsedUrl.searchParams.get(COMPLETED_SESSION_PARAM),
  };
}

export function clearShortcutReturn(url: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.delete(COMPLETED_SESSION_PARAM);

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}
