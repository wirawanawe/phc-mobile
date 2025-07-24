import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

const { width } = Dimensions.get("window");

const MealLoggingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");

  const meals = [
    {
      id: "breakfast",
      name: "Breakfast",
      icon: "weather-sunny",
      color: "#F59E0B",
    },
    { id: "lunch", name: "Lunch", icon: "sun-wireless", color: "#EF4444" },
    {
      id: "dinner",
      name: "Dinner",
      icon: "moon-waning-crescent",
      color: "#8B5CF6",
    },
    { id: "snacks", name: "Snacks", icon: "food-apple", color: "#10B981" },
  ];

  const quickFoods = [
    {
      id: "1",
      name: "Oatmeal",
      calories: 150,
      protein: 6,
      carbs: 27,
      fat: 3,
      icon: "food-variant",
      color: "#F59E0B",
    },
    {
      id: "2",
      name: "Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      icon: "food-steak",
      color: "#EF4444",
    },
    {
      id: "3",
      name: "Salmon",
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      icon: "fish",
      color: "#3B82F6",
    },
    {
      id: "4",
      name: "Broccoli",
      calories: 55,
      protein: 3.7,
      carbs: 11,
      fat: 0.6,
      icon: "food-apple",
      color: "#10B981",
    },
    {
      id: "5",
      name: "Banana",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      icon: "food-variant",
      color: "#F59E0B",
    },
    {
      id: "6",
      name: "Greek Yogurt",
      calories: 130,
      protein: 22,
      carbs: 9,
      fat: 0.5,
      icon: "cup-water",
      color: "#8B5CF6",
    },
  ];

  const recentMeals = [
    {
      id: "1",
      name: "Grilled Chicken Salad",
      time: "12:30 PM",
      calories: 320,
      meal: "lunch",
    },
    {
      id: "2",
      name: "Oatmeal with Berries",
      time: "8:00 AM",
      calories: 280,
      meal: "breakfast",
    },
    {
      id: "3",
      name: "Salmon with Vegetables",
      time: "7:30 PM",
      calories: 450,
      meal: "dinner",
    },
  ];

  const dailyNutrition = {
    calories: { consumed: 1250, goal: 2000 },
    protein: { consumed: 85, goal: 120 },
    carbs: { consumed: 140, goal: 250 },
    fat: { consumed: 45, goal: 65 },
  };

  const renderMealTab = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.mealTab, selectedMeal === item.id && styles.mealTabActive]}
      onPress={() => setSelectedMeal(item.id)}
    >
      <Icon
        name={item.icon}
        size={20}
        color={selectedMeal === item.id ? "#FFFFFF" : item.color}
      />
      <Text
        style={[
          styles.mealTabText,
          selectedMeal === item.id && styles.mealTabTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderQuickFood = ({ item }: any) => (
    <TouchableOpacity style={styles.quickFoodCard}>
      <View
        style={[styles.quickFoodIcon, { backgroundColor: item.color + "20" }]}
      >
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickFoodName}>{item.name}</Text>
      <Text style={styles.quickFoodCalories}>{item.calories} cal</Text>
      <View style={styles.quickFoodMacros}>
        <Text style={styles.quickFoodMacro}>P: {item.protein}g</Text>
        <Text style={styles.quickFoodMacro}>C: {item.carbs}g</Text>
        <Text style={styles.quickFoodMacro}>F: {item.fat}g</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentMeal = ({ item }: any) => (
    <View style={styles.recentMealCard}>
      <View style={styles.recentMealInfo}>
        <Text style={styles.recentMealName}>{item.name}</Text>
        <Text style={styles.recentMealTime}>{item.time}</Text>
      </View>
      <View style={styles.recentMealCalories}>
        <Text style={styles.recentMealCaloriesText}>{item.calories} cal</Text>
        <Icon
          name={
            item.meal === "breakfast"
              ? "weather-sunny"
              : item.meal === "lunch"
              ? "sun-wireless"
              : "moon-waning-crescent"
          }
          size={16}
          color="#6B7280"
        />
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Log Meal</Text>
            <TouchableOpacity style={styles.scanButton}>
              <Icon name="barcode-scan" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="magnify" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity>
                <Icon name="microphone" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Meal Tabs */}
          <View style={styles.mealTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {meals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={[
                    styles.mealTab,
                    selectedMeal === meal.id && styles.mealTabActive,
                  ]}
                  onPress={() => setSelectedMeal(meal.id)}
                >
                  <Icon
                    name={meal.icon}
                    size={20}
                    color={selectedMeal === meal.id ? "#FFFFFF" : meal.color}
                  />
                  <Text
                    style={[
                      styles.mealTabText,
                      selectedMeal === meal.id && styles.mealTabTextActive,
                    ]}
                  >
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Daily Nutrition Summary */}
          <View style={styles.nutritionSummaryContainer}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            <View style={styles.nutritionSummaryCard}>
              <View style={styles.caloriesContainer}>
                <Text style={styles.caloriesLabel}>Calories</Text>
                <Text style={styles.caloriesValue}>
                  {dailyNutrition.calories.consumed}
                  <Text style={styles.caloriesGoal}>
                    /{dailyNutrition.calories.goal}
                  </Text>
                </Text>
                <View style={styles.caloriesBar}>
                  <View
                    style={[
                      styles.caloriesBarFill,
                      {
                        width: `${
                          (dailyNutrition.calories.consumed /
                            dailyNutrition.calories.goal) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.macrosContainer}>
                {[
                  { label: "Protein", ...dailyNutrition.protein },
                  { label: "Carbs", ...dailyNutrition.carbs },
                  { label: "Fat", ...dailyNutrition.fat },
                ].map((macro, index) => (
                  <View key={index} style={styles.macroItem}>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                    <Text style={styles.macroValue}>
                      {macro.consumed}g/{macro.goal}g
                    </Text>
                    <View style={styles.macroBar}>
                      <View
                        style={[
                          styles.macroBarFill,
                          {
                            width: `${(macro.consumed / macro.goal) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Quick Foods */}
          <View style={styles.quickFoodsContainer}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.quickFoodsGrid}>
              {quickFoods.map((food) => (
                <TouchableOpacity key={food.id} style={styles.quickFoodCard}>
                  <View
                    style={[
                      styles.quickFoodIcon,
                      { backgroundColor: food.color + "20" },
                    ]}
                  >
                    <Icon name={food.icon} size={24} color={food.color} />
                  </View>
                  <Text style={styles.quickFoodName}>{food.name}</Text>
                  <Text style={styles.quickFoodCalories}>
                    {food.calories} cal
                  </Text>
                  <View style={styles.quickFoodMacros}>
                    <Text style={styles.quickFoodMacro}>
                      P: {food.protein}g
                    </Text>
                    <Text style={styles.quickFoodMacro}>C: {food.carbs}g</Text>
                    <Text style={styles.quickFoodMacro}>F: {food.fat}g</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Meals */}
          <View style={styles.recentMealsContainer}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            <View style={styles.recentMealsList}>
              {recentMeals.map((meal) => (
                <View key={meal.id} style={styles.recentMealCard}>
                  <View style={styles.recentMealInfo}>
                    <Text style={styles.recentMealName}>{meal.name}</Text>
                    <Text style={styles.recentMealTime}>{meal.time}</Text>
                  </View>
                  <View style={styles.recentMealCalories}>
                    <Text style={styles.recentMealCaloriesText}>
                      {meal.calories} cal
                    </Text>
                    <Icon
                      name={
                        meal.meal === "breakfast"
                          ? "weather-sunny"
                          : meal.meal === "lunch"
                          ? "sun-wireless"
                          : "moon-waning-crescent"
                      }
                      size={16}
                      color="#6B7280"
                    />
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
  scanButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  mealTabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mealTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mealTabActive: {
    backgroundColor: "#E22345",
  },
  mealTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  mealTabTextActive: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  nutritionSummaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  nutritionSummaryCard: {
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
  },
  caloriesContainer: {
    marginBottom: 20,
  },
  caloriesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E22345",
    marginBottom: 8,
  },
  caloriesGoal: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "500",
  },
  caloriesBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  caloriesBarFill: {
    height: "100%",
    backgroundColor: "#E22345",
    borderRadius: 4,
  },
  macrosContainer: {
    gap: 16,
  },
  macroItem: {
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  macroBar: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  quickFoodsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickFoodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickFoodCard: {
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
  quickFoodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickFoodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  quickFoodCalories: {
    fontSize: 12,
    color: "#E22345",
    fontWeight: "600",
    marginBottom: 8,
  },
  quickFoodMacros: {
    flexDirection: "row",
    gap: 4,
  },
  quickFoodMacro: {
    fontSize: 10,
    color: "#6B7280",
  },
  recentMealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentMealsList: {
    gap: 12,
  },
  recentMealCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  recentMealInfo: {
    flex: 1,
  },
  recentMealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  recentMealTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  recentMealCalories: {
    alignItems: "flex-end",
  },
  recentMealCaloriesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E22345",
    marginBottom: 4,
  },
});

export default MealLoggingScreen;
