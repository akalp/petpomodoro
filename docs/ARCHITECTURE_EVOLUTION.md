# PetPomodoro Architecture Evolution Roadmap

This document is the canonical long-term architecture direction for evolving PetPomodoro from a drawer-heavy MVP into a native-feeling, mobile-first PWA that can support richer pets, CSS-art food/snack visuals, more moods, future mini-games, and more scalable UI/domain architecture.

The long-term architecture must stay within the original product promise: a local-first, offline-first focus companion for iOS Home Screen usage, with no backend, auth, account system, or cloud sync.

## Non-negotiable product constraints

These constraints come from the existing project direction and must stay true throughout the refactor:

- Keep the app local-first and offline-first.
- Keep all product data on the user's device for the MVP and near-term roadmap.
- Do not add backend APIs, auth, accounts, cloud sync, or cross-device recovery.
- Preserve offline PWA behavior after first load.
- Keep iOS Home Screen usage as the primary mobile target, including standalone display, safe-area handling, and touch-first navigation.
- Do not imply that the app can observe, detect, or verify native iOS timer completion.
- Pomodoro completion remains trust-based and requires the user's honest confirmation.
- Never auto-complete a focus session without the confirmation prompt.
- Keep the tone cozy, encouraging, shame-free, and pet-centric.
- Keep business logic out of React components.
- Keep pure domain rules in `src/domain`.
- Keep IndexedDB/Dexie code in `src/db`.
- Keep Zustand stores as orchestration between UI, domain, and persistence.
- Do not use Zustand for primary navigation state.
- Keep Framer Motion for motion orchestration where it is useful.

## Main architectural decisions

### 1. Keep Framer Motion

Framer Motion should stay where it improves motion orchestration. The bundle cost is acceptable, and it helps with:

- screen transitions,
- active tab indicator layout animation,
- modal/drawer/sheet enter-exit animations,
- reward animations,
- bottom navigation active indicators,
- pet container motion,
- tap/hover interactions.

Do not use Framer Motion as the drawing system for pets or food. Use it as a motion orchestration layer.

### 2. Use CSS art for pet and food visuals

Pet bodies, faces, ears, tails, paws, food shapes, snack details, steam, sparkle, and small visual loops should be CSS-based.

Recommended approach:

- `div` / `span` structure,
- CSS classes,
- `data-mood`, `data-species`, `data-food`, `data-disabled`,
- CSS modules/files or global CSS art files,
- typed presentation registries for copy, motion, species, and food metadata,
- pseudo-elements where useful,
- `prefers-reduced-motion` support.

Do not rely on image assets, SVG art, canvas, or Framer Motion to draw the pet or food shapes. Those tools can still be used elsewhere if the product later needs them, but pet and snack visuals should remain HTML/CSS art.

Avoid JSX `if` chains for visual variants.

### 3. Use hash-based React Router navigation

Primary navigation should use React Router with hash-based routing. Hash routing is the long-term direction because it works well for static PWA hosting, iOS Home Screen launches, refreshes, and offline app-shell fallback without requiring server rewrite configuration for every route.

Use route state for navigation:

- Primary URLs are represented as hash routes, such as `#/pet`, `#/focus`, `#/shop`, and `#/journal`.
- `src/app/routeRegistry.ts` is the canonical route/tab registry.
- The route/tab registry maps route paths to labels, optional icon metadata, primary-tab visibility, and future route metadata when useful.
- The active tab is derived from the current route.
- Do not create a Zustand navigation store with `activeTab` or `setActiveTab`.

Canonical primary routes/tabs:

1. `/pet`
2. `/focus`
3. `/shop`
4. `/journal`

Future prepared route:

1. `/games`, added later when there is real game content.

Settings should not be a primary bottom tab. It can be implemented as a separate route such as `/settings`, a sheet, or a header action. If settings becomes a route, it should not appear in the primary tab registry unless there is an explicit product decision later.

### 4. Move from drawer-heavy navigation to native-feeling app shell

The long-term UI should be a native-feeling tab-based app shell:

