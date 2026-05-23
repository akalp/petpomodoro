# MVP Tasks

Each task should be small enough to review and commit separately. Keep app implementation changes out of the planning-docs commit.

## Phase 0: Project Setup

- Scaffold a Vite React TypeScript project.
- Add Tailwind CSS and baseline global styles.
- Add Vitest and a minimal test script.
- Add ESLint or equivalent baseline linting if chosen during setup.
- Add the preferred package manager lockfile.
- Confirm the app starts locally with the default scaffold.
- Remove unused scaffold UI and assets after baseline setup is working.

## Phase 1: Domain Models And Tests

- Define `Pet`, `PomodoroSession`, `RewardLedger`, `AppSettings`, abandonment reason, and session status types.
- Add test factories for pets and sessions.
- Implement pure function to create a running session.
- Implement pure function to move running sessions to awaiting confirmation based on time.
- Implement pure function to abandon a running session as cancelled or an awaiting session as honest confirmation.
- Implement pure function to confirm a session.
- Implement pure reward calculation for XP, care stats, level, and honesty hearts.
- Add tests for every allowed state transition.
- Add tests that invalid transitions are rejected.
- Add tests that duplicate reward inputs do not produce another reward.

## Phase 2: Local Database

- Add Dexie database setup.
- Create `pets`, `sessions`, `rewardLedger`, and singleton `settings` tables.
- Add a unique index for `rewardLedger.sessionId`.
- Add repository function to load or create the default pet.
- Add repository functions to create, read, and update sessions.
- Add repository function to read recent session history.
- Add transactional reward claim function.
- Add a versioned settings/session migration that preserves existing local data.
- Add tests for schema initialization.
- Add tests for unique reward ledger enforcement.
- Add tests for atomic reward application.

## Phase 3: State Stores

- Add app hydration store or slice.
- Add pet store or slice for current pet state.
- Add session store or slice for active session state.
- Add settings store for duration and optional device convenience preferences.
- Add action to hydrate pet and active session from IndexedDB.
- Add action to start a session.
- Add action to check whether a running session is ready for confirmation.
- Add action to confirm completion.
- Add separate actions for early cancellation and declined confirmation.
- Add store-level tests for hydration and core actions.

## Phase 4: Basic UI

- Build the mobile-first app shell.
- Add pet home screen with name, level, XP, mood, and care stats.
- Add primary focus session control.
- Add preset and custom whole-minute durations from 1 to 180 minutes.
- Add visible active session status.
- Add empty state for no session history.
- Add basic recent session history.
- Ensure touch targets are comfortable on mobile.
- Ensure UI text does not claim timer verification.

## Phase 5: Pomodoro Flow

- Wire start session UI to the session store.
- Show running session state with expected end time.
- Add foreground or interval check while the app is open.
- Run rehydration check on app launch.
- Show awaiting confirmation UI after expected end time.
- Wire "Yes, we did it" to completion.
- Wire "Not this time" to honesty-rewarded abandonment.
- Handle refresh or reopen during running and awaiting confirmation states.

## Phase 6: Pet Rewards

- Apply multi-stat reward on honest completion.
- Apply a small honesty reward only after declined confirmation.
- Update pet level when XP crosses level thresholds.
- Save reward ledger entry for each rewarded session.
- Prevent duplicate reward from double tap or retry.
- Add UI feedback for XP gained.
- Add UI feedback for level up.
- Add hunger, happiness, and duration-based focus care decay using local timestamps.
- Add tests for reward idempotency through the store and database transaction.

## Phase 7: PWA Setup

- Add `vite-plugin-pwa`.
- Add manifest name, short name, colors, display mode, and start URL.
- Add PWA icons and Apple touch icon assets.
- Add service worker app shell precaching.
- Add offline fallback for the main route.
- Add iOS Home Screen metadata.
- Add install hint copy for Safari on iOS.
- Add optional Shortcut launch and best-effort local reminder controls.
- Verify the app opens offline after first load.

## Phase 8: Polish

- Add Framer Motion transitions for pet reactions and session result states.
- Refine cozy visual style without reducing readability.
- Review all copy for trust-based language.
- Add small loading and error states.
- Add bundled English and Türkçe copy with a locally persisted language choice.
- Polish mobile spacing, safe areas, and viewport behavior.
- Verify text fits inside buttons and compact UI containers.
- Check color contrast for primary actions and status text.

## Phase 9: Manual QA

- Test fresh load in desktop browser.
- Test starting a session.
- Test cancelling a running session with elapsed focus care impact and no completion reward.
- Test declining confirmation with one honesty reward.
- Test custom durations and settings migration/reset.
- Test reaching awaiting confirmation while the app remains open.
- Test closing the app and reopening after `expectedEndAt`.
- Test confirming completion once.
- Test double tapping confirmation.
- Test refreshing on awaiting confirmation.
- Test session history after completion and abandonment.
- Test offline launch after first load.
- Test switching between English and Türkçe while offline and after reopen.
- Test installed iOS Home Screen behavior.
- Test that no UI copy claims native timer verification.
