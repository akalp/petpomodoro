import { create, type StoreApi, type UseBoundStore } from "zustand";

import {
  applyAppOpenDecay,
  applyFocusSessionImpact,
  applyHungerDecay,
  isPetSleeping,
  type ClaimFocusRewardResult,
  type FoodItemId,
  type FoodPurchaseResult,
  type FocusSession,
  type PetSleepResult,
  type PetSleepSummary,
  type PetState,
  type RewardSummary,
} from "../domain";
import {
  applyStoredSessionImpact,
  buyFoodForStoredPet,
  claimStoredSessionReward,
  getCurrentPet,
  loadOrCreateDefaultPet,
  startStoredPetSleep,
  updatePet,
  wakeStoredPetFromSleep,
} from "../db";

import { errorMessage } from "./errors";

export interface PetStoreDependencies {
  getCurrentPet: typeof getCurrentPet;
  loadOrCreateDefaultPet: typeof loadOrCreateDefaultPet;
  updatePet: typeof updatePet;
  claimStoredSessionReward: typeof claimStoredSessionReward;
  applyStoredSessionImpact: typeof applyStoredSessionImpact;
  buyFoodForStoredPet: typeof buyFoodForStoredPet;
  startStoredPetSleep: typeof startStoredPetSleep;
  wakeStoredPetFromSleep: typeof wakeStoredPetFromSleep;
  now: () => string;
}

export interface PetStoreState {
  pet: PetState | null;
  lastRewardSummary: RewardSummary | null;
  lastFoodPurchase: FoodPurchaseResult["summary"] | null;
  lastSleepSummary: PetSleepSummary | null;
  isLoading: boolean;
  error: string | null;
  initializePet: (now?: string) => Promise<PetState>;
  loadCurrentPet: () => Promise<PetState | null>;
  applyReward: (pet: PetState) => Promise<PetState>;
  applyHonestyReward: (
    sessionId: string,
    now?: string,
  ) => Promise<ClaimFocusRewardResult>;
  applySessionReward: (
    session: FocusSession,
    now?: string,
  ) => Promise<ClaimFocusRewardResult>;
  applyFocusImpact: (
    session: FocusSession,
    now?: string,
  ) => Promise<{ pet: PetState; session: FocusSession }>;
  buyFood: (
    foodId: FoodItemId | string,
    now?: string,
  ) => Promise<FoodPurchaseResult>;
  startSleep: (now?: string) => Promise<PetState>;
  wakeSleep: (now?: string) => Promise<PetSleepResult>;
  renamePet: (name: string, now?: string) => Promise<PetState>;
  clearLastRewardSummary: () => void;
  clearLastFoodPurchase: () => void;
  clearLastSleepSummary: () => void;
  updateAppOpenDecay: (now?: string) => Promise<PetState | null>;
  updateDecayOnOpen: (now?: string) => Promise<PetState | null>;
  clearError: () => void;
}

const defaultDependencies: PetStoreDependencies = {
  getCurrentPet,
  loadOrCreateDefaultPet,
  updatePet,
  claimStoredSessionReward,
  applyStoredSessionImpact,
  buyFoodForStoredPet,
  startStoredPetSleep,
  wakeStoredPetFromSleep,
  now: () => new Date().toISOString(),
};

export function createPetStore(
  dependencies: PetStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<PetStoreState>> {
  return create<PetStoreState>((set, get) => ({
    pet: null,
    lastRewardSummary: null,
    lastFoodPurchase: null,
    lastSleepSummary: null,
    isLoading: false,
    error: null,

    initializePet: async (now = dependencies.now()) => {
      set({ isLoading: true, error: null });

      try {
        const pet = await dependencies.loadOrCreateDefaultPet(now);
        set({ pet, isLoading: false });
        return pet;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    loadCurrentPet: async () => {
      set({ isLoading: true, error: null });

      try {
        const pet = (await dependencies.getCurrentPet()) ?? null;
        set({ pet, isLoading: false });
        return pet;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    applyReward: async (pet) => {
      set({ isLoading: true, error: null });

      try {
        const savedPet = await dependencies.updatePet(pet);
        set({ pet: savedPet, isLoading: false });
        return savedPet;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    applyHonestyReward: async (sessionId, now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const result = await dependencies.claimStoredSessionReward({
          petId: pet.id,
          sessionId,
          now,
        });
        set({
          pet: result.pet,
          lastRewardSummary: result.summary,
          isLoading: false,
        });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    applySessionReward: async (session, now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const result = await dependencies.claimStoredSessionReward({
          petId: pet.id,
          sessionId: session.id,
          session,
          now,
        });
        set({
          pet: result.pet,
          lastRewardSummary: result.summary,
          isLoading: false,
        });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    applyFocusImpact: async (session, now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const localImpact = applyFocusSessionImpact(pet, session, now);
        if (
          localImpact.pet === pet &&
          localImpact.session === session &&
          session.status === "running"
        ) {
          set({ isLoading: false });
          return localImpact;
        }

        const result = await dependencies.applyStoredSessionImpact({
          petId: pet.id,
          session,
          now,
        });
        set({ pet: result.pet, isLoading: false });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    buyFood: async (foodId, now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const result = await dependencies.buyFoodForStoredPet({
          petId: pet.id,
          foodId,
          now,
        });
        set({
          pet: result.pet,
          lastFoodPurchase: result.summary,
          isLoading: false,
        });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    startSleep: async (now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const savedPet = await dependencies.startStoredPetSleep({
          petId: pet.id,
          now,
        });
        set({
          pet: savedPet,
          lastSleepSummary: null,
          isLoading: false,
        });
        return savedPet;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    wakeSleep: async (now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      set({ isLoading: true, error: null });

      try {
        const result = await dependencies.wakeStoredPetFromSleep({
          petId: pet.id,
          now,
        });
        set({
          pet: result.pet,
          lastSleepSummary: result.summary,
          isLoading: false,
        });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    renamePet: async (name, now = dependencies.now()) => {
      const pet = get().pet ?? (await get().initializePet(now));
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Your pet needs a small name to answer to.");
      }

      const nextPet: PetState = {
        ...pet,
        name: trimmedName.slice(0, 24),
        updatedAt: now,
      };

      return get().applyReward(nextPet);
    },

    clearLastRewardSummary: () => set({ lastRewardSummary: null }),

    clearLastFoodPurchase: () => set({ lastFoodPurchase: null }),

    clearLastSleepSummary: () => set({ lastSleepSummary: null }),

    updateAppOpenDecay: async (now = dependencies.now()) => {
      const pet = get().pet ?? (await get().loadCurrentPet());

      if (!pet) {
        return null;
      }

      if (isPetSleeping(pet)) {
        return pet;
      }

      const decayedPet = applyAppOpenDecay(pet, now);

      if (decayedPet === pet) {
        return pet;
      }

      return get().applyReward(decayedPet);
    },

    updateDecayOnOpen: async (now = dependencies.now()) => {
      const pet = get().pet ?? (await get().loadCurrentPet());

      if (!pet) {
        return null;
      }

      if (isPetSleeping(pet)) {
        return pet;
      }

      const decayedPet = applyHungerDecay(pet, now);

      if (decayedPet === pet) {
        return pet;
      }

      return get().applyReward(decayedPet);
    },

    clearError: () => set({ error: null }),
  }));
}

export const usePetStore = createPetStore();