- Mobile: bottom tab bar.
- Tablet/Desktop: side rail or wider side navigation layout.
- Mobile, tablet, and desktop navigation use the same typed route/tab registry.
- Settings: not a primary tab; use header gear, screen, or sheet.
- Reward, reset confirmation, food purchase confirmation, Pomodoro confirmation, and similar short-lived flows: keep as modal/dialog/sheet overlays, not primary tabs or full navigation destinations.

Primary tabs:

1. Pet
2. Focus
3. Shop
4. Journal
5. Games later, once there is real game content

Recommended initial route ids:

1. `pet`
2. `focus`
3. `shop`
4. `journal`
5. `games` later

Pet is the default landing route and should contain richer pet care and visual detail. Focus contains the focus controls and current-session summary. Shop should contain food/snack purchasing. Journal should contain session history and reflections. Games is reserved for future mini-games and should not be shown as empty chrome before the feature exists.

The "Your pet waited for you. Did you really finish this focus session?" confirmation remains an overlay shown above the current shell. Session reward and honesty reward results also remain overlays so they can interrupt gently without becoming route state.

### 5. Separate app shell responsibilities

The app shell should separate:

- routing,
- responsive layout,
- overlays,
- domain stores,
- feature screens.

Recommended boundaries:

- Routing owns `HashRouter`, route definitions, redirects, not-found behavior, and route-based active tab derivation.
- Layout owns the mobile bottom tab bar, desktop/tablet side navigation, safe-area spacing, and content regions.
- Overlays own modal/dialog/sheet presentation for confirmation, rewards, reset, food purchase feedback, and transient interruptions.
- Domain stores own pet, sessions, settings, rewards, hydration, persistence orchestration, and local app data.
- Feature screens own screen composition for Pet, Focus, Shop, Journal, Settings, and future Games.

`App.tsx` or `AppRoot.tsx` should become a composition root that wires providers, bootstrap, router, shell, and overlays. It should not contain domain rules, route-specific screen logic, or growing UI variant branches.

### 6. Keep Zustand for app and domain state

Zustand remains the state orchestration layer for local app data and async workflows, not for primary route state.

Zustand should coordinate:

- hydration and bootstrap status,
- pet state and care updates,
- focus sessions and session history,
- settings and local device preferences,
- rewards and idempotent reward claims,
- food purchases and latest purchase feedback,
- IndexedDB/Dexie persistence orchestration,
- local error/loading state.

React Router should coordinate:

- current primary screen,
- active tab derivation,
- navigable URLs,
- redirects and not-found routes.

Short-lived overlay visibility can live in component state, a focused UI store, route state, or an overlay host depending on scope. It should not turn reward, reset, purchase, or confirmation dialogs into primary navigation tabs.

### 7. Use registries/config maps instead of variant `if` chains

`if` statements are fine for domain guards and invalid transitions. They are not ideal for UI variant selection that will grow over time.

Use registry/config maps for:

- routes and tabs,
- route icons and labels,
- future route metadata,
- pet mood copy,
- pet mood motion,
- pet species definitions,
- food presentation metadata,
- reward rows,
- i18n-backed presentation labels,
- future mini-games.

Good use of `if`:

```ts
if (session.status !== "running") {
  throw new DomainError("Only running sessions can be checked.");
}
```

Poor long-term use of `if`:

```tsx
if (foodId === "berry-bowl") return <BerryBowl />;
if (foodId === "warm-soup") return <WarmSoup />;
if (foodId === "honey-toast") return <HoneyToast />;
return <MoonMilk />;
```

Prefer:

```tsx
<div className="food-visual" data-food={foodId}>...</div>
```

or:

```ts
const FOOD_PRESENTATION = {
  "berry-bowl": { nameKey: "foodBerryBowl", descriptionKey: "foodBerryBowlDescription" },
  "warm-soup": { nameKey: "foodWarmSoup", descriptionKey: "foodWarmSoupDescription" },
  "honey-toast": { nameKey: "foodHoneyToast", descriptionKey: "foodHoneyToastDescription" },
  "moon-milk": { nameKey: "foodMoonMilk", descriptionKey: "foodMoonMilkDescription" },
  "cozy-stew": { nameKey: "foodCozyStew", descriptionKey: "foodCozyStewDescription" },
} satisfies Record<FoodItemId, FoodPresentation>;
```

