import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { trpc } from "@/lib/trpc";
import type { Language } from "@/lib/translations";

const NAVY = "#0a1628";
const GOLD = "#e67e22";
const FONT = "ArialRoundedMTBold";

const LOCAL_PROFILE_KEY = "adviser_profile_local";
const LOCAL_LOGO_KEY = "adviser_logo_local";

const TX: Record<Language, {
  back: string; title: string; sub: string;
  sectionLogo: string; logoHint: string; uploadBtn: string; removeBtn: string; uploading: string;
  sectionDetails: string; savedNote: string;
  labelName: string; labelCompany: string; labelMobile: string; labelContact: string;
  saveBtn: string; saving: string; saved: string;
  usageNote: string;
  permissionTitle: string; permissionMsg: string;
  uploadError: string;
}> = {
  en: {
    back: "← Back", title: "ADVISER PROFILE", sub: "Your details and logo are pre-filled in all letters and PDFs.",
    sectionLogo: "YOUR LOGO", logoHint: "Appears in letter PDF headers instead of the diamond logo.",
    uploadBtn: "Upload Logo", removeBtn: "Remove", uploading: "Uploading…",
    sectionDetails: "YOUR DETAILS", savedNote: "(saved to your account)",
    labelName: "Full Name", labelCompany: "Company / Organisation", labelMobile: "Mobile Number", labelContact: "Email / Website",
    saveBtn: "Save Profile", saving: "Saving…", saved: "✓ Saved",
    usageNote: "Profile is shared across all letter types — customer, advisor recruiting, real estate, and HNW outreach.",
    permissionTitle: "Permission needed", permissionMsg: "Please allow access to your photo library to upload a logo.",
    uploadError: "Upload failed. Please try again.",
  },
  nl: {
    back: "← Terug", title: "ADVISEUR PROFIEL", sub: "Uw gegevens en logo worden automatisch ingevuld in alle brieven en PDF's.",
    sectionLogo: "UW LOGO", logoHint: "Verschijnt in de koptekst van PDF-brieven in plaats van het diamantlogo.",
    uploadBtn: "Logo uploaden", removeBtn: "Verwijderen", uploading: "Uploaden…",
    sectionDetails: "UW GEGEVENS", savedNote: "(opgeslagen in uw account)",
    labelName: "Volledige naam", labelCompany: "Bedrijf / organisatie", labelMobile: "Mobiel nummer", labelContact: "E-mail / Website",
    saveBtn: "Profiel opslaan", saving: "Opslaan…", saved: "✓ Opgeslagen",
    usageNote: "Profiel wordt gedeeld over alle brieftypen — klant, adviseur werving, vastgoed en HNW.",
    permissionTitle: "Toestemming nodig", permissionMsg: "Sta toegang tot uw fotobibliotheek toe om een logo te uploaden.",
    uploadError: "Upload mislukt. Probeer het opnieuw.",
  },
  de: {
    back: "← Zurück", title: "BERATER PROFIL", sub: "Ihre Daten und Ihr Logo werden in allen Briefen und PDFs automatisch ausgefüllt.",
    sectionLogo: "IHR LOGO", logoHint: "Erscheint in PDF-Briefköpfen anstelle des Diamantlogos.",
    uploadBtn: "Logo hochladen", removeBtn: "Entfernen", uploading: "Hochladen…",
    sectionDetails: "IHRE DATEN", savedNote: "(in Ihrem Konto gespeichert)",
    labelName: "Vollständiger Name", labelCompany: "Unternehmen / Organisation", labelMobile: "Handynummer", labelContact: "E-Mail / Website",
    saveBtn: "Profil speichern", saving: "Speichern…", saved: "✓ Gespeichert",
    usageNote: "Profil wird für alle Brieftypen geteilt — Kunde, Beraterrekrutierung, Immobilien und HNW.",
    permissionTitle: "Berechtigung erforderlich", permissionMsg: "Bitte erlauben Sie den Zugriff auf Ihre Fotobibliothek, um ein Logo hochzuladen.",
    uploadError: "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
  },
  fr: {
    back: "← Retour", title: "PROFIL CONSEILLER", sub: "Vos coordonnées et votre logo sont pré-remplis dans toutes les lettres et PDF.",
    sectionLogo: "VOTRE LOGO", logoHint: "Apparaît dans les en-têtes PDF à la place du logo diamant.",
    uploadBtn: "Télécharger logo", removeBtn: "Supprimer", uploading: "Téléchargement…",
    sectionDetails: "VOS COORDONNÉES", savedNote: "(enregistré dans votre compte)",
    labelName: "Nom complet", labelCompany: "Entreprise / Organisation", labelMobile: "Numéro de portable", labelContact: "E-mail / Site web",
    saveBtn: "Enregistrer profil", saving: "Enregistrement…", saved: "✓ Enregistré",
    usageNote: "Le profil est partagé entre tous les types de lettres — client, recrutement conseiller, immobilier et HNW.",
    permissionTitle: "Permission requise", permissionMsg: "Veuillez autoriser l'accès à votre bibliothèque de photos pour télécharger un logo.",
    uploadError: "Échec du téléchargement. Veuillez réessayer.",
  },
  es: {
    back: "← Volver", title: "PERFIL DE ASESOR", sub: "Sus datos y logotipo se rellenan automáticamente en todas las cartas y PDFs.",
    sectionLogo: "SU LOGOTIPO", logoHint: "Aparece en los encabezados de PDF en lugar del logotipo de diamante.",
    uploadBtn: "Subir logotipo", removeBtn: "Eliminar", uploading: "Subiendo…",
    sectionDetails: "SUS DATOS", savedNote: "(guardado en su cuenta)",
    labelName: "Nombre completo", labelCompany: "Empresa / Organización", labelMobile: "Número de móvil", labelContact: "Email / Sitio web",
    saveBtn: "Guardar perfil", saving: "Guardando…", saved: "✓ Guardado",
    usageNote: "El perfil se comparte entre todos los tipos de cartas — cliente, reclutamiento de asesores, inmobiliario y HNW.",
    permissionTitle: "Permiso necesario", permissionMsg: "Permita el acceso a su biblioteca de fotos para subir un logotipo.",
    uploadError: "Error al subir. Por favor, inténtelo de nuevo.",
  },
  it: {
    back: "← Indietro", title: "PROFILO CONSULENTE", sub: "I tuoi dati e logo vengono precompilati in tutte le lettere e PDF.",
    sectionLogo: "IL TUO LOGO", logoHint: "Appare nelle intestazioni PDF al posto del logo diamante.",
    uploadBtn: "Carica logo", removeBtn: "Rimuovi", uploading: "Caricamento…",
    sectionDetails: "I TUOI DATI", savedNote: "(salvato nel tuo account)",
    labelName: "Nome completo", labelCompany: "Azienda / Organizzazione", labelMobile: "Numero di cellulare", labelContact: "Email / Sito web",
    saveBtn: "Salva profilo", saving: "Salvataggio…", saved: "✓ Salvato",
    usageNote: "Il profilo è condiviso tra tutti i tipi di lettera — cliente, reclutamento consulenti, immobiliare e HNW.",
    permissionTitle: "Autorizzazione richiesta", permissionMsg: "Consenti l'accesso alla tua libreria foto per caricare un logo.",
    uploadError: "Caricamento fallito. Riprova.",
  },
  pt: {
    back: "← Voltar", title: "PERFIL DO CONSULTOR", sub: "Os seus dados e logótipo são pré-preenchidos em todas as cartas e PDFs.",
    sectionLogo: "O SEU LOGÓTIPO", logoHint: "Aparece nos cabeçalhos de PDF em vez do logótipo de diamante.",
    uploadBtn: "Carregar logótipo", removeBtn: "Remover", uploading: "A carregar…",
    sectionDetails: "OS SEUS DADOS", savedNote: "(guardado na sua conta)",
    labelName: "Nome completo", labelCompany: "Empresa / Organização", labelMobile: "Número de telemóvel", labelContact: "Email / Website",
    saveBtn: "Guardar perfil", saving: "A guardar…", saved: "✓ Guardado",
    usageNote: "O perfil é partilhado entre todos os tipos de cartas — cliente, recrutamento de consultores, imobiliário e HNW.",
    permissionTitle: "Permissão necessária", permissionMsg: "Permita o acesso à sua biblioteca de fotos para carregar um logótipo.",
    uploadError: "Falha no carregamento. Por favor, tente novamente.",
  },
  ru: {
    back: "← Назад", title: "ПРОФИЛЬ СОВЕТНИКА", sub: "Ваши данные и логотип автоматически заполняются во всех письмах и PDF.",
    sectionLogo: "ВАШ ЛОГОТИП", logoHint: "Появляется в заголовках PDF вместо логотипа с бриллиантом.",
    uploadBtn: "Загрузить логотип", removeBtn: "Удалить", uploading: "Загрузка…",
    sectionDetails: "ВАШИ ДАННЫЕ", savedNote: "(сохранено в вашем аккаунте)",
    labelName: "Полное имя", labelCompany: "Компания / Организация", labelMobile: "Номер мобильного", labelContact: "Email / Веб-сайт",
    saveBtn: "Сохранить профиль", saving: "Сохранение…", saved: "✓ Сохранено",
    usageNote: "Профиль используется во всех типах писем — клиенту, рекрутинг советников, недвижимость и HNW.",
    permissionTitle: "Требуется разрешение", permissionMsg: "Разрешите доступ к библиотеке фото для загрузки логотипа.",
    uploadError: "Ошибка загрузки. Пожалуйста, попробуйте снова.",
  },
  zh: {
    back: "← 返回", title: "顾问资料", sub: "您的详细信息和标志将预填至所有信函和PDF中。",
    sectionLogo: "您的标志", logoHint: "在PDF信函页眉中替代钻石标志显示。",
    uploadBtn: "上传标志", removeBtn: "删除", uploading: "上传中…",
    sectionDetails: "您的信息", savedNote: "（已保存至账户）",
    labelName: "全名", labelCompany: "公司 / 组织", labelMobile: "手机号码", labelContact: "电子邮件 / 网站",
    saveBtn: "保存资料", saving: "保存中…", saved: "✓ 已保存",
    usageNote: "资料在所有信函类型中共享 — 客户、顾问招募、房地产和HNW。",
    permissionTitle: "需要权限", permissionMsg: "请允许访问您的照片库以上传标志。",
    uploadError: "上传失败，请重试。",
  },
  tl: {
    back: "← Bumalik", title: "PROFILE NG ADVISER", sub: "Ang iyong mga detalye at logo ay awtomatikong nalalapat sa lahat ng liham at PDF.",
    sectionLogo: "ANG IYONG LOGO", logoHint: "Lumalabas sa mga header ng PDF sa halip ng diamond logo.",
    uploadBtn: "I-upload ang Logo", removeBtn: "Alisin", uploading: "Ina-upload…",
    sectionDetails: "ANG IYONG MGA DETALYE", savedNote: "(naka-save sa iyong account)",
    labelName: "Buong pangalan", labelCompany: "Kumpanya / Organisasyon", labelMobile: "Numero ng mobile", labelContact: "Email / Website",
    saveBtn: "I-save ang Profile", saving: "Sine-save…", saved: "✓ Nai-save",
    usageNote: "Ang profile ay ibinabahagi sa lahat ng uri ng liham — customer, adviser recruiting, real estate, at HNW.",
    permissionTitle: "Kailangan ang pahintulot", permissionMsg: "Mangyaring payagan ang access sa iyong photo library para mag-upload ng logo.",
    uploadError: "Nabigo ang pag-upload. Pakisubukan muli.",
  },
  ar: {
    back: "→ رجوع", title: "ملف المستشار", sub: "يتم ملء بياناتك وشعارك مسبقاً في جميع الرسائل وملفات PDF.",
    sectionLogo: "شعارك", logoHint: "يظهر في رأس صفحات PDF بدلاً من شعار الماس.",
    uploadBtn: "رفع الشعار", removeBtn: "إزالة", uploading: "جارٍ الرفع…",
    sectionDetails: "بياناتك", savedNote: "(محفوظ في حسابك)",
    labelName: "الاسم الكامل", labelCompany: "الشركة / المنظمة", labelMobile: "رقم الجوال", labelContact: "البريد الإلكتروني / الموقع",
    saveBtn: "حفظ الملف", saving: "جارٍ الحفظ…", saved: "✓ تم الحفظ",
    usageNote: "الملف مشترك عبر جميع أنواع الرسائل — العميل والتوظيف والعقارات وكبار العملاء.",
    permissionTitle: "إذن مطلوب", permissionMsg: "يرجى السماح بالوصول إلى مكتبة الصور لرفع شعار.",
    uploadError: "فشل الرفع. يرجى المحاولة مرة أخرى.",
  },
  th: {
    back: "← กลับ", title: "โปรไฟล์ที่ปรึกษา", sub: "รายละเอียดและโลโก้ของคุณจะถูกกรอกล่วงหน้าในจดหมายและ PDF ทั้งหมด",
    sectionLogo: "โลโก้ของคุณ", logoHint: "แสดงในส่วนหัวของ PDF แทนโลโก้เพชร",
    uploadBtn: "อัปโหลดโลโก้", removeBtn: "ลบออก", uploading: "กำลังอัปโหลด…",
    sectionDetails: "ข้อมูลของคุณ", savedNote: "(บันทึกในบัญชีของคุณ)",
    labelName: "ชื่อเต็ม", labelCompany: "บริษัท / องค์กร", labelMobile: "หมายเลขมือถือ", labelContact: "อีเมล / เว็บไซต์",
    saveBtn: "บันทึกโปรไฟล์", saving: "กำลังบันทึก…", saved: "✓ บันทึกแล้ว",
    usageNote: "โปรไฟล์ใช้ร่วมกันในทุกประเภทจดหมาย — ลูกค้า, การรับสมัครที่ปรึกษา, อสังหาริมทรัพย์ และ HNW",
    permissionTitle: "ต้องการสิทธิ์", permissionMsg: "กรุณาอนุญาตการเข้าถึงคลังภาพของคุณเพื่ออัปโหลดโลโก้",
    uploadError: "อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง",
  },
  hi: {
    back: "← वापस", title: "सलाहकार प्रोफ़ाइल", sub: "आपकी जानकारी और लोगो सभी पत्रों और PDF में स्वतः भरे जाते हैं।",
    sectionLogo: "आपका लोगो", logoHint: "PDF पत्र हेडर में हीरे के लोगो की जगह दिखता है।",
    uploadBtn: "लोगो अपलोड करें", removeBtn: "हटाएं", uploading: "अपलोड हो रहा है…",
    sectionDetails: "आपका विवरण", savedNote: "(आपके खाते में सेव)",
    labelName: "पूरा नाम", labelCompany: "कंपनी / संगठन", labelMobile: "मोबाइल नंबर", labelContact: "ईमेल / वेबसाइट",
    saveBtn: "प्रोफ़ाइल सेव करें", saving: "सेव हो रहा है…", saved: "✓ सेव हो गया",
    usageNote: "प्रोफ़ाइल सभी पत्र प्रकारों में साझा की जाती है — ग्राहक, सलाहकार भर्ती, रियल एस्टेट और HNW।",
    permissionTitle: "अनुमति आवश्यक", permissionMsg: "लोगो अपलोड करने के लिए अपनी फ़ोटो लाइब्रेरी तक पहुंच की अनुमति दें।",
    uploadError: "अपलोड विफल। कृपया पुनः प्रयास करें।",
  },
  vi: {
    back: "← Quay lại", title: "HỒ SƠ TƯ VẤN VIÊN", sub: "Thông tin và logo của bạn được điền sẵn trong tất cả thư và PDF.",
    sectionLogo: "LOGO CỦA BẠN", logoHint: "Xuất hiện trong tiêu đề PDF thay cho logo kim cương.",
    uploadBtn: "Tải lên Logo", removeBtn: "Xóa", uploading: "Đang tải lên…",
    sectionDetails: "THÔNG TIN CỦA BẠN", savedNote: "(đã lưu vào tài khoản của bạn)",
    labelName: "Họ và tên đầy đủ", labelCompany: "Công ty / Tổ chức", labelMobile: "Số điện thoại di động", labelContact: "Email / Trang web",
    saveBtn: "Lưu hồ sơ", saving: "Đang lưu…", saved: "✓ Đã lưu",
    usageNote: "Hồ sơ được chia sẻ cho tất cả loại thư — khách hàng, tuyển dụng tư vấn viên, bất động sản và HNW.",
    permissionTitle: "Cần cấp quyền", permissionMsg: "Vui lòng cho phép truy cập thư viện ảnh để tải lên logo.",
    uploadError: "Tải lên thất bại. Vui lòng thử lại.",
  },
};

