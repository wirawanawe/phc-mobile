import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  borderRadius?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  fontSize?: number;
  fontWeight?: string;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  colors = ["#D32F2F", "#B71C1C"] as const,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  borderRadius = 12,
  paddingVertical = 12,
  paddingHorizontal = 24,
  fontSize = 16,
  fontWeight = "600" as const,
  disabled = false,
}) => {
  return (
    <Shadow distance={4} startColor="rgba(0,0,0,0.1)" offset={[0, 2]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          {
            borderRadius,
            paddingVertical,
            paddingHorizontal,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          style={[
            styles.gradient,
            {
              borderRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                fontSize,
                fontWeight,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default GradientButton;