### 8. State machines: use them where they fit

Use state-machine-style transition tables or typed reducers for workflows with real transitions:

- focus session,
- mini-game session,
- future pet activity flow, if pet activities become true workflows.

Do not force everything into a state machine.

Pet mood is better as derived state using priority-based rules, not as another workflow state machine:

```txt
stats + activity + session status -> display mood
```

Example:

```ts
const PET_MOOD_RULES = [
  { mood: "hungry", priority: 100, matches: ({ hunger }) => hunger <= 25 },
  { mood: "tired", priority: 90, matches: ({ energy }) => energy <= 15 },
  { mood: "sad", priority: 80, matches: ({ happiness }) => happiness <= 25 },
  { mood: "happy", priority: 40, matches: ({ happiness }) => happiness >= 60 },
  { mood: "calm", priority: 0, matches: () => true },
] as const;
```

### 9. Separate domain state from visual/display state

Current code stores `pet.mood` and also derives `working` mood through session state. This is acceptable for the MVP but should evolve carefully.

Recommended mental model:

- `PetMood`: care/stat-based mood, such as `calm`, `happy`, `hungry`, `tired`, `sad`.
- `PetDisplayMood`: UI-facing mood, such as `working` during focus.
- `PetActivity`: future transient activity, such as `idle`, `focused`, `eating`, `playing`, `sleeping`.

`working` is not really a mood; it is a display/activity override.

### 10. Prepare for multiple pets without implementing the whole feature immediately

Current code assumes a single local pet:

- `DEFAULT_PET_ID = "local-pet"`
- `DEFAULT_PET_NAME = "Momo"`
- `getCurrentPet()`
- `loadOrCreateDefaultPet()`

Future-ready changes:

- Add `speciesId` to `PetState`.
- Later add `activePetId` to `AppSettings`.
- Later add `petId` to `FocusSession`, so focus rewards apply to the pet that started the session even if the active pet changes afterward.
- Keep `RewardLedger.petId` as the historical reward target.
- Add a pet species registry.

Avoid implementing multi-pet UX until the app shell and presentation architecture are stable. The intended direction is a local-only `activePetId` / `petId` model, not accounts or cloud-backed pet profiles.

## Current architecture pain points

### `src/App.tsx`

Currently handles too many concerns:

- hydration/bootstrap,
- notification permission,
- notification scheduling,
- duration draft state,
- shortcut integration,
- pet dashboard,
- focus state screen switching,
- reward modal,
- session history,
- shop drawer,
- settings drawer,
- reset flow.

Target: turn `App.tsx` into a composition root that wires providers/shell/overlays, while screens and hooks own their concerns.

### `src/components/pet/PetAvatar.tsx`

Currently combines:

- mood face mapping,
- mood label mapping,
- Framer motion config,
- visual structure.

Target split:

- `petMoodPresentation.ts`
- `petMotion.ts`
- `PetRenderer.tsx`
- `PetAvatar.tsx`
- CSS art file.

### `src/components/pet/PetShop.tsx`

Currently includes:

- shop screen/card UI,
- food copy map,
- food button,
- coin balance,
- food stat formatting,
- `FoodVisual` with `if` chain.

Target split:

- `PetShop.tsx` or `ShopScreen.tsx`
- `FoodButton.tsx`
- `FoodVisual.tsx`
- `foodPresentation.ts`
- CSS art file.

### `src/domain/pet.ts`

Current `moodForStats` is an ordered `if` chain. It works, but a priority-rule resolver will scale better when more moods are added.

### `src/domain/sessions.ts`

Current functions are clear and well-tested, but a transition table/reducer would make allowed session transitions easier to inspect and extend.

Do this later, after UI navigation/presentation refactors are stable.

## Target folder shape

This is an incremental target, not a single large rewrite.

