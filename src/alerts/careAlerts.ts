import { LocalNotifications } from "@capacitor/local-notifications";

import { isNativeApp } from "../platform";
import type { PetState } from "../domain";

const CARE_HUNGER_NOTIFICATION_ID = 1_000_001;
const CARE_ENERGY_NOTIFICATION_ID = 1_000_002;

const HUNGER_THRESHOLD = 15;
const ENERGY_THRESHOLD = 30;
const HUNGER_DECAY_PER_HOUR = 2;
const CRITICAL_HUNGER_THRESHOLD = 20;
const ENERGY_DECAY_PER_HOUR = 2;

function hoursUntilHungerReaches(hunger: number, target: number): number {
  if (hunger <= target) {
    return 0;
  }

  return (hunger - target) / HUNGER_DECAY_PER_HOUR;
}

function hoursUntilEnergyReaches(
  hunger: number,
  energy: number,
  target: number,
): number {
  if (energy <= target) {
    return 0;
  }

  if (hunger > CRITICAL_HUNGER_THRESHOLD) {
    const hoursToCriticalHunger =
      (hunger - CRITICAL_HUNGER_THRESHOLD) / HUNGER_DECAY_PER_HOUR;
    const hoursToTargetEnergy = (energy - target) / ENERGY_DECAY_PER_HOUR;

    return hoursToCriticalHunger + hoursToTargetEnergy;
  }

  return (energy - target) / ENERGY_DECAY_PER_HOUR;
}

export async function scheduleCareNotifications(
  pet: PetState,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  if (pet.sleepStartedAt) {
    return;
  }

  const now = Date.now();
  const notifications: Array<{
    id: number;
    title: string;
    body: string;
    sound: string;
    schedule: { at: Date };
  }> = [];

  const hungerHours = hoursUntilHungerReaches(pet.hunger, HUNGER_THRESHOLD);

  if (hungerHours > 0) {
    const hungerAt = new Date(now + hungerHours * 3600_000);

    notifications.push({
      id: CARE_HUNGER_NOTIFICATION_ID,
      title: "Your pet is getting hungry",
      body: "A small snack would brighten their day.",
      sound: "notification.caf",
      schedule: { at: hungerAt },
    });
  }

  const energyHours = hoursUntilEnergyReaches(
    pet.hunger,
    pet.energy,
    ENERGY_THRESHOLD,
  );

  if (energyHours > 0) {
    const energyAt = new Date(now + energyHours * 3600_000);

    notifications.push({
      id: CARE_ENERGY_NOTIFICATION_ID,
      title: "Your pet could use a rest",
      body: "A cozy nap helps them recover.",
      sound: "notification.caf",
      schedule: { at: energyAt },
    });
  }

  if (notifications.length === 0) {
    return;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();

    if (permission.display !== "granted") {
      return;
    }

    await LocalNotifications.schedule({ notifications });
  } catch {
    // Silently ignore — notifications are a convenience.
  }
}

export async function cancelAllCareNotifications(): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [
        { id: CARE_HUNGER_NOTIFICATION_ID },
        { id: CARE_ENERGY_NOTIFICATION_ID },
      ],
    });
  } catch {
    // Silently ignore.
  }
}
