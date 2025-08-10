import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  gradient?: readonly [string, string, ...string[]];
  borderRadius?: number;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  elevation?: number;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  onPress,
  shadow = 'medium',
  gradient,
  borderRadius = 16,
  padding = 20,
  margin = 0,
  backgroundColor = "#FFFFFF",
  borderColor = "#E2E8F0",
  borderWidth = 1,
  elevation,
}) => {
  const getShadowConfig = () => {
    switch (shadow) {
      case 'small':
        return {
          distance: 2,
          startColor: "rgba(16, 24, 40, 0.08)",
          offset: [0, 1] as [number, number],
        };
      case 'large':
        return {
          distance: 12,
          startColor: "rgba(16, 24, 40, 0.16)",
          offset: [0, 8] as [number, number],
        };
      case 'medium':
        return {
          distance: 6,
          startColor: "rgba(16, 24, 40, 0.12)",
          offset: [0, 4] as [number, number],
        };
      default:
        return null;
    }
  };

  const cardStyles = [
    styles.card,
    {
      borderRadius,
      padding,
      margin,
      backgroundColor: gradient ? 'transparent' : backgroundColor,
      borderColor,
      borderWidth: gradient ? 0 : borderWidth,
      elevation: elevation || (shadow === 'large' ? 8 : shadow === 'medium' ? 4 : 2),
    },
    style,
  ];

  const CardContent = () => {
    if (gradient) {
      return (
        <LinearGradient
          colors={gradient}
          style={[
            styles.gradientCard,
            {
              borderRadius,
              padding,
            }
          ]}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={cardStyles}>
        {children}
      </View>
    );
  };

  if (onPress) {
    const shadowConfig = getShadowConfig();
    
    if (shadow !== 'none' && shadowConfig) {
      return (
        <Shadow
          distance={shadowConfig.distance}
          startColor={shadowConfig.startColor}
          offset={shadowConfig.offset}
          paintInside={false}
        >
          <TouchableOpacity
            onPress={onPress}
            style={[
              gradient && {
                borderRadius,
                overflow: 'hidden',
              }
            ]}
            activeOpacity={0.9}
          >
            <CardContent />
          </TouchableOpacity>
        </Shadow>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          gradient && {
            borderRadius,
            overflow: 'hidden',
          }
        ]}
        activeOpacity={0.9}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  if (shadow !== 'none') {
    const shadowConfig = getShadowConfig();
    
    if (shadowConfig) {
      return (
        <Shadow
          distance={shadowConfig.distance}
          startColor={shadowConfig.startColor}
          offset={shadowConfig.offset}
          paintInside={false}
        >
          <View style={gradient && { borderRadius, overflow: 'hidden' }}>
            <CardContent />
          </View>
        </Shadow>
      );
    }
  }

  return (
    <View style={gradient && { borderRadius, overflow: 'hidden' }}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
  },
});

export default ModernCard; 