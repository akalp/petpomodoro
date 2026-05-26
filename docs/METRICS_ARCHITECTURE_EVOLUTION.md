# PetPomodoro Metrics Architecture Evolution Roadmap

This document defines the intended evolution of PetPomodoro's care, reward, economy, sleep, rescue, honesty, streak, and achievement metrics.

It is intentionally separate from `docs/ARCHITECTURE_EVOLUTION.md`, which focuses on app shell, navigation, UI architecture, CSS art, and long-term presentation structure. This document focuses on the domain balance model and the technical architecture needed to make that balance easy to configure, test, and evolve.

The target product feel is:

- cozy, gentle, and shame-free;
- balanced enough to avoid obvious farming/exploit loops;
- meaningful enough that hunger, energy, happiness, sleep, focus, food, honesty, and streak all connect logically;
- fully local-first and offline-first;
- easy to tune through centralized configuration rather than scattered magic numbers.

## Current baseline inventory

This section records the current runtime behavior before the configurable balance work begins. It is intentionally descriptive only; these values are not the target balance.

### Current PetState metrics

| Field | Current role | Current writes |
| --- | --- | --- |
| `xp` | Total lifetime focus XP. Level is derived from total XP. | Initial pet starts at `0`; `applyPetStatAdjustments` adds reward XP and clamps at minimum `0`; completed focus reward adds `25`; honesty adds `0`. |
| `level` | Display/progression level. | Initial pet starts at `1`; recalculated as `floor(max(0, xp) / 100) + 1` whenever `applyPetStatAdjustments` changes XP. |
| `coins` | Local food shop currency. | Initial pet starts at `0`; focus impact adds base coins for full 5-minute focus blocks; completed reward adds `10`; food purchases subtract item cost; clamped at minimum `0`. |
| `happiness` | Care stat and mood input. | Initial pet starts at `50`; completed reward adds `8`; honesty reward adds `3`; food adds item happiness; idle app-open decay subtracts up to `6`; low-care pressure during hunger/focus impact may subtract more; sleep can add happiness based on energy recovered. Clamped `0..100`. |
| `hunger` | Care stat and mood input. Higher means better fed. | Initial pet starts at `100`; idle hunger decay subtracts `4` per hour; focus impact subtracts `0.2` per minute; sleep subtracts `4` per hour; food adds item hunger; completed and honesty rewards add `0`. Clamped `0..100`. |
| `energy` | Care stat and mood input. Higher means more rested. | Initial pet starts at `80`; focus impact subtracts `0.28` per minute; sleep adds `18` per hour capped at `54` gained per wake; food adds item energy; completed and honesty rewards add `0`. Clamped `0..100`. |
| `streak` | Current simple completion count. | Initial pet starts at `0`; completed focus reward adds `1`; honesty, focus impact, sleep, feeding, and idle decay do not change it. |
| `honestyHearts` | Trust marker for honest declined confirmation. | Initial pet starts at `0`; honesty reward adds `1`; completed focus, sleep, feeding, and decay do not change it. |
| `mood` | Persisted care mood derived from happiness, hunger, and energy. | Recomputed by care/reward/feed/decay/wake actions. Start sleep does not change persisted mood. Working and sleeping are display-only overrides. |
| `sleepStartedAt` | Null when awake; ISO timestamp while sleeping. | Initial pet starts as `null`; start sleep sets `now`; wake clears to `null`; normalization/backfill defaults missing values to `null`. |
| `lastHungerUpdatedAt` | Timestamp anchor for hunger decay and focus/sleep care accounting. | Initial pet starts at `now`; hunger-changing adjustments set it to `now`; focus impact sets it to the focus impact timestamp; idle hunger decay sets it to `now`; wake sets it to `now` only when sleep elapsed. |
| `lastAppOpenedAt` | Timestamp anchor for app-open happiness decay. | Initial pet starts at `now`; app-open decay and wake set it to `now`; normalization/backfill defaults missing values from hunger/update timestamps. |

### Current FocusSession metrics

| Field | Current role | Current writes |
| --- | --- | --- |
| `plannedDurationMinutes` | Requested whole-minute focus duration. Valid range is `1..180`. | Set when a session starts; shown in UI, used to compute `expectedEndAt`, and used by optional Shortcut URL. Current completion reward is not duration-based. |
| `status` | Session state: `running`, `awaiting_confirmation`, `completed`, or `abandoned`. | Start creates `running`; time check moves running to `awaiting_confirmation` at or after `expectedEndAt`; confirm moves awaiting to `completed`; cancel/honest decline moves to `abandoned`. |
| `confirmedAt` | Completion confirmation timestamp. | Starts `null`; set to `now` only on `awaiting_confirmation -> completed`; reset to `null` on abandonment. |
| `abandonedAt` | Abandonment timestamp. | Starts `null`; set to `now` on early cancellation or honest declined confirmation. |
| `abandonmentReason` | Distinguishes early cancellation from honest declined confirmation. | Starts `null`; running sessions can only set `cancelled`; awaiting-confirmation sessions can only set `honest_confirmation`. |
| `rewardClaimedAt` | Idempotency marker for completion or honesty reward. | Starts `null`; set to reward claim time when reward succeeds; if a ledger row already exists, backfilled from that row's `createdAt`. Early cancellation remains `null`. |
| `focusImpactAppliedUntil` | Timestamp through which elapsed focus care impact has already been applied. | Starts at `startedAt`; focus impact advances up to the earliest of `now`, terminal timestamp, and `expectedEndAt`; prevents duplicate focus care impact. |
| `focusCoinsAwarded` | Count of base focus coins already awarded for elapsed focus blocks. | Starts at `0`; focus impact sets it to total full 5-minute blocks already earned; prevents duplicate base coin grants. |

