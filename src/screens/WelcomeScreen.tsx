import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingSlider from "../components/OnboardingSlider";

const WelcomeScreen = ({ navigation }: any) => {
  const handleComplete = () => {
    navigation.replace("Terms");
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingSlider onComplete={handleComplete} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WelcomeScreen;
