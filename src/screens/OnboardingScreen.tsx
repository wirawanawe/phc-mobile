import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingSlider from "../components/OnboardingSlider";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "react-native-paper";

const OnboardingScreen = ({ navigation }: any) => {
  const handleComplete = () => {
    navigation.replace("Terms");
  };

  const theme = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={(theme as any).customColors?.primaryGradient || ["#E22345", "#C53030"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <OnboardingSlider onComplete={handleComplete} />
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
});

export default OnboardingScreen;
