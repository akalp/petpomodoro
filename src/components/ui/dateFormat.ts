import { languageLocale, type SupportedLanguage } from "../../i18n";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatTime(
  value: string,
  language: SupportedLanguage,
): string {
  return getFormatter(languageLocale(language), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(
  value: string,
  language: SupportedLanguage,
): string {
  return getFormatter(languageLocale(language), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
