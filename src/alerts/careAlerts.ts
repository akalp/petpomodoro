import { LocalNotifications } from "@capacitor/local-notifications";

import { isNativeApp } from "../platform";
import { ACTIVE_BALANCE_PROFILE, type FocusSession, type PetState } from "../domain";

const CARE_HUNGER_NOTIFICATION_ID = 1_000_001;
const CARE_ENERGY_NOTIFICATION_ID = 1_000_002;

const HUNGER_THRESHOLD = moodThreshold("hungry", "hunger", 15);
const ENERGY_THRESHOLD = moodThreshold("tired", "energy", 30);

function hoursUntilHungerReaches(hunger: number, target: number): number {
  if (hunger <= target) {
    return 0;
  }

  return (hunger - target) / ACTIVE_BALANCE_PROFILE.care.hungerDecayPerHour;
}

function hoursUntilEnergyReaches(
  hunger: number,
  energy: number,
  target: number,
): number {
  if (energy <= target) {
    return 0;
  }

  if (hunger > ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyThreshold) {
    const hoursToCriticalHunger =
      (hunger - ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyThreshold) /
      ACTIVE_BALANCE_PROFILE.care.hungerDecayPerHour;
    const hoursToTargetEnergy =
      (energy - target) /
      ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyDecayPerHour;

    return hoursToCriticalHunger + hoursToTargetEnergy;
  }

  return (
    (energy - target) /
    ACTIVE_BALANCE_PROFILE.care.criticalHungerEnergyDecayPerHour
  );
}

export async function scheduleCareNotifications(
  pet: PetState,
  activeSession?: FocusSession | null,
): Promise<void> {
  if (!isNativeApp) {
    return;
  }

  await cancelAllCareNotifications();

  if (pet.sleepStartedAt || isFocusActive(activeSession)) {
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

function isFocusActive(session: FocusSession | null | undefined): boolean {
  return (
    session?.status === "running" ||
    session?.status === "awaiting_confirmation"
  );
}

function moodThreshold(
  mood: "hungry" | "tired",
  metric: "hunger" | "energy",
  fallback: number,
): number {
  const rule = ACTIVE_BALANCE_PROFILE.mood.rules.find(
    (candidate) => candidate.mood === mood,
  );
  const condition = rule?.conditions.find(
    (candidate) =>
      candidate.metric === metric && candidate.comparison === "lte",
  );

  return condition?.value ?? fallback;
}
