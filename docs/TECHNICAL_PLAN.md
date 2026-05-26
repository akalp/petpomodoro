# Technical Plan

## Architecture Overview

PetPomodoro uses a local-first frontend architecture:

- React renders the UI and handles interaction events.
- React Router uses hash-based routes for primary navigation.
- Zustand stores coordinate app state, hydration, and async workflows.
- Domain functions in `src/domain` implement session transitions, pet care stats, XP, level logic, hunger and app-open decay, rest/sleep care, feeding purchases, and reward idempotency checks.
- Dexie repositories in `src/db` isolate IndexedDB reads, writes, transactions, and schema versioning.
- PWA configuration handles app shell caching, install metadata, and offline fallback.

React components should not contain business rules for reward application or state transitions. They should call store actions, and store actions should call domain functions and persistence functions.

Primary screen navigation is route state, not Zustand state. Short-lived overlays such as rewards and settings can remain component or UI-store state.

## Current Folder Structure

```text
src/
  app/
    AppRoutes.tsx
    AppShell.tsx
    DesktopSideNav.tsx
    MobileBottomTabBar.tsx
    routeRegistry.ts
  components/
    layout/
    pet/
    pwa/
    session/
    settings/
    ui/
  db/
    database.ts
    petsRepository.ts
    sessionsRepository.ts
    rewardsRepository.ts
    settingsRepository.ts
    shopRepository.ts
  domain/
    focusSessionMachine.ts
    petMoodRules.ts
    pet.ts
    rewards.ts
    sessions.ts
    settings.ts
    shop.ts
  features/
    focus/
    journal/
    pet/
    shop/
  i18n/
    index.ts
  pwa/
    installHints.ts
    notifications.ts
    shortcuts.ts
  routes/
    routePaths.ts
  stores/
    petStore.ts
    pomodoroStore.ts
    settingsStore.ts
    uiStore.ts
  test/
    factories.ts
```

The boundaries should remain: domain logic is pure, persistence is isolated, route state owns navigation, Zustand stores orchestrate local data workflows, and UI stays mobile-first.

## Data Models

Current TypeScript model shapes:

```ts
type PetMood = "calm" | "happy" | "hungry" | "tired" | "sad";
type PetDisplayMood = PetMood | "working" | "sleeping";
type PetSpeciesId = "momo";

interface Pet {
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
  sleepStartedAt: string | null;
  lastHungerUpdatedAt: string;
  lastAppOpenedAt: string;
  createdAt: string;
  updatedAt: string;
}

type PomodoroSessionStatus =
  | "idle"
  | "running"
  | "awaiting_confirmation"
  | "completed"
  | "abandoned";

interface PomodoroSession {
  id: string;
  status: PomodoroSessionStatus;
  plannedDurationMinutes: number;
  startedAt: string;
  expectedEndAt: string;
  confirmedAt: string | null;
  abandonedAt: string | null;
  abandonmentReason: "cancelled" | "honest_confirmation" | null;
  rewardClaimedAt: string | null;
  focusImpactAppliedUntil: string;
  focusCoinsAwarded: number;
}

interface RewardLedger {
  id: string;
  sessionId: string;
  petId: string;
  rewardType: "focus_completed" | "honesty";
  xpAwarded: number;
  coinsAwarded: number;
  happinessAwarded: number;
  hungerAwarded: number;
  energyAwarded: number;
  streakAwarded: number;
  honestyHeartsAwarded: number;
  createdAt: string;
}

interface AppSettings {
  id: "local-settings";
  preferredDurationMinutes: number;
  hasInstalledShortcut: boolean;
  hasEnabledFocusNotifications: boolean;
  language: "en" | "tr";
  motivationalMessages: string[];
  updatedAt: string;
}

type ShopItemCategory = "food";
type FoodItemId = "berry-bowl" | "warm-soup" | "honey-toast" | "moon-milk";

interface FoodItem {
  id: FoodItemId;
  category: ShopItemCategory;
  cost: number;
  hunger: number;
  happiness: number;
  energy: number;
}
```

