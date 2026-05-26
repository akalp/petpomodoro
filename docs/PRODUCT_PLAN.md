# Product Plan

## Product Vision

PetPomodoro is a gentle focus companion. It combines the ritual of a Pomodoro timer with the emotional reward of caring for a small virtual pet. The product should feel warm, calm, and trust-based rather than strict or punitive.

The app helps users build focus habits by making honest completion feel meaningful. It does not monitor the user. It gives them a small moment of reflection after a planned focus session and lets them decide whether the pet should receive progress.

## Target User

The primary user is someone who:

- Uses an iPhone as their main personal device.
- Likes cozy, low-pressure productivity tools.
- May already use the native iOS timer, Focus modes, or Shortcuts while working.
- Wants a small ritual that makes focus sessions feel emotionally rewarding.
- Does not want an account, leaderboard, subscription, or cloud dependency.

The first version should be optimized for one-handed mobile use and iOS Home Screen launch behavior.

## Core Loop

1. The user opens PetPomodoro.
2. The user lands on the Pet tab and sees their pet, current progress, care stats, and rest state.
3. The user moves to the Focus tab and starts a preset or custom whole-minute focus session from 1 to 180 minutes, defaulting to 25 minutes.
4. The app records `startedAt` and `expectedEndAt` locally.
5. The user may leave the app and use the native iOS timer, a Shortcut, or another reminder method.
6. When the user returns after the expected end time, PetPomodoro asks:

   > Your pet waited for you. Did you really finish this focus session?

7. If the user confirms, the session is completed and the pet receives XP once.
8. If the user selects "Not this time", the session is abandoned without punishment. A session of at least 15 minutes can grant `+1` Honesty Heart and `+2` happiness, capped at two hearts per local day.
9. The user can spend earned coins in the Shop tab on food that immediately helps the pet's hunger, happiness, and energy.
10. The user can let the pet rest to recover energy when no focus session is active.
11. The user can review recent sessions in the Journal tab and start another session when ready.

Ending a running session before it reaches confirmation abandons it without a completion reward. Elapsed focus care impact and base focus coins still apply because the pet spent that time working with the user. Choosing "Not this time" grants no XP, coins, or streak progress.

## MVP Features

- Single local pet with name, level, XP, mood, coins, care stats, streak, honesty hearts, and timestamps.
- Single default pet species id for the local pet, with future-ready species presentation metadata but no multi-pet UI.
- Working display mood and focused face while an active session is running, without changing the saved care mood.
- Sleeping display mood while the pet is resting, with focus and feeding blocked until wake.
- Pomodoro session creation with preset durations and custom whole-minute durations from 1 to 180 minutes.
- Session states: idle, running, awaiting confirmation, completed, abandoned.
- Local time-based transition from running to awaiting confirmation.
- Honesty confirmation with two choices:
  - Yes, we did it
  - Not this time
- Multi-stat reward application for completed sessions and an eligibility-limited honesty reward for declined confirmation.
- Honesty Hearts support achievements and streak freeze only; they are not XP, coins, shop currency, or mini-game currency.
- Duration-based focus care impact and base focus coins for elapsed focus time.
- A local feeding shop with four foods, each with a different coin cost and care-stat impact.
- A local pet rest flow that restores energy over elapsed local time and may affect hunger and happiness.
- Idempotent reward protection per session.
- Hunger decay based on locally stored timestamps.
- Local session history for recent completed and abandoned sessions.
- Hash-based Pet, Focus, Shop, and Journal routes with a mobile bottom tab bar and desktop side navigation.
- Settings available from the header, not as a primary tab.
- Offline-capable installed PWA after first load.
- English and Türkçe interface copy bundled in the app, with language choice stored locally.
- User-authored pet speech messages stored locally in device settings.
- Cozy mobile-first interface and copy.
- Optional iOS Shortcut launch and best-effort local reminder notifications.

## Non-Goals

- Backend API.
- User accounts or authentication.
- Cloud sync.
- Cross-device sync.
- Social sharing, leaderboards, or competitive streaks.
- Paid features.
- Native iOS app implementation.
- Claims that the app can verify native iOS timer completion.
- Strict productivity enforcement or shame-based failure states.

## iOS And PWA Limitations

iOS PWA behavior shapes the product:

- The app cannot reliably run JavaScript continuously in the background.
- The app cannot observe the native iOS Clock timer state.
- The app cannot know whether a Shortcut timer actually ran to completion.
- Push notifications and local notification behavior are limited compared with native apps.
- Installed PWA storage can be cleared by the user or the operating system.
- The app should rely on timestamps and rehydration logic when opened again.

These limitations are product constraints, not edge cases. The UI and copy must be honest about them.

## Trust-Based Completion Model

Completion is based on two facts:

- Local session state says the planned focus window has reached or passed `expectedEndAt`.
- The user honestly confirms whether they finished.

The app should ask in a warm way:

> Your pet waited for you. Did you really finish this focus session?

The app should never say:

- "Timer verified."
- "We detected you completed your focus."
- "Your iOS timer finished."
- "You failed."

The abandoned path should be neutral and supportive. A user who chooses "Not this time" should not lose XP, lose levels, or receive shaming copy.

## Possible Future Features

- Multiple pets.
- Pet customization.
- Themes and habitats.
- More forgiving or richer streak rules.
- Break timers.
- Focus intention notes.
- Richer reminder and iOS Shortcut templates.
- Import and export backup files.
- Optional local analytics dashboard.
- Seasonal cosmetics stored locally.
- More shop item categories, stored foods, and pet looks.
