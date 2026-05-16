import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, StyleSheet, Platform } from "react-native";

const CHECK_INTERVAL = 10_000;
const PING_URL = "https://www.google.com/generate_204";

async function isOnline(): Promise<boolean> {
  try {
    const res = await fetch(PING_URL, { method: "HEAD", cache: "no-cache" });
    return res.status < 400;
  } catch {
    return false;
  }
}

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const slideY = useRef(new Animated.Value(-48)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      const online = await isOnline();
      setOffline(!online);
    };

    check();
    timer = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: offline ? 0 : -48,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [offline]);

  if (Platform.OS === "web" && !offline) return null;

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
