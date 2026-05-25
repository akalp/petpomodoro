# MVP QA Checklist

Use this checklist before the first MVP deployment and again after every release candidate. PetPomodoro is local-first and trust-based: completion must come from local timestamps plus the user's honest confirmation, never from a claim that the app verified a native timer.

## Setup

- [ ] Build the latest code with `npm run build`.
- [ ] Serve the production build with `npm run preview`.
- [ ] Open the preview URL in a desktop browser.
- [ ] Open the app in Safari on iOS for Home Screen checks.
- [ ] Start with a clean IndexedDB state when testing first-launch behavior.

## First App Load

- [ ] The app loads without console errors.
- [ ] The app shell uses the mobile-first layout at narrow widths.
- [ ] The app shows the PetPomodoro title and gentle companion copy.
- [ ] The default route lands on the Pet screen through `#/pet`.
- [ ] The UI does not mention accounts, cloud sync, backend services, or verification of native timers.
- [ ] Loading states are brief and readable if IndexedDB is slow.
- [ ] If IndexedDB is blocked or unavailable, the app shows a friendly local-storage error and does not pretend progress is saved.

## Navigation

- [ ] Mobile width shows bottom tabs for Pet, Focus, Shop, and Journal.
- [ ] Tablet or desktop width shows side navigation for the same primary tabs.
- [ ] Navigating to `#/pet`, `#/focus`, `#/shop`, and `#/journal` renders the expected screen.
- [ ] Active tab state follows the current hash route after click, refresh, and direct launch.
- [ ] `#/home` redirects to `#/focus`.
- [ ] Unknown hash routes redirect to `#/pet`.
- [ ] Settings opens from the header and is not shown as a primary tab.
- [ ] No empty Games tab or placeholder screen is visible.

## Pet Initialization

- [ ] A default local pet is created on first load.
- [ ] The pet has a name, species id, level, mood, XP, coins, honesty hearts, and care stats.
- [ ] Reloading the app preserves the same pet from IndexedDB.
- [ ] Updating the pet name in Settings persists after reload.
- [ ] Empty-state copy remains cozy and shame-free.

## Starting Pomodoro Durations

- [ ] Select `5m` and start a session.
- [ ] Select `15m` and start a session.
- [ ] Select `25m` and start a session.
- [ ] Select `50m` and start a session.
- [ ] Open `Custom`, apply a whole-minute duration from `1` to `180`, and start a session.
- [ ] Invalid custom values cannot be applied, persisted, or started.
- [ ] Closing the custom-duration sheet without applying keeps the previously selected duration.
- [ ] The selected preset or custom duration remains visually clear.
- [ ] The latest valid Focus duration is restored as the selected duration after reopen.
- [ ] Settings does not render a second duration editor.
- [ ] Starting a session creates exactly one running session.

## Countdown Behavior

- [ ] Running sessions show `In progress`.
- [ ] While a session is `running`, the pet shows its focused working face and `Working` / `Odaklanıyor` mood label.
- [ ] After a running session ends or awaits confirmation, the pet returns to its persisted care-derived mood unless it is sleeping.
- [ ] The countdown decreases while the app is open.
- [ ] The expected finish time matches the selected duration.
- [ ] Refreshing before `expectedEndAt` keeps the session running.
- [ ] The app does not claim that a native timer was detected or verified.

## Close Or Reopen Before `expectedEndAt`

- [ ] Start a session.
- [ ] Close the tab or app before `expectedEndAt`.
- [ ] Reopen before `expectedEndAt`.
- [ ] The same session is restored as `running`.
- [ ] The remaining time is recalculated from local timestamps.

## Close Or Reopen After `expectedEndAt`

- [ ] Start a session.
- [ ] Close the tab or app before `expectedEndAt`.
- [ ] Reopen after `expectedEndAt`.
- [ ] The session moves to `awaiting_confirmation`.
- [ ] Elapsed focus care impact is applied once, but no completion reward is applied during rehydration.
- [ ] The confirmation prompt appears exactly as: "Your pet waited for you. Did you really finish this focus session?"