### Current focus reward rules

Completion reward is fixed and idempotent per session:

| Reward type | Eligibility | XP | Coins | Happiness | Hunger | Energy | Streak | Honesty Hearts |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `focus_completed` | Session status is `completed` and no reward exists. | `25` | `10` | `8` | `0` | `0` | `1` | `0` |
| `honesty` | Session status is `abandoned`, `abandonmentReason` is `honest_confirmation`, and no reward exists. | `0` | `0` | `3` | `0` | `0` | `0` | `1` |

Reward idempotency exists in two layers:

- domain: `claimSessionReward` returns no new reward when `rewardClaimedAt` is set or an existing ledger entry is supplied;
- persistence: `rewardLedger.sessionId` has a unique index, and reward application runs in a Dexie transaction.

### Current focus care impact rules

Elapsed focus care impact is separate from completion/honesty reward and applies to running, awaiting-confirmation, completed, and abandoned sessions when persisted through store/repository paths.

- Impact is capped at the earliest of `now`, `confirmedAt` or `abandonedAt` when present, and `expectedEndAt`.
- Hunger changes by `-0.2` per elapsed focus minute.
- Energy changes by `-0.28` per elapsed focus minute.
- Base coins are `floor(totalFocusMinutes / 5)` minus `focusCoinsAwarded`, so only full 5-minute blocks award coins.
- Low-care pressure can additionally reduce happiness during the elapsed focus window when hunger or energy are below `50`; the decay is capped to at most elapsed hours.
- When impact is applied to a non-running session through the repository, idle hunger decay is also applied from the new `lastHungerUpdatedAt` to `now`.

Current examples from tests:

| Elapsed focus | Base coins | Hunger | Energy |
| ---: | ---: | ---: | ---: |
| 25 min | `+5` | `-5` | `-7` |
| 90 min | `+18` | `-18` | `-25.2` |

### Current idle care and sleep rules

- Idle hunger decay subtracts `4` hunger per hour since `lastHungerUpdatedAt`.
- App-open happiness decay subtracts `0.25` happiness per hour since `lastAppOpenedAt`, capped at `6` per app-open update.
- Low-care happiness pressure subtracts extra happiness when hunger or energy are below `50`.
- There is no generic passive energy decay.
- Starting sleep sets `sleepStartedAt = now` and does not grant rewards or change Pomodoro state.
- Sleeping blocks focus start and food purchases.
- Waking sleep:
  - restores `18` energy per hour, capped at `54` energy gained for the wake action;
  - subtracts `4` hunger per hour;
  - adds `floor(energyGained / 15)` happiness, capped at `4`;
  - clears `sleepStartedAt`;
  - sets `lastAppOpenedAt = now`;
  - sets `lastHungerUpdatedAt = now` only if time elapsed.

### Current shop catalog

| Item | Cost | Hunger | Happiness | Energy |
| --- | ---: | ---: | ---: | ---: |
| Berry Bowl | `3` | `+12` | `+6` | `0` |
| Warm Soup | `5` | `+22` | `+4` | `0` |
| Honey Toast | `6` | `+14` | `+10` | `+4` |
| Moon Milk | `7` | `+8` | `+6` | `+16` |

Food purchases require enough coins and an awake pet. Successful purchases subtract coins, add the listed stats with `0..100` stat caps, update mood, set `updatedAt = now`, and set `lastHungerUpdatedAt = now` because hunger is adjusted. Failed purchases leave the saved pet unchanged.

### Current mood rules

Persisted `PetState.mood` is resolved by priority:

| Priority | Mood | Rule |
| ---: | --- | --- |
| `100` | `hungry` | `hunger <= 25` |
| `90` | `tired` | `energy <= 15` |
| `80` | `sad` | `happiness <= 25` |
| `40` | `happy` | `happiness >= 60` |
| `0` | `calm` | default |

Display mood overrides are not persisted:

- a running focus session displays `working`;
- a sleeping pet displays `sleeping` unless a running session is active, though focus start is blocked while sleeping in current store/UI paths.

### Current persistence and store orchestration

- `pets` stores the single local pet; load paths normalize legacy/default fields.
- `sessions` stores session history and active sessions; active lookup returns the newest `running` or `awaiting_confirmation` session.
- `rewardLedger` stores one row per rewarded session with a unique `sessionId`.
- `settings` stores local device preferences and does not currently carry balance settings.
- Reward claim, focus impact, food purchase, and sleep/wake persistence are transactional where they mutate saved data.
- App initialization loads settings, initializes the pet, applies app-open happiness decay, restores/refreshes the active session, and only applies idle hunger decay if there is no active session.
- Store actions block focus while sleeping; UI disables food during active focus or sleep; domain/repository also block food while sleeping.

