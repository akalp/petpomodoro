export function isIosOrIpadosDevice(
  userAgent: string,
  maxTouchPoints = 0,
): boolean {
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  );
}

export function shouldShowIosInstallHint(
  userAgent: string,
  isStandalone: boolean,
  maxTouchPoints = 0,
): boolean {
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

  return (
    isIosOrIpadosDevice(userAgent, maxTouchPoints) &&
    isSafari &&
    !isStandalone
  );
}

export function shouldShowIosShortcutInstallHint(
  userAgent: string,
  isStandalone: boolean,
  hasInstalledShortcut: boolean,
  maxTouchPoints = 0,
): boolean {
  return (
    isIosOrIpadosDevice(userAgent, maxTouchPoints) &&
    isStandalone &&
    !hasInstalledShortcut
  );
}

export function isStandaloneDisplayMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
