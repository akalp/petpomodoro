export type PetMood = "calm" | "happy" | "hungry" | "tired" | "sad";
export type PetDisplayMood = PetMood | "working" | "sleeping";
export type PetSpeciesId = "momo" | "moowi";
export type SupportedLanguage = "en" | "tr";

export interface PetState {
  id: string;
  speciesId: PetSpeciesId;
  name: string;
  customName: string | null;
  level: number;
  xp: number;
  mood: PetMood;
  coins: number;
  happiness: number;
  hunger: number;
  energy: number;
  streak: number;
  honestyHearts: number;
  lastFreezeUsedAt: string | null;
  sleepStartedAt: string | null;
  lastHungerUpdatedAt: string;
  lastAppOpenedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type RewardType = "focus_completed" | "honesty";

export type AbandonmentReason = "cancelled" | "honest_confirmation";

export type FocusSessionStatus =
  | "idle"
  | "running"
  | "awaiting_confirmation"
  | "completed"
  | "abandoned";

export interface FocusSession {
  id: string;
  status: FocusSessionStatus;
  plannedDurationMinutes: number;
  startedAt: string;
  expectedEndAt: string;
  confirmedAt: string | null;
  abandonedAt: string | null;
  abandonmentReason: AbandonmentReason | null;
  rewardClaimedAt: string | null;
  focusImpactAppliedUntil: string;
  focusCoinsAwarded: number;
}

export interface AppSettings {
  id: "local-settings";
  preferredDurationMinutes: number;
  hasInstalledShortcut: boolean;
  hasEnabledFocusNotifications: boolean;
  language: SupportedLanguage;
  motivationalMessages: string[];
  updatedAt: string;
}

export interface DailyFocusState {
  petId: string;
  dateKey: string;
  completedFocusMinutes: number;
  dailyGoalAwarded: boolean;
  honestyHeartsAwarded: number;
  streakFreezesUsed: number;
  lastStreakFreezeAt: string | null;
  powerNapsUsed: number;
  emergencySnacksUsed: number;
  lastPowerNapAt: string | null;
}

export interface RewardLedger {
  id: string;
  sessionId: string;
  petId: string;
  rewardType: RewardType;
  xpAwarded: number;
  coinsAwarded: number;
  happinessAwarded: number;
  hungerAwarded: number;
  energyAwarded: number;
  streakAwarded: number;
  honestyHeartsAwarded: number;
  createdAt: string;
}

export interface RewardSummary {
  rewardType: RewardType;
  xpAwarded: number;
  coinsAwarded: number;
  happinessAwarded: number;
  hungerAwarded: number;
  energyAwarded: number;
  streakAwarded: number;
  honestyHeartsAwarded: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export type PomodoroSession = FocusSession;
export type PomodoroSessionStatus = FocusSessionStatus;
export type Pet = PetState;
