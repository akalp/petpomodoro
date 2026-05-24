import {
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
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
  continue: "Continue",
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
  shortcutInstallTitle: "Install the Start Native Timer Shortcut.",
  shortcutInstallBody:
    "It can start an iOS timer alongside PetPomodoro. Your pet will still ask you to confirm honestly when you come back.",
  installShortcut: "Install Shortcut",
  meetPet: "Meet your focus friend.",
  startSmallSession: "Start with one small session.",
  levelValue: "Level {level}",
  petMoodAria: "Pet mood: {mood}",
  xpProgress: "XP progress",
  level: "Level",
  mood: "Mood",
  coins: "Coins",
  streak: "Streak",
  happiness: "Happiness",
  hunger: "Hunger",
  energy: "Energy",
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
  shopUnavailableDuringFocus:
    "Snacks wait until this focus session is finished.",
  moodHappy: "Happy",
  moodHungry: "Hungry",
  moodTired: "Tired",
  moodSad: "Sad",
  moodCalm: "Calm",
  moodWorking: "Working",
  startTitle: "Ready to focus together?",
  startInstructions: "Choose a focus session and begin when you are ready.",
  startSupport:
    "Your pet will wait while you spend a little time with your task.",
  focusDuration: "Focus duration",
  customMinutes: "Custom minutes",
  durationMinutes: "{minutes} min",
  durationShort: "{minutes}m",
  durationError: "Enter a whole number from 1 to 180 minutes.",
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
  save: "Save",
  preferredFocusTime: "Preferred focus time",
  preferredDurationAria: "Preferred Pomodoro duration",
  shortcutTitle: "iOS Shortcut",
  shortcutSettingsSupport:
    "This only remembers whether this device should hide the Shortcut install hint.",
  installedShortcut: "I installed shortcut already.",
  remindersTitle: "Local reminders",
  remindersSupport:
    "PetPomodoro can send a local reminder if this app is still allowed to run when focus time ends.",
  notifyAtEnd: "Notify me when focus time is done.",
  remindersOn: "Local reminders are on for this device.",
  notificationsUnavailable: "Notifications are not available on this device.",
  notificationsOff: "Notifications are off for this device.",
  resetTitle: "Reset local data",
  resetSupport:
    "This clears the pet, sessions, rewards, and preferences saved on this device.",
  resetAcknowledgment: "I understand this clears local progress.",
  resetDevice: "Reset this device",
  resetConfirmation:
    "Reset the pet, sessions, and rewards saved on this device?",
  notificationTitle: "Your pet is waiting.",
  notificationBody: "Come back to PetPomodoro when you're ready to check in.",
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
  continue: "Devam et",
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
  shortcutInstallTitle: "Yerel Zamanlayıcı Başlat kestirmesini yükle.",
  shortcutInstallBody:
    "PetPomodoro ile birlikte bir iOS zamanlayıcısı başlatabilir. Geri geldiğinde dostun yine dürüstçe onaylamanı isteyecek.",
  installShortcut: "Kestirmeyi yükle",
  meetPet: "Odak arkadaşınla tanış.",
  startSmallSession: "Küçük bir oturumla başla.",
  levelValue: "Seviye {level}",
  petMoodAria: "Dostunun ruh hali: {mood}",
  xpProgress: "XP ilerlemesi",
  level: "Seviye",
  mood: "Ruh hali",
  coins: "Jetonlar",
  streak: "Seri",
  happiness: "Mutluluk",
  hunger: "Tokluk",
  energy: "Enerji",
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
  shopUnavailableDuringFocus:
    "Atıştırmalıklar bu odak oturumu bitene kadar bekler.",
  moodHappy: "Mutlu",
  moodHungry: "Aç",
  moodTired: "Yorgun",
  moodSad: "Üzgün",
  moodCalm: "Sakin",
  moodWorking: "Odaklanıyor",
  startTitle: "Birlikte odaklanmaya hazır mısın?",
  startInstructions: "Bir odak oturumu seç ve hazır olduğunda başla.",
  startSupport: "Sen işine biraz zaman ayırırken dostun seni bekleyecek.",
  focusDuration: "Odak süresi",
  customMinutes: "Özel dakika",
  durationMinutes: "{minutes} dk",
  durationShort: "{minutes} dk",
  durationError: "1 ile 180 arasında tam dakika gir.",
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
  save: "Kaydet",
  preferredFocusTime: "Tercih edilen odak süresi",
  preferredDurationAria: "Tercih edilen Pomodoro süresi",
  shortcutTitle: "iOS Kestirmesi",
  shortcutSettingsSupport:
    "Bu ayar yalnızca bu cihazda kestirme yükleme ipucunun gizlenip gizlenmeyeceğini hatırlar.",
  installedShortcut: "Kestirmeyi zaten yükledim.",
  remindersTitle: "Yerel hatırlatıcılar",
  remindersSupport:
    "Odak süresi bittiğinde bu uygulamanın çalışmasına hâlâ izin veriliyorsa PetPomodoro yerel bir hatırlatıcı gönderebilir.",
  notifyAtEnd: "Odak süresi bitince bana bildir.",
  remindersOn: "Bu cihazda yerel hatırlatıcılar açık.",
  notificationsUnavailable: "Bu cihazda bildirimler kullanılamıyor.",
  notificationsOff: "Bu cihazda bildirimler kapalı.",
  resetTitle: "Yerel verileri sıfırla",
  resetSupport:
    "Bu cihazda kayıtlı dostunu, oturumlarını, ödüllerini ve tercihlerini temizler.",
  resetAcknowledgment: "Yerel ilerlemenin temizleneceğini anlıyorum.",
  resetDevice: "Bu cihazı sıfırla",
  resetConfirmation:
    "Bu cihazda kayıtlı dost, oturum ve ödüller sıfırlansın mı?",
  notificationTitle: "Dostun seni bekliyor.",
  notificationBody: "Kontrol etmek için hazır olduğunda PetPomodoro'ya dön.",
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

  if (message === INSUFFICIENT_COINS_ERROR) {
    return t("foodNotEnoughCoins");
  }

  if (message === FOOD_NOT_FOUND_ERROR) {
    return t("errorGeneric");
  }

  return message;
}
