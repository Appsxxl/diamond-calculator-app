// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
const rawBundleId = "space.manus.diamond.calculator.app.t20260404074555";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase()
    .split(".")
    .map((segment) => (/^[a-zA-Z]/.test(segment) ? segment : "x" + segment))
    .join(".") || "space.manus.app";

const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

// EAS Project ID - Set after running eas build:configure
const EAS_PROJECT_ID = "ade99209-f13f-42d6-aabb-afe760bf5b98";

const env = {
  appName: "Plan B",
  appSlug: "diamond-calculator-app",
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417308751/jCtAQ46pJGZpaYNWHBsQ4H/icon-jCB2JpzktDjtWxrhwEp9nT.webp",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "2.1.0",
  description: "Plan B — Strategic scenario planning simulator with multi-language support and advanced calculations.",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  ...(EAS_PROJECT_ID
    ? {
        updates: {
          url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
          enabled: true,
          fallbackToCacheTimeout: 0,
          checkAutomatically: "ON_LOAD" as const,
        },
        runtimeVersion: {
          policy: "appVersion" as const,
        },
      }
    : {}),
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    backgroundColor: "#0f172a",
    buildNumber: "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "Allow Plan B to access your photo library to upload a profile logo.",
      NSCameraUsageDescription:
        "Allow Plan B to take a photo for your profile logo.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0f172a",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    versionCode: 1,
    permissions: [
      "POST_NOTIFICATIONS",
      "INTERNET",
      "READ_MEDIA_IMAGES",
      "READ_EXTERNAL_STORAGE",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: env.scheme, host: "*" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    "expo-asset",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Plan B to access your photos to upload a profile logo.",
        cameraPermission:
          "Allow Plan B to take a photo for your profile logo.",
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#151718",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  ...(EAS_PROJECT_ID ? { extra: { eas: { projectId: EAS_PROJECT_ID } } } : {}),
};

export const appEnv = env;
export default config;




