import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/lib/translations";
import type { AdvisorLetterType } from "./templates/advisor";
import { buildAdvisorLetter as _buildAdvisorLetter } from "./templates/advisor";

export { buildAdvisorLetter } from "./templates/advisor";

const LOCAL_PROFILE_KEY = "adviser_profile_local";
const LOCAL_LOGO_KEY = "adviser_logo_local";

export type LocalProfile = {
  adviserName?: string;
  companyName?: string;
  mobile?: string;
  contactInfo?: string;
  logoUrl?: string;
};

export async function loadLocalProfile(): Promise<LocalProfile> {
  try {
    const [profileRaw, logoUrl] = await Promise.all([
      AsyncStorage.getItem(LOCAL_PROFILE_KEY),
      AsyncStorage.getItem(LOCAL_LOGO_KEY),
    ]);
    const profile: LocalProfile = profileRaw ? JSON.parse(profileRaw) : {};
    if (logoUrl) profile.logoUrl = logoUrl;
    return profile;
  } catch {
    return {};
  }
}

export async function saveLocalProfileData(data: Omit<LocalProfile, "logoUrl">): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(data));
  } catch { /* storage unavailable */ }
}

export function formatLetterDate(language: Language): string {
  const localeMap: Partial<Record<Language, string>> = {
    en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR", es: "es-ES",
    it: "it-IT", pt: "pt-PT", ru: "ru-RU", zh: "zh-CN", tl: "en-PH",
    ar: "ar-SA", th: "th-TH", hi: "hi-IN", vi: "vi-VN",
  };
  return new Date().toLocaleDateString(localeMap[language] ?? "en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Returns a logo URI suitable for embedding in PDF HTML.
// On web a URL is used directly. On native, downloads and converts to base64.
export async function resolveLogoForPdf(customLogoUrl?: string | null): Promise<string> {
  if (customLogoUrl) {
    if (Platform.OS === "web") return customLogoUrl;
    try {
      const dest = `${FileSystem.cacheDirectory}custom_logo_pdf`;
      await FileSystem.downloadAsync(customLogoUrl, dest);
      const b64 = await FileSystem.readAsStringAsync(dest, { encoding: FileSystem.EncodingType.Base64 });
      return `data:image/jpeg;base64,${b64}`;
    } catch {
      // fall through to diamond logo
    }
  }
  // Fallback: return empty string (HTML will hide the logo element gracefully)
  return "";
}

export function buildLetterHtml(letter: string, logoSrc: string, recipientName: string, date: string): string {
  const escaped = letter
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  const safeName = recipientName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDate = date.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const logoTag = logoSrc
    ? `<img src="${logoSrc}" style="height:48px;max-width:160px;object-fit:contain;" alt="Logo"/>`
    : `<span style="font-family:Arial,sans-serif;font-weight:bold;font-size:15px;color:#0a1628;">PLAN B · DIAMOND SOLUTION</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
  .page { max-width: 700px; margin: 0 auto; padding: 48px 48px 64px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px solid #e67e22; margin-bottom: 32px; }
  .header-right { text-align: right; }
  .doc-name { font-size: 13px; font-weight: bold; color: #0a1628; }
  .doc-date { font-size: 12px; color: #64748b; margin-top: 4px; }
  .letter-body { font-size: 13px; line-height: 1.8; color: #1e293b; white-space: pre-wrap; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  @media print { body { background: #fff; } .page { padding: 32px; } }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>${logoTag}</div>
      <div class="header-right">
        <div class="doc-name">${safeName}</div>
        <div class="doc-date">${safeDate}</div>
      </div>
    </div>
    <div class="letter-body">${escaped}</div>
    <div class="footer">
      This letter is a professional introduction tool and does not constitute financial advice or a contractual offer.
      Always comply with the regulations applicable in your jurisdiction.
    </div>
  </div>
</body>
</html>`;
}
