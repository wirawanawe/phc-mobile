import React from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";

interface MissionPromptCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
  gradient?: readonly [string, string, ...string[]];
  shadow?: boolean;
  animated?: boolean;
  badge?: string;
  badgeColor?: string;
}

const MissionPromptCard: React.FC<MissionPromptCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  backgroundColor,
  onPress,
  gradient,
  shadow = true,
  animated = true,
  badge,
  badgeColor = "#10B981",
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const CardContent = () => (
    <View style={styles.content}>
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            { 
              backgroundColor: gradient ? "rgba(255, 255, 255, 0.2)" : iconColor + "20",
            },
          ]}
        >
          <Icon 
            name={icon} 
            size={32} 
            color={gradient ? "#FFFFFF" : iconColor} 
          />
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title, 
            { color: gradient ? "#FFFFFF" : "#1F2937" }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.subtitle, 
            { color: gradient ? "rgba(255, 255, 255, 0.9)" : "#64748B" }
          ]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Icon 
          name="chevron-right" 
          size={24} 
          color={gradient ? "rgba(255, 255, 255, 0.8)" : iconColor} 
        />
      </View>
    </View>
  );

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (gradient) {
      return (
        <LinearGradient
          colors={gradient}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor }]}>
        {children}
      </View>
    );
  };

  const AnimatedCard = () => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <CardWrapper>
          <CardContent />
        </CardWrapper>
      </TouchableOpacity>
    </Animated.View>
  );

  if (shadow) {
    return (
      <View style={styles.container}>
        <Shadow
          distance={8}
          startColor={gradient ? "rgba(229, 62, 62, 0.15)" : "rgba(16, 24, 40, 0.1)"}
          offset={[0, 4]}
          paintInside={false}
        >
          <AnimatedCard />
        </Shadow>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedCard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gradientCard: {
    borderRadius: 20,
    padding: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContent: {
    marginLeft: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});

export default MissionPromptCard;