### Current risks and gaps to preserve while refactoring

- Balance values are scattered across `pet.ts`, `rewards.ts`, `shop.ts`, and `petMoodRules.ts`.
- Completion XP/coin/happiness rewards are fixed and do not use `plannedDurationMinutes`; a 1-minute completed session can currently claim the same completion reward as a 180-minute session after confirmation.
- `streak` currently increments once per completed rewarded session, not once per daily focus goal.
- Honesty Hearts have no minimum duration or daily cap.
- Sleep energy recovery is capped at `+54`, so long sleep cannot necessarily restore energy to `100`.
- There is no persisted daily state for focus minutes, honesty caps, rescue actions, or streak freezes.
- There are no focus start requirements based on hunger or energy yet, except the sleep block.
- `claimStoredSessionReward` trusts an optional caller-provided session after checking only the id matches the stored session; current store usage passes domain-transitioned sessions, but future refactors should keep this boundary tight.

## Non-negotiable product constraints

- Keep the app fully offline/local-first.
- Do not add backend APIs, auth, accounts, cloud sync, leaderboards, or network-dependent gameplay.
- Keep all timers, rewards, care changes, streaks, and achievements based on local device state.
- Preserve trust-based Pomodoro completion. Never claim to verify real-world focus work.
- Never auto-complete a focus session without the existing honest confirmation flow.
- Do not punish the user harshly for absence. The tone should remain cozy.
- Do not create death, permanent pet loss, or irreversible failure states.
- Rescue mechanics must prevent deadlocks when the pet has low hunger/energy and the user has no coins.
- Honesty Hearts must not become a mini-game currency, market currency, XP source, or coin source.
- Achievement UI, mini-games, cosmetics, and advanced sleep quality are out of scope for the first balance implementation unless explicitly requested later.

## Target balance principles

### 1. Micro-focus is valid, but 25 minutes is the standard

A 5-minute focus session should remain meaningful as a micro-focus action. It should produce a small amount of XP, coins, and happiness. However, it must not outperform a 25-minute session on a per-minute basis through large fixed completion rewards.

The 25-minute session is the standard calibration point for rewards, care costs, daily habit streaks, and shop prices.

### 2. Daily habit streaks are based on daily focus minutes, not session count

Streak should represent a daily focus habit. It should not increase once per completed session.

The target v1 rule is:

```txt
Complete at least 25 focus minutes in a local calendar day to advance the daily streak.
```

Multiple sessions can contribute to the same day. For example, five 5-minute micro-focus sessions can complete the daily goal. The same day can increase streak only once.

### 3. Care metrics should influence each other logically

The desired mental model is:

- working/focusing gives XP, coins, and happiness;
- working/focusing consumes hunger and energy;
- sleep restores energy and gives a little happiness;
- sleep lowers hunger because time passes;
- hunger decays over time;
- happiness decays slowly over time;
- low hunger makes happiness fall faster;
- critically low hunger can also lower energy because the pet is underfed;
- low energy can make happiness fall slightly faster;
- energy should not decay merely because time passed, except through critical hunger or explicit activities.

This avoids a harsh life-sim feel while still making pet care meaningful.

### 4. Energy should not have generic passive decay in v1

Do not implement a generic `energy decreases every hour` rule for v1.

Instead:

- focus sessions consume energy;
- critical hunger drains energy slowly;
- future play activities may consume energy;
- sleep and power nap restore energy;
- some food items may restore a small amount of energy.

This keeps the game cozy while still preventing the user from ignoring hunger forever.

### 5. Sleep can fully restore energy

Sleep should be the primary recovery mechanic. It may restore energy up to 100. It should not have an artificial max gain like `+54` if that prevents a long sleep from fully recovering the pet.

Sleep must not produce XP, coins, streak progress, or Honesty Hearts.

### 6. Rescue mechanics should prevent deadlocks

The user must never get stuck in this loop:

```txt
energy too low to focus
hunger too low to focus
no coins to buy food
cannot earn coins because focus cannot start
```

V1 should include both:

- Power Nap: limited free energy recovery.
- Emergency Snack: limited free hunger recovery.

Both are rescue mechanics, not reward systems.

### 7. Honesty Hearts are trust and streak support, not economy

Honesty Hearts should represent trust and self-kindness. They can support:

- honesty achievements;
- streak freeze/grace-day mechanics.

They should not be used for:

- mini-games;
- market purchases;
- coin conversion;
- XP conversion;
- normal focus rewards.

Because Honesty Hearts can protect streaks, they must have anti-farming limits.

### 8. Shop prices should be calibrated against 25-minute focus income

If a standard 25-minute focus session produces about 7 coins, shop prices should make care useful but not trivial.

Food should feel helpful and cozy, but it should not bypass sleep or make all stats easy to max out after a single short session.

