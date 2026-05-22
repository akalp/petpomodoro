# Technical Plan

## Architecture Overview

PetPomodoro should use a local-first frontend architecture:

- React renders the UI and handles interaction events.
- Zustand stores coordinate app state, hydration, and async workflows.
- Domain functions in `src/domain` implement session transitions, pet XP, level logic, and reward idempotency checks.
- Dexie repositories in `src/db` isolate IndexedDB reads, writes, transactions, and schema versioning.
- PWA configuration handles app shell caching, install metadata, and offline fallback.

React components should not contain business rules for reward application or state transitions. They should call store actions, and store actions should call domain functions and persistence functions.

## Future Folder Structure

```text
src/
  components/
    pet/
    session/
    layout/
  db/
    database.ts
    petsRepository.ts
    sessionsRepository.ts
    rewardsRepository.ts
  domain/
    pet.ts
    rewards.ts
    sessions.ts
    stateMachine.ts
  routes/
    HomeRoute.tsx
    HistoryRoute.tsx
  stores/
    appStore.ts
    petStore.ts
    sessionStore.ts
  pwa/
    installHints.ts
  test/
    factories.ts
```

This structure may be adjusted during implementation, but the boundaries should remain: domain logic is pure, persistence is isolated, and UI stays mobile-first.

## Data Models

Planned TypeScript model shapes:

```ts
type PetMood = "calm" | "happy" | "sleepy";

interface Pet {
  id: string;
  name: string;
  level: number;
  xp: number;
  mood: PetMood;
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
  rewardClaimedAt: string | null;
}

interface RewardLedger {
  id: string;
  sessionId: string;
  petId: string;
  xpAwarded: number;
  createdAt: string;
}
```

Implementation should store dates as ISO strings for IndexedDB portability and straightforward test assertions.

## IndexedDB Schema

Use Dexie with an explicit database name, for example `petpomodoro`.

Initial schema:

- `pets`: primary key `id`; indexes `createdAt`, `updatedAt`.
- `sessions`: primary key `id`; indexes `status`, `startedAt`, `expectedEndAt`, `rewardClaimedAt`.
- `rewardLedger`: primary key `id`; unique index `sessionId`; indexes `petId`, `createdAt`.

The unique `rewardLedger.sessionId` index is required. It is the persistence-level guard that prevents one Pomodoro session from rewarding the pet more than once.

Reward application should happen in a Dexie transaction that:

1. Reads the session.
2. Checks that the session is eligible for reward.
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
- Session state:
  - active session
  - session history summary
  - start session
  - mark session awaiting confirmation
  - confirm completion
  - abandon session
  - rehydrate running sessions after app launch

Store actions may be async, but all transition decisions should be delegated to pure domain functions.

## PWA Requirements

The app should meet these installable PWA requirements:

- Web app manifest with name, short name, theme color, background color, display mode, start URL, and icons.
- Mobile viewport metadata.
- Apple-specific metadata where useful, such as `apple-mobile-web-app-capable`.
- App shell precaching via `vite-plugin-pwa`.
- Offline fallback that can load the main app route after first load.
- No network dependency for core user flows after initial installation.
- Icons sized for iOS Home Screen and general PWA installability.

The app should be tested both in a desktop browser and as an installed iOS Home Screen PWA.

## iOS Shortcut Integration Approach

For MVP, the app should not depend on Shortcuts. It can provide guidance for a user-created Shortcut later:

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
- Abandoned sessions cannot receive rewards.
- Completed sessions cannot receive duplicate rewards.
- XP and level calculations are deterministic.

Database tests:

- Dexie schema initializes.
- Repositories create and update pets.
- Repositories create and update sessions.
- Reward ledger enforces one reward per session.
- Reward transaction is atomic.

Store tests:

- Hydration creates a default pet if none exists.
- Hydration restores active running or awaiting confirmation sessions.
- Confirm completion updates session, pet, and reward ledger.
- Abandoning a session applies no reward.

Manual QA:

- Fresh install.
- Offline launch after first load.
- App refresh during running session.
- App reopen after expected end time.
- Duplicate confirm attempts.
- iOS Home Screen launch and viewport behavior.

## Offline Strategy

The app should cache the static app shell after first load. Product data should live entirely in IndexedDB. On launch, the app should:

1. Open IndexedDB.
2. Load or create the local pet.
3. Load the latest active session.
4. Compare `expectedEndAt` with the current local time.
5. Move eligible running sessions to awaiting confirmation.
6. Render the appropriate screen.

If the app is offline, all MVP flows should continue to work. If IndexedDB is unavailable or blocked, the app should show a clear local storage error rather than pretending progress is saved.