`PetDisplayMood` is derived for rendering only: a `running` session displays `working`, a resting pet displays `sleeping`, and the persisted `Pet.mood` remains derived from care stats.

Implementation should store dates as ISO strings for IndexedDB portability and straightforward test assertions.

## IndexedDB Schema

Use Dexie with an explicit database name, for example `petpomodoro`.

Initial schema:

- `pets`: primary key `id`; indexes `createdAt`, `updatedAt`.
- `sessions`: primary key `id`; indexes `status`, `startedAt`, `expectedEndAt`, `rewardClaimedAt`.
- `rewardLedger`: primary key `id`; unique index `sessionId`; indexes `petId`, `createdAt`.
- `settings`: singleton primary key `id`; index `updatedAt`.

The unique `rewardLedger.sessionId` index is required. It is the persistence-level guard that prevents one Pomodoro session from rewarding the pet more than once, for completion or honest declined confirmation.

Database changes use Dexie version upgrades. Version 2 adds the settings table and backfills `abandonmentReason = null` on existing sessions without changing historical pet or reward data. Version 3 backfills `lastAppOpenedAt`, `focusImpactAppliedUntil`, and `focusCoinsAwarded`. Version 4 backfills `sleepStartedAt = null`. Version 5 backfills `speciesId = "momo"`. Version 6 backfills `customName`, preserving user-supplied names while allowing an unnamed pet to display its selected species name. Version 7 backfills `motivationalMessages = []` on existing settings. Version 8 adds `dailyFocus`, including `honestyHeartsAwarded` for local-day caps. Version 9 adds streak-freeze metadata.

The feeding shop v1 uses a bundled static food catalog and does not need a new IndexedDB table. Buying food runs in a Dexie transaction that reads the current pet, applies the pure purchase function, and writes the updated pet. Failed purchases, such as insufficient coins or an unknown food id, must leave the stored pet unchanged.

Pet rest/sleep uses fields on the pet record and does not need a separate table in the MVP. Starting rest records `sleepStartedAt`; waking computes elapsed local time, restores energy, applies hunger change, updates happiness where applicable, and clears `sleepStartedAt`.

Reward application should happen in a Dexie transaction that:

1. Reads the session.
2. Checks that the session is completed or was honestly declined from confirmation.
3. Checks that no reward ledger row exists for `sessionId`.
4. Updates the pet XP and level.
5. Marks the session reward as claimed.
6. Inserts the reward ledger row.

If any step fails, the transaction should not partially apply the reward.

## Zustand Store Responsibilities

Use small stores or slices with clear responsibilities:

- App state:
  - hydration status
  - global loading and error state
  - offline or install hint visibility
- Pet state:
  - current pet
  - pet creation for first launch
  - pet updates after rewards
  - immediate food purchases and the latest purchase summary
  - pet rest start, wake, preview, and latest rest summary
- Session state:
  - active session
  - session history summary
  - start session
  - mark session awaiting confirmation
  - confirm completion
  - abandon session
  - rehydrate running sessions after app launch
- Settings state:
  - preferred duration, including custom whole-minute values from 1 to 180
  - optional Shortcut and local-reminder preferences
  - bundled English or Türkçe interface language preference
  - local user-authored pet speech messages
  - one-time migration of legacy localStorage preferences into IndexedDB

Store actions may be async, but all transition decisions should be delegated to pure domain functions.

Primary route and active-tab state should be derived from React Router and `src/app/routeRegistry.ts`. Do not add a Zustand navigation store for tabs.

## Navigation Requirements

- Use `HashRouter`.
- Route `/` to `/pet`.
- Keep the current primary routes as `/pet`, `/focus`, `/shop`, and `/journal`.
- Keep `/home` as a legacy redirect to `/focus`.
- Drive mobile bottom tabs and desktop side navigation from `src/app/routeRegistry.ts`.
- Keep settings out of primary tabs; the current implementation uses a header sheet.
- Keep `/games` and `/settings` as future route paths only until real product decisions require them.