### 9. All balance values must be easy to configure

The implementation should avoid magic numbers spread across `pet.ts`, `rewards.ts`, `shop.ts`, `petMoodRules.ts`, stores, and UI components.

Balance constants should live in a central typed profile. Domain calculations should read from that profile. Tests should be able to import the profile and assert both exact values and behavior tables.

## Proposed configurable balance architecture

### Recommended folder structure

Start small, but move toward this shape:

```txt
src/domain/balance/
  types.ts
  v1Profile.ts
  activeProfile.ts
  calculations.ts
  rewardCalculations.ts
  careCalculations.ts
  startRequirements.ts
  sleepCalculations.ts
  rescueCalculations.ts
  streakCalculations.ts
  honestyCalculations.ts
  moodCalculations.ts
  shopCatalog.ts
  achievementRules.ts
  index.ts
```

This can be implemented incrementally. Do not create files that are empty placeholders. Each file should have a clear purpose and tests.

### Balance profile type

A central profile should hold every tunable value:

```ts
export interface BalanceProfile {
  readonly version: string;

  readonly focus: FocusBalanceConfig;
  readonly care: CareBalanceConfig;
  readonly sleep: SleepBalanceConfig;
  readonly rescue: RescueBalanceConfig;
  readonly streak: StreakBalanceConfig;
  readonly honesty: HonestyBalanceConfig;
  readonly mood: MoodBalanceConfig;
  readonly shop: ShopBalanceConfig;
  readonly achievements: AchievementBalanceConfig;
}
```

The active profile should be explicit:

```ts
export const BALANCE_PROFILE_V1 = {
  version: "v1-cozy-balanced",
  // ...config
} as const satisfies BalanceProfile;

export const ACTIVE_BALANCE_PROFILE = BALANCE_PROFILE_V1;
```

Domain functions should either import `ACTIVE_BALANCE_PROFILE` or accept an optional profile parameter when testability benefits from injection:

```ts
export function calculateFocusReward(
  minutes: number,
  profile: BalanceProfile = ACTIVE_BALANCE_PROFILE,
): FocusRewardResult {
  // pure calculation
}
```

### Why version the balance profile?

Reward and care tuning will change over time. Versioning makes it easier to understand which rules produced a historical reward record.

Recommended approach:

- Do not retroactively recalculate old rewards.
- Store actual awarded values in reward/session records as already done or when adding new records.
- Add `balanceVersion` to new reward-related records if the schema is changed.
- Keep migrations backward-compatible.

### Configuration versus user settings

This roadmap uses "configurable" to mean developer-configurable and test-configurable. It does not mean the user should see sliders for XP, hunger decay, or shop prices.

Recommended rule:

- Product balance lives in typed domain config.
- User preferences remain in settings.
- Do not expose economy tuning to users in v1.

### No scattered magic numbers

The following values should come from the active balance profile:

- XP per focus minute.
- Base coin interval.
- Completion bonus per standard focus block.
- Happiness per focus interval.
- Happiness max per completed session.
- Hunger decay per focus minute.
- Energy decay per focus minute.
- Minimum hunger/energy requirements for starting focus.
- Hunger decay per hour.
- Base happiness decay per hour.
- Low hunger happiness penalty.
- Low energy happiness penalty.
- Critical hunger energy penalty.
- Sleep energy gain.
- Sleep hunger decay.
- Sleep happiness gain and cap.
- Power Nap limits and effects.
- Emergency Snack limits and effects.
- Honesty reward, limits, and eligibility.
- Daily focus goal minutes.
- Streak freeze cost and cooldown.
- Mood thresholds.
- Shop catalog costs and effects.
- Achievement thresholds.

### Pure calculation functions

Each balance subsystem should expose pure functions first. Stores can call these functions and then persist results.

Recommended examples:

```ts
calculateFocusReward(minutes, profile);
calculateFocusCareImpact(minutes, profile);
calculateFocusStartRequirements(minutes, profile);
canStartFocus(pet, minutes, profile);
calculateIdleCareImpact(pet, from, to, profile);
calculateWakeUpEffects(pet, sleepStartedAt, wakeAt, profile);
calculatePowerNapEffects(pet, now, dailyState, profile);
calculateEmergencySnackEffects(pet, now, dailyState, profile);
calculateHonestyReward(session, dailyState, profile);
calculateDailyFocusProgress(existingDailyState, session, profile);
calculateStreakTransition(streakState, dailyState, now, profile);
calculateMoodForStats(stats, activityState, profile);
```

Pure functions make it easier to test the balance with exact tables before wiring UI.

### Local date handling

Daily streaks, daily limits, emergency snack limits, power nap limits, and honesty heart limits require local calendar days.

Recommended utility:

```ts
toLocalDateKey(date: Date): string // YYYY-MM-DD in the user's local timezone
```

Tests should use explicit dates and local date keys. Avoid relying on the machine's current date inside pure tests.

### Daily state model

V1 needs daily counters. They can live in a new repository/table or be embedded in pet state. A dedicated daily state model is cleaner.

Recommended model:

```ts
export interface PetDailyState {
  petId: string;
  dateKey: string;
  completedFocusMinutes: number;
  dailyGoalAwarded: boolean;
  honestyHeartsAwarded: number;
  powerNapsUsed: number;
  emergencySnacksUsed: number;
  lastPowerNapAt: string | null;
}
```

A later version can add more counters without bloating `PetState`.

If the implementation prefers embedding for speed, keep it wrapped behind selectors so it can be moved later.

### Streak state model

Existing `PetState.streak` can remain as the visible streak count. However, daily habit streaks need metadata.

Recommended minimal additions:

```ts
export interface StreakMetadata {
  lastCompletedDateKey: string | null;
  lastEvaluatedDateKey: string | null;
  lastFreezeUsedAt: string | null;
}
```

This can be embedded into `PetState` or a companion record. Keep migration safe for old pets.

### Achievements model

V1 should not implement achievement UI. It can still add domain scaffolding if useful.

Recommended v1 scope:

- Define achievement rule IDs and thresholds.
- Track unlocked achievement IDs locally only if it is low-risk.
- No badge gallery or cosmetic unlock UI yet.

Achievement categories:

- focus achievements;
- daily streak achievements;
- honesty achievements;
- care achievements;
- rescue achievements.

Achievements should avoid large economy rewards in v1.

## Proposed v1 balance profile

The following numbers are the starting profile. They are intentionally simple and should be adjusted through config after playtesting.

### Focus rewards

```ts
DAILY_FOCUS_GOAL_MINUTES = 25;
XP_PER_FOCUS_MINUTE = 1;
FOCUS_BASE_COIN_INTERVAL_MINUTES = 5;
FOCUS_COMPLETION_BONUS_PER_25_MINUTES = 2;
FOCUS_HAPPINESS_PER_5_MINUTES = 1;
FOCUS_HAPPINESS_MAX = 10;
```

Expected examples:

| Completed focus |  XP | Base coins | Completion bonus | Total coins | Happiness |
| --------------: | --: | ---------: | ---------------: | ----------: | --------: |
|           5 min |   5 |          1 |                0 |           1 |        +1 |
|          15 min |  15 |          3 |                0 |           3 |        +3 |
|          25 min |  25 |          5 |                2 |           7 |        +5 |
|          50 min |  50 |         10 |                4 |          14 |       +10 |

### Focus care costs

```ts
FOCUS_HUNGER_DECAY_PER_MINUTE = 0.2;
FOCUS_ENERGY_DECAY_PER_MINUTE = 0.28;
```

Expected examples:

| Focus duration | Hunger cost | Energy cost |
| -------------: | ----------: | ----------: |
|          5 min |          -1 |        -1.4 |
|         25 min |          -5 |          -7 |
|         50 min |         -10 |         -14 |

### Focus start requirements

```ts
MIN_START_ENERGY_BASE = 5;
MIN_START_ENERGY_PER_MINUTE = 0.8;
MIN_START_HUNGER_BASE = 8;
MIN_START_HUNGER_PER_MINUTE = 0.5;
```

Formula:

```ts
requiredEnergy = max(
  MIN_START_ENERGY_BASE,
  ceil(minutes * MIN_START_ENERGY_PER_MINUTE),
);
requiredHunger = max(
  MIN_START_HUNGER_BASE,
  ceil(minutes * MIN_START_HUNGER_PER_MINUTE),
);
```

Expected examples:

| Selected focus | Required energy | Required hunger |
| -------------: | --------------: | --------------: |
|          5 min |               5 |               8 |
|         15 min |              12 |               8 |
|         25 min |              20 |              13 |
|         50 min |              40 |              25 |

### Care decay

```ts
HUNGER_DECAY_PER_HOUR = 4;
BASE_HAPPINESS_DECAY_PER_HOUR = 0.25;
LOW_HUNGER_HAPPINESS_THRESHOLD = 35;
LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR = 1;
LOW_ENERGY_HAPPINESS_THRESHOLD = 25;
LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR = 0.5;
CRITICAL_HUNGER_ENERGY_THRESHOLD = 20;
CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR = 2;
```

Important v1 decision:

```txt
There is no generic passive energy decay. Energy decays over time only when hunger is critically low.
```

### Sleep

```ts
SLEEP_ENERGY_GAIN_PER_HOUR = 20;
SLEEP_HUNGER_DECAY_PER_HOUR = 4;
SLEEP_HAPPINESS_ENERGY_STEP = 20;
SLEEP_HAPPINESS_MAX_GAIN = 8;
```

Rules:

- Energy can recover up to 100.
- Hunger decreases while sleeping.
- Happiness increases slightly based on energy recovered.
- Sleep gives no XP, coins, streak, or Honesty Hearts.

Expected examples:

| Sleep duration | Energy effect | Hunger effect |            Happiness effect |
| -------------: | ------------: | ------------: | --------------------------: |
|         30 min | +10 up to cap |            -2 | +0 or +1 depending rounding |
|         1 hour | +20 up to cap |            -4 |                          +1 |
|        3 hours | +60 up to cap |           -12 |                          +3 |
|        8 hours |     up to 100 |           -32 |                    up to +8 |

