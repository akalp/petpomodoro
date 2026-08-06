import {
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
  EMERGENCY_SNACK_DAILY_LIMIT_ERROR,
  EMERGENCY_SNACK_NOT_NEEDED_ERROR,
  PET_ALREADY_SLEEPING_ERROR,
  PET_FOCUS_NEEDS_CARE_ERROR,
  PET_NOT_SLEEPING_ERROR,
  PET_SLEEPING_CANNOT_EAT_ERROR,
  PET_SLEEPING_CANNOT_FOCUS_ERROR,
  POWER_NAP_COOLDOWN_ACTIVE_ERROR,
  POWER_NAP_DAILY_LIMIT_ERROR,
  STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR,
  STREAK_FREEZE_DAILY_LIMIT_ERROR,
  STREAK_FREEZE_DAY_NOT_MISSED_ERROR,
  STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR,
  type SupportedLanguage,
} from "../domain";

export type { SupportedLanguage };

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const englishMessages = {
  loading: "Your cozy focus companion is getting ready.",
  errorTitle: "Something got in the way.",
  errorStorage:
    "PetPomodoro could not reach local device storage. Your pet data stays on this device, so check that storage is available, then try again.",
  errorStorageSupport:
    "If local storage is blocked or full, PetPomodoro cannot safely save progress. Nothing is sent to a server.",
  errorGeneric: "Something went wrong.",
  errorPetName: "Your pet needs a small name to answer to.",
  errorPetAlreadySleeping: "Your pet is already resting.",
  errorPetNotSleeping: "Your pet is not resting right now.",
  errorFoodNotFound: "That snack is not available right now.",
  errorFoodNotEnoughCoins: "Need more coins",
  errorPetSleepingCannotEat: "Snacks wait until your pet wakes up.",
  errorPetSleepingCannotFocus:
    "Your pet is resting. Wake them before starting focus.",
  errorPetFocusNeedsCare:
    "Your pet needs a little more care before starting focus.",
  errorPowerNapLimit: "Two power naps are plenty for today. A longer rest is still here.",
  errorPowerNapCooldown: "Your pet can take another power nap a little later.",
  errorEmergencySnackLimit:
    "Your pet already had today's little rescue snack.",
  errorEmergencySnackNotNeeded:
    "That little rescue snack is saved for a hungrier moment.",
  errorStreakFreezeNotMissed:
    "Your pet does not need a streak freeze right now.",
  errorStreakFreezeHearts:
    "Streak freeze needs more Honesty Hearts. Honest check-ins can bring them back.",
  errorStreakFreezeCooldown:
    "Streak freeze is resting for now. Try again another day.",
  errorStreakFreezeLimit:
    "That missed day already has a streak freeze tucked in.",
  continue: "Continue",
  retry: "Retry",
  close: "Close",
  store: "Store",
  petTab: "Pet",
  focusTab: "Focus",
  shopTab: "Shop",
  journalTab: "Journal",
  topBarSupport: "Focus and care, saved on this device.",
  installTitle:
    "For the coziest experience, add PetPomodoro to your Home Screen from Safari.",
  installBody:
    "Open the share menu, then choose Add to Home Screen. After the first load, PetPomodoro is designed to keep working offline.",
  appUpdateTitle: "A new PetPomodoro version is ready.",
  appUpdateBody:
    "Update now to get the latest improvements. Your pet and focus history stay on this device.",
  updateNow: "Update now",
  shortcutInstallTitle: "Install the Start Native Timer Shortcut.",
  shortcutInstallBody:
    "It can start an iOS timer alongside PetPomodoro. Your pet will still ask you to confirm honestly when you come back.",
  installShortcut: "Install Shortcut",
  confirmShortcutInstall: "I installed this Shortcut",
  shortcutUpdateTitle: "A new timer Shortcut is ready.",
  shortcutUpdateBody:
    "Install the new Shortcut, then open the Shortcuts app and delete the old one named PetPomodoro Start Timer.",
  installShortcutUpdate: "Install update",
  confirmShortcutUpdate: "I installed the update",
  meetPet: "Meet your focus friend.",
  startSmallSession: "Start with one small session.",
  levelValue: "Level {level}",
  petMoodAria: "Pet mood: {mood}",
  petEncouragement: "One gentle step at a time.",
  speciesTitle: "Choose your pet companion",
  speciesSupport: "Switch looks without changing your pet's progress.",
  speciesSelected: "Selected",
  speciesMomoName: "Momo",
  speciesMomoDescription: "A warm little friend for gentle focus days.",
  speciesMomoSelectionLabel: "Choose Momo",
  speciesMoowiName: "Moowi",
  speciesMoowiDescription: "A gentle little cow who cheers for calm focus.",
  speciesMoowiSelectionLabel: "Choose Moowi",
  xpProgress: "XP progress",
  level: "Level",
  mood: "Mood",
  coins: "Coins",
  streak: "Streak",
  happiness: "Happiness",
  hunger: "Hunger",
  energy: "Energy",
  sleepTitle: "Rest time",
  sleepSupportAwake: "A quiet nap helps {pet} recover energy.",
  sleepSupportSleeping: "{pet} is resting softly.",
  sleepUnavailableDuringFocus:
    "Rest waits until this focus session is finished.",
  startPetSleep: "Let {pet} rest",
  wakePet: "Wake {pet}",
  sleepDuration: "Resting for {duration}",
  sleepEnergyPreview: "Projected energy {energy}",
  sleepDurationLabel: "Resting",
  sleepEnergyLabel: "Energy",
  sleepHungerLabel: "Hunger",
  sleepHappinessLabel: "Happiness",
  sleepResultTitle: "{pet} had a good rest.",
  sleepResultSupport:
    "Energy {energy}, hunger {hunger}, happiness {happiness}.",
  rescueTitle: "Gentle pick-me-up",
  rescueSupport: "A little care can help {pet} get ready again.",
  rescueUnavailableDuringFocus:
    "Little care breaks wait until this focus session is finished.",
  rescueCareReady: "Care ready",
  rescueAfterFocus: "After focus",
  rescueReady: "Ready",
  rescueCoolingDown: "Cooling down",
  rescueDoneToday: "Done today",
  rescueSaved: "Saved",
  powerNapTitle: "Power nap",
  powerNapSupport:
    "A {minutes}-minute cozy nap can help {pet} feel ready.",
  powerNapUnavailableSupport:
    "Power Nap is resting for now. Rest time can still help {pet}.",
  powerNapLimitSupport:
    "Power Nap is done for today. Rest time can still help {pet}.",
  takePowerNap: "Take power nap",
  powerNapResultTitle: "{pet} feels refreshed after a power nap.",
  powerNapResultSupport:
    "Energy {energy}, hunger {hunger}, happiness {happiness}.",
  emergencySnackTitle: "Emergency snack",
  emergencySnackSupport:
    "A small free bite is ready while {pet} is hungry and coins are short.",
  emergencySnackSavedSupport:
    "Saved for a very hungry moment when coins are short.",
  emergencySnackLimitSupport:
    "Emergency Snack is done for today. The Shop can help when coins are back.",
  offerEmergencySnack: "Offer snack",
  powerNapDurationChip: "{minutes} min",
  energyChangeChip: "Energy {value}",
  hungerChangeChip: "Hunger {value}",
  emergencySnackFreeChip: "Free",
  emergencySnackDailyChip: "1/day",
  emergencySnackResultTitle: "{pet} enjoyed a little rescue snack.",
  emergencySnackResultSupport: "Hunger {hunger}.",
  focusUnavailableDuringSleep:
    "{pet} is resting. Wake them before starting focus.",
  focusUnavailableCareBoth:
    "{pet} needs food and rest before this focus. Try a snack, then a nap.",
  focusUnavailableCareEnergy:
    "{pet} is too sleepy for this focus. Try a Power Nap or Rest time first.",
  focusUnavailableCareHunger:
    "{pet} needs a bite before this focus. Try the Shop or Emergency Snack.",
  focusRequirementSummary:
    "Needs energy {requiredEnergy} and hunger {requiredHunger}.",
  dailyFocusTitle: "Daily focus goal",
  dailyFocusProgress:
    "{minutes} of {goal} minutes with your pet today.",
  dailyFocusComplete:
    "Daily goal complete. {pet}'s streak is tucked in for today.",
  dailyFocusProgressLabel: "Today",
  streakFreezeAvailableTitle: "Streak freeze ready",
  streakFreezeAvailableSupport:
    "Use {cost} Honesty Hearts to keep {pet}'s streak warm for yesterday.",
  streakFreezeNotEnoughTitle: "Streak freeze needs Honesty Hearts",
  streakFreezeNotEnoughSupport:
    "It costs {cost}. Honest check-ins can bring hearts back.",
  useStreakFreeze: "Use freeze",
  shopUnavailableDuringSleep:
    "Snacks wait until {pet} wakes up.",
  totalXp: "Total XP",
  honestyHearts: "Honesty hearts",
  shopTitle: "Pet snack shop",
  shopSupport: "Spend focus coins on a small bite for your pet.",
  shopCoinBalance: "Coins: {coins}",
  feedPet: "Feed",
  foodCost: "{coins} coins",
  foodNotEnoughCoins: "Need more coins",
  foodBought: "{food} was enjoyed.",
  foodBoughtSupport:
    "Care changed by hunger {hunger}, happiness {happiness}, energy {energy}.",
  foodBerryBowl: "Berry bowl",
  foodBerryBowlDescription: "A bright snack for hunger and a little joy.",
  foodWarmSoup: "Warm soup",
  foodWarmSoupDescription: "A gentle bowl when your pet needs a filling meal.",
  foodHoneyToast: "Honey toast",
  foodHoneyToastDescription: "Sweet, cozy, and a bit energizing.",
  foodMoonMilk: "Moon milk",
  foodMoonMilkDescription: "A soft drink for tired focus friends.",
  foodCozyStew: "Cozy stew",
  foodCozyStewDescription: "A hearty bowl for a well-earned care moment.",
  shopUnavailableDuringFocus:
    "Snacks wait until this focus session is finished.",
  moodHappy: "Happy",
  moodHungry: "Hungry",
  moodExhausted: "Exhausted",
  moodTired: "Tired",
  moodSad: "Sad",
  moodCalm: "Calm",
  moodWorking: "Working",
  moodSleeping: "Sleeping",
  startTitle: "Ready to focus together?",
  startInstructions: "Choose a focus session and begin when you are ready.",
  startSupport:
    "Your pet will wait while you spend a little time with your task.",
  focusDuration: "Focus duration",
  customMinutes: "Custom",
  customDurationSelected: "Custom - {minutes} min",
  customDurationTitle: "Choose your focus time",
  customDurationSupport: "Set a gentle focus session from 1 to 180 minutes.",
  durationMinutes: "{minutes} min",
  durationShort: "{minutes}m",
  durationMinutesUnit: "minutes",
  durationMinutesShort: "{minutes}m",
  durationHoursMinutesShort: "{hours}h {minutes}m",
  durationAdjustments: "Adjust minutes",  decreaseOneMinute: "Decrease by 1 minute",
  decreaseMinutes: "Decrease by {minutes} minutes",
  increaseOneMinute: "Increase by 1 minute",
  increaseMinutes: "Increase by {minutes} minutes",
  durationError: "Enter a whole number from 1 to 180 minutes.",
  useDuration: "Use duration",
  cancel: "Cancel",
  startFocus: "Start focus",
  inProgress: "In progress",
  runningTitle: "Your pet is keeping you company while you focus.",
  runningSupport: "Come back when your focus time is done.",
  timeRemaining: "Time remaining",
  focusTime: "Focus time",
  expectedFinish: "Expected finish",
  endSession: "End this session",
  confirmationStatus: "Ready for your answer",
  confirmationTitle:
    "Your pet waited for you. Did you really finish this focus session?",
  confirmationSupport:
    "No pressure. Just answer honestly. Trust keeps this little ritual meaningful.",
  completedChoice: "Yes, we did it",
  abandonedChoice: "Not this time",
  sessionComplete: "Session complete",
  honestyReward: "Honesty reward",
  completedRewardTitle: "You showed up. Your pet noticed.",
  honestyRewardTitle: "Thanks for being honest. Trust keeps your pet happy.",
  levelUpReward: "Your pet grew a little stronger.",
  completedRewardSupport: "A little care goes a long way.",
  honestyRewardSupport: "No points lost. No scolding.",
  levelUpSupport: "Level up! Your care is adding up.",
  xpGained: "XP gained",
  newLevel: "New level",
  recentSessions: "Recent sessions",
  updating: "Updating",
  noSessions: "No focus sessions yet.",
  noSessionsSupport:
    "Your session history will appear here after your first focus session.",
  waitingAnswer: "Waiting for your answer",
  awaiting: "Awaiting",
  completedSupport: "That focus time counts.",
  awaitingSupport: "Your pet is ready for your answer.",
  runningHistorySupport: "Your session is underway.",
  statusCompleted: "Completed",
  statusAbandoned: "Abandoned",
  statusRunning: "Running",
  settings: "Settings",
  settingsSupport: "Preferences for this device.",
  language: "Language",
  languageSupport: "Choose the language saved on this device.",
  english: "English",
  turkish: "Türkçe",
  petName: "Pet name",
  petNameSupport: "Leave blank to use your companion's own name.",
  save: "Save",
  petMessagesTitle: "Pet messages",
  petMessagesSupport:
    "Write little notes your pet can say. Saved only on this device.",
  petMessageLabel: "Message {number}",
  petMessagePlaceholder: "Write a tiny note.",
  petMessageCharacters: "{count}/{max}",
  addPetMessage: "Add message",
  removePetMessage: "Remove message {number}",
  savePetMessages: "Save messages",
  petMessagesLimit: "You can save up to {max} pet messages.",
  shortcutTitle: "iOS Shortcut",
  shortcutSettingsSupport:
    "This only remembers whether the current timer Shortcut is installed on this device.",
  installedShortcut: "I installed the current Shortcut.",
  resetTitle: "Reset local data",
  resetSupport:
    "This clears the pet, sessions, rewards, and preferences saved on this device.",
  resetAcknowledgment: "I understand this clears local progress.",
  resetDevice: "Reset this device",
  resetConfirmation:
    "Reset the pet, sessions, and rewards saved on this device?",
  focusEndNotificationTitle: "Focus time is up",
  focusEndNotificationBody: "Your pet is waiting for you. Come back when you can.",
  careHungerNotificationTitle: "Your pet is getting hungry",
  careHungerNotificationBody: "A small snack would brighten their day.",
  careEnergyNotificationTitle: "Your pet could use a rest",
  careEnergyNotificationBody: "A cozy nap helps them recover.",
  liveActivityRunningTitle: "Focus time",
  liveActivityAwaitingTitle: "Time's up",
  liveActivityCompletedTitle: "Session complete",
  liveActivityAbandonedTitle: "Session ended",
  liveActivityRunningSupport: "Come back to confirm when time is up",
  liveActivityAwaitingSupport: "Come back to confirm",
  liveActivityCompletedSupport: "Your pet noticed",
  liveActivityAbandonedSupport: "No scolding",
  liveActivityCompactRunning: "Focus",
  liveActivityCompactAwaiting: "Confirm",
  liveActivityCompactCompleted: "Done",
  liveActivityCompactAbandoned: "Ended",
} as const;

