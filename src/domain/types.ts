export type PetMood = "calm" | "happy" | "sleepy";

export interface PetState {
  id: string;
  name: string;
  level: number;
  xp: number;
  mood: PetMood;
  hunger: number;
  createdAt: string;
  updatedAt: string;
}

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
  xpAwarded: number;
  createdAt: string;
}

export type PomodoroSession = FocusSession;
export type PomodoroSessionStatus = FocusSessionStatus;
export type Pet = PetState;
