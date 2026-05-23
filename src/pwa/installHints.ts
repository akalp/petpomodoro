export function shouldShowIosInstallHint(userAgent: string, isStandalone: boolean): boolean {
  const isiOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

  return isiOS && isSafari && !isStandalone;
}

export function shouldShowIosShortcutInstallHint(
  userAgent: string,
  isStandalone: boolean,
  hasInstalledShortcut: boolean,
): boolean {
  const isiOS = /iPad|iPhone|iPod/.test(userAgent);

  return isiOS && isStandalone && !hasInstalledShortcut;
}

export function isStandaloneDisplayMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
