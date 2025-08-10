import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  borderRadius?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  fontSize?: number;
  fontWeight?: string;
  disabled?: boolean;
  icon?: string;
  iconSize?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  borderRadius,
  paddingVertical,
  paddingHorizontal,
  fontSize,
  fontWeight,
  disabled = false,
  icon,
  iconSize = 20,
  variant = 'primary',
  size = 'medium',
  loading = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const getButtonColors = (): readonly [string, string, ...string[]] => {
    if (colors) return colors;
    
    switch (variant) {
      case 'primary':
        return ["#E53E3E", "#C53030"] as const;
      case 'secondary':
        return ["#FF6B8A", "#FFB8D6"] as const;
      case 'outline':
        return ["transparent", "transparent"] as const;
      case 'ghost':
        return ["rgba(229, 62, 62, 0.1)", "rgba(197, 48, 48, 0.1)"] as const;
      default:
        return ["#E53E3E", "#C53030"] as const;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: paddingVertical || 8,
          paddingHorizontal: paddingHorizontal || 16,
          borderRadius: borderRadius || 8,
          fontSize: fontSize || 14,
          fontWeight: fontWeight || "600",
        };
      case 'large':
        return {
          paddingVertical: paddingVertical || 16,
          paddingHorizontal: paddingHorizontal || 32,
          borderRadius: borderRadius || 16,
          fontSize: fontSize || 18,
          fontWeight: fontWeight || "700",
        };
      default: // medium
        return {
          paddingVertical: paddingVertical || 12,
          paddingHorizontal: paddingHorizontal || 24,
          borderRadius: borderRadius || 12,
          fontSize: fontSize || 16,
          fontWeight: fontWeight || "600",
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return "#E53E3E";
    }
    return "#FFFFFF";
  };

  const sizeStyles = getSizeStyles();
  const buttonColors = getButtonColors();
  const textColor = getTextColor();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const ButtonContent = () => (
    <LinearGradient
      colors={buttonColors}
      start={start}
      end={end}
      style={[
        styles.gradient,
        {
          borderRadius: sizeStyles.borderRadius,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variant === 'outline' && {
          borderWidth: 2,
          borderColor: "#E53E3E",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            fontWeight: sizeStyles.fontWeight as any,
            color: textColor,
          },
          textStyle,
        ]}
      >
        {loading ? "Loading..." : title}
      </Text>
      {icon && !loading && (
        <Icon 
          name={icon} 
          size={iconSize} 
          color={textColor} 
          style={styles.icon}
        />
      )}
    </LinearGradient>
  );

  if (variant === 'outline' || variant === 'ghost') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[
            styles.button,
            {
              borderRadius: sizeStyles.borderRadius,
              opacity: disabled ? 0.6 : 1,
            },
            style,
          ]}
          activeOpacity={0.8}
        >
          <ButtonContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Shadow 
      distance={disabled ? 2 : 6} 
      startColor="rgba(229, 62, 62, 0.2)" 
      offset={[0, disabled ? 1 : 3]}
      paintInside={false}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[
            styles.button,
            {
              borderRadius: sizeStyles.borderRadius,
              opacity: disabled ? 0.6 : 1,
            },
            style,
          ]}
          activeOpacity={0.8}
        >
          <ButtonContent />
        </TouchableOpacity>
      </Animated.View>
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
    flexDirection: "row",
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  icon: {
    marginLeft: 8,
  },
});

export default GradientButton;
