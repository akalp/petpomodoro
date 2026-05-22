# PetPomodoro

PetPomodoro is a cozy tamagotchi plus Pomodoro progressive web app designed mainly for iOS Home Screen usage. The user cares for a small pet by completing focus sessions. Each honestly completed Pomodoro helps the pet grow.

The product is intentionally local-first: no backend, no auth, no cloud sync, and no account system. After the first successful load, the app should work offline and keep all user data on the device.

## Why Completion Is Honesty-Based

An iOS PWA cannot reliably observe the state of the native iOS Clock timer, Shortcuts timer actions, or other system-level focus tools. It also cannot depend on continuous background execution while the user is away from the app.

Because of that, PetPomodoro must never claim that it technically verified a native timer. Instead, it uses local session state plus a friendly honesty confirmation after the expected focus session end:

> Your pet waited for you. Did you really finish this focus session?

The confirmation choices are:

- Yes, we did it
- Not this time

The tone should be cozy, trusting, and non-accusatory. The user is rewarded for honest completion, not monitored.

## Tech Stack

- Vite for app scaffolding and development server
- React for UI
- TypeScript for type safety
- Tailwind CSS for mobile-first styling
- Zustand for client state orchestration
- Dexie and IndexedDB for local persistence
- Framer Motion for cozy UI motion
- vite-plugin-pwa for service worker and installability
- Vitest for domain and integration tests

Dependencies should not be installed until the project setup phase begins.

## Local-First Architecture

PetPomodoro will store all product data in IndexedDB on the user's device. React components should remain UI-focused. Business logic should live in pure functions under `src/domain` later, persistence should be isolated under `src/db`, and Zustand stores should coordinate UI state, domain actions, and database reads or writes.

The app shell should be cached by the service worker so the installed PWA can open offline after first load. Local data should remain available without any network request.

## Development Approach

Development should proceed in small, reviewable steps:

1. Create planning documents.
2. Scaffold the Vite, React, and TypeScript app.
3. Add Tailwind CSS, test tooling, and baseline scripts.
4. Implement domain models and pure state transition tests.
5. Add Dexie persistence and repository tests.
6. Add Zustand stores for hydration and session actions.
7. Build the mobile-first UI.
8. Wire the Pomodoro flow and honesty confirmation.
9. Add pet rewards with idempotency protection.
10. Configure PWA behavior and offline support.
11. Polish motion, copy, and iOS Home Screen behavior.
12. Run manual QA on desktop and iOS.

## Initial MVP Scope

The MVP should include:

- One local pet.
- A default 25-minute focus session.
- A local session lifecycle: idle, running, awaiting confirmation, completed, abandoned.
- A trust-based completion prompt after the expected end time.
- Pet XP rewards for honestly completed sessions.
- Idempotent rewards so the same session cannot reward the pet twice.
- Local session history.
- Offline support after first load.
- Mobile-first UI optimized for iOS Home Screen usage.

The MVP should not include backend services, auth, cloud sync, social features, cross-device recovery, or any claim that PetPomodoro can verify a native iOS timer.

