# MVP Release Notes

## PetPomodoro MVP

PetPomodoro is a local-first, cozy focus companion for iOS Home Screen and modern mobile browsers. It combines a Pomodoro session ritual with a small pet that grows through honestly completed focus sessions.

## Included

- One local pet with name, level, XP, mood, and care stats.
- Focus durations for 5, 15, 25, and 50 minutes.
- Local session states: `idle`, `running`, `awaiting_confirmation`, `completed`, and `abandoned`.
- Trust-based confirmation after the planned focus window:
  - "Your pet waited for you. Did you really finish this focus session?"
  - "Yes, we did it"
  - "Not this time"
- Completion rewards with idempotent reward protection.
- Neutral abandoned-session handling with no shame copy.
- Recent session history.
- Basic settings for pet name, preferred focus duration, and resetting local data.
- PWA manifest, app icons, service worker precaching, and offline app-shell support after first load.
- iOS Safari install hint and Home Screen metadata.
- Shortcut return query handling for `completedSessionId` as a convenience flow.

## Not Included

- Backend API.
- User accounts or authentication.
- Cloud sync or cross-device recovery.
- Social features, leaderboards, subscriptions, or paid features.
- Native iOS app functionality.
- Native timer verification or monitoring.

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
- Shortcut return handling can move an active elapsed session to confirmation, but it is not proof that a native timer completed.
- This MVP has no export or backup flow for local data.

## Deployment Notes

Deploy the built `dist/` directory to static hosting over HTTPS. Configure the host to serve `index.html` for navigation fallback so direct visits and PWA launches work. The service worker and manifest are generated during `npm run build`.
