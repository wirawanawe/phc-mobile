import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface ProgressRingProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  strokeColor: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
  duration?: number;
  gradient?: {
    colors: string[];
    id?: string;
  };
  glowEffect?: boolean;
  startAngle?: number; // -90 is top, 0 is right, 90 is bottom, 180 is left
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  strokeColor,
  backgroundColor = "#F3F4F6",
  children,
  animated = true,
  duration = 1500,
  gradient,
  glowEffect = false,
  startAngle = -90,
}) => {
  const [animatedProgress] = useState(new Animated.Value(0));
  const [currentProgress, setCurrentProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();

      // Listen to animation value changes
      const listener = animatedProgress.addListener(({ value }) => {
        setCurrentProgress(value);
      });

      return () => {
        animatedProgress.removeListener(listener);
      };
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animated, duration]);

  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;
  const gradientId = gradient?.id || "progressGradient";

  const getStrokeColor = () => {
    if (gradient) {
      return `url(#${gradientId})`;
    }
    return strokeColor;
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          shadowColor: glowEffect ? strokeColor : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowEffect ? 0.3 : 0,
          shadowRadius: glowEffect ? 8 : 0,
          elevation: glowEffect ? 8 : 0,
        }
      ]}
    >
      <Svg width={size} height={size} style={styles.svg}>
        {gradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradient.colors.map((color, index) => (
                <Stop
                  key={index}
                  offset={`${(index / (gradient.colors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>
        )}
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? strokeDashoffset : circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />
        
        {/* Glow effect circle (if enabled) */}
        {glowEffect && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth + 2}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference - (progress / 100) * circumference}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            opacity={0.2}
          />
        )}
      </Svg>
      
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    position: "absolute",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProgressRing;
