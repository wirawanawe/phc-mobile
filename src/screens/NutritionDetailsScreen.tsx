import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

const { width } = Dimensions.get("window");

const NutritionDetailsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const nutritionData = {
    total: { current: 623, target: 1617 },
    protein: { current: 45, target: 120, unit: "g" },
    carbs: { current: 78, target: 200, unit: "g" },
    fat: { current: 22, target: 65, unit: "g" },
    fiber: { current: 18, target: 25, unit: "g" },
    sugar: { current: 35, target: 50, unit: "g" },
    sodium: { current: 1200, target: 2300, unit: "mg" },
  };

  const meals = [
    {
      id: "1",
      name: "Breakfast",
      time: "08:00",
      calories: 320,
      icon: "food-croissant",
      color: "#F59E0B",
      items: ["Oatmeal with berries", "Greek yogurt", "Banana"],
    },
    {
      id: "2",
      name: "Lunch",
      time: "12:30",
      calories: 450,
      icon: "food-variant",
      color: "#10B981",
      items: ["Grilled chicken salad", "Quinoa", "Mixed vegetables"],
    },
    {
      id: "3",
      name: "Snack",
      time: "15:00",
      calories: 150,
      icon: "food-apple",
      color: "#E22345",
      items: ["Apple", "Almonds"],
    },
    {
      id: "4",
      name: "Dinner",
      time: "19:00",
      calories: 380,
      icon: "food-fish",
      color: "#3B82F6",
      items: ["Salmon", "Brown rice", "Steamed broccoli"],
    },
  ];

  const recommendations = [
    {
      id: "1",
      title: "Increase Protein Intake",
      description:
        "You're 37% below your protein target. Try adding lean meats, eggs, or legumes.",
      icon: "food-steak",
      color: "#E22345",
      priority: "high",
    },
    {
      id: "2",
      title: "Add More Fiber",
      description:
        "Include more whole grains, fruits, and vegetables to reach your fiber goal.",
      icon: "food-apple",
      color: "#10B981",
      priority: "medium",
    },
    {
      id: "3",
      title: "Reduce Sodium",
      description:
        "Your sodium intake is high. Try using herbs and spices instead of salt.",
      icon: "salt",
      color: "#F59E0B",
      priority: "medium",
    },
  ];

  const periods = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "#10B981";
    if (percentage >= 70) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      {/* <View style={styles.header}>
        <Icon
          name="arrow-left"
          size={24}
          color="#1F2937"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Nutrition Details</Text>
        <Icon name="plus" size={24} color="#1F2937" />
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.id && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Calories */}
        <View style={styles.caloriesContainer}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.sectionTitle}>Total Calories</Text>
            <View style={styles.caloriesActions}>
              <Icon
                name="pencil"
                size={20}
                color="#6B7280"
                style={styles.actionIcon}
              />
              <Icon
                name="plus"
                size={20}
                color="#6B7280"
                style={styles.actionIcon}
              />
            </View>
          </View>
          <View style={styles.caloriesCard}>
            <View style={styles.caloriesMain}>
              <Text style={styles.caloriesValue}>
                {nutritionData.total.current}
              </Text>
              <Text style={styles.caloriesTarget}>
                / {nutritionData.total.target} kcal
              </Text>
            </View>
            <View style={styles.caloriesProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(
                        nutritionData.total.current,
                        nutritionData.total.target
                      )}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage(
                          nutritionData.total.current,
                          nutritionData.total.target
                        )
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  getProgressPercentage(
                    nutritionData.total.current,
                    nutritionData.total.target
                  )
                )}
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Macronutrients */}
        <View style={styles.macrosContainer}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macrosGrid}>
            {Object.entries(nutritionData)
              .slice(1, 5)
              .map(([key, data]) => (
                <View key={key} style={styles.macroCard}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroTitle}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Icon
                      name={
                        key === "protein"
                          ? "food-steak"
                          : key === "carbs"
                          ? "bread-slice"
                          : key === "fat"
                          ? "oil"
                          : "leaf"
                      }
                      size={20}
                      color="#E22345"
                    />
                  </View>
                  <View style={styles.macroValues}>
                    <Text style={styles.macroCurrent}>{data.current}</Text>
                    <Text style={styles.macroTarget}>/ {data.target}</Text>
                  </View>
                  <Text style={styles.macroUnit}>{(data as any).unit}</Text>
                  <View style={styles.macroProgress}>
                    <View style={styles.macroProgressBar}>
                      <View
                        style={[
                          styles.macroProgressFill,
                          {
                            width: `${getProgressPercentage(
                              data.current,
                              data.target
                            )}%`,
                            backgroundColor: getProgressColor(
                              getProgressPercentage(data.current, data.target)
                            ),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              onPress={() => navigation.navigate("MealDetail", { meal })}
            >
              <View style={styles.mealHeader}>
                <View
                  style={[
                    styles.mealIcon,
                    { backgroundColor: meal.color + "20" },
                  ]}
                >
                  <Icon name={meal.icon} size={24} color={meal.color} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <View style={styles.mealCalories}>
                  <Text style={styles.mealCaloriesValue}>{meal.calories}</Text>
                  <Text style={styles.mealCaloriesLabel}>kcal</Text>
                </View>
              </View>
              <View style={styles.mealItems}>
                {meal.items.map((item, index) => (
                  <Text key={index} style={styles.mealItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((recommendation) => (
            <View key={recommendation.id} style={styles.recommendationCard}>
              <View
                style={[
                  styles.recommendationIcon,
                  { backgroundColor: recommendation.color + "20" },
                ]}
              >
                <Icon
                  name={recommendation.icon}
                  size={24}
                  color={recommendation.color}
                />
              </View>
              <View style={styles.recommendationContent}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>
                    {recommendation.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          recommendation.priority === "high"
                            ? "#EF4444"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {recommendation.priority.charAt(0).toUpperCase() +
                        recommendation.priority.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>
                  {recommendation.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Add */}
        <View style={styles.quickAddContainer}>
          <LinearGradient
            colors={["#E22345", "#E22345"]}
            style={styles.quickAddCard}
          >
            <Icon name="food-plus" size={32} color="#FFFFFF" />
            <Text style={styles.quickAddTitle}>Add Food</Text>
            <Text style={styles.quickAddDescription}>
              Log your meals and track your nutrition
            </Text>
            <TouchableOpacity style={styles.quickAddButton}>
              <Text style={styles.quickAddButtonText}>Add Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  periodContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  periodButtonActive: {
    backgroundColor: "#E22345",
    borderColor: "#E22345",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  caloriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  caloriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  caloriesActions: {
    flexDirection: "row",
  },
  actionIcon: {
    marginLeft: 15,
  },
  caloriesCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  caloriesMain: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -1,
  },
  caloriesTarget: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 8,
  },
  caloriesProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    minWidth: 40,
  },
  macrosContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  macroCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  macroValues: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  macroCurrent: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  macroTarget: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 4,
  },
  macroUnit: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 8,
  },
  macroProgress: {
    marginTop: 8,
  },
  macroProgressBar: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  macroProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  mealCalories: {
    alignItems: "center",
  },
  mealCaloriesValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  mealCaloriesLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  mealItems: {
    paddingLeft: 64,
  },
  mealItem: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 2,
    fontWeight: "500",
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  recommendationDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },
  quickAddContainer: {
    paddingHorizontal: 20,
  },
  quickAddCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  quickAddTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  quickAddDescription: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  quickAddButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E22345",
  },
});

export default NutritionDetailsScreen;
