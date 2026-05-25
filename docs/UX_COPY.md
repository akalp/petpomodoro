# UX Copy

## Copy Principles

- Cozy: the pet is a companion, not a judge.
- Encouraging: completion should feel warm and earned.
- Trust-based: ask honestly and accept the answer.
- No shame: abandoned sessions are neutral.
- No fake verification: never claim the app detected or verified a native timer.

## Languages

- The MVP interface supports English and Türkçe.
- Both languages must keep the same trust-based, shame-free meaning.
- Language selection is saved locally on the device and must continue to work offline.

## Navigation

Primary tabs:

- Pet / Dost
- Focus / Odak
- Shop / Dükkan
- Journal / Günlük

Settings:

- Settings / Ayarlar
- Preferences for this device. / Bu cihaz için tercihler.

Guidance:

- Settings should feel like local device preferences, not an account area.
- Do not add a visible Games tab until there is real playable content.

## Starting A Focus Session

Primary:

- Ready to focus together?

Supporting:

- Your pet will wait while you spend a little time with your task.
- Choose a focus session and begin when you are ready.
- A gentle 25-minute session is ready.

Primary button:

- Start focus

Secondary options:

- Maybe later
- Change duration
- Custom

Custom duration sheet:

- Choose your focus time
- Set a gentle focus session from 1 to 180 minutes.
- Adjust minutes
- Use duration
- Cancel
- Custom - {minutes} min

Turkish:

- Özel
- Odak süreni seç
- 1 ile 180 dakika arasında sakin bir odak oturumu ayarla.
- Dakikayı ayarla
- Süreyi kullan
- Vazgeç
- Özel - {minutes} dk

## Running Session

Primary:

- Your pet is keeping you company while you focus.

Supporting:

- Come back when your focus time is done.
- Your session is underway.
- Your pet is waiting quietly.

Status labels:

- Focus time
- Expected finish
- In progress
- Mood: Working / Odaklanıyor
- Mood: Sleeping / Uyuyor
- Mood: Hungry / Aç
- Mood: Tired / Yorgun
- Mood: Sad / Üzgün

Pet reaction:

- Show a focused working face only while the session status is `running`.
- Show a sleeping face while the pet is resting.

## Pet Speech Bubble

Current motivational message:

- One gentle step at a time.
- Her seferinde minik bir adım.

This message is bundled and local-first for now. A future iteration may allow the
user to choose or write pet messages stored only on their device.

Action:

- End this session

## Pet Rest

Primary:

- Rest time

Supporting:

- A quiet nap helps {pet} recover energy.
- {pet} is resting softly.
- Rest waits until this focus session is finished.
- {pet} is resting. Wake them before starting focus.

Actions and labels:

- Let {pet} rest
- Wake {pet}
- Resting for {duration}
- Projected energy {energy}
- Energy
- Hunger
- Happiness

Result:

- {pet} had a good rest.
- Energy {energy}, hunger {hunger}, happiness {happiness}.

Turkish:

- Dinlenme zamanı
- Sessiz bir uyku {pet} için enerji toplar.
- {pet} usulca dinleniyor.
- Dinlenme bu odak oturumu bitene kadar bekler.
- {pet} dinleniyor. Odağa başlamadan önce uyandır.
- {pet} dinlensin
- {pet} uyansın
- {duration} dinlendi
- Beklenen enerji {energy}
- Enerji
- Tokluk
- Mutluluk
- {pet} güzelce dinlendi.
- Enerji {energy}, tokluk {hunger}, mutluluk {happiness}.

## Session Ready For Confirmation

Primary:

- Your pet waited for you. Did you really finish this focus session?

Supporting:

- No pressure. Just answer honestly.
- Trust keeps this little ritual meaningful.

Choices:

- Yes, we did it
- Not this time

Do not use:

- Verified
- Detected
- Failed
- Cheated
- Timer completed automatically

## Completed Session

Primary:

- You showed up. Your pet noticed.

Supporting:

- That focus time counts.
- A little care goes a long way.
- Your pet looks brighter after that session.

Action:

- Continue

## Abandoned Session

Primary:

- That's okay. We can try again when you're ready.

Supporting:

- No points lost. No scolding.
- Thanks for being honest with your pet.
- Some sessions do not go as planned.

For an early cancellation, do not show reward language. After "Not this time" from the confirmation prompt, the honesty reward copy may be shown.

Action:

- Back to pet

## Completion Reward

Primary:

- You showed up. Your pet noticed.

Supporting:

- That focus time counts.
- A little care goes a long way.
- Your pet gained XP and care progress from this completed focus session.

Short labels:

- XP gained
- Reward saved
- Session complete

## Honesty Reward

Primary:

- Thanks for being honest. Trust keeps your pet happy.

Supporting:

- No points lost. No scolding.
- Your honesty heart was saved.

Short labels:

- Honesty hearts
- Reward saved

## Pet Level Up

Primary:

- Your pet grew a little stronger.

Supporting:

- Level up!
- Your care is adding up.
- Your pet learned something from your focus.

Short labels:

- New level
- Growing well
- Pet progress

## Feeding Shop

Primary:

- Pet snack shop

Supporting:

- Spend focus coins on a small bite for your pet.
- Snacks wait until this focus session is finished.
- Snacks wait until your pet wakes up.

Food:

- Berry bowl
- Warm soup
- Honey toast
- Moon milk

Actions and labels:

- Feed
- Need more coins
- {coins} coins
- {food} was enjoyed.
- Care changed by hunger {hunger}, happiness {happiness}, energy {energy}.

Turkish:

- Dost atıştırmalıkları
- Odak jetonlarını dostun için küçük bir lokmaya harca.
- Atıştırmalıklar bu odak oturumu bitene kadar bekler.
- Atıştırmalıklar dostun uyanana kadar bekler.
- Besle
- Daha çok jeton gerekli
- {coins} jeton
- {food} keyifle yendi.
- Bakım değişimi: tokluk {hunger}, mutluluk {happiness}, enerji {energy}.

## Empty States

No sessions:

- No focus sessions yet. Start a gentle one when you're ready.

No rewards:

- Your pet has not earned XP yet. One honest session is enough to begin.

No history:

- Your session history will appear here after your first focus session.

First launch:

- Meet your focus friend.
- Start with one small session.

## iOS Install Hint

Primary:

- For the coziest experience, add PetPomodoro to your Home Screen from Safari.

Supporting:

- Open the share menu, then choose Add to Home Screen.
- Once installed, PetPomodoro can open like a small app.
- After the first load, the app is designed to keep working offline.

Do not imply:

- Installation enables native timer verification.
- The app can monitor iOS Clock timers.
- The app can keep running continuously in the background.

## iOS Shortcut Install Hint

Primary:

- Install the Start Native Timer Shortcut.

Supporting:

- It can start an iOS timer alongside PetPomodoro.
- Your pet will still ask you to confirm honestly when you come back.

Action:

- Install Shortcut

Do not imply:

- The Shortcut proves that focus was completed.
- PetPomodoro can observe the native timer.
- The confirmation step is skipped.

## Local Reminder Settings

Primary:

- Local reminders

Supporting:

- PetPomodoro can send a local reminder if this app is still allowed to run when focus time ends.
- Local reminders are on for this device.
- Notifications are off for this device.
- Notifications are not available on this device.

Action:

- Notify me when focus time is done.

Do not imply:

- Notifications are guaranteed after the app is closed.
- Local reminders verify focus completion.
- The confirmation step is skipped.
