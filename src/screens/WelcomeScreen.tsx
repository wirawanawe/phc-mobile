import React from "react";
import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import LogoPutih from "../components/LogoPutih";

const WelcomeScreen = ({ navigation }: any) => {
  const theme = useTheme();

  const handleGetStarted = () => {
    navigation.replace("Onboarding");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={(theme as any).customColors?.primaryGradient || ["#E22345", "#C53030"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <LogoPutih size={500} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Selamat Datang di PHC</Text>
              <Text style={styles.description}>
                Platform kesehatan dan kebugaran terdepan untuk masyarakat Indonesia. 
                Mulai perjalanan kesehatan Anda bersama kami.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleGetStarted}
                style={styles.getStartedButton}
                labelStyle={styles.getStartedButtonText}
              >
                Mulai Sekarang
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
      marginBottom: 10,
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: 320,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  getStartedButtonText: {
    color: "#D32F2F",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
