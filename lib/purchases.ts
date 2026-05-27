// Web fallback — Metro uses purchases.native.ts on iOS/Android at runtime.
// TypeScript uses this file for type checking on all platforms.

export const ENTITLEMENT_PRO = "pro";

export type PurchasesPackage = {
  packageType: string;
  product: { priceString: string; productIdentifier: string };
};

export type AvailablePackages = {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
};

export async function initializePurchases(_userId?: string): Promise<void> {}

export async function getAvailablePackages(): Promise<AvailablePackages> {
  return { monthly: null, annual: null };
}

export async function purchasePackage(_pkg: PurchasesPackage): Promise<boolean> {
  throw new Error("Purchases are only available on iOS and Android.");
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}

export async function checkEntitlement(): Promise<boolean> {
  return false;
}
