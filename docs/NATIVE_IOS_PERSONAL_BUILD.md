# Personal iOS Native Build

## Overview

This is a personal Capacitor build for running PetPomodoro as a native iOS app on your own device.

- Not intended for App Store distribution.
- The PWA remains the primary target; Capacitor is an additional native shell.
- All app behavior is identical to the PWA — no backend, no cloud sync, no analytics.

## Requirements

- macOS with Xcode installed
- An iPhone connected via USB or wireless debugging
- An Apple ID (free tier works, paid Developer account lasts longer)
- Node.js and npm

## Build Commands

Convenience npm scripts are defined in `package.json`:

```bash
npm run ios          # npm run build + npx cap sync ios + npx cap open ios
npm run cap:sync:ios # npm run build + npx cap sync ios (no Xcode launch)
```

The equivalent manual steps:

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

`npx cap sync ios` copies the built web assets into the native Xcode project and installs CocoaPods dependencies. `npx cap open ios` opens the project in Xcode.

## Xcode Signing & Running

1. Open the project in Xcode (`npx cap open ios` does this automatically).
2. Select the **App** target in the project navigator.
3. Under **Signing & Capabilities**, select your **Personal Team** or paid Apple Developer team.
4. Choose your connected iPhone as the run destination.
5. Click **Run** (or press `Cmd+R`).

## Free Apple ID Signing

Free Apple ID signing profiles expire after **7 days**. After expiry, the app will stop launching and must be reinstalled.

To reinstall:

1. Rebuild with `npm run build && npx cap sync ios`.
2. Redeploy from Xcode.

A paid Apple Developer account ($99/year) removes this limitation.

## What Stays the Same

- Pomodoro completion still requires honest confirmation — the app never auto-completes a session.
- All data stays local on your device.
- The PWA continues to work in Safari and other browsers.
- Offline behavior is preserved.

## Native Notifications

- Local notifications are handled entirely on-device by iOS.
- No backend, no cloud service, no analytics.
- Notifications remind you to return — they do not complete sessions for you.

## Live Activity And Dynamic Island

- While a focus session runs, the app can start a Live Activity on the lock screen and Dynamic Island showing the countdown and a gentle pet message.
- The Live Activity is a reminder surface only. It never claims to verify focus work, and it is cleared when the session reaches the awaiting-confirmation state.
- Like notifications, this is native-only; the PWA keeps its existing best-effort reminder behavior.

See `src/alerts/` and `src/platform/` in the source, and the "Native Notifications And Live Activity" section in `TECHNICAL_PLAN.md`.