## Awaiting Confirmation

- [ ] The choices are "Yes, we did it" and "Not this time".
- [ ] Supporting copy is calm and trust-based.
- [ ] Refreshing while awaiting confirmation keeps the app on the confirmation prompt.
- [ ] The user can choose either path without errors.

## Completed Confirmation

- [ ] Choose "Yes, we did it" from awaiting confirmation.
- [ ] The session becomes `completed`.
- [ ] XP and other completion rewards are applied once.
- [ ] The reward modal shows cozy completion copy.
- [ ] Session history records the completed session.
- [ ] After dismissing the modal, the app returns to the idle start state.

## Abandoned Confirmation

- [ ] Choose "Not this time" from awaiting confirmation.
- [ ] The session becomes `abandoned`.
- [ ] No completion XP is applied.
- [ ] Any honesty-only reward behavior remains non-punitive.
- [ ] One honesty reward is saved and cannot be claimed twice.
- [ ] Copy says there are no points lost and no scolding.
- [ ] Session history records the abandoned session.

## Duplicate Reward Prevention

- [ ] Double tap "Yes, we did it" as quickly as practical.
- [ ] Refresh immediately after confirming completion.
- [ ] Attempt to trigger confirmation again for the same session.
- [ ] Pet XP does not increase twice for the same session.
- [ ] The reward ledger contains at most one entry per session.
- [ ] Duplicate attempts do not corrupt session history.

## Session Cancellation

- [ ] Start a running session.
- [ ] Tap "End this session".
- [ ] The session becomes `abandoned`.
- [ ] Elapsed focus care impact and base focus coins are applied.
- [ ] No completion reward or reward-ledger entry is applied.
- [ ] The app returns to the idle start state after result handling.
- [ ] Session history shows a neutral abandoned entry.

## Session History

- [ ] New sessions appear at the top of recent history.
- [ ] Completed entries show supportive completion context.
- [ ] Abandoned entries show neutral copy.
- [ ] Running or awaiting entries do not imply completion.
- [ ] Empty history says: "Your session history will appear here after your first focus session."
- [ ] History remains readable on small mobile widths.

## Pet Stats

- [ ] XP progress updates after completed sessions.
- [ ] Coins, streak, happiness, hunger, energy, total XP, and honesty hearts render without overlap.
- [ ] Stat changes remain legible during animations.
- [ ] Reloading preserves persisted stats.
- [ ] Stats do not go outside expected bounds.

## Level Up

- [ ] Prepare a pet near the next level threshold.
- [ ] Complete an eligible session.
- [ ] The pet level increases once when XP crosses the threshold.
- [ ] The reward modal shows level-up feedback.
- [ ] Duplicate confirmation does not add another level.

## Hunger Decay

- [ ] Load a pet with an older `lastHungerUpdatedAt` timestamp.
- [ ] Reopen the app.
- [ ] Hunger decay is applied through the pet store.
- [ ] Hunger remains within valid bounds.
- [ ] Decay does not create duplicate rewards or sessions.

## Pet Rest

- [ ] Start pet rest from the Pet screen when no focus session is active.
- [ ] The pet shows the sleeping display mood and `Sleeping` / `Uyuyor` mood label.
- [ ] Reload while the pet is sleeping and confirm `sleepStartedAt` persists.
- [ ] Wake the pet and confirm energy increases according to elapsed local time.
- [ ] Confirm hunger change and happiness change remain within valid bounds.
- [ ] Confirm focus cannot start while the pet is sleeping.
- [ ] Confirm food cannot be purchased while the pet is sleeping.
- [ ] Confirm rest cannot complete or reward a Pomodoro session.

## Reset Local Data

- [ ] Open Settings.
- [ ] Confirm the reset checkbox enables the reset button.
- [ ] Cancel the browser confirmation and verify data remains.
- [ ] Confirm reset and verify pet, sleep state, sessions, rewards, duration, language, Shortcut preference, and reminder preference reset locally.
- [ ] Reload after reset and verify a fresh pet is initialized.

