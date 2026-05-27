// @ts-nocheck — react-native-purchases types resolve after `pnpm install`
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  type PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";

export const ENTITLEMENT_PRO = "pro";

// Set these in .env after creating your RevenueCat project
const RC_KEY =
  Platform.OS === "ios"
    ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "")
    : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "");

export async function initializePurchases(userId?: string): Promise<void> {
  if (!RC_KEY) {
    console.warn("[Purchases] Set EXPO_PUBLIC_REVENUECAT_IOS_KEY / ANDROID_KEY in .env");
    return;
  }
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey: RC_KEY });
  if (userId) {
    try {
      await Purchases.logIn(userId);
    } catch {
      // non-fatal — anonymous session still works
    }
  }
}

export type { PurchasesPackage };

export type AvailablePackages = {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
};

export async function getAvailablePackages(): Promise<AvailablePackages> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    return {
      monthly: pkgs.find((p: PurchasesPackage) => p.packageType === PACKAGE_TYPE.MONTHLY) ?? null,
      annual: pkgs.find((p: PurchasesPackage) => p.packageType === PACKAGE_TYPE.ANNUAL) ?? null,
    };
  } catch {
    return { monthly: null, annual: null };
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return ENTITLEMENT_PRO in customerInfo.entitlements.active;
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return ENTITLEMENT_PRO in info.entitlements.active;
}

export async function checkEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return ENTITLEMENT_PRO in info.entitlements.active;
  } catch {
    return false;
  }
}
