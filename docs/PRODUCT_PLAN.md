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
2. The user sees their pet and current progress.
3. The user starts a preset or custom whole-minute focus session from 1 to 180 minutes, defaulting to 25 minutes.
4. The app records `startedAt` and `expectedEndAt` locally.
5. The user may leave the app and use the native iOS timer, a Shortcut, or another reminder method.
6. When the user returns after the expected end time, PetPomodoro asks:

   > Your pet waited for you. Did you really finish this focus session?

7. If the user confirms, the session is completed and the pet receives XP once.
8. If the user selects "Not this time", the session is abandoned without punishment and receives one small honesty-heart reward.
9. The user can start another session when ready.

Ending a running session before it reaches confirmation abandons it without any reward.

## MVP Features

- Single local pet with name, level, XP, mood, coins, care stats, streak, honesty hearts, and timestamps.
- Pomodoro session creation with preset durations and custom whole-minute durations from 1 to 180 minutes.
- Session states: idle, running, awaiting confirmation, completed, abandoned.
- Local time-based transition from running to awaiting confirmation.
- Honesty confirmation with two choices:
  - Yes, we did it
  - Not this time
- Multi-stat reward application for completed sessions and a small honesty reward for declined confirmation.
- Idempotent reward protection per session.
- Hunger decay based on locally stored timestamps.
- Local session history for recent completed and abandoned sessions.
- Offline-capable installed PWA after first load.
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