### Rescue mechanics

```ts
POWER_NAP_DURATION_MINUTES = 15;
POWER_NAP_ENERGY_GAIN = 18;
POWER_NAP_HUNGER_COST = 3;
POWER_NAP_HAPPINESS_GAIN = 1;
MAX_POWER_NAPS_PER_DAY = 2;
POWER_NAP_COOLDOWN_MINUTES = 120;

EMERGENCY_SNACK_HUNGER_GAIN = 12;
EMERGENCY_SNACK_HAPPINESS_GAIN = 0;
EMERGENCY_SNACK_ENERGY_GAIN = 0;
MAX_EMERGENCY_SNACKS_PER_DAY = 1;
```

Power Nap:

- restores a small amount of energy;
- costs a little hunger;
- gives tiny happiness;
- gives no XP, coins, streak, or Honesty Hearts;
- is limited per day and cooldown-gated.

Emergency Snack:

- restores a small amount of hunger;
- gives no XP, coins, streak, or Honesty Hearts;
- should generally be offered only when hunger is low and the user cannot afford the cheapest food.

### Honesty Hearts

```ts
HONESTY_HAPPINESS_REWARD = 2;
HONESTY_HEART_REWARD = 1;
MIN_HONESTY_SESSION_MINUTES = 15;
MAX_HONESTY_HEARTS_PER_DAY = 2;
```

Rules:

- Honest non-completion gives no XP, no coins, and no streak progress.
- Eligible honesty can grant +1 Honesty Heart and +2 happiness.
- Sessions shorter than 15 minutes should not grant an Honesty Heart.
- Daily Honesty Heart gain is capped.
- Honesty Hearts can support achievements and streak freeze only.
- Honesty Hearts are not mini-game currency.

### Daily streak and grace/freeze

```ts
DAILY_FOCUS_GOAL_MINUTES = 25;
STREAK_FREEZE_COST_HONESTY_HEARTS = 3;
STREAK_FREEZE_COOLDOWN_DAYS = 7;
MAX_STREAK_FREEZES_PER_MISSED_DAY = 1;
```

Rules:

- A day is successful when completed focus minutes reach at least 25.
- Streak can increase at most once per local calendar day.
- A missed day can be protected by spending Honesty Hearts if freeze rules allow it.
- A freeze protects the streak but does not increase it.
- Prefer explicit user confirmation before spending Honesty Hearts.

### Mood thresholds

```ts
EXHAUSTED_ENERGY_THRESHOLD = 8;
HUNGRY_HUNGER_THRESHOLD = 15;
SAD_HAPPINESS_THRESHOLD = 20;
TIRED_ENERGY_THRESHOLD = 25;
HAPPY_HAPPINESS_THRESHOLD = 70;
HAPPY_HUNGER_THRESHOLD = 40;
HAPPY_ENERGY_THRESHOLD = 40;
```

Priority order:

1. sleeping
2. exhausted
3. hungry
4. sad
5. tired
6. happy
7. calm

Expected behavior:

| Hunger | Energy | Happiness | Expected mood |
| -----: | -----: | --------: | ------------- |
|     80 |     80 |        80 | happy         |
|     10 |     80 |        90 | hungry        |
|     80 |      5 |        90 | exhausted     |
|     80 |     20 |        90 | tired         |
|     80 |     80 |        15 | sad           |
|     35 |     35 |        65 | calm          |

### Shop catalog

If a standard 25-minute focus produces about 7 coins, the v1 catalog can start here:

| Item        | Cost | Hunger | Happiness | Energy | Role                                  |
| ----------- | ---: | -----: | --------: | -----: | ------------------------------------- |
| Berry Bowl  |    8 |    +10 |        +4 |      0 | Light snack                           |
| Warm Soup   |   12 |    +22 |        +3 |      0 | Main hunger item                      |
| Honey Toast |   16 |    +14 |        +8 |     +2 | Happiness-focused treat               |
| Moon Milk   |   20 |     +6 |        +4 |    +12 | Energy support, not sleep replacement |
| Cozy Stew   |   28 |    +30 |        +6 |     +4 | Strong premium care item              |

Rules:

- Food cannot exceed stat caps.
- Food should not be usable while sleeping unless explicitly designed later.
- Energy food should not make sleep irrelevant.
- No item should max every important stat by itself.

### Achievement thresholds

Achievement UI can wait, but rule definitions can be configured:

```ts
focusMinuteAchievements = [100, 500, 1000];
streakAchievements = [3, 7, 14, 30];
honestyHeartAchievements = [1, 5, 15, 30];
careAchievements = [
  "firstSleep",
  "firstPowerNap",
  "firstEmergencySnack",
  "firstHappyMood",
];
```

Achievement rewards should be cosmetic/badge-oriented later. Avoid large coin or XP rewards in v1.

## Implementation phases

### Phase 0 — Baseline inventory and safety

Goal: verify the current app and document the existing metric behavior before changing rules.

Tasks:

