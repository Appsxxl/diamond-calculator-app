export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:8081",
  fromEmail: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
  isProduction: process.env.NODE_ENV === "production",
  // Legacy Manus fields — unused but kept so existing server files compile
  appId: "",
  oAuthServerUrl: "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