```txt
src/
  app/
    App.tsx or AppRoot.tsx
    AppBootstrap.tsx
    AppShell.tsx
    AppRoutes.tsx
    routeRegistry.ts
    MobileBottomTabBar.tsx
    DesktopSideNav.tsx
    OverlayHost.tsx
    useAppBootstrap.ts
    useFocusNotifications.ts

  features/
    focus/
      FocusScreen.tsx
      FocusPanel.tsx
      FocusSessionSwitcher.tsx
    pet/
      PetScreen.tsx
      PetAvatar.tsx
      PetRenderer.tsx
      petMotion.ts
      petMoodPresentation.ts
      petSpeciesRegistry.ts
      pet-art.css
    shop/
      ShopScreen.tsx
      FoodButton.tsx
      FoodVisual.tsx
      foodPresentation.ts
      food-art.css
    journal/
      JournalScreen.tsx
    settings/
      SettingsScreen.tsx or SettingsSheet.tsx
    rewards/
      RewardOverlay.tsx
    overlays/
      ResetConfirmationOverlay.tsx
      FoodPurchaseOverlay.tsx

  domain/
    pet.ts
    petMoodRules.ts
    sessions.ts
    focusSessionMachine.ts later
    shop.ts
    rewards.ts

  routes/
    routePaths.ts
```

You do not need to create all of these at once. Prefer small, testable commits.

## Proposed implementation phases

### Phase 0 — Baseline safety check

Goal: make sure the current project is green before refactoring.

Commands:

```bash
npm ci
npm run lint
npm test
npm run build
```

Acceptance criteria:

- Lint passes.
- Tests pass.
- Build passes.
- No product behavior changes.

### Phase 1 — Verify architecture documentation

Goal: keep this roadmap as the canonical architecture direction before runtime refactors begin.

Acceptance criteria:

- `docs/ARCHITECTURE_EVOLUTION.md` exists and matches the intended long-term direction.
- It documents hash routing, Framer Motion, CSS art, registries, state-machine boundaries, shell/store separation, and multi-pet direction.
- No runtime code changes.
- Existing tests/build remain green.

### Phase 2 — Add hash router and route registry

Goal: introduce route-backed app navigation without changing the full layout yet.

Suggested files:

```txt
src/app/routeRegistry.ts
src/app/AppRoutes.tsx
src/routes/routePaths.ts
```

Primary routes:

```txt
/pet
/focus
/shop
/journal
```

Prepared future route:

```txt
/games
```

Acceptance criteria:

- Use React Router with hash-based routing.
- If `react-router-dom` is not installed, add it as a runtime dependency and keep the version compatible with the current React/Vite setup.
- Route registry is typed and includes route id, path, label key, optional icon metadata, and primary-tab visibility.
- `/` redirects to `/pet`; legacy `/home` redirects to `/focus` during the route rename.
- It may reference screen components directly or be paired with route definitions in `AppRoutes.tsx`, whichever keeps imports simpler and avoids unnecessary coupling.
- `/games` is planned in types or comments only; do not render an empty Games tab before the feature exists.
- Active tab is derived from the current route.
- Do not add a Zustand navigation store.
- Existing Zustand stores remain focused on domain/application state.
- No visual behavior change required yet.

### Phase 3 — Add responsive route-backed navigation UI

Goal: add mobile bottom tab bar and desktop/tablet side navigation.

Suggested files:

```txt
src/app/MobileBottomTabBar.tsx
src/app/DesktopSideNav.tsx
src/app/AppShell.tsx
```

Acceptance criteria:

- Mobile uses a fixed bottom tab bar driven by the route registry.
- Tablet/desktop uses a side rail or wider side navigation driven by the same route registry.
- Uses `env(safe-area-inset-bottom)`.
- Main content has bottom padding on mobile so content is not hidden behind the nav.
- Uses Framer Motion for active tab indicator if helpful.
- Links navigate hash routes instead of calling a store action.
- Respects keyboard focus and `aria-current="page"`.

### Phase 4 — Split screens from `App.tsx`

Goal: stop `App.tsx` from owning all screen composition.

Suggested files:

