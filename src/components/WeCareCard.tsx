import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Shadow } from "react-native-shadow-2";

interface WeCareCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
  backgroundColor?: string;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

const WeCareCard: React.FC<WeCareCardProps> = ({
  children,
  style,
  padding = 16,
  borderRadius = 16,
  backgroundColor = "#FFFFFF",
  shadowColor = "#000000",
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.1,
  shadowRadius = 8,
  elevation = 4,
}) => {
  return (
    <Shadow
      distance={elevation}
      startColor={shadowColor}
      offset={[shadowOffset.width, shadowOffset.height]}
    >
      <View
        style={[
          styles.card,
          {
            padding,
            borderRadius,
            backgroundColor,
          },
          style,
        ]}
      >
        {children}
      </View>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
  },
});

export default WeCareCard;
