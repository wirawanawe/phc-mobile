import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, RadialGradient } from "react-native-svg";

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
  pulseEffect?: boolean;
  showBackground?: boolean;
  showInnerGlow?: boolean;
  modernStyle?: boolean;
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
  pulseEffect = false,
  showBackground = true,
  showInnerGlow = false,
  modernStyle = true,
}) => {
  const [animatedProgress] = useState(new Animated.Value(0));
  const [currentProgress, setCurrentProgress] = useState(0);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration,
        easing: Easing.out(Easing.cubic),
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

  useEffect(() => {
    if (pulseEffect) {
      const pulseSequence = Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulseSequence).start();
    }
  }, [pulseEffect]);

  useEffect(() => {
    // Scale animation on mount
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;
  const gradientId = gradient?.id || "progressGradient";
  const innerGlowId = "innerGlow";

  const getStrokeColor = () => {
    if (gradient) {
      return `url(#${gradientId})`;
    }
    return strokeColor;
  };

  const getModernGradient = () => {
    if (modernStyle && !gradient) {
      return {
        colors: ['#FF6B8A', '#FFB347', '#4ECDC4'],
        id: 'modernGradient'
      };
    }
    return gradient;
  };

  const modernGradient = getModernGradient();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          transform: [
            { scale: Animated.multiply(scaleAnimation, pulseAnimation) }
          ],
          shadowColor: glowEffect ? strokeColor : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowEffect ? 0.4 : 0,
          shadowRadius: glowEffect ? 12 : 0,
          elevation: glowEffect ? 12 : 0,
        }
      ]}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          {modernGradient && (
            <LinearGradient 
              id={modernGradient.id} 
              x1="0%" 
              y1="0%" 
              x2="100%" 
              y2="100%"
            >
              {modernGradient.colors.map((color, index) => (
                <Stop
                  key={index}
                  offset={`${(index / (modernGradient.colors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          )}
          
          {showInnerGlow && (
            <RadialGradient
              id={innerGlowId}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
              <Stop offset="70%" stopColor="rgba(255, 255, 255, 0.1)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </RadialGradient>
          )}
        </Defs>
        
        {/* Background circle with modern styling */}
        {showBackground && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={modernStyle ? "rgba(255, 255, 255, 0.15)" : backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={modernStyle ? 0.8 : 0.3}
          />
        )}
        
        {/* Inner glow circle */}
        {showInnerGlow && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill={`url(#${innerGlowId})`}
          />
        )}
        
        {/* Progress circle with enhanced styling */}
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
          opacity={modernStyle ? 0.9 : 1}
        />
        
        {/* Enhanced glow effect circle */}
        {glowEffect && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth + 4}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference - (progress / 100) * circumference}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            opacity={0.3}
          />
        )}
        
        {/* Additional modern glow layers */}
        {modernStyle && glowEffect && (
          <>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius + 2}
              stroke={getStrokeColor()}
              strokeWidth={strokeWidth + 2}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={animated ? strokeDashoffset : circumference - (progress / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
              opacity={0.15}
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius + 4}
              stroke={getStrokeColor()}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={animated ? strokeDashoffset : circumference - (progress / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
              opacity={0.1}
            />
          </>
        )}
      </Svg>
      
      <View style={styles.content}>{children}</View>
    </Animated.View>
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
