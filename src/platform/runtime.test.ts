import { describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
}));

import { Capacitor } from "@capacitor/core";

describe("platform detection", () => {
  it("detects native app when Capacitor reports native platform", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");

    vi.resetModules();
    const { isNativeApp, isWebApp, nativePlatform } = await import("./runtime");

    expect(isNativeApp).toBe(true);
    expect(isWebApp).toBe(false);
    expect(nativePlatform).toBe("ios");
  });

  it("detects web app when Capacitor reports web platform", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");

    vi.resetModules();
    const { isNativeApp, isWebApp, nativePlatform } = await import("./runtime");

    expect(isNativeApp).toBe(false);
    expect(isWebApp).toBe(true);
    expect(nativePlatform).toBeNull();
  });

  it("returns the native platform name for android", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");

    vi.resetModules();
    const { isNativeApp, nativePlatform } = await import("./runtime");

    expect(isNativeApp).toBe(true);
    expect(nativePlatform).toBe("android");
  });
});
