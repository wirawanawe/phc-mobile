import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "medium", showText = true }) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return { width: 80, height: 48, textSize: 12 };
      case "large":
        return { width: 250, height: 250, textSize: 18 };
      default:
        return { width: 120, height: 72, textSize: 14 };
    }
  };

  const { width, height, textSize } = getSize();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo-phc-putih.png")}
          style={{ width: width, height: height, resizeMode: "contain" }}
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