```txt
src/features/pet/PetScreen.tsx
src/features/focus/FocusScreen.tsx
src/features/focus/FocusSessionSwitcher.tsx
src/features/shop/ShopScreen.tsx
src/features/journal/JournalScreen.tsx
```

Acceptance criteria:

- Pet screen contains pet dashboard/stats and is the default landing route.
- Focus screen contains focus start/running/awaiting-confirmation flow.
- Shop screen hosts the existing shop content in a route-safe screen wrapper. The drawer removal can happen in Phase 5.
- Journal screen contains session history.
- `AppRoutes.tsx` renders the active screen via React Router and the route registry.
- `AppShell.tsx` owns responsive shell layout around routed content.
- Existing reward modal still works.
- Existing tests pass or are updated to match the new screen structure.

### Phase 5 — Replace shop drawer with Shop tab

Goal: remove shop as a primary drawer and make it a native app section.

Acceptance criteria:

- Shop opens through the `/shop` hash route in bottom/side navigation.
- Top bar no longer needs a primary store button, or it becomes optional/secondary.
- Drawer-specific shop state, buttons, and layout are removed or converted to route-safe screen behavior.
- Existing shop disabled rules still apply where needed.
- If focus session is active, decide explicitly whether shop is blocked or allowed. Recommended: allow navigation but disable buying during focus if product wants that constraint.
- Existing food purchase feedback still works in the Shop screen.

### Phase 6 — Decide Settings UX

Goal: keep settings out of primary tabs but make it native-feeling.

Recommended:

- Header gear opens a settings screen, route, or sheet.
- Settings is not one of the main tabs.

Acceptance criteria:

- Settings remains accessible.
- Settings is not shown in the primary bottom tab bar.
- Reset confirmation remains explicit and safe.
- Notification/shortcut/language/duration/pet name settings still work.
- Drawer can remain for settings temporarily if needed; do not block the navigation refactor on this.

### Phase 7 — Extract pet presentation registries

Goal: remove mood copy/motion logic from `PetAvatar.tsx`.

Suggested files:

```txt
src/features/pet/petMoodPresentation.ts
src/features/pet/petMotion.ts
src/features/pet/PetRenderer.tsx
```

Acceptance criteria:

- `PET_MOOD_COPY` maps every `PetDisplayMood` to an i18n key.
- `PET_MOTION_BY_MOOD` maps every `PetDisplayMood` to a Framer motion profile.
- `PetAvatar.tsx` becomes a thin wrapper around motion, accessibility, and `PetRenderer`.
- `PetStats.tsx` reuses the same mood copy map.
- TypeScript fails if a new display mood lacks copy or motion config.

### Phase 8 — Add CSS-art pet renderer

Goal: replace text/emoticon face with CSS-rendered pet parts.

Suggested files:

```txt
src/features/pet/PetRenderer.tsx
src/features/pet/pet-art.css
```

Acceptance criteria:

- Pet visual is drawn using HTML/CSS only.
- No SVG, canvas, image, or external art asset.
- Mood changes are expressed through `data-mood` selectors.
- Motion-sensitive loops respect `prefers-reduced-motion`.
- Framer Motion still controls the overall pet container motion.
- Tests do not need to inspect visual internals beyond accessible labels/test IDs.

### Phase 9 — Extract food presentation and CSS-art visuals

Goal: remove `FoodVisual` `if` chain from `PetShop.tsx`.

Suggested files:

```txt
src/features/shop/FoodVisual.tsx
src/features/shop/foodPresentation.ts
src/features/shop/food-art.css
```

Acceptance criteria:

- `foodPresentation.ts` maps every `FoodItemId` to copy keys and visual metadata.
- `FoodVisual` uses a stable DOM structure plus `data-food`.
- No food-specific JSX `if` chain.
- Food/snack visuals are CSS-only.
- Existing `PetShop` tests pass or are updated.

### Phase 10 — Replace pet mood `if` chain with priority rules

Goal: make mood expansion easier without changing behavior.

Suggested file:

```txt
src/domain/petMoodRules.ts
```

Acceptance criteria:

