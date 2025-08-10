import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

interface ModernIconProps {
  name: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  gradient?: readonly [string, string, ...string[]];
  borderRadius?: number;
  style?: ViewStyle;
  containerSize?: number;
  shadow?: boolean;
  variant?: 'default' | 'contained' | 'outlined' | 'gradient';
}

const ModernIcon: React.FC<ModernIconProps> = ({
  name,
  size = 24,
  color = "#4A5568",
  backgroundColor = "#F7FAFC",
  gradient,
  borderRadius,
  style,
  containerSize,
  shadow = false,
  variant = 'default',
}) => {
  const getContainerSize = () => {
    if (containerSize) return containerSize;
    return size + 16; // Default padding around icon
  };

  const getVariantStyles = () => {
    const baseSize = getContainerSize();
    const radius = borderRadius || baseSize / 2;

    switch (variant) {
      case 'contained':
        return {
          width: baseSize,
          height: baseSize,
          borderRadius: radius,
          backgroundColor: gradient ? 'transparent' : backgroundColor,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          shadowColor: shadow ? "rgba(16, 24, 40, 0.1)" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: shadow ? 1 : 0,
          shadowRadius: shadow ? 4 : 0,
          elevation: shadow ? 3 : 0,
        };
      case 'outlined':
        return {
          width: baseSize,
          height: baseSize,
          borderRadius: radius,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        };
      case 'gradient':
        return {
          width: baseSize,
          height: baseSize,
          borderRadius: radius,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          shadowColor: shadow ? "rgba(229, 62, 62, 0.2)" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: shadow ? 1 : 0,
          shadowRadius: shadow ? 4 : 0,
          elevation: shadow ? 3 : 0,
        };
      default:
        return {};
    }
  };

  const containerStyles = getVariantStyles();

  if (variant === 'default') {
    return (
      <Icon 
        name={name} 
        size={size} 
        color={color}
        style={style}
      />
    );
  }

  if (variant === 'gradient' && gradient) {
    return (
      <View style={[containerStyles, style]}>
        <LinearGradient
          colors={gradient}
          style={[
            styles.gradientContainer,
            {
              width: containerStyles.width,
              height: containerStyles.height,
              borderRadius: containerStyles.borderRadius,
            }
          ]}
        >
          <Icon 
            name={name} 
            size={size} 
            color="#FFFFFF"
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[containerStyles, style]}>
      <Icon 
        name={name} 
        size={size} 
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ModernIcon; 