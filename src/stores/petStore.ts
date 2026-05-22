import { create, type StoreApi, type UseBoundStore } from "zustand";

import { applyHungerDecay, type ClaimFocusRewardResult, type PetState } from "../domain";
import {
  claimStoredFocusReward,
  getCurrentPet,
  loadOrCreateDefaultPet,
  updatePet,
} from "../db";

import { errorMessage } from "./errors";

export interface PetStoreDependencies {
  getCurrentPet: typeof getCurrentPet;
  loadOrCreateDefaultPet: typeof loadOrCreateDefaultPet;
  updatePet: typeof updatePet;
  claimStoredFocusReward: typeof claimStoredFocusReward;
  now: () => string;
}

export interface PetStoreState {
  pet: PetState | null;
  isLoading: boolean;
  error: string | null;
  initializePet: (now?: string) => Promise<PetState>;
  loadCurrentPet: () => Promise<PetState | null>;
  applyReward: (pet: PetState) => Promise<PetState>;
  applyHonestyReward: (
    sessionId: string,
    now?: string,
  ) => Promise<ClaimFocusRewardResult>;
  updateDecayOnOpen: (now?: string) => Promise<PetState | null>;
  clearError: () => void;
}

const defaultDependencies: PetStoreDependencies = {
  getCurrentPet,
  loadOrCreateDefaultPet,
  updatePet,
  claimStoredFocusReward,
  now: () => new Date().toISOString(),
};

export function createPetStore(
  dependencies: PetStoreDependencies = defaultDependencies,
): UseBoundStore<StoreApi<PetStoreState>> {
  return create<PetStoreState>((set, get) => ({
    pet: null,
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
        const result = await dependencies.claimStoredFocusReward({
          petId: pet.id,
          sessionId,
          now,
        });
        set({ pet: result.pet, isLoading: false });
        return result;
      } catch (error) {
        set({ error: errorMessage(error), isLoading: false });
        throw error;
      }
    },

    updateDecayOnOpen: async (now = dependencies.now()) => {
      const pet = get().pet ?? (await get().loadCurrentPet());

      if (!pet) {
        return null;
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