- Current behavior is preserved:
  - hunger <= 25 => hungry
  - else energy <= 15 => tired
  - else happiness <= 25 => sad
  - else happiness >= 60 => happy
  - else calm
- Tests verify existing thresholds.
- Adding a new mood should require adding a rule and updating exhaustive registries.

### Phase 11 — Prepare multi-pet data model minimally

Goal: add the least invasive future-proofing.

Recommended first step:

- Add `speciesId` to `PetState` with default `"momo"`.
- Add normalization fallback for old stored pets.
- Add a pet species registry.

Do not implement multi-pet selection yet.

Acceptance criteria:

- Existing local data normalizes without crashing.
- New pets get `speciesId: "momo"`.
- Pet renderer receives `speciesId` and `displayMood`.
- No multi-pet UI yet.

### Phase 12 — Refactor focus session to transition reducer/table

Goal: make session state rules more explicitly state-machine-like.

Suggested file:

```txt
src/domain/focusSessionMachine.ts
```

Acceptance criteria:

- Existing public domain functions can delegate to the new reducer/table, or tests can be migrated carefully.
- Invalid transitions still throw `DomainError`.
- Honest confirmation rules are preserved.
- Reward idempotency behavior remains unchanged.
- Existing tests pass.

### Phase 13 — Future mini-games architecture only

Goal: document and optionally scaffold future game boundaries without building games.

Mini-games are a future product area, not MVP chrome. Games should become a
primary tab only after there is actual playable content. The route registry may
prepare `/games` in comments, route ids, or future-facing types, but it must not
render an empty Games tab or placeholder screen before the feature exists.

Mini-game sessions should follow a small state-machine-style model instead of
ad hoc UI flags. A likely future state model is:

```txt
idle
playing
completed
rewarded
```

Likely future events are:

```txt
START_GAME
FINISH_GAME
CLAIM_REWARD
CANCEL_GAME
```

Game completion should produce domain-level pet events or stat adjustments that
stores can persist and present. Mini-games should not directly mutate UI state,
pet visuals, overlays, or route state as a reward shortcut. Reward application
must remain idempotent where a game result can be claimed, similar in spirit to
the Pomodoro reward ledger.

Mini-games must stay local-first and offline-first. Game catalogs, rules,
scores, reward records, and any pet effects should be bundled or stored locally
on device. They must not require backend APIs, accounts, cloud sync, leaderboards,
or a network request for core play.

Mini-games should preserve PetPomodoro's cozy, shame-free tone. Losing,
cancelling, or skipping a game should not punish the pet or shame the user.
Games are small moments of care and play, not productivity enforcement.

Mini-games must not compromise honest Pomodoro confirmation. They should not
claim to verify focus work, replace the confirmation prompt, auto-complete focus
sessions, or create incentives that pressure the user to answer the Pomodoro
confirmation dishonestly.

Suggested future shape:

```txt
src/features/minigames/
  domain/gameSessionMachine.ts
  miniGameCatalog.ts
  components/
```

Recommended state model:

```ts
type MiniGameState =
  | { status: "idle" }
  | { status: "playing"; gameId: MiniGameId; startedAt: string }
  | { status: "completed"; gameId: MiniGameId; score: number }
  | { status: "rewarded"; gameId: MiniGameId; rewardId: string };
```

Do not implement before the app shell, pet presentation, and shop presentation are stable.

## Definition of done for every task

Every Codex task should end with:

```bash
npm run lint
npm test
npm run build
```

If a task intentionally updates UI layout, also manually inspect:

- mobile width around 390px,
- tablet width around 768px,
- desktop width above 1024px,
- standalone PWA safe area behavior where possible,
- keyboard focus states,
- reduced-motion behavior.

## Commit strategy

Use small conventional commits:

```bash
git commit -m "docs: add architecture evolution roadmap"
git commit -m "feat: add hash route registry"
git commit -m "feat: add responsive route navigation"
git commit -m "refactor: split app screens by tab"
git commit -m "refactor: extract pet presentation config"
git commit -m "refactor: extract food visuals"
git commit -m "refactor: add priority mood resolver"
```
