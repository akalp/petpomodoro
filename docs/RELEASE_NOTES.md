# MVP Release Notes

## PetPomodoro MVP

PetPomodoro is a local-first, cozy focus companion for iOS Home Screen and modern mobile browsers. It combines a Pomodoro session ritual with a small pet that grows through honestly completed focus sessions.

## Included

- One local pet with selectable Momo or Moowi presentation, name, level, XP, mood, coins, streak, honesty hearts, and care stats.
- CSS-art pet presentation with care, working, and sleeping display moods.
- Focus durations for 5, 15, 25, and 50 minutes, plus custom whole-minute durations from 1 to 180 minutes.
- Local session states: `idle`, `running`, `awaiting_confirmation`, `completed`, and `abandoned`.
- Trust-based confirmation after the planned focus window:
  - "Your pet waited for you. Did you really finish this focus session?"
  - "Yes, we did it"
  - "Not this time"
- Multi-stat completion rewards with idempotent reward protection.
- Versioned v1 balance profile with duration-scaled focus rewards and care-aware focus start requirements.
- Duration-based focus care impact and base focus coins for elapsed work time.
- Neutral abandoned-session handling: early cancellation grants no completion reward, while honestly declining after at least 15 planned minutes may grant `+1` Honesty Heart and `+2` happiness, capped at two hearts per local day and never granting XP, coins, or streak progress.
- Local pet rest/sleep behavior that can restore energy and blocks focus or feeding until the pet wakes.
- A 25-minute local daily focus goal with at most one streak award per day, plus an explicit Honesty Heart-funded streak freeze for an eligible missed day.
- Power Nap and Emergency Snack rescue care actions with local daily/cooldown eligibility limits.
- Hash-routed Pet, Focus, Shop, and Journal screens with mobile bottom tabs and desktop side navigation.
- Header Settings sheet kept outside primary navigation.
- Local snack shop with CSS-art food visuals and disabled states for focus, sleep, and insufficient coins.
- Recent session history.
- IndexedDB-backed settings for pet name, preferred focus duration, Shortcut preference, reminders, and resetting local data.
- PWA manifest, app icons, service worker precaching, and offline app-shell support after first load.
- iOS Safari install hint and Home Screen metadata.
- Optional iOS Shortcut launch for starting a native timer with the selected duration.
- Optional local notification reminders while the PWA is allowed to keep running.
- Care stats, hunger and happiness decay, streak tracking, and honesty hearts.
- Configured achievement rule evaluation for future local presentation, without an achievement screen or persisted unlocks.
- Bundled English and Türkçe interface copy with local language persistence.

## Not Included

- Backend API.
- User accounts or authentication.
- Cloud sync or cross-device recovery.
- Social features, leaderboards, subscriptions, or paid features.
- Native iOS app functionality.
- Native timer verification or monitoring.
- Multi-pet selection, pet accounts, or cross-device pet profiles.
- Mini-games or a Games tab.
- Achievement gallery, achievement unlock persistence, or achievement rewards.

## Trust-Based Completion

PetPomodoro cannot observe the native iOS Clock timer, Shortcut timer actions, Focus modes, or whether the user actually stayed focused outside the app. Completion is based on:

- the locally saved `expectedEndAt` timestamp, and
- the user's honest confirmation.

The app must not claim that it detected, verified, or automatically completed a native timer.

## Release Candidate Checks

Before deploying the MVP, complete [QA_CHECKLIST.md](./QA_CHECKLIST.md), then run:

```sh
npm test
npm run build
npm run preview
```

Use the preview build for browser and PWA checks. Use a real iPhone Safari session for Add to Home Screen, safe-area, standalone display mode, and offline reload checks.

## Known Limitations

- iOS may suspend JavaScript while the app is backgrounded.
- Installed PWA storage can be cleared by the user, browser, or operating system.
- Offline launch works after the app shell has loaded and the service worker has installed.
- Shortcut launch can start a native timer as a convenience, but the user must return to PetPomodoro manually for honesty confirmation.
- Local notification reminders are best-effort and are not Web Push or a closed-app delivery guarantee.
- This MVP has no export or backup flow for local data.
- The database upgrades in place so existing pets, sessions, rewards, and migrated settings remain on the device.
- The app uses hash routes for static hosting and offline PWA resilience.

## Deployment Notes

Deploy the built `dist/` directory to static hosting over HTTPS. Configure the host to serve `index.html` for navigation fallback so direct visits and PWA launches work. The service worker and manifest are generated during `npm run build`.
