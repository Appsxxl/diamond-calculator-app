import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * DisclaimerFooter — Option B implementation.
 *
 * COLLAPSED by default: shows a single unobtrusive line.
 * EXPANDED on tap: shows full legal notice.
 * Intended to be placed at the bottom of the results section,
 * only visible after the user has scrolled past the calculation output.
 * © Douglas Appsxxl
 */
export function DisclaimerFooter() {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.collapsed}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.collapsedText}>
          Mathematical calculation only · Not financial advice · © Douglas Appsxxl
        </Text>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {expanded && (
        <View style={styles.expandedBlock}>
          <Text style={styles.title}>Important Notice</Text>
          <Text style={styles.body}>
            This app is provided for{" "}
            <Text style={styles.bold}>mathematical calculation purposes only</Text>
            . It is{" "}
            <Text style={styles.bold}>NOT financial advice</Text>{" "}
            in any form. Always consult a qualified financial advisor before
            making investment decisions.
          </Text>
          <Text style={styles.trademark}>© Douglas Appsxxl — All rights reserved.</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * DisclaimerInline — used inside results section only.
 * Shown as a static, non-interactive note at the bottom of calculation output.
 */
export function DisclaimerInline() {
  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.inlineText}>
        Mathematical calculation only · Not financial advice · © Douglas Appsxxl
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0d1117",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  collapsed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 12,
    opacity: 0.6,
  },
  collapsedText: {
    flex: 1,
    fontSize: 10,
    color: "#334155",
    lineHeight: 14,
  },
  chevron: {
    fontSize: 9,
    color: "#334155",
  },
  expandedBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  body: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 17,
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
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    opacity: 0.6,
  },
  inlineText: {
    flex: 1,
    fontSize: 10,
    color: "#475569",
    lineHeight: 14,
  },
});
