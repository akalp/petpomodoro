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
- React Router for hash-based app navigation
- Zustand for client state orchestration
- Dexie and IndexedDB for local persistence
- Framer Motion for cozy UI motion
- vite-plugin-pwa for service worker and installability
- Vitest for domain and integration tests

Use the committed `package-lock.json` for dependency installs.

## Local Development

Prerequisites:

- Node.js compatible with the Vite version in `package.json`.
- npm, using the committed `package-lock.json`.

Install dependencies:

```sh
npm install
```

Start the Vite development server:

```sh
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

Run tests:

```sh
npm test
```

Run a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

Open the preview URL printed by Vite, usually `http://localhost:4173/`. Use preview mode for PWA and service-worker checks because the development server does not represent the final cached app shell.

Service workers require a secure origin. `http://localhost` is sufficient when
testing in a browser on the same computer, but an iPhone opening
`http://<computer-lan-ip>:<port>` cannot install the service worker. For iPhone
offline and Home Screen testing, use a deployed HTTPS URL or a local HTTPS URL
whose certificate is trusted on the device.

## Available Scripts

- `npm run dev`: Start the local Vite dev server.
- `npm test`: Run the Vitest suite once.
- `npm run build`: Type-check and build the static production bundle into `dist/`.
- `npm run preview`: Serve the built `dist/` output for local release checks.
- `npm run lint`: Run ESLint.

## Local-First Architecture

PetPomodoro stores all product data in IndexedDB on the user's device. React components remain UI-focused. Business logic lives in pure functions under `src/domain`, persistence is isolated under `src/db`, and Zustand stores coordinate UI state, domain actions, and database reads or writes.

Primary navigation uses hash-based React Router routes so static hosting, refreshes, iOS Home Screen launches, and offline app-shell fallback stay simple. The current primary routes are:

- `#/pet`
- `#/focus`
- `#/shop`
- `#/journal`

Settings are available from the header as a sheet, not as a primary tab. The mobile shell uses a bottom tab bar; wider viewports use a side navigation rail driven by the same route registry.

The app shell should be cached by the service worker so the installed PWA can open offline after first load. Local data should remain available without any network request.

If IndexedDB is unavailable or blocked, the app should show a local-storage error instead of pretending progress is saved. There is no remote recovery path in the MVP.

## Development Approach

Development proceeds in small, reviewable steps. The MVP foundation is now implemented across:

1. Vite, React, TypeScript, Tailwind CSS, Vitest, and ESLint setup.
2. Pure domain models, pet care rules, shop rules, and focus-session transition reducer.
3. Dexie repositories and IndexedDB schema migrations.
4. Zustand stores for hydration, pet care, focus sessions, settings, rewards, and reset workflows.
5. Hash-router app shell with Pet, Focus, Shop, and Journal routes.
6. Mobile bottom navigation and desktop side navigation.
7. CSS-art pet and food presentation registries.
8. PWA manifest, app icons, service worker precaching, install hints, Shortcut convenience, and best-effort local reminders.

Future changes should continue following `docs/MVP_TASKS.md` and the architecture direction in `docs/ARCHITECTURE_EVOLUTION.md`.

## Initial MVP Scope

The MVP should include:

- One local pet with name, level, XP, species id, mood, coins, streak, honesty hearts, rest state, and care stats.
- Preset focus durations plus a custom 1 to 180 minute option, defaulting to 25 minutes.
- A local session lifecycle: idle, running, awaiting confirmation, completed, abandoned.
- A trust-based completion prompt after the expected end time.
- Multi-stat completion rewards, duration-based focus care impact, and hunger decay between visits.
- A local feeding shop where focus coins can buy food that immediately improves hunger, energy, and happiness.
- A local rest flow where the pet can sleep to recover energy; focus and feeding wait until the pet wakes.
- An honesty-heart reward only when the user declines completion from the confirmation prompt; ending a running session early gives no completion reward, but elapsed focus care impact and base coins still apply.
- Idempotent rewards so the same session cannot reward the pet twice.
- Local session history and local-only shop purchases.
- Offline support after first load.
- Bundled English and Türkçe interface languages with an on-device saved preference.
- Mobile-first UI optimized for iOS Home Screen usage.
- Hash-based Pet, Focus, Shop, and Journal routes with mobile bottom tabs and desktop side navigation.
- Optional native-timer Shortcut launch and best-effort local reminders as convenience features only.

The MVP should not include backend services, auth, cloud sync, social features, cross-device recovery, or any claim that PetPomodoro can verify a native iOS timer.

## Deployment

PetPomodoro builds to static files, including both interface language bundles. To deploy:

1. Run `npm test`.
2. Run `npm run build`.
3. Deploy the generated `dist/` directory to static hosting over HTTPS.
4. Configure the host to serve `index.html` as the navigation fallback for app routes and PWA launches.
5. Confirm `manifest.webmanifest`, `sw.js`, icons, JavaScript, and CSS files are served with normal static asset caching.

Suitable hosts include any static host that supports HTTPS and SPA fallback behavior. No backend, server runtime, database service, auth provider, or cloud sync service is required.

## iOS PWA Testing

Use Safari on a real iPhone for final checks:

- Load a deployed HTTPS URL, or another HTTPS URL trusted by the iPhone, once
  while online. A plain HTTP LAN URL such as
  `http://<computer-lan-ip>:8080` cannot install the service worker and will
  fail this offline-launch check.
- Confirm the Safari install hint appears only in Safari browser mode.
- Use Share > Add to Home Screen.
- Launch PetPomodoro from the Home Screen icon.
- Confirm it opens in standalone display mode.
- Confirm the safe-area layout is not obscured by the status area or home indicator.
- Start a session, close the app, reopen before and after `expectedEndAt`, and confirm the timestamp-based state restoration.
- Confirm completion still asks the trust-based question and never claims native timer verification.
- After the first successful load, switch offline and reopen the installed app to verify the cached app shell.

For the full release pass, use [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md). MVP release details are in [docs/RELEASE_NOTES.md](docs/RELEASE_NOTES.md).
