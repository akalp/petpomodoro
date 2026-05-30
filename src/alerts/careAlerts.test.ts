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

import { cancelAllCareNotifications, scheduleCareNotifications } from "./careAlerts";
import { makePet, makeSession } from "../test/factories";

afterEach(() => {
  vi.clearAllMocks();
  nativeApp = true;
});

describe("scheduleCareNotifications", () => {
  it("cancels stale care notifications before scheduling new ones", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockCancel).toHaveBeenCalledWith({
      notifications: [{ id: 1_000_001 }, { id: 1_000_002 }],
    });
    expect(mockCancel.mock.invocationCallOrder[0]).toBeLessThan(
      mockSchedule.mock.invocationCallOrder[0],
    );
  });

  it("schedules hunger notification when hunger is above threshold", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const hungerNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_001,
    );

    expect(hungerNotif).toBeDefined();
    expect(hungerNotif.title).toBe("Your pet is getting hungry");
    expect(hungerNotif.body).toBe("A small snack would brighten their day.");
    expect(hungerNotif.sound).toBe("notification.caf");
    expect(hungerNotif.schedule.at.getTime()).toBeGreaterThan(Date.now());
  });

  it("schedules energy notification when energy is above threshold and hunger is low", async () => {
    const pet = makePet({ hunger: 18, energy: 50 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const energyNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_002,
    );

    expect(energyNotif).toBeDefined();
    expect(energyNotif.title).toBe("Your pet could use a rest");
    expect(energyNotif.body).toBe("A cozy nap helps them recover.");
    expect(energyNotif.sound).toBe("notification.caf");
  });

  it("schedules both notifications when both thresholds will be crossed", async () => {
    const pet = makePet({ hunger: 40, energy: 50 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];

    expect(call.notifications).toHaveLength(2);
    expect(call.notifications.map((n: { id: number }) => n.id)).toEqual(
      expect.arrayContaining([1_000_001, 1_000_002]),
    );
  });

  it("does not schedule hunger notification when already hungry", async () => {
    const pet = makePet({ hunger: 10, energy: 50 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const hungerNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_001,
    );

    expect(hungerNotif).toBeUndefined();
  });

  it("does not schedule energy notification when already tired", async () => {
    const pet = makePet({ hunger: 50, energy: 20 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet);

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const energyNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_002,
    );

    expect(energyNotif).toBeUndefined();
  });

  it("does not schedule when pet is sleeping", async () => {
    const pet = makePet({ hunger: 40, energy: 80, sleepStartedAt: "2026-05-22T12:00:00.000Z" });

    await scheduleCareNotifications(pet);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule during an active focus session", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    const session = makeSession({ status: "running" });

    await scheduleCareNotifications(pet, session);

    expect(mockCancel).toHaveBeenCalledOnce();
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule while a session awaits confirmation", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    const session = makeSession({ status: "awaiting_confirmation" });

    await scheduleCareNotifications(pet, session);

    expect(mockCancel).toHaveBeenCalledOnce();
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule in PWA", async () => {
    nativeApp = false;
    const pet = makePet({ hunger: 40, energy: 80 });

    await scheduleCareNotifications(pet);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not schedule if permission is denied", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    mockRequestPermissions.mockResolvedValue({ display: "denied" });

    await scheduleCareNotifications(pet);

    expect(mockRequestPermissions).toHaveBeenCalledOnce();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    mockRequestPermissions.mockRejectedValue(new Error("native error"));

    await expect(scheduleCareNotifications(pet)).resolves.toBeUndefined();
  });

  it("schedules energy notification with correct delay when hunger is above critical", async () => {
    const pet = makePet({ hunger: 40, energy: 50 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    const before = Date.now();
    await scheduleCareNotifications(pet);

    const call = mockSchedule.mock.calls[0][0];
    const energyNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_002,
    );

    // Hunger drops 40→20 in 10h, then energy drops 50→30 in 10h = 20h total
    const expectedHours = (40 - 20) / 2 + (50 - 30) / 2;
    const expectedMs = expectedHours * 3600_000;

    expect(energyNotif.schedule.at.getTime()).toBeGreaterThanOrEqual(
      before + expectedMs - 1000,
    );
    expect(energyNotif.schedule.at.getTime()).toBeLessThanOrEqual(
      before + expectedMs + 1000,
    );
  });
  it("schedules hunger notification with Turkish copy when language is tr", async () => {
    const pet = makePet({ hunger: 40, energy: 80 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet, undefined, "tr");

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const hungerNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_001,
    );

    expect(hungerNotif).toBeDefined();
    expect(hungerNotif.title).toBe("Dostun acıkmaya başlıyor");
    expect(hungerNotif.body).toBe("Küçük bir atıştırmalık gününü güzelleştirir.");
  });

  it("schedules energy notification with Turkish copy when language is tr", async () => {
    const pet = makePet({ hunger: 18, energy: 50 });
    mockRequestPermissions.mockResolvedValue({ display: "granted" });
    mockSchedule.mockResolvedValue({ notifications: [] });

    await scheduleCareNotifications(pet, undefined, "tr");

    expect(mockSchedule).toHaveBeenCalledOnce();
    const call = mockSchedule.mock.calls[0][0];
    const energyNotif = call.notifications.find(
      (n: { id: number }) => n.id === 1_000_002,
    );

    expect(energyNotif).toBeDefined();
    expect(energyNotif.title).toBe("Dostunun dinlenmesi gerekiyor");
    expect(energyNotif.body).toBe("Sıcacık bir uyku onu canlandırır.");
  });
});

describe("cancelAllCareNotifications", () => {
  it("cancels both care notifications", async () => {
    await cancelAllCareNotifications();

    expect(mockCancel).toHaveBeenCalledOnce();
    expect(mockCancel).toHaveBeenCalledWith({
      notifications: [{ id: 1_000_001 }, { id: 1_000_002 }],
    });
  });

  it("does not cancel in PWA", async () => {
    nativeApp = false;

    await cancelAllCareNotifications();

    expect(mockCancel).not.toHaveBeenCalled();
  });

  it("does not throw if the native API fails", async () => {
    mockCancel.mockRejectedValue(new Error("native error"));

    await expect(cancelAllCareNotifications()).resolves.toBeUndefined();
  });
});
