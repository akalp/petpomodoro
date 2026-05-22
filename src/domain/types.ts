export type PetMood = "calm" | "happy" | "sleepy";

export interface PetState {
  id: string;
  name: string;
  level: number;
  xp: number;
  mood: PetMood;
  coins: number;
  happiness: number;
  hunger: number;
  energy: number;
  streak: number;
  honestyHearts: number;
  lastHungerUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type RewardType = "focus_completed" | "honesty";

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
  rewardClaimedAt: string | null;
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