## Settings Migration

- [ ] Seed legacy browser preferences, then load the upgraded app.
- [ ] Preferences appear in the UI after being migrated into IndexedDB once.
- [ ] Existing settings without a language preference load in English and save the added preference.
- [ ] Existing session and reward history remains unchanged after the schema upgrade.

## Language Selection

- [ ] Choose `Türkçe` in Settings and confirm the focus flow, pet stats, history, reminder settings, and reset confirmation render in Turkish.
- [ ] Dates and expected finish times use the selected locale.
- [ ] Reload the app and confirm the saved language remains selected.
- [ ] Choose `English` and confirm the interface returns to English without losing pet or session data.

## Offline Reload After First Load

- [ ] Build the production app.
- [ ] Use `http://localhost` only for desktop offline tests; for iPhone testing,
      open a deployed HTTPS URL or a local HTTPS URL trusted by the device.
      Plain HTTP on a computer LAN IP cannot install the service worker.
- [ ] Load the app once online so the service worker installs.
- [ ] Confirm static assets are precached.
- [ ] Switch the browser or device offline.
- [ ] Reload the app.
- [ ] The app shell opens offline.
- [ ] Pet, Focus, Shop, and Journal hash routes remain reachable offline.
- [ ] Existing local pet and session data remain available.
- [ ] Switch between English and Türkçe while offline, reload, and confirm the selected language remains available.
- [ ] No copy suggests offline support changes native timer behavior.

## iOS Add To Home Screen

- [ ] Open the deployed app in Safari on iPhone.
- [ ] Confirm the install hint appears in Safari and not in standalone mode.
- [ ] Use Share > Add to Home Screen.
- [ ] Launch the installed Home Screen app.
- [ ] The app opens to the Pet route from `/` and uses the installed icon and title.
- [ ] Local IndexedDB data persists across standalone launches.

## Standalone Display Mode

- [ ] Launch from the iOS Home Screen icon.
- [ ] Confirm the browser address bar is not shown.
- [ ] Confirm standalone detection hides the Safari install hint.
- [ ] Confirm the app remains usable after closing and reopening from the app switcher.

## Safe-Area Layout

- [ ] Test on iPhone with a notch or Dynamic Island.
- [ ] Header content is not obscured by the status area.
- [ ] Bottom content and buttons are not hidden by the home indicator.
- [ ] Landscape and portrait layouts remain readable.
- [ ] Text does not overflow buttons or compact cards.

## Shortcut Timer Launch

- [ ] Mark "I installed shortcut already." in Settings on the installed iOS PWA.
- [ ] Start a running session.
- [ ] Confirm the app opens the `PetPomodoro Start Timer` Shortcut with the selected duration in seconds.
- [ ] Return to PetPomodoro manually when the native timer ends.
- [ ] Confirm the session still uses the normal timestamp-based honesty confirmation.
- [ ] Confirm that Shortcut support is treated as convenience only, not verification.

## Local Reminder Notifications

- [ ] Enable "Notify me when focus time is done." in Settings.
- [ ] If permission is denied, confirm the setting stays off and says: "Notifications are off for this device."
- [ ] Start a 5-minute session with reminders enabled.
- [ ] Keep the app open or otherwise eligible to run until `expectedEndAt`.
- [ ] Confirm a local notification says "Your pet is waiting." and does not imply verification.
- [ ] Tap the notification and confirm PetPomodoro opens or focuses when supported.
- [ ] Confirm the session still asks the normal honesty confirmation question.
- [ ] Close or background the app and confirm no copy promises reliable closed-app delivery.

## Copy Review

- [ ] The app never uses "verified", "detected", "failed", "cheated", or "timer completed automatically" in user-facing completion copy.
- [ ] Completed copy is encouraging.
- [ ] Abandoned copy is neutral and shame-free.
- [ ] Settings and reset copy clearly describe local device data.
