import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, StyleSheet, Platform } from "react-native";

const CHECK_INTERVAL = 10_000;
const PING_URL = "https://www.google.com/generate_204";
const DISMISS_AFTER = 5_000;

async function isOnline(): Promise<boolean> {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }
  try {
    const res = await fetch(PING_URL, { method: "HEAD", cache: "no-cache" });
    return res.status < 400;
  } catch {
    return false;
  }
}

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);
  const slideY = useRef(new Animated.Value(-48)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      const online = await isOnline();
      setOffline(!online);
    };

    check();
    timer = setInterval(check, CHECK_INTERVAL);

    if (Platform.OS === "web") {
      const goOnline = () => setOffline(false);
      const goOffline = () => setOffline(true);
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);
      return () => {
        clearInterval(timer);
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }

    return () => clearInterval(timer);
  }, []);

  // Show banner when offline, auto-dismiss after DISMISS_AFTER ms
  useEffect(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (offline) {
      setVisible(true);
      dismissTimer.current = setTimeout(() => setVisible(false), DISMISS_AFTER);
    } else {
      setVisible(false);
    }
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [offline]);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: visible ? 0 : -48,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (Platform.OS === "web" && !visible) return null;

  return (
    <Animated.View style={[S.banner, { transform: [{ translateY: slideY }] }]}>
      <Text style={S.text}>⚠️  No internet connection — calculations still work offline</Text>
    </Animated.View>
  );
}

const S = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#7f1d1d",
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  text: {
    color: "#fecaca",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