export type MessageKey = keyof typeof englishMessages;
export type TranslationValues = Record<string, string | number>;
export type Translator = (
  key: MessageKey,
  values?: TranslationValues,
) => string;

const turkishMessages: Record<MessageKey, string> = {
  loading: "Sıcacık odak arkadaşın hazırlanıyor.",
  errorTitle: "Bir şey araya girdi.",
  errorStorage:
    "PetPomodoro cihazındaki yerel depolamaya ulaşamadı. Dostunun verileri bu cihazda kalır; depolamanın kullanılabilir olduğunu kontrol edip yeniden dene.",
  errorStorageSupport:
    "Yerel depolama engellenmiş veya doluysa PetPomodoro ilerlemeyi güvenle kaydedemez. Sunucuya hiçbir şey gönderilmez.",
  errorGeneric: "Bir şeyler ters gitti.",
  errorPetName: "Dostunun seslenebileceğin küçük bir isme ihtiyacı var.",
  errorPetAlreadySleeping: "Dostun zaten dinleniyor.",
  errorPetNotSleeping: "Dostun şu anda dinlenmiyor.",
  errorFoodNotFound: "Bu atıştırmalık şu anda kullanılamıyor.",
  errorFoodNotEnoughCoins: "Daha çok jeton gerekli",
  errorPetSleepingCannotEat: "Atıştırmalıklar dostun uyanana kadar bekler.",
  errorPetSleepingCannotFocus:
    "Dostun dinleniyor. Odağa başlamadan önce uyandır.",
  errorPetFocusNeedsCare:
    "Dostunun odağa başlamadan önce biraz bakıma ihtiyacı var.",
  errorPowerNapLimit:
    "Bugün iki kısa uyku yeterli. Daha uzun bir dinlenme hala burada.",
  errorPowerNapCooldown:
    "Dostun biraz sonra yeniden kısa bir uyku uyuyabilir.",
  errorEmergencySnackLimit:
    "Dostun bugünün küçük destek atıştırmalığını zaten yedi.",
  errorEmergencySnackNotNeeded:
    "Bu küçük destek atıştırmalığı daha aç bir ana saklanıyor.",
  errorStreakFreezeNotMissed:
    "Dostunun şu anda seri dondurmaya ihtiyacı yok.",
  errorStreakFreezeHearts:
    "Seri dondurma için daha fazla Dürüstlük Kalbi gerekiyor. Dürüst check-in'ler onları geri getirebilir.",
  errorStreakFreezeCooldown:
    "Seri dondurma şimdilik dinleniyor. Başka bir gün yeniden dene.",
  errorStreakFreezeLimit:
    "Bu kaçan gün için seri dondurma zaten yerinde.",
  continue: "Devam et",
  retry: "Yeniden dene",
  close: "Kapat",
  store: "Dükkan",
  petTab: "Dost",
  focusTab: "Odak",
  shopTab: "Dükkan",
  journalTab: "Günlük",
  topBarSupport: "Odak ve bakım bu cihazda kaydedilir.",
  installTitle:
    "En sıcak deneyim için PetPomodoro'yu Safari'den Ana Ekranına ekle.",
  installBody:
    "Paylaş menüsünü aç, ardından Ana Ekrana Ekle'yi seç. İlk yüklemeden sonra PetPomodoro çevrimdışı çalışmak üzere tasarlanmıştır.",
  appUpdateTitle: "PetPomodoro'nun yeni bir sürümü hazır.",
  appUpdateBody:
    "En yeni iyileştirmeleri almak için şimdi güncelle. Dostun ve odak geçmişin bu cihazda kalır.",
  updateNow: "Şimdi güncelle",
  shortcutInstallTitle: "Yerel Zamanlayıcı Başlat kestirmesini yükle.",
  shortcutInstallBody:
    "PetPomodoro ile birlikte bir iOS zamanlayıcısı başlatabilir. Geri geldiğinde dostun yine dürüstçe onaylamanı isteyecek.",
  installShortcut: "Kestirmeyi yükle",
  confirmShortcutInstall: "Bu kestirmeyi yükledim",
  shortcutUpdateTitle: "Yeni bir zamanlayıcı kestirmesi hazır.",
  shortcutUpdateBody:
    "Yeni kestirmeyi yükle, sonra Kısayollar uygulamasını aç ve PetPomodoro Start Timer adlı eski olanı sil.",
  installShortcutUpdate: "Güncellemeyi yükle",
  confirmShortcutUpdate: "Güncellemeyi yükledim",
  meetPet: "Odak arkadaşınla tanış.",
  startSmallSession: "Küçük bir oturumla başla.",
  levelValue: "Seviye {level}",
  petMoodAria: "Dostunun ruh hali: {mood}",
  petEncouragement: "Her seferinde minik bir adım.",
  speciesTitle: "Odak dostunu seç",
  speciesSupport: "Dostunun ilerlemesini değiştirmeden görünüşünü değiştir.",
  speciesSelected: "Seçili",
  speciesMomoName: "Momo",
  speciesMomoDescription: "Sakin odak günleri için sıcacık küçük bir dost.",
  speciesMomoSelectionLabel: "Momo'yu seç",
  speciesMoowiName: "Moowi",
  speciesMoowiDescription: "Sakin odaklanmayı seven yumuşacık küçük bir inek.",
  speciesMoowiSelectionLabel: "Moowi'yi seç",
  xpProgress: "XP ilerlemesi",
  level: "Seviye",
  mood: "Ruh hali",
  coins: "Jetonlar",
  streak: "Seri",
  happiness: "Mutluluk",
  hunger: "Tokluk",
  energy: "Enerji",
  sleepTitle: "Dinlenme zamanı",
  sleepSupportAwake: "Sessiz bir uyku {pet} için enerji toplar.",
  sleepSupportSleeping: "{pet} usulca dinleniyor.",
  sleepUnavailableDuringFocus:
    "Dinlenme bu odak oturumu bitene kadar bekler.",
  startPetSleep: "{pet} dinlensin",
  wakePet: "{pet} uyansın",
  sleepDuration: "{duration} dinlendi",
  sleepEnergyPreview: "Beklenen enerji {energy}",
  sleepDurationLabel: "Dinlenme",
  sleepEnergyLabel: "Enerji",
  sleepHungerLabel: "Tokluk",
  sleepHappinessLabel: "Mutluluk",
  sleepResultTitle: "{pet} güzelce dinlendi.",
  sleepResultSupport:
    "Enerji {energy}, tokluk {hunger}, mutluluk {happiness}.",
  rescueTitle: "Nazik destek",
  rescueSupport: "Biraz bakım {pet} için yeniden hazırlanmaya yardım eder.",
  rescueUnavailableDuringFocus:
    "Küçük bakım molaları bu odak oturumu bitene kadar bekler.",
  rescueCareReady: "Bakım hazır",
  rescueAfterFocus: "Odaktan sonra",
  rescueReady: "Hazır",
  rescueCoolingDown: "Bekliyor",
  rescueDoneToday: "Bugün tamam",
  rescueSaved: "Saklı",
  powerNapTitle: "Kısa uyku",
  powerNapSupport:
    "{minutes} dakikalık sıcacık bir uyku {pet} için hazır hissettirebilir.",
  powerNapUnavailableSupport:
    "Kısa uyku şimdilik dinleniyor. Dinlenme zamanı {pet} için hâlâ yardım eder.",
  powerNapLimitSupport:
    "Kısa uyku bugün tamamlandı. Dinlenme zamanı {pet} için hâlâ yardım eder.",
  takePowerNap: "Kısa uyku yap",
  powerNapResultTitle: "{pet} kısa uykudan sonra canlandı.",
  powerNapResultSupport:
    "Enerji {energy}, tokluk {hunger}, mutluluk {happiness}.",
  emergencySnackTitle: "Destek atıştırmalığı",
  emergencySnackSupport:
    "{pet} aç ve jetonlar azken küçük ücretsiz bir lokma hazır.",
  emergencySnackSavedSupport:
    "Jetonlar azken çok aç bir an için saklanıyor.",
  emergencySnackLimitSupport:
    "Destek atıştırmalığı bugün tamamlandı. Jetonlar geri gelince Dükkan yardım eder.",
  offerEmergencySnack: "Atıştırmalık ver",
  powerNapDurationChip: "{minutes} dk",
  energyChangeChip: "Enerji {value}",
  hungerChangeChip: "Tokluk {value}",
  emergencySnackFreeChip: "Ücretsiz",
  emergencySnackDailyChip: "1/gün",
  emergencySnackResultTitle: "{pet} küçük destek atıştırmalığını keyifle yedi.",
  emergencySnackResultSupport: "Tokluk {hunger}.",
  focusUnavailableDuringSleep:
    "{pet} dinleniyor. Odağa başlamadan önce uyandır.",
  focusUnavailableCareBoth:
    "{pet} bu odak için yemek ve dinlenmeye ihtiyaç duyuyor. Önce atıştırmalık, sonra kısa uyku dene.",
  focusUnavailableCareEnergy:
    "{pet} bu odak için çok uykulu. Önce Kısa uyku ya da Dinlenme zamanı dene.",
  focusUnavailableCareHunger:
    "{pet} bu odaktan önce bir lokmaya ihtiyaç duyuyor. Dükkan ya da Destek atıştırmalığı dene.",
  focusRequirementSummary:
    "Gerekli enerji {requiredEnergy}, tokluk {requiredHunger}.",
  dailyFocusTitle: "Günlük odak hedefi",
  dailyFocusProgress:
    "Bugün dostunla {goal} dakikanın {minutes} dakikası.",
  dailyFocusComplete:
    "Günlük hedef tamam. {pet} için seri bugün sarıp sarmalandı.",
  dailyFocusProgressLabel: "Bugün",
  streakFreezeAvailableTitle: "Seri dondurma hazır",
  streakFreezeAvailableSupport:
    "{pet} için dünkü seriyi sıcak tutmak üzere {cost} Dürüstlük Kalbi kullan.",
  streakFreezeNotEnoughTitle: "Seri dondurma Dürüstlük Kalbi istiyor",
  streakFreezeNotEnoughSupport:
    "{cost} kalp gerekir. Dürüst check-in'ler kalpleri geri getirebilir.",
  useStreakFreeze: "Dondur",
  shopUnavailableDuringSleep:
    "Atıştırmalıklar {pet} uyanana kadar bekler.",
  totalXp: "Toplam XP",
  honestyHearts: "Dürüstlük kalpleri",
  shopTitle: "Dost atıştırmalıkları",
  shopSupport: "Odak jetonlarını dostun için küçük bir lokmaya harca.",
  shopCoinBalance: "Jetonlar: {coins}",
  feedPet: "Besle",
  foodCost: "{coins} jeton",
  foodNotEnoughCoins: "Daha çok jeton gerekli",
  foodBought: "{food} keyifle yendi.",
  foodBoughtSupport:
    "Bakım değişimi: tokluk {hunger}, mutluluk {happiness}, enerji {energy}.",
  foodBerryBowl: "Orman meyvesi kasesi",
  foodBerryBowlDescription:
    "Tokluk ve biraz neşe için parlak bir atıştırmalık.",
  foodWarmSoup: "Ilık çorba",
  foodWarmSoupDescription:
    "Dostunun doyurucu bir öğüne ihtiyacı olduğunda nazik bir kase.",
  foodHoneyToast: "Ballı tost",
  foodHoneyToastDescription: "Tatlı, sıcak ve biraz enerji veren bir lokma.",
  foodMoonMilk: "Ay sütü",
  foodMoonMilkDescription: "Yorgun odak dostları için yumuşak bir içecek.",
  foodCozyStew: "Sıcacık yahni",
  foodCozyStewDescription: "Hak edilmiş bir bakım anı için doyurucu bir kase.",
  shopUnavailableDuringFocus:
    "Atıştırmalıklar bu odak oturumu bitene kadar bekler.",
  moodHappy: "Mutlu",
  moodHungry: "Aç",
  moodExhausted: "Bitkin",
  moodTired: "Yorgun",
  moodSad: "Üzgün",
  moodCalm: "Sakin",
  moodWorking: "Odaklanıyor",
  moodSleeping: "Uyuyor",
  startTitle: "Birlikte odaklanmaya hazır mısın?",
  startInstructions: "Bir odak oturumu seç ve hazır olduğunda başla.",
  startSupport: "Sen işine biraz zaman ayırırken dostun seni bekleyecek.",
  focusDuration: "Odak süresi",
  customMinutes: "Özel",
  customDurationSelected: "Özel - {minutes} dk",
  customDurationTitle: "Odak süreni seç",
  customDurationSupport: "1 ile 180 dakika arasında sakin bir odak oturumu ayarla.",
  durationMinutes: "{minutes} dk",
  durationShort: "{minutes} dk",
  durationMinutesUnit: "dakika",
  durationMinutesShort: "{minutes} dk",
  durationHoursMinutesShort: "{hours} sa {minutes} dk",
  durationAdjustments: "Dakikayı ayarla",
  decreaseOneMinute: "1 dakika azalt",
  decreaseMinutes: "{minutes} dakika azalt",
  increaseOneMinute: "1 dakika artır",
  increaseMinutes: "{minutes} dakika artır",
  durationError: "1 ile 180 arasında tam dakika gir.",
  useDuration: "Süreyi kullan",
  cancel: "Vazgeç",
  startFocus: "Odağa başla",
  inProgress: "Devam ediyor",
  runningTitle: "Sen odaklanırken dostun sana eşlik ediyor.",
  runningSupport: "Odak süren bittiğinde geri gel.",
  timeRemaining: "Kalan süre",
  focusTime: "Odak süresi",
  expectedFinish: "Beklenen bitiş",
  endSession: "Bu oturumu bitir",
  confirmationStatus: "Yanıtın bekleniyor",
  confirmationTitle:
    "Dostun seni bekledi. Bu odak oturumunu gerçekten tamamladın mı?",
  confirmationSupport:
    "Baskı yok. Yalnızca dürüstçe yanıtla. Güven bu küçük ritüeli anlamlı kılar.",
  completedChoice: "Evet, başardık",
  abandonedChoice: "Bu sefer değil",
  sessionComplete: "Oturum tamamlandı",
  honestyReward: "Dürüstlük ödülü",
  completedRewardTitle: "Geldin ve emek verdin. Dostun fark etti.",
  honestyRewardTitle:
    "Dürüst olduğun için teşekkürler. Güven dostunu mutlu eder.",
  levelUpReward: "Dostun biraz daha güçlendi.",
  completedRewardSupport: "Küçük bir bakım çok şey değiştirir.",
  honestyRewardSupport: "Puan kaybı yok. Azarlama yok.",
  levelUpSupport: "Seviye atladın! İlgin birikiyor.",
  xpGained: "Kazanılan XP",
  newLevel: "Yeni seviye",
  recentSessions: "Son oturumlar",
  updating: "Güncelleniyor",
  noSessions: "Henüz odak oturumu yok.",
  noSessionsSupport: "İlk odak oturumundan sonra geçmişin burada görünecek.",
  waitingAnswer: "Yanıtın bekleniyor",
  awaiting: "Bekliyor",
  completedSupport: "Bu odak süresi değerliydi.",
  awaitingSupport: "Dostun yanıtına hazır.",
  runningHistorySupport: "Oturumun devam ediyor.",
  statusCompleted: "Tamamlandı",
  statusAbandoned: "Bırakıldı",
  statusRunning: "Devam ediyor",
  settings: "Ayarlar",
  settingsSupport: "Bu cihaz için tercihler.",
  language: "Dil",
  languageSupport: "Bu cihazda kaydedilecek dili seç.",
  english: "English",
  turkish: "Türkçe",
  petName: "Dostunun adı",
  petNameSupport: "Dostunun kendi adını kullanmak için boş bırak.",
  save: "Kaydet",
  petMessagesTitle: "Dost mesajları",
  petMessagesSupport:
    "Dostunun söyleyebileceği küçük notlar yaz. Yalnızca bu cihazda kaydedilir.",
  petMessageLabel: "Mesaj {number}",
  petMessagePlaceholder: "Küçük bir not yaz.",
  petMessageCharacters: "{count}/{max}",
  addPetMessage: "Mesaj ekle",
  removePetMessage: "{number}. mesajı kaldır",
  savePetMessages: "Mesajları kaydet",
  petMessagesLimit: "En fazla {max} dost mesajı kaydedebilirsin.",
  shortcutTitle: "iOS Kestirmesi",
  shortcutSettingsSupport:
    "Bu ayar yalnızca güncel zamanlayıcı kestirmesinin bu cihazda yüklü olup olmadığını hatırlar.",
  installedShortcut: "Güncel kestirmeyi yükledim.",
  resetTitle: "Yerel verileri sıfırla",
  resetSupport:
    "Bu cihazda kayıtlı dostunu, oturumlarını, ödüllerini ve tercihlerini temizler.",
  resetAcknowledgment: "Yerel ilerlemenin temizleneceğini anlıyorum.",
  resetDevice: "Bu cihazı sıfırla",
  resetConfirmation:
    "Bu cihazda kayıtlı dost, oturum ve ödüller sıfırlansın mı?",
  focusEndNotificationTitle: "Odak süresi doldu",
  focusEndNotificationBody: "Dostun seni bekliyor. Geldiğinde geri gel.",
  careHungerNotificationTitle: "Dostun acıkmaya başlıyor",
  careHungerNotificationBody: "Küçük bir atıştırmalık gününü güzelleştirir.",
  careEnergyNotificationTitle: "Dostunun dinlenmesi gerekiyor",
  careEnergyNotificationBody: "Sıcacık bir uyku onu canlandırır.",
  liveActivityRunningTitle: "Odak süresi",
  liveActivityAwaitingTitle: "Süre doldu",
  liveActivityCompletedTitle: "Oturum tamamlandı",
  liveActivityAbandonedTitle: "Oturum bitti",
  liveActivityRunningSupport: "Süre dolduğunda geri gel onayla",
  liveActivityAwaitingSupport: "Geri gel onayla",
  liveActivityCompletedSupport: "Dostun fark etti",
  liveActivityAbandonedSupport: "Azarlama yok",
  liveActivityCompactRunning: "Odak",
  liveActivityCompactAwaiting: "Onay",
  liveActivityCompactCompleted: "Tamam",
  liveActivityCompactAbandoned: "Bitti",
};

