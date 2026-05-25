import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import {
  addPetXp,
  applyAppOpenDecay,
  applyFocusSessionImpact,
  applyHungerDecay,
  calculateLevel,
  changePetSpecies,
  DEFAULT_PET_SPECIES_ID,
  DEFAULT_HUNGER_DECAY_PER_HOUR,
  displayMoodForSession,
  normalizePetState,
  previewPetSleep,
  startPetSleep,
  wakePetFromSleep,
  moodForStats,
} from "./pet";
import { PET_MOOD_RULES, resolvePetMood } from "./petMoodRules";
import { makePet, makeSession } from "../test/factories";

describe("pet domain logic", () => {
  it("calculates deterministic levels from total XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(250)).toBe(3);
    expect(calculateLevel(-20)).toBe(1);
  });

  it("normalizes legacy pets to Momo species", () => {
    const legacyPet = makePet();
    delete (legacyPet as Partial<typeof legacyPet>).speciesId;

    expect(normalizePetState(legacyPet).speciesId).toBe(DEFAULT_PET_SPECIES_ID);
  });

  it("changes species without changing progress or pet identity", () => {
    const pet = makePet({ coins: 12, xp: 75, happiness: 82 });
    const updated = changePetSpecies(
      pet,
      "moowi",
      "2026-05-22T12:30:00.000Z",
    );

    expect(updated).toMatchObject({
      id: pet.id,
      speciesId: "moowi",
      coins: 12,
      xp: 75,
      happiness: 82,
      updatedAt: "2026-05-22T12:30:00.000Z",
    });
    expect(pet.speciesId).toBe(DEFAULT_PET_SPECIES_ID);
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
    expect(updated.happiness).toBeLessThan(50);
    expect(updated.mood).toBe("hungry");
    expect(updated.lastHungerUpdatedAt).toBe("2026-05-22T12:00:00.000Z");
    expect(updated.updatedAt).toBe("2026-05-22T12:00:00.000Z");
  });

  it("applies focus impact from elapsed minutes once", () => {
    const result = applyFocusSessionImpact(
      makePet(),
      makeSession(),
      "2026-05-22T12:25:00.000Z",
    );

    expect(result.pet).toMatchObject({
      coins: 5,
      hunger: 95,
      energy: 73,
      lastHungerUpdatedAt: "2026-05-22T12:25:00.000Z",
    });
    expect(result.session).toMatchObject({
      focusImpactAppliedUntil: "2026-05-22T12:25:00.000Z",
      focusCoinsAwarded: 5,
    });

    const repeated = applyFocusSessionImpact(
      result.pet,
      result.session,
      "2026-05-22T12:25:00.000Z",
    );

    expect(repeated.pet).toBe(result.pet);
    expect(repeated.session).toBe(result.session);
  });

  it("scales focus impact for longer custom durations", () => {
    const result = applyFocusSessionImpact(
      makePet(),
      makeSession({
        plannedDurationMinutes: 90,
        expectedEndAt: "2026-05-22T13:30:00.000Z",
      }),
      "2026-05-22T13:30:00.000Z",
    );

    expect(result.pet.coins).toBe(18);
    expect(result.pet.hunger).toBe(82);
    expect(result.pet.energy).toBeCloseTo(54.8);
  });

  it("awards focus coins only for full five minute blocks", () => {
    const first = applyFocusSessionImpact(
      makePet(),
      makeSession(),
      "2026-05-22T12:07:00.000Z",
    );
    const second = applyFocusSessionImpact(
      first.pet,
      first.session,
      "2026-05-22T12:10:00.000Z",
    );

    expect(first.pet.coins).toBe(1);
    expect(first.session.focusCoinsAwarded).toBe(1);
    expect(second.pet.coins).toBe(2);
    expect(second.session.focusCoinsAwarded).toBe(2);
  });

  it("applies capped app-open happiness decay", () => {
    const updated = applyAppOpenDecay(
      makePet({
        happiness: 80,
        lastAppOpenedAt: "2026-05-21T12:00:00.000Z",
      }),
      "2026-05-22T12:00:00.000Z",
    );

    expect(updated.happiness).toBe(74);
    expect(updated.lastAppOpenedAt).toBe("2026-05-22T12:00:00.000Z");
  });

  it("does not decay hunger when time has not moved forward", () => {
    const pet = makePet({ hunger: 80 });

    expect(applyHungerDecay(pet, "2026-05-22T11:59:00.000Z")).toBe(pet);
  });

  it("shows a working mood only while a focus session is running", () => {
    expect(displayMoodForSession("happy", "running")).toBe("working");
    expect(displayMoodForSession("happy", "awaiting_confirmation")).toBe("happy");
    expect(displayMoodForSession("happy", null, true)).toBe("sleeping");
    expect(displayMoodForSession("tired", null)).toBe("tired");
  });

  it("starts timed pet sleep", () => {
    const pet = makePet();
    const updated = startPetSleep(pet, "2026-05-22T13:00:00.000Z");

    expect(updated).toMatchObject({
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
      updatedAt: "2026-05-22T13:00:00.000Z",
    });
    expect(pet.sleepStartedAt).toBeNull();
  });

  it("rejects starting sleep while already sleeping", () => {
    expect(() =>
      startPetSleep(
        makePet({ sleepStartedAt: "2026-05-22T13:00:00.000Z" }),
        "2026-05-22T13:01:00.000Z",
      ),
    ).toThrow(DomainError);
  });

  it("wakes from one hour of sleep with energy recovery and hunger decay", () => {
    const result = wakePetFromSleep(
      makePet({
        energy: 20,
        happiness: 50,
        hunger: 100,
        sleepStartedAt: "2026-05-22T13:00:00.000Z",
      }),
      "2026-05-22T14:00:00.000Z",
    );

    expect(result.pet).toMatchObject({
      energy: 38,
      happiness: 51,
      hunger: 96,
      sleepStartedAt: null,
      lastHungerUpdatedAt: "2026-05-22T14:00:00.000Z",
      lastAppOpenedAt: "2026-05-22T14:00:00.000Z",
      updatedAt: "2026-05-22T14:00:00.000Z",
    });
    expect(result.summary).toMatchObject({
      elapsedMinutes: 60,
      energyGained: 18,
      hungerChanged: -4,
      happinessGained: 1,
    });
  });

  it("caps long sleep energy recovery", () => {
    const result = wakePetFromSleep(
      makePet({
        energy: 10,
        happiness: 50,
        hunger: 100,
        sleepStartedAt: "2026-05-22T13:00:00.000Z",
      }),
      "2026-05-22T17:00:00.000Z",
    );

    expect(result.pet.energy).toBe(64);
    expect(result.pet.hunger).toBe(84);
    expect(result.pet.happiness).toBe(53);
    expect(result.summary.energyGained).toBe(54);
  });

  it("clamps sleep stat changes at pet stat bounds", () => {
    const result = wakePetFromSleep(
      makePet({
        energy: 90,
        happiness: 99,
        hunger: 2,
        sleepStartedAt: "2026-05-22T13:00:00.000Z",
      }),
      "2026-05-22T14:00:00.000Z",
    );

    expect(result.pet.energy).toBe(100);
    expect(result.pet.hunger).toBe(0);
    expect(result.pet.happiness).toBe(99);
    expect(result.summary.energyGained).toBe(10);
    expect(result.summary.hungerChanged).toBe(-2);
  });

  it("recalculates persisted care mood after waking", () => {
    const result = wakePetFromSleep(
      makePet({
        energy: 0,
        happiness: 80,
        hunger: 26,
        sleepStartedAt: "2026-05-22T13:00:00.000Z",
      }),
      "2026-05-22T14:00:00.000Z",
    );

    expect(result.pet.mood).toBe("hungry");
  });

  it("previews sleep recovery without mutating the pet", () => {
    const pet = makePet({
      energy: 20,
      hunger: 100,
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
    });

    const summary = previewPetSleep(pet, "2026-05-22T14:00:00.000Z");

    expect(summary.nextStats).toMatchObject({
      energy: 38,
      hunger: 96,
    });
    expect(pet.energy).toBe(20);
    expect(pet.hunger).toBe(100);
  });

  it("derives actionable moods from care stats", () => {
    expect(moodForStats({ happiness: 80, hunger: 20, energy: 80 })).toBe(
      "hungry",
    );
    expect(moodForStats({ happiness: 80, hunger: 80, energy: 10 })).toBe(
      "tired",
    );
    expect(moodForStats({ happiness: 20, hunger: 80, energy: 80 })).toBe("sad");
    expect(moodForStats({ happiness: 80, hunger: 80, energy: 80 })).toBe(
      "happy",
    );
    expect(moodForStats({ happiness: 50, hunger: 80, energy: 80 })).toBe(
      "calm",
    );
  });

  it("keeps pet mood rule priorities explicit", () => {
    expect(
      PET_MOOD_RULES.map(({ mood, priority }) => ({ mood, priority })),
    ).toEqual([
      { mood: "hungry", priority: 100 },
      { mood: "tired", priority: 90 },
      { mood: "sad", priority: 80 },
      { mood: "happy", priority: 40 },
      { mood: "calm", priority: 0 },
    ]);
  });

  it("resolves pet moods at documented thresholds", () => {
    expect(resolvePetMood({ happiness: 50, hunger: 25, energy: 50 })).toBe(
      "hungry",
    );
    expect(resolvePetMood({ happiness: 50, hunger: 26, energy: 15 })).toBe(
      "tired",
    );
    expect(resolvePetMood({ happiness: 25, hunger: 26, energy: 16 })).toBe("sad");
    expect(resolvePetMood({ happiness: 60, hunger: 26, energy: 16 })).toBe(
      "happy",
    );
    expect(resolvePetMood({ happiness: 59, hunger: 26, energy: 16 })).toBe(
      "calm",
    );
  });

  it("uses priority order when multiple pet mood rules match", () => {
    expect(resolvePetMood({ happiness: 20, hunger: 20, energy: 10 })).toBe(
      "hungry",
    );
    expect(resolvePetMood({ happiness: 20, hunger: 26, energy: 10 })).toBe(
      "tired",
    );
    expect(resolvePetMood({ happiness: 20, hunger: 26, energy: 16 })).toBe(
      "sad",
    );
  });
});
