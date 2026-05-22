import { describe, expect, it } from "vitest";
import {
  addPetXp,
  applyHungerDecay,
  calculateLevel,
  DEFAULT_HUNGER_DECAY_PER_HOUR,
} from "./pet";
import { makePet } from "../test/factories";

describe("pet domain logic", () => {
  it("calculates deterministic levels from total XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(250)).toBe(3);
    expect(calculateLevel(-20)).toBe(1);
  });

  it("adds XP and recalculates the pet level", () => {
    const pet = makePet({ xp: 90, level: 1 });
    const updated = addPetXp(pet, 25, "2026-05-22T12:30:00.000Z");

    expect(updated).toMatchObject({
      xp: 115,
      level: 2,
      mood: "calm",
      updatedAt: "2026-05-22T12:30:00.000Z",
    });
    expect(pet.xp).toBe(90);
  });

  it("decays hunger by elapsed hours without dropping below zero", () => {
    const pet = makePet({
      hunger: 10,
      lastHungerUpdatedAt: "2026-05-22T08:00:00.000Z",
      updatedAt: "2026-05-22T08:00:00.000Z",
    });

    const updated = applyHungerDecay(
      pet,
      "2026-05-22T12:00:00.000Z",
      DEFAULT_HUNGER_DECAY_PER_HOUR,
    );

    expect(updated.hunger).toBe(0);
    expect(updated.mood).toBe("sleepy");
    expect(updated.lastHungerUpdatedAt).toBe("2026-05-22T12:00:00.000Z");
    expect(updated.updatedAt).toBe("2026-05-22T12:00:00.000Z");
  });

  it("does not decay hunger when time has not moved forward", () => {
    const pet = makePet({ hunger: 80 });

    expect(applyHungerDecay(pet, "2026-05-22T11:59:00.000Z")).toBe(pet);
  });
});