const messages: Record<SupportedLanguage, Record<MessageKey, string>> = {
  en: englishMessages,
  tr: turkishMessages,
};

export function normalizeLanguage(value: unknown): SupportedLanguage {
  return typeof value === "string" && value.toLowerCase().startsWith("tr")
    ? "tr"
    : DEFAULT_LANGUAGE;
}

export function languageLocale(language: SupportedLanguage): string {
  return language === "tr" ? "tr-TR" : "en-US";
}

export function createTranslator(language: SupportedLanguage): Translator {
  return (key, values = {}) =>
    Object.entries(values).reduce(
      (message, [name, value]) =>
        message.replaceAll(`{${name}}`, String(value)),
      messages[language][key],
    );
}

export interface NativeFocusCopy {
  focusEndTitle: string;
  focusEndBody: string;
  runningTitle: string;
  runningSupport: string;
  awaitingTitle: string;
  awaitingSupport: string;
  completedTitle: string;
  completedSupport: string;
  abandonedTitle: string;
  abandonedSupport: string;
  compactRunning: string;
  compactAwaiting: string;
  compactCompleted: string;
  compactAbandoned: string;
}

export interface NativeCareCopy {
  hungerTitle: string;
  hungerBody: string;
  energyTitle: string;
  energyBody: string;
}