## PWA Requirements

The app should meet these installable PWA requirements:

- Web app manifest with name, short name, theme color, background color, display mode, start URL, and icons.
- Mobile viewport metadata.
- Apple-specific metadata where useful, such as `apple-mobile-web-app-capable`.
- App shell precaching via `vite-plugin-pwa`.
- Offline fallback that can load the app shell after first load, including hash routes.
- No network dependency for core user flows after initial installation.
- Icons sized for iOS Home Screen and general PWA installability.

The app should be tested both in a desktop browser and as an installed iOS Home Screen PWA.

## iOS Shortcut Integration Approach

For MVP, the app may optionally launch a user-installed Shortcut as a convenience:

1. Open PetPomodoro.
2. Start a focus session in the app.
3. Start a native iOS timer for the same duration.
4. Return to PetPomodoro when the timer ends.
5. Confirm honestly.

Any Shortcut integration must be described as a convenience flow, not as verification. PetPomodoro should still treat completion as user-confirmed.

## Testing Strategy

Use Vitest as the primary test runner.

Domain tests:

- Start session creates a running session with correct timestamps.
- Running session becomes awaiting confirmation when `now >= expectedEndAt`.
- Running session remains running when `now < expectedEndAt`.
- Awaiting confirmation can become completed.
- Awaiting confirmation can become abandoned.
- Cancelled running sessions cannot receive rewards.
- An honestly declined confirmation of at least 15 minutes can receive one idempotent honesty reward while the two-heart local-day cap allows it.
- Completed sessions cannot receive duplicate rewards.
- XP and level calculations are deterministic.
- Pet mood rules preserve priority thresholds.
- Pet rest start and wake rules update energy, hunger, happiness, and sleeping state deterministically.
- Feeding is rejected while the pet is sleeping.
- Starting focus is rejected while the pet is sleeping.

Database tests:

- Dexie schema initializes.
- Repositories create and update pets.
- Repositories create and update sessions.
- Reward ledger enforces one reward per session.
- Reward transaction is atomic.
- Schema migration and settings persistence preserve existing local data.
- Pet migration backfills `sleepStartedAt`, `speciesId`, and optional custom-name state.

Store tests:

- Hydration creates a default pet if none exists.
- Hydration restores active running or awaiting confirmation sessions.
- Confirm completion updates session, pet, and reward ledger.
- Cancelling a running session applies elapsed focus care impact and base focus coins, but no completion reward or reward-ledger row.
- Declining confirmation applies no XP, coins, or streak progress, and applies an eligible honesty reward only within the duration and daily-heart limits.
- Hydration migrates and restores settings.
- Pet sleep state persists through hydration.
- Buying food and starting focus surface sleeping-state errors.

UI and routing tests:

- Route registry exposes Pet, Focus, Shop, and Journal as primary tabs in order.
- Settings and Games are not primary tabs.
- Mobile and desktop navigation derive active state from the current route.

Manual QA:

- Fresh install.
- Offline launch after first load.
- App refresh during running session.
- App reopen after expected end time.
- Duplicate confirm attempts.
- iOS Home Screen launch and viewport behavior.

## Offline Strategy

The app should cache the static app shell after first load. Product data and device preferences should live in IndexedDB after one-time legacy preference migration. On launch, the app should:

1. Open IndexedDB.
2. Load or create the local pet.
3. Load the latest active session.
4. Compare `expectedEndAt` with the current local time.
5. Move eligible running sessions to awaiting confirmation.
6. Render the current hash route, defaulting to the Pet screen.

English and Türkçe messages must be included in the static app bundle; changing or restoring language cannot depend on a network request. If the app is offline, all MVP flows should continue to work. If IndexedDB is unavailable or blocked, the app should show a clear local storage error rather than pretending progress is saved.
