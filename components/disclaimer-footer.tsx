import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * DisclaimerFooter — persistent legal notice shown on all calculation screens.
 * Always visible to protect against financial advice liability.
 * © Douglas Appsxxl
 */
export function DisclaimerFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Important Notice</Text>
          <Text style={styles.body}>
            This app is provided for{" "}
            <Text style={styles.bold}>mathematical calculation purposes only</Text>
            . It is{" "}
            <Text style={styles.bold}>NOT financial advice</Text>{" "}
            in any form. Always consult a qualified financial advisor before making investment decisions.
          </Text>
          <Text style={styles.trademark}>© Douglas Appsxxl — All rights reserved.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#f59e0b44",
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  icon: {
    fontSize: 16,
    marginTop: 1,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
  },
  bold: {
    fontWeight: "700",
    color: "#e2e8f0",
  },
  trademark: {
    fontSize: 10,
    color: "#475569",
    marginTop: 4,
    fontStyle: "italic",
  },
});