export function createNativeFocusCopy(language: SupportedLanguage): NativeFocusCopy {
  const t = createTranslator(language);
  return {
    focusEndTitle: t("focusEndNotificationTitle"),
    focusEndBody: t("focusEndNotificationBody"),
    runningTitle: t("liveActivityRunningTitle"),
    runningSupport: t("liveActivityRunningSupport"),
    awaitingTitle: t("liveActivityAwaitingTitle"),
    awaitingSupport: t("liveActivityAwaitingSupport"),
    completedTitle: t("liveActivityCompletedTitle"),
    completedSupport: t("liveActivityCompletedSupport"),
    abandonedTitle: t("liveActivityAbandonedTitle"),
    abandonedSupport: t("liveActivityAbandonedSupport"),
    compactRunning: t("liveActivityCompactRunning"),
    compactAwaiting: t("liveActivityCompactAwaiting"),
    compactCompleted: t("liveActivityCompactCompleted"),
    compactAbandoned: t("liveActivityCompactAbandoned"),
  };
}

export function createNativeCareCopy(language: SupportedLanguage): NativeCareCopy {
  const t = createTranslator(language);
  return {
    hungerTitle: t("careHungerNotificationTitle"),
    hungerBody: t("careHungerNotificationBody"),
    energyTitle: t("careEnergyNotificationTitle"),
    energyBody: t("careEnergyNotificationBody"),
  };
}