type LocalProfile = {
  adviserName?: string;
  companyName?: string;
  mobile?: string;
  contactInfo?: string;
};

async function loadLocalProfile(): Promise<LocalProfile> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveLocalProfile(data: LocalProfile): Promise<void> {
  await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(data));
}

async function loadLocalLogo(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LOCAL_LOGO_KEY);
  } catch {
    return null;
  }
}

// Resize + compress to JPEG ≤256px before storing — keeps it well under localStorage quota
function compressLogoForStorage(dataUrl: string): Promise<string> {
  if (Platform.OS !== "web" || typeof document === "undefined") return Promise.resolve(dataUrl);
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX = 256;
      let w = img.width;
      let h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function saveLocalLogo(dataUrl: string): Promise<void> {
  const compressed = await compressLogoForStorage(dataUrl);
  await AsyncStorage.setItem(LOCAL_LOGO_KEY, compressed);
}

async function removeLocalLogo(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_LOGO_KEY);
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { language } = useCalculator();
  const tx = TX[language] ?? TX.en;

  const [adviserName, setAdviserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobile, setMobile] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [uploadState, setUploadState] = useState<"idle" | "uploading">("idle");

  const profileQuery = trpc.advisor.getProfile.useQuery(undefined, { retry: false });
  const updateProfile = trpc.advisor.updateProfile.useMutation();
  const uploadLogo = trpc.advisor.uploadLogo.useMutation();
  const removeLogo = trpc.advisor.removeLogo.useMutation();

  // Load: server profile first, fall back to AsyncStorage
  useEffect(() => {
    const p = profileQuery.data;
    if (p) {
      if (p.adviserName) setAdviserName(p.adviserName);
      if (p.companyName) setCompanyName(p.companyName);
      if (p.mobile) setMobile(p.mobile);
      if (p.contactInfo) setContactInfo(p.contactInfo);
      if (p.logoUrl) setLogoUri(p.logoUrl);
      return;
    }
    // Server returned nothing — try local storage
    if (!profileQuery.isLoading) {
      loadLocalProfile().then((local) => {
        if (local.adviserName) setAdviserName(local.adviserName);
        if (local.companyName) setCompanyName(local.companyName);
        if (local.mobile) setMobile(local.mobile);
        if (local.contactInfo) setContactInfo(local.contactInfo);
      });
      loadLocalLogo().then((url) => {
        if (url) setLogoUri(url);
      });
    }
  }, [profileQuery.data, profileQuery.isLoading]);

  const handleSave = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaveState("saving");
    const data = { adviserName, companyName, mobile, contactInfo };
    // Always save locally — fast and works offline
    await saveLocalProfile(data);
    // Also try server — ignore failure
    try {
      await updateProfile.mutateAsync(data);
    } catch {
      // server unavailable — local save is sufficient
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }, [adviserName, companyName, mobile, contactInfo, updateProfile]);

  const handlePickImage = useCallback(async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const dataUrl = ev.target?.result as string;
          const base64 = dataUrl.split(",")[1];
          if (!base64) return;
          setUploadState("uploading");
          // Try server upload; fall back to storing data URL locally
          try {
            const result = await uploadLogo.mutateAsync({ base64, mimeType: file.type });
            setLogoUri(result.logoUrl);
            await saveLocalLogo(result.logoUrl);
          } catch {
            // Server unavailable — store base64 data URL directly
            await saveLocalLogo(dataUrl);
            setLogoUri(dataUrl);
          } finally {
            setUploadState("idle");
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(tx.permissionTitle, tx.permissionMsg);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    const { base64, mimeType } = result.assets[0];
    if (!base64) return;
    const dataUrl = `data:${mimeType ?? "image/jpeg"};base64,${base64}`;
    setUploadState("uploading");
    try {
      const res = await uploadLogo.mutateAsync({ base64, mimeType: mimeType ?? "image/jpeg" });
      setLogoUri(res.logoUrl);
      await saveLocalLogo(res.logoUrl);
    } catch {
      await saveLocalLogo(dataUrl);
      setLogoUri(dataUrl);
    } finally {
      setUploadState("idle");
    }
  }, [tx, uploadLogo]);

  const handleRemoveLogo = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogoUri(null);
    await removeLocalLogo();
    try { await removeLogo.mutateAsync(); } catch { /* offline */ }
  }, [removeLogo]);

  const saveBtnLabel =
    saveState === "saving" ? tx.saving :
    saveState === "saved"  ? tx.saved  : tx.saveBtn;

  return (
    <ScreenContainer bgColor={NAVY}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

          <View style={S.header}>
            <TouchableOpacity onPress={() => router.back()} style={S.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={S.backText}>{tx.back}</Text>
            </TouchableOpacity>
            <Text style={S.title}>{tx.title}</Text>
            <Text style={S.sub}>{tx.sub}</Text>
          </View>

          {/* Logo */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>{tx.sectionLogo}</Text>
            <View style={S.logoRow}>
              <View style={S.logoBox}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={S.logoImage} resizeMode="contain" />
                ) : (
                  <View style={S.logoPlaceholder}>
                    <Text style={S.logoPlaceholderIcon}>🏢</Text>
                  </View>
                )}
              </View>
              <View style={S.logoBtns}>
                <TouchableOpacity
                  style={[S.uploadBtn, uploadState === "uploading" && S.uploadBtnDisabled]}
                  onPress={handlePickImage}
                  disabled={uploadState === "uploading"}
                  activeOpacity={0.8}
                >
                  {uploadState === "uploading" ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={S.uploadBtnText}>{tx.uploadBtn}</Text>
                  )}
                </TouchableOpacity>
                {logoUri && (
                  <TouchableOpacity style={S.removeBtn} onPress={handleRemoveLogo} activeOpacity={0.8}>
                    <Text style={S.removeBtnText}>{tx.removeBtn}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={S.logoHint}>{tx.logoHint}</Text>
          </View>

          {/* Details */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>
              {tx.sectionDetails}{"  "}
              <Text style={S.savedNote}>{tx.savedNote}</Text>
            </Text>
            <Text style={S.fieldLabel}>{tx.labelName}</Text>
            <TextInput style={S.input} placeholder={tx.labelName} placeholderTextColor="#475569"
              value={adviserName} onChangeText={setAdviserName} autoCapitalize="words" />
            <Text style={S.fieldLabel}>{tx.labelCompany}</Text>
            <TextInput style={S.input} placeholder={tx.labelCompany} placeholderTextColor="#475569"
              value={companyName} onChangeText={setCompanyName} autoCapitalize="words" />
            <Text style={S.fieldLabel}>{tx.labelMobile}</Text>
            <TextInput style={S.input} placeholder={tx.labelMobile} placeholderTextColor="#475569"
              value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Text style={S.fieldLabel}>{tx.labelContact}</Text>
            <TextInput style={S.input} placeholder={tx.labelContact} placeholderTextColor="#475569"
              value={contactInfo} onChangeText={setContactInfo} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={S.saveRow}>
            <TouchableOpacity
              style={[S.saveBtn, saveState === "saving" && S.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saveState === "saving"}
              activeOpacity={0.85}
            >
              {saveState === "saving" ? (
                <ActivityIndicator size="small" color={NAVY} />
              ) : (
                <Text style={S.saveBtnText}>{saveBtnLabel}</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={S.usageNote}>{tx.usageNote}</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#1e2d47" },
  backBtn: { marginBottom: 12 },
  backText: { color: GOLD, fontFamily: FONT, fontSize: 14 },
  title: { color: "#fff", fontFamily: FONT, fontSize: 20, letterSpacing: 1, marginBottom: 6 },
  sub: { color: "#94a3b8", fontFamily: FONT, fontSize: 13, lineHeight: 19 },
  section: { marginHorizontal: 16, marginTop: 24, backgroundColor: "#0f1f38", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#1e2d47" },
  sectionLabel: { color: GOLD, fontFamily: FONT, fontSize: 11, letterSpacing: 1.5, marginBottom: 16 },
  savedNote: { color: "#64748b", fontFamily: FONT, fontSize: 10, letterSpacing: 0 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12 },
  logoBox: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#1e2d47", borderWidth: 1, borderColor: "#2d3f5c", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  logoImage: { width: 80, height: 80 },
  logoPlaceholder: { alignItems: "center", justifyContent: "center" },
  logoPlaceholderIcon: { fontSize: 32 },
  logoBtns: { flex: 1, gap: 8 },
  uploadBtn: { backgroundColor: GOLD, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center" },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: NAVY, fontFamily: FONT, fontSize: 13 },
  removeBtn: { backgroundColor: "transparent", borderRadius: 8, borderWidth: 1, borderColor: "#dc2626", paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" },
  removeBtnText: { color: "#dc2626", fontFamily: FONT, fontSize: 12 },
  logoHint: { color: "#64748b", fontFamily: FONT, fontSize: 12, lineHeight: 17 },
  fieldLabel: { color: "#94a3b8", fontFamily: FONT, fontSize: 11, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: "#0a1628", borderWidth: 1, borderColor: "#1e2d47", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: "#e2e8f0", fontFamily: FONT, fontSize: 14 },
  saveRow: { marginHorizontal: 16, marginTop: 24 },
  saveBtn: { backgroundColor: GOLD, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: NAVY, fontFamily: FONT, fontSize: 16 },
  usageNote: { marginHorizontal: 20, marginTop: 16, color: "#334155", fontFamily: FONT, fontSize: 11, lineHeight: 17, textAlign: "center" },
});
