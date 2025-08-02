import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";

interface ModernIconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  shadow?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  gradient?: readonly [string, string, ...string[]];
}

const ModernIconButton: React.FC<ModernIconButtonProps> = ({
  icon,
  onPress,
  size = 48,
  iconSize = 24,
  style,
  variant = 'primary',
  shadow = true,
  disabled = false,
  backgroundColor,
  iconColor,
  gradient,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || "#E53E3E",
          iconColor: iconColor || "#FFFFFF",
          gradient: gradient || (["#E53E3E", "#C53030"] as const),
        };
      case 'secondary':
        return {
          backgroundColor: backgroundColor || "#F7FAFC",
          iconColor: iconColor || "#4A5568",
          gradient: null,
        };
      case 'outline':
        return {
          backgroundColor: backgroundColor || "transparent",
          iconColor: iconColor || "#E53E3E",
          gradient: null,
          borderWidth: 2,
          borderColor: "#E53E3E",
        };
      case 'ghost':
        return {
          backgroundColor: backgroundColor || "rgba(229, 62, 62, 0.1)",
          iconColor: iconColor || "#E53E3E",
          gradient: null,
        };
      case 'danger':
        return {
          backgroundColor: backgroundColor || "#E53E3E",
          iconColor: iconColor || "#FFFFFF",
          gradient: gradient || (["#E53E3E", "#DC2626"] as const),
        };
      default:
        return {
          backgroundColor: backgroundColor || "#E53E3E",
          iconColor: iconColor || "#FFFFFF",
          gradient: gradient || (["#E53E3E", "#C53030"] as const),
        };
    }
  };

  const variantStyles = getVariantStyles();
  const borderRadius = size / 2;

  const buttonStyles = [
    styles.button,
    {
      width: size,
      height: size,
      borderRadius,
      backgroundColor: variantStyles.gradient ? 'transparent' : variantStyles.backgroundColor,
      borderWidth: variantStyles.borderWidth || 0,
      borderColor: variantStyles.borderColor || 'transparent',
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const ButtonContent = () => {
    if (variantStyles.gradient) {
      return (
        <LinearGradient
          colors={variantStyles.gradient}
          style={[
            styles.gradientButton,
            {
              width: size,
              height: size,
              borderRadius,
            }
          ]}
        >
          <Icon 
            name={icon} 
            size={iconSize} 
            color={variantStyles.iconColor} 
          />
        </LinearGradient>
      );
    }

    return (
      <TouchableOpacity
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Icon 
          name={icon} 
          size={iconSize} 
          color={variantStyles.iconColor} 
        />
      </TouchableOpacity>
    );
  };

  if (variantStyles.gradient) {
    const content = (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
          style={{ borderRadius }}
        >
          <ButtonContent />
        </TouchableOpacity>
      </Animated.View>
    );

    if (shadow && !disabled) {
      return (
        <Shadow 
          distance={4} 
          startColor="rgba(229, 62, 62, 0.3)" 
          offset={[0, 2] as [number, number]}
          paintInside={false}
        >
          {content}
        </Shadow>
      );
    }

    return content;
  }

  const content = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <ButtonContent />
    </Animated.View>
  );

  if (shadow && !disabled && variant !== 'ghost') {
    return (
      <Shadow 
        distance={2} 
        startColor="rgba(16, 24, 40, 0.1)" 
        offset={[0, 1] as [number, number]}
        paintInside={false}
      >
        {content}
      </Shadow>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  gradientButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ModernIconButton; 