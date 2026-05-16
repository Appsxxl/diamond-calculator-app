import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? "Unknown error" };
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={S.container}>
        <Text style={S.icon}>💎</Text>
        <Text style={S.title}>Something went wrong</Text>
        <Text style={S.body}>
          An unexpected error occurred. Your data is safe — please restart the screen.
        </Text>
        <Text style={S.detail} numberOfLines={3}>{this.state.message}</Text>
        <TouchableOpacity style={S.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={S.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon:   { fontSize: 48, marginBottom: 16 },
  title:  { color: "#f59e0b", fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  body:   { color: "#94a3b8", fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 12 },
  detail: { color: "#475569", fontSize: 11, fontStyle: "italic", textAlign: "center", marginBottom: 24 },
  btn:    { backgroundColor: "#e67e22", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 },
  btnText:{ color: "#0f172a", fontSize: 15, fontWeight: "bold" },
});
