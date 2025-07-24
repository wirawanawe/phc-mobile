import React from "react";
import { View, StyleSheet, ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  style?: any;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = ["#D32F2F", "#B71C1C"] as const,
  style,
}) => {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
