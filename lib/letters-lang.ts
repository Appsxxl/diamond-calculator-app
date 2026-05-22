import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/lib/translations";

const STORAGE_KEY = "letters_lang_usage";
const ALL_LANGUAGES: Language[] = ["en", "nl", "de", "fr", "es", "it", "pt", "ru", "zh", "tl", "ar", "th", "hi", "vi"];
const DEFAULT_TOP_6: Language[] = ["en", "nl", "de", "fr", "es", "it"];

export async function recordLetterLangUsage(lang: Language): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const counts: Partial<Record<Language, number>> = raw ? JSON.parse(raw) : {};
    counts[lang] = (counts[lang] ?? 0) + 1;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch { /* ignore */ }
}

export async function getTopLetterLanguages(n = 6): Promise<Language[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TOP_6.slice(0, n);
    const counts: Partial<Record<Language, number>> = JSON.parse(raw);
    return [...ALL_LANGUAGES]
      .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
      .slice(0, n);
  } catch {
    return DEFAULT_TOP_6.slice(0, n);
  }
}
