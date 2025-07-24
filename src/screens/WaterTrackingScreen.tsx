import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

const { width, height } = Dimensions.get("window");

const WaterTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [currentIntake, setCurrentIntake] = useState(1200); // ml
  const [dailyGoal] = useState(2500); // ml
  const [scaleValue] = useState(new Animated.Value(1));

  const waterIntakeOptions = [
    { amount: 200, label: "Small Glass", icon: "cup-water" },
    { amount: 300, label: "Medium Glass", icon: "cup" },
    { amount: 500, label: "Large Glass", icon: "bottle-water" },
    { amount: 1000, label: "Bottle", icon: "bottle-soda" },
  ];

  const hydrationTips = [
    {
      id: "1",
      title: "Start Your Day Right",
      description: "Drink a glass of water first thing in the morning",
      icon: "weather-sunny",
      color: "#F59E0B",
    },
    {
      id: "2",
      title: "Set Reminders",
      description: "Use notifications to stay hydrated throughout the day",
      icon: "bell-ring",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "Eat Water-Rich Foods",
      description: "Include fruits and vegetables with high water content",
      icon: "food-apple",
      color: "#10B981",
    },
    {
      id: "4",
      title: "Monitor Your Urine",
      description: "Light yellow urine indicates good hydration",
      icon: "eye",
      color: "#8B5CF6",
    },
  ];

  const weeklyProgress = [
    { day: "Mon", intake: 2200, goal: 2500 },
    { day: "Tue", intake: 2400, goal: 2500 },
    { day: "Wed", intake: 2100, goal: 2500 },
    { day: "Thu", intake: 2600, goal: 2500 },
    { day: "Fri", intake: 2300, goal: 2500 },
    { day: "Sat", intake: 1800, goal: 2500 },
    { day: "Sun", intake: 1200, goal: 2500 },
  ];

  const handleAddWater = (amount: number) => {
    const newIntake = Math.min(currentIntake + amount, dailyGoal);
    setCurrentIntake(newIntake);

    // Animate the scale
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getProgressPercentage = () => {
    return Math.min((currentIntake / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const renderWaterIntakeOption = ({ item }: any) => (
    <TouchableOpacity
      style={styles.waterIntakeOption}
      onPress={() => handleAddWater(item.amount)}
    >
      <View
        style={[styles.waterIntakeIcon, { backgroundColor: "#3B82F6" + "20" }]}
      >
        <Icon name={item.icon} size={24} color="#3B82F6" />
      </View>
      <Text style={styles.waterIntakeAmount}>{item.amount}ml</Text>
      <Text style={styles.waterIntakeLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderHydrationTip = ({ item }: any) => (
    <View style={styles.hydrationTipCard}>
      <View
        style={[
          styles.hydrationTipIcon,
          { backgroundColor: item.color + "20" },
        ]}
      >
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.hydrationTipContent}>
        <Text style={styles.hydrationTipTitle}>{item.title}</Text>
        <Text style={styles.hydrationTipDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderWeeklyBar = ({ item, index }: any) => {
    const progress = (item.intake / item.goal) * 100;
    const isToday = index === 6; // Sunday

    return (
      <View style={styles.weeklyBarContainer}>
        <View style={styles.weeklyBarBackground}>
          <View
            style={[
              styles.weeklyBarFill,
              {
                height: `${progress}%`,
                backgroundColor: isToday ? "#3B82F6" : "#E5E7EB",
              },
            ]}
          />
        </View>
        <Text style={styles.weeklyBarLabel}>{item.day}</Text>
        <Text style={styles.weeklyBarValue}>
          {(item.intake / 1000).toFixed(1)}L
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Water Tracking</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="cog" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Main Water Progress */}
          <View style={styles.mainProgressContainer}>
            <Animated.View
              style={[
                styles.waterBottleContainer,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <View style={styles.waterBottle}>
                <View style={styles.waterBottleTop}>
                  <Icon name="bottle-water" size={60} color="#3B82F6" />
                </View>
                <View style={styles.waterBottleBody}>
                  <View
                    style={[
                      styles.waterFill,
                      {
                        height: `${getProgressPercentage()}%`,
                        backgroundColor: getProgressColor(),
                      },
                    ]}
                  />
                </View>
                <View style={styles.waterBottleBottom}>
                  <Text style={styles.waterAmount}>{currentIntake}ml</Text>
                  <Text style={styles.waterGoal}>/ {dailyGoal}ml</Text>
                </View>
              </View>
            </Animated.View>
            <Text style={styles.progressText}>
              {getProgressPercentage().toFixed(0)}% Complete
            </Text>
          </View>

          {/* Quick Add Water */}
          <View style={styles.quickAddContainer}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.waterIntakeGrid}>
              {waterIntakeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.waterIntakeOption}
                  onPress={() => handleAddWater(option.amount)}
                >
                  <View
                    style={[
                      styles.waterIntakeIcon,
                      { backgroundColor: "#3B82F6" + "20" },
                    ]}
                  >
                    <Icon name={option.icon} size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.waterIntakeAmount}>
                    {option.amount}ml
                  </Text>
                  <Text style={styles.waterIntakeLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyProgressContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weeklyChart}>
              {weeklyProgress.map((item, index) => (
                <View key={index} style={styles.weeklyBarContainer}>
                  <View style={styles.weeklyBarBackground}>
                    <View
                      style={[
                        styles.weeklyBarFill,
                        {
                          height: `${(item.intake / item.goal) * 100}%`,
                          backgroundColor: index === 6 ? "#3B82F6" : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.weeklyBarLabel}>{item.day}</Text>
                  <Text style={styles.weeklyBarValue}>
                    {(item.intake / 1000).toFixed(1)}L
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hydration Tips */}
          <View style={styles.hydrationTipsContainer}>
            <Text style={styles.sectionTitle}>Hydration Tips</Text>
            <View style={styles.hydrationTipsList}>
              {hydrationTips.map((tip) => (
                <View key={tip.id} style={styles.hydrationTipCard}>
                  <View
                    style={[
                      styles.hydrationTipIcon,
                      { backgroundColor: tip.color + "20" },
                    ]}
                  >
                    <Icon name={tip.icon} size={24} color={tip.color} />
                  </View>
                  <View style={styles.hydrationTipContent}>
                    <Text style={styles.hydrationTipTitle}>{tip.title}</Text>
                    <Text style={styles.hydrationTipDescription}>
                      {tip.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  settingsButton: {
    padding: 8,
  },
  mainProgressContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  waterBottleContainer: {
    marginBottom: 20,
  },
  waterBottle: {
    width: 120,
    height: 200,
    alignItems: "center",
  },
  waterBottleTop: {
    width: 80,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterBottleBody: {
    width: 100,
    height: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: -20,
    position: "relative",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  waterBottleBottom: {
    marginTop: 10,
    alignItems: "center",
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  waterGoal: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  quickAddContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  waterIntakeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  waterIntakeOption: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  waterIntakeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  waterIntakeAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  waterIntakeLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  weeklyProgressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    height: 140,
  },
  weeklyBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  weeklyBarBackground: {
    width: 20,
    height: 60,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  weeklyBarFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  weeklyBarLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  weeklyBarValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  hydrationTipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  hydrationTipsList: {
    gap: 12,
  },
  hydrationTipCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  hydrationTipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hydrationTipContent: {
    flex: 1,
  },
  hydrationTipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  hydrationTipDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});

export default WaterTrackingScreen;