- Run tests, lint, and build.
- Identify every current metric and every function that changes it.
- Confirm current focus rewards, honesty reward, sleep behavior, shop catalog, and mood thresholds.
- Create or update this document if needed.

Acceptance criteria:

- No runtime behavior changes.
- Existing tests pass.
- The team can see the current values and the target values side by side.

### Phase 1 — Add centralized balance profile without changing behavior

Goal: introduce typed balance configuration while preserving existing behavior.

Tasks:

- Add `src/domain/balance/` or a similarly small balance module.
- Define `BalanceProfile` and `ACTIVE_BALANCE_PROFILE`.
- Move current constants into a profile that preserves current behavior, or add a v1 profile behind tests without activating it yet.
- Add tests proving the active profile matches current behavior.

Acceptance criteria:

- No intentional gameplay changes yet.
- Current tests pass.
- Existing constants are no longer scattered where practical.
- New profile values are typed and easy to edit.

### Phase 2 — Extract pure metric calculators

Goal: make reward, care, sleep, rescue, honesty, streak, mood, and shop calculations testable before changing product behavior.

Tasks:

- Add pure functions for focus rewards, focus care impact, start requirements, sleep effects, honesty reward, mood resolution, and shop effects.
- Keep stores as orchestrators only.
- Keep persistence logic outside pure calculations.
- Add table-driven tests.

Acceptance criteria:

- Existing behavior remains the same unless a specific test documents the new target behind an inactive profile.
- Pure tests cover 5, 15, 25, and 50-minute focus examples.
- Pure tests cover sleep, honesty, mood, and shop calculations.

### Phase 3 — Activate v1 focus reward and start requirement rules

Goal: make focus rewards duration-based and prevent focus from starting when the pet is too hungry or tired.

Tasks:

- Activate XP, coin, and happiness rules from the v1 profile.
- Keep focus care costs duration-based.
- Add focus start requirements for hunger and energy.
- Update UI copy to explain why focus cannot start and what rescue action can help.

Acceptance criteria:

- 5 minutes gives small rewards.
- 25 minutes is the standard calibration point.
- 50 minutes scales roughly linearly.
- Low energy or hunger blocks focus start.
- The app suggests Power Nap or Emergency Snack where appropriate once those actions exist, or provides copy placeholders until Phase 6.

### Phase 4 — Implement daily focus habit streaks

Goal: replace session-count streak behavior with daily focus-minute streak behavior.

Tasks:

- Add local date key utility.
- Add daily focus state or equivalent persisted counters.
- Count completed focus minutes toward the local day's goal.
- Increase streak at most once per day when daily completed focus minutes reach 25.
- Do not increase streak from honesty, sleep, power nap, emergency snack, or failed sessions.

Acceptance criteria:

- Five 5-minute sessions can complete the daily goal.
- A single 25-minute session can complete the daily goal.
- A 50-minute session can complete the daily goal.
- The same day cannot increase streak more than once.
- Session completion remains idempotent.

### Phase 5 — Add streak freeze/grace using Honesty Hearts

Goal: keep streaks cozy by allowing rare recovery without making streak meaningless.

Tasks:

- Add freeze eligibility rules using Honesty Hearts.
- Add freeze cooldown.
- Prefer an explicit user confirmation before spending hearts.
- A freeze should preserve the streak but not increase it.

Acceptance criteria:

- A missed day can be protected if the pet has enough Honesty Hearts and cooldown allows it.
- Spending hearts is persisted.
- Freeze cannot be used repeatedly without cooldown.
- Freeze does not create focus minutes.
- Freeze does not unlock coin or XP rewards.

### Phase 6 — Add Power Nap and Emergency Snack rescue mechanics

Goal: prevent low-hunger/low-energy/no-coin deadlocks.

Tasks:

- Add Power Nap domain action and daily/cooldown limits.
- Add Emergency Snack domain action and daily limit.
- Wire minimal UI affordances where focus start is blocked or on the pet screen.
- Persist daily counters.

Acceptance criteria:

- Power Nap restores energy, costs a little hunger, and gives tiny happiness.
- Emergency Snack restores a small amount of hunger.
- Neither action gives XP, coins, streak, or Honesty Hearts.
- Daily limits are enforced.
- The user can recover from a no-coins low-care state.

### Phase 7 — Rebalance sleep

Goal: make sleep the primary energy recovery path.

Tasks:

- Update wake-up calculations so sleep can restore energy up to 100.
- Keep hunger decay during sleep.
- Add capped happiness gain based on energy recovered.
- Ensure sleep gives no XP, coins, streak, or Honesty Hearts.

Acceptance criteria:

- Long sleep can fully restore energy.
- Hunger still drops during sleep.
- Happiness gain is small and capped.
- Sleep remains a recovery mechanic, not an economy mechanic.

### Phase 8 — Add hunger-linked happiness and energy pressure

Goal: make care metrics meaningful without harsh passive energy decay.

Tasks:

- Keep hunger decay over time.
- Keep base happiness decay gentle.
- Add extra happiness decay when hunger is low.
- Add extra happiness decay when energy is low.
- Add energy decay only when hunger is critically low.
- Do not add generic passive energy decay.

