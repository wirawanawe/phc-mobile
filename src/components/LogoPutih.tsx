import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Text } from "react-native-paper";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const Logo: React.FC<LogoProps> = ({ size = "medium", showText = true }) => {
  const getSize = () => {
    // Use responsive sizing based on screen width
    const baseSize = screenWidth * 0.15; // 15% of screen width
    
    switch (size) {
      case "small":
        return { width: Math.min(60, baseSize * 0.8) };
      case "large":
        return { width: Math.min(200, baseSize * 2.5) };
      default:
        return { width: Math.min(100, baseSize * 1.3) };
    }
  };

  const { width } = getSize();

  return (
    <View style={styles.container}>
      <View style={[styles.logoWrapper, { width }]}>
        <Image
          source={require("../../assets/logo-phc-putih.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    aspectRatio: 5/3, // Maintain logo aspect ratio (5:3)
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  textContainer: {
    marginLeft: 12,
  },
  doctorText: {
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  phcText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  indonesiaText: {
    color: "#FFFFFF",
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default Logo;