export function localizeErrorMessage(message: string, t: Translator): string {
  if (message === englishMessages.errorGeneric) {
    return t("errorGeneric");
  }

  if (message === englishMessages.errorStorage) {
    return t("errorStorage");
  }

  if (message === englishMessages.errorPetName) {
    return t("errorPetName");
  }

  if (message === PET_ALREADY_SLEEPING_ERROR) {
    return t("errorPetAlreadySleeping");
  }

  if (message === PET_NOT_SLEEPING_ERROR) {
    return t("errorPetNotSleeping");
  }

  if (message === PET_SLEEPING_CANNOT_EAT_ERROR) {
    return t("errorPetSleepingCannotEat");
  }

  if (message === PET_SLEEPING_CANNOT_FOCUS_ERROR) {
    return t("errorPetSleepingCannotFocus");
  }

  if (message === PET_FOCUS_NEEDS_CARE_ERROR) {
    return t("errorPetFocusNeedsCare");
  }

  if (message === POWER_NAP_DAILY_LIMIT_ERROR) {
    return t("errorPowerNapLimit");
  }

  if (message === POWER_NAP_COOLDOWN_ACTIVE_ERROR) {
    return t("errorPowerNapCooldown");
  }

  if (message === EMERGENCY_SNACK_DAILY_LIMIT_ERROR) {
    return t("errorEmergencySnackLimit");
  }

  if (message === EMERGENCY_SNACK_NOT_NEEDED_ERROR) {
    return t("errorEmergencySnackNotNeeded");
  }

  if (message === STREAK_FREEZE_DAY_NOT_MISSED_ERROR) {
    return t("errorStreakFreezeNotMissed");
  }

  if (message === STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR) {
    return t("errorStreakFreezeHearts");
  }

  if (message === STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR) {
    return t("errorStreakFreezeCooldown");
  }

  if (message === STREAK_FREEZE_DAILY_LIMIT_ERROR) {
    return t("errorStreakFreezeLimit");
  }

  if (message === INSUFFICIENT_COINS_ERROR) {
    return t("errorFoodNotEnoughCoins");
  }

  if (message === FOOD_NOT_FOUND_ERROR) {
    return t("errorFoodNotFound");
  }

  return message;
}
