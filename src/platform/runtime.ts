import { Capacitor } from "@capacitor/core";

export const isNativeApp: boolean = Capacitor.isNativePlatform();
export const isWebApp: boolean = !isNativeApp;
export const nativePlatform: string | null = isNativeApp
  ? Capacitor.getPlatform()
  : null;