Acceptance criteria:

- A well-fed pet does not lose energy just because time passed.
- A critically hungry pet slowly loses energy.
- Low hunger and low energy make happiness decline faster.
- All values are capped safely at 0 and 100.

### Phase 9 — Rework Honesty Heart rules

Goal: preserve honesty as a trust mechanic while preventing farming.

Tasks:

- Add minimum session duration for Honesty Heart eligibility.
- Add daily Honesty Heart gain cap.
- Keep honesty reward free of XP, coins, and streak progress.
- Keep small happiness reward.

Acceptance criteria:

- 5-minute failed sessions do not farm Honesty Hearts.
- 15+ minute honest non-completion can grant a heart if daily cap allows it.
- Honesty rewards never produce XP, coins, or streak.
- Honesty Hearts can be spent only by approved mechanics such as streak freeze.

### Phase 10 — Rebalance shop catalog

Goal: align food costs/effects with the new 25-minute coin economy.

Tasks:

- Move catalog values into balance/shop config.
- Update costs and effects to the v1 table.
- Add or update tests for affordability and stat caps.

Acceptance criteria:

- Cheapest food costs about one standard focus session's income.
- Energy food supports focus but does not replace sleep.
- Food effects are capped at 100.
- Food cannot be purchased without enough coins.
- Food cannot be used while sleeping if that remains the product rule.

### Phase 11 — Update mood resolver

Goal: make visual pet state reflect combined care state.

Tasks:

- Update mood priority and thresholds.
- Add `exhausted` if the domain/UI supports adding a mood safely; otherwise map exhausted to tired visually while keeping a domain rule for future expansion.
- Keep sleeping and working as display/activity overrides.

Acceptance criteria:

- Happy requires happiness, hunger, and energy to all be healthy.
- Very low energy shows exhausted/tired before happy.
- Very low hunger shows hungry before happy.
- Very low happiness shows sad.
- Mood rules are configurable and table-tested.

### Phase 12 — Add achievement rule scaffolding without full UI

Goal: prepare streak and Honesty Heart achievements while avoiding a large UI feature.

Tasks:

- Define achievement rule IDs and thresholds in config.
- Add pure unlock evaluation functions if low-risk.
- Persist unlocked IDs only if the project already has a suitable place or the migration is small.
- Do not add full achievement gallery UI.

Acceptance criteria:

- Achievement thresholds are centralized and testable.
- Honesty and streak achievements can be evaluated.
- No mini-game or cosmetic currency is introduced.

### Phase 13 — UI copy and rescue guidance polish

Goal: make the new rules understandable without turning the UI into a spreadsheet.

Tasks:

- Add friendly copy when focus cannot start.
- Suggest Power Nap for low energy.
- Suggest food or Emergency Snack for low hunger.
- Show daily focus goal progress.
- Show streak freeze availability gently.

Acceptance criteria:

- The user understands why an action is blocked.
- The UI suggests a next step.
- The tone remains kind and pet-centric.
- No large achievement UI or mini-game UI is introduced.

### Phase 14 — Balance stabilization and regression tests

Goal: lock down the v1 balance profile with test coverage and avoid accidental regressions.

Tasks:

- Add golden table tests for rewards, start requirements, sleep, rescue, honesty, streak, shop, and mood.
- Add deadlock prevention tests.
- Add idempotency tests for reward/streak claims.
- Run full test/lint/build.

Acceptance criteria:

- `npm test` passes.
- `npm run lint` passes.
- `npm run build` passes.
- The v1 balance profile is fully configurable from central config.
- No new external dependencies are required unless already justified elsewhere.

## Recommended implementation order

For safer Codex runs, do not implement all phases in one prompt. Use small checkpoints:

1. Documentation and config layer.
2. Pure calculators.
3. Focus reward/start rules.
4. Daily streak and freeze.
5. Rescue actions.
6. Sleep and care decay.
7. Honesty rules.
8. Shop and mood.
9. Achievement scaffolding and UI copy.
10. Stabilization.

## Definition of done for every phase

Every implementation phase should end with:

```bash
npm run lint
npm test
npm run build
```

A phase is not done until:

- all changed behavior is covered by tests;
- balance numbers come from central config;
- no external network/backend dependency is added;
- old local data is normalized safely;
- reward/streak/rescue actions are idempotent where needed;
- the app remains cozy and does not introduce harsh punishment loops.

## Commit strategy

Use small commits. Suggested examples:

```bash
git commit -m "docs: add configurable metrics roadmap"
git commit -m "refactor: add balance profile config"
git commit -m "refactor: extract metric calculators"
git commit -m "feat: add duration-based focus rewards"
git commit -m "feat: add daily focus streaks"
git commit -m "feat: add streak freeze with honesty hearts"
git commit -m "feat: add power nap and emergency snack"
git commit -m "feat: rebalance sleep recovery"
git commit -m "feat: add hunger-linked care decay"
git commit -m "feat: rebalance honesty heart rules"
git commit -m "feat: rebalance shop catalog"
git commit -m "feat: update pet mood rules"
git commit -m "test: lock v1 balance tables"
```
