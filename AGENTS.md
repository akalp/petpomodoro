# AGENTS.md

These instructions apply to the entire PetPomodoro repository.

PetPomodoro is a local-first, cozy tamagotchi plus Pomodoro PWA designed mainly for iOS Home Screen usage. Before implementing changes, read the planning documents in `README.md` and `docs/`.

## Required Reading

- `README.md`
- `docs/PRODUCT_PLAN.md`
- `docs/TECHNICAL_PLAN.md`
- `docs/STATE_MACHINE.md`
- `docs/MVP_TASKS.md`
- `docs/UX_COPY.md`

## Product Rules

- No backend, auth, cloud sync, or account system.
- All MVP product data stays local on the device.
- The app must work offline after first load.
- Never claim the app can verify, detect, or observe native iOS timer completion.
- Pomodoro completion is based on local timestamps plus the user's honesty confirmation.
- Keep the tone cozy, encouraging, trust-based, and shame-free.

## Architecture Rules

- Keep business logic out of React components.
- Put pure session, pet, reward, and state-machine logic in `src/domain`.
- Isolate Dexie and IndexedDB code in `src/db`.
- Use Zustand stores in `src/stores` to coordinate UI state, domain functions, and persistence.
- Keep UI mobile-first and optimized for iOS PWA usage.

## Pomodoro And Reward Rules

- Use the documented states: `idle`, `running`, `awaiting_confirmation`, `completed`, `abandoned`.
- Never auto-complete a session without user confirmation.
- Ask: "Your pet waited for you. Did you really finish this focus session?"
- Use the choices: "Yes, we did it" and "Not this time".
- Rewards must be idempotent. The same session cannot reward the pet twice.
- Protect reward idempotency in both domain logic and persistence with a unique reward ledger entry per session.

## Implementation Workflow

- Follow `docs/MVP_TASKS.md` phase order.
- Keep changes small enough to commit separately.
- Do not install dependencies or scaffold unrelated project files outside the current phase.
- Prefer tests before UI wiring for domain and persistence behavior.

## Git Commit Messages

- Use Conventional Commits for all commit messages, such as `docs: add agent instructions`, `feat: add session domain model`, or `fix: prevent duplicate rewards`.
- Keep the subject line concise and imperative.
- When a commit needs a body, build it with multiple `-m` flags, for example: `git commit -m "feat: add reward ledger" -m "Persist one reward ledger entry per completed session to keep rewards idempotent."`
- Do not put literal `\n` sequences inside a single `-m` value to create a body; zsh will not turn that into the intended multi-paragraph commit message.

## Testing And QA

- Use Vitest for domain transitions, invalid transitions, XP and level logic, reward idempotency, repository behavior, and store workflows.
- Manually verify offline launch, refresh and reopen during sessions, duplicate confirmation attempts, and iOS Home Screen behavior.
- Review all user-facing copy against `docs/UX_COPY.md`.

## PWA Constraints

- Cache the app shell so the installed app can open offline after first load.
- Store core MVP data in IndexedDB.
- Treat iOS background execution limits as product constraints.
- Treat Shortcuts integration as convenience only, never as verification.
- Do not imply native iOS timer observability in UI, docs, tests, or code comments.

## Capacitor Native App Rules

PetPomodoro must remain a working PWA and offline-first web app.

Capacitor is an additional native shell, not a replacement for the PWA.

Native-only behavior must be isolated behind small adapter modules. Do not import Capacitor APIs directly inside React screens unless there is no clean alternative.

Use native local notifications only when running inside Capacitor. In the browser/PWA, keep existing best-effort PWA and Shortcut behavior.

Never auto-complete a Pomodoro session from a notification. Notifications may remind the user, but completion must still go through the existing awaiting-confirmation flow.

Do not remove the existing iOS Shortcut integration from the PWA path unless explicitly asked. In the native Capacitor app, bypass Shortcut timer launching.

Keep all data local. Do not add backend, auth, cloud sync, analytics, tracking, or push notification server code.

After changes, run:

- npm run build
- npm test
- npm run lint

If a native command cannot be verified in the current environment, document the exact command the user should run locally.
