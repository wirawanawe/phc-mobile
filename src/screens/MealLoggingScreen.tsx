import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme, Modal, Portal, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import eventEmitter from "../utils/eventEmitter";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

interface FoodItem {
  id: number;
  name: string;
  name_indonesian?: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number;
  sodium_per_100g: number;
  serving_size?: string;
  serving_weight?: number;
  barcode?: string;
  image_url?: string;
  isQuickFood?: boolean;
  quantity?: number; // Add quantity field
}

const MealLoggingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchResultsWithQuickStatus, setSearchResultsWithQuickStatus] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [selectedRecentMealTab, setSelectedRecentMealTab] = useState("all");

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
    { id: "snack", name: "Snacks", icon: "food-apple", color: "#10B981" },
  ];

  const recentMealTabs = [
    { id: "all", name: "All", icon: "food-variant", color: "#6B7280" },
    { id: "breakfast", name: "Breakfast", icon: "weather-sunny", color: "#F59E0B" },
    { id: "lunch", name: "Lunch", icon: "sun-wireless", color: "#EF4444" },
    { id: "dinner", name: "Dinner", icon: "moon-waning-crescent", color: "#8B5CF6" },
    { id: "snack", name: "Snacks", icon: "food-apple", color: "#10B981" },
  ];

  // Search food from database
  const searchFood = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchResultsWithQuickStatus([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiService.searchFood(query);
      if (response.success && response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
        
        // Check quick food status for each search result (only if authenticated)
        const resultsWithQuickStatus = await Promise.all(
          response.data.map(async (food: any) => {
            if (!isAuthenticated) {
              return {
                ...food,
                isQuickFood: false,
              };
            }
            
            try {
              const quickStatusResponse = await apiService.checkQuickFoodStatus(food.id);
              return {
                ...food,
                isQuickFood: quickStatusResponse.success ? quickStatusResponse.data.isQuickFood : false,
              };
            } catch (error: any) {
              // For any error checking quick food status, default to false
              // This is normal behavior - not all foods will be in quick foods
              return {
                ...food,
                isQuickFood: false,
              };
            }
          })
        );
        setSearchResultsWithQuickStatus(resultsWithQuickStatus);
      } else {
        // If API fails, show fallback data based on query
        const fallbackResults = getFallbackFoodResults(query);
        setSearchResults(fallbackResults);
        // Don't check quick food status for fallback data to avoid 404 errors
        setSearchResultsWithQuickStatus(fallbackResults.map(food => ({ ...food, isQuickFood: false })));
      }
    } catch (error: any) {
      // For any error, use fallback data without checking quick food status
      const fallbackResults = getFallbackFoodResults(query);
      setSearchResults(fallbackResults);
      setSearchResultsWithQuickStatus(fallbackResults.map(food => ({ ...food, isQuickFood: false })));
    } finally {
      setIsSearching(false);
    }
  };

  // Fallback food data when API is not available
  const getFallbackFoodResults = (query: string) => {
    const fallbackFoods = [
      {
        id: 17,
        name: "Nasi Goreng",
        name_indonesian: "Nasi Goreng",
        category: "Rice Dishes",
        calories_per_100g: 186,
        protein_per_100g: 6.8,
        carbs_per_100g: 28.5,
        fat_per_100g: 6.2,
        fiber_per_100g: 2.1,
        sugar_per_100g: 1.2,
        sodium_per_100g: 450,
      },
      {
        id: 18,
        name: "Ayam Goreng",
        name_indonesian: "Ayam Goreng",
        category: "Chicken Dishes",
        calories_per_100g: 239,
        protein_per_100g: 23.5,
        carbs_per_100g: 0,
        fat_per_100g: 15.2,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_per_100g: 380,
      },
      {
        id: 19,
        name: "Gado-gado",
        name_indonesian: "Gado-gado",
        category: "Salads",
        calories_per_100g: 145,
        protein_per_100g: 8.2,
        carbs_per_100g: 12.5,
        fat_per_100g: 8.1,
        fiber_per_100g: 4.2,
        sugar_per_100g: 3.1,
        sodium_per_100g: 320,
      },
      {
        id: 20,
        name: "Sate Ayam",
        name_indonesian: "Sate Ayam",
        category: "Grilled Dishes",
        calories_per_100g: 185,
        protein_per_100g: 25.8,
        carbs_per_100g: 2.1,
        fat_per_100g: 8.5,
        fiber_per_100g: 0.5,
        sugar_per_100g: 1.8,
        sodium_per_100g: 420,
      },
      {
        id: 21,
        name: "Soto Ayam",
        name_indonesian: "Soto Ayam",
        category: "Soups",
        calories_per_100g: 85,
        protein_per_100g: 12.5,
        carbs_per_100g: 8.2,
        fat_per_100g: 2.1,
        fiber_per_100g: 1.8,
        sugar_per_100g: 1.2,
        sodium_per_100g: 280,
      },
      {
        id: 22,
        name: "Rendang",
        name_indonesian: "Rendang",
        category: "Beef Dishes",
        calories_per_100g: 320,
        protein_per_100g: 28.5,
        carbs_per_100g: 5.2,
        fat_per_100g: 22.1,
        fiber_per_100g: 2.8,
        sugar_per_100g: 1.5,
        sodium_per_100g: 450,
      },
      {
        id: 23,
        name: "Mie Goreng",
        name_indonesian: "Mie Goreng",
        category: "Noodle Dishes",
        calories_per_100g: 165,
        protein_per_100g: 8.5,
        carbs_per_100g: 25.8,
        fat_per_100g: 5.2,
        fiber_per_100g: 2.5,
        sugar_per_100g: 2.1,
        sodium_per_100g: 380,
      },
      {
        id: 24,
        name: "Bakso",
        name_indonesian: "Bakso",
        category: "Meatballs",
        calories_per_100g: 145,
        protein_per_100g: 18.5,
        carbs_per_100g: 8.2,
        fat_per_100g: 5.8,
        fiber_per_100g: 1.2,
        sugar_per_100g: 1.8,
        sodium_per_100g: 320,
      },
      {
        id: 27,
        name: "Banana",
        name_indonesian: "Pisang",
        category: "Fruits",
        calories_per_100g: 89,
        protein_per_100g: 1.1,
        carbs_per_100g: 23,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.6,
        sugar_per_100g: 12,
        sodium_per_100g: 1,
      },
      {
        id: 32,
        name: "Broccoli",
        name_indonesian: "Brokoli",
        category: "Vegetables",
        calories_per_100g: 34,
        protein_per_100g: 2.8,
        carbs_per_100g: 7,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.6,
        sugar_per_100g: 1.5,
        sodium_per_100g: 33,
      },
    ];

    // Filter based on query
    const filtered = fallbackFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.name_indonesian?.toLowerCase().includes(query.toLowerCase()) ||
      food.category.toLowerCase().includes(query.toLowerCase())
    );

    return filtered;
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      searchFood(text);
    } else {
      setSearchResults([]);
    }
  };

  // AI Food Recognition (simplified for now)
  const handleCameraCapture = async () => {
    Alert.alert("Camera Feature", "Camera feature will be implemented with expo-image-picker");
    setShowCameraModal(false);
  };

  const handleImagePicker = async () => {
    Alert.alert("Gallery Feature", "Gallery feature will be implemented with expo-image-picker");
    setShowCameraModal(false);
  };

  // Add food to meal
  const addFoodToMeal = (food: FoodItem) => {
    setSelectedFoods(prev => {
      // Check if food already exists in selected foods
      const existingFoodIndex = prev.findIndex(item => item.id === food.id);
      
      if (existingFoodIndex !== -1) {
        // If food exists, increase quantity
        const updatedFoods = [...prev];
        const existingFood = updatedFoods[existingFoodIndex];
        updatedFoods[existingFoodIndex] = {
          ...existingFood,
          quantity: (existingFood.quantity || 1) + 1
        };
        return updatedFoods;
      } else {
        // If food doesn't exist, add it with quantity 1
        return [...prev, { ...food, quantity: 1 }];
      }
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchModal(false);
  };

  // Add quick food to meal
  const addQuickFoodToMeal = (quickFood: any) => {
    // Convert quick food to FoodItem format
    // Quick foods already contain actual nutrition values (not per 100g)
    const foodItem: FoodItem = {
      id: parseInt(quickFood.id),
      name: quickFood.name,
      category: quickFood.category || "Quick Food",
      calories_per_100g: quickFood.calories || 0, // These are already actual values
      protein_per_100g: quickFood.protein || 0,
      carbs_per_100g: quickFood.carbs || 0,
      fat_per_100g: quickFood.fat || 0,
      fiber_per_100g: quickFood.fiber_per_100g || 0,
      sugar_per_100g: quickFood.sugar_per_100g || 0,
      sodium_per_100g: quickFood.sodium_per_100g || 0,
      serving_weight: 100, // Set serving weight to 100g for quick foods
      quantity: 1, // Default quantity for quick foods
    };
    
    setSelectedFoods(prev => {
      // Check if food already exists in selected foods
      const existingFoodIndex = prev.findIndex(item => item.id === foodItem.id);
      
      if (existingFoodIndex !== -1) {
        // If food exists, increase quantity
        const updatedFoods = [...prev];
        const existingFood = updatedFoods[existingFoodIndex];
        updatedFoods[existingFoodIndex] = {
          ...existingFood,
          quantity: (existingFood.quantity || 1) + 1
        };
        return updatedFoods;
      } else {
        // If food doesn't exist, add it with quantity 1
        return [...prev, foodItem];
      }
    });
    Alert.alert("Success", `${quickFood.name} added to your meal!`);
  };

  // Add food to quick foods
  const addToQuickFoods = async (food: any) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to save quick foods");
      return;
    }

    try {
      const response = await apiService.addToQuickFoods(food.id);
      
      if (response.success) {
        Alert.alert("Success", `${food.name} added to Quick Add!`);
        // Refresh quick foods
        loadQuickFoods();
        // Update search results to show heart as filled
        setSearchResultsWithQuickStatus(prev => 
          prev.map(item => 
            item.id === food.id ? { ...item, isQuickFood: true } : item
          )
        );
      } else {
        Alert.alert("Error", response.message || "Failed to add to Quick Add");
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message && error.message.includes("Selected food not found in database")) {
        Alert.alert("Error", "Selected food not found in database");
      } else if (error.message && error.message.includes("Food already in quick foods")) {
        Alert.alert("Info", "Food is already in your Quick Add list");
        // Refresh to sync state
        loadQuickFoods();
      } else if (error.message && error.message.includes("Maximum 12 quick foods allowed")) {
        Alert.alert("Limit Reached", "You can only have up to 12 quick foods. Please remove some items first.");
      } else {
        Alert.alert("Error", "Failed to add to Quick Add");
      }
    }
  };

  // Remove food from quick foods
  const removeFromQuickFoods = async (foodId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to manage quick foods");
      return;
    }

    try {
      const response = await apiService.removeFromQuickFoods(foodId);
      
      if (response.success) {
        // Don't show alert for successful removal, just refresh
        loadQuickFoods();
      } else {
        Alert.alert("Error", response.message || "Failed to remove from Quick Add");
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message && error.message.includes("Quick food not found")) {
        // Silently refresh quick foods to sync state
        loadQuickFoods();
        return;
      }
      
      Alert.alert("Error", "Failed to remove from Quick Add");
    }
  };

  // Save meal to database
  const saveMeal = async () => {
    console.log('🍽️ saveMeal function called!');
    console.log('🍽️ selectedFoods length:', selectedFoods.length);
    console.log('🍽️ selectedMeal:', selectedMeal);
    
    if (selectedFoods.length === 0) {
      console.log('⚠️ No foods selected, showing alert');
      Alert.alert("No Food Selected", "Please add at least one food item to your meal");
      return;
    }

    // Check if user is authenticated
    console.log('🔐 Authentication check - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('⚠️ User not authenticated, showing alert');
      Alert.alert("Authentication Required", "Please log in to save your meal");
      return;
    }

    try {
      // Calculate totals from selected foods (using same logic as food transformation)
      const totalCalories = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        
        let actualCalories;
        if (food.serving_weight === 100) {
          // Quick foods - values are already actual
          actualCalories = Math.round(food.calories_per_100g || 0);
        } else {
          // Search results - convert from per 100g to actual
          const actualWeight = (servingSize * quantity) / 100;
          actualCalories = Math.round((food.calories_per_100g || 0) * actualWeight);
        }
        return sum + actualCalories;
      }, 0);
      
      const totalProtein = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        
        let actualProtein;
        if (food.serving_weight === 100) {
          // Quick foods - values are already actual
          actualProtein = Math.round((food.protein_per_100g || 0) * 10) / 10;
        } else {
          // Search results - convert from per 100g to actual
          const actualWeight = (servingSize * quantity) / 100;
          actualProtein = Math.round((food.protein_per_100g || 0) * actualWeight * 10) / 10;
        }
        return sum + actualProtein;
      }, 0);
      
      const totalCarbs = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        
        let actualCarbs;
        if (food.serving_weight === 100) {
          // Quick foods - values are already actual
          actualCarbs = Math.round((food.carbs_per_100g || 0) * 10) / 10;
        } else {
          // Search results - convert from per 100g to actual
          const actualWeight = (servingSize * quantity) / 100;
          actualCarbs = Math.round((food.carbs_per_100g || 0) * actualWeight * 10) / 10;
        }
        return sum + actualCarbs;
      }, 0);
      
      const totalFat = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        
        let actualFat;
        if (food.serving_weight === 100) {
          // Quick foods - values are already actual
          actualFat = Math.round((food.fat_per_100g || 0) * 10) / 10;
        } else {
          // Search results - convert from per 100g to actual
          const actualWeight = (servingSize * quantity) / 100;
          actualFat = Math.round((food.fat_per_100g || 0) * actualWeight * 10) / 10;
        }
        return sum + actualFat;
      }, 0);
      
      const totalFiber = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        const actualWeight = (servingSize * quantity) / 100;
        const actualFiber = Math.round((food.fiber_per_100g || 0) * actualWeight * 10) / 10;
        return sum + actualFiber;
      }, 0);
      
      const totalSugar = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        const actualWeight = (servingSize * quantity) / 100;
        const actualSugar = Math.round((food.sugar_per_100g || 0) * actualWeight * 10) / 10;
        return sum + actualSugar;
      }, 0);
      
      const totalSodium = selectedFoods.reduce((sum, food) => {
        const servingSize = food.serving_weight || 100;
        const quantity = food.quantity || 1; // Use food.quantity or default to 1
        const actualWeight = (servingSize * quantity) / 100;
        const actualSodium = Math.round((food.sodium_per_100g || 0) * actualWeight * 10) / 10;
        return sum + actualSodium;
      }, 0);

      // Transform selected foods to match API expected format
      // Calculate nutrition based on actual serving size
      const foods = selectedFoods.map(food => {
        const servingSize = food.serving_weight || 100; // Default to 100g if not specified
        const quantity = food.quantity || 1; // Default quantity
        
        // For quick foods, values are already actual values (not per 100g)
        // For search results, values are per 100g and need to be converted
        let actualCalories, actualProtein, actualCarbs, actualFat;
        
        if (food.serving_weight === 100) {
          // Quick foods - values are already actual
          actualCalories = Math.round(food.calories_per_100g || 0);
          actualProtein = Math.round((food.protein_per_100g || 0) * 10) / 10;
          actualCarbs = Math.round((food.carbs_per_100g || 0) * 10) / 10;
          actualFat = Math.round((food.fat_per_100g || 0) * 10) / 10;
        } else {
          // Search results - convert from per 100g to actual
          const actualWeight = (servingSize * quantity) / 100;
          actualCalories = Math.round((food.calories_per_100g || 0) * actualWeight);
          actualProtein = Math.round((food.protein_per_100g || 0) * actualWeight * 10) / 10;
          actualCarbs = Math.round((food.carbs_per_100g || 0) * actualWeight * 10) / 10;
          actualFat = Math.round((food.fat_per_100g || 0) * actualWeight * 10) / 10;
        }
        
        return {
          food_id: food.id,
          quantity: quantity,
          unit: 'serving',
          calories: actualCalories,
          protein: actualProtein,
          carbs: actualCarbs,
          fat: actualFat
        };
      });

      const mealData = {
        meal_type: selectedMeal,
        foods: foods,
        notes: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} - Total: ${totalCalories} cal`,
        recorded_at: new Date().toISOString()
      };

      // Debug logging
      console.log('🍽️ Selected foods:', selectedFoods.map(food => ({
        name: food.name,
        calories_per_100g: food.calories_per_100g,
        protein_per_100g: food.protein_per_100g,
        carbs_per_100g: food.carbs_per_100g,
        fat_per_100g: food.fat_per_100g,
        serving_weight: food.serving_weight,
        quantity: food.quantity
      })));
      console.log('🍽️ Transformed foods:', foods);
      console.log('🍽️ Meal data to send:', JSON.stringify(mealData, null, 2));
      console.log('📊 Nutrition totals:', {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      });
      
      // Test calculation for first food
      if (selectedFoods.length > 0) {
        const testFood = selectedFoods[0];
        console.log('🧪 Test calculation for:', testFood.name);
        console.log('   Original values:', {
          calories: testFood.calories_per_100g,
          protein: testFood.protein_per_100g,
          carbs: testFood.carbs_per_100g,
          fat: testFood.fat_per_100g,
          serving_weight: testFood.serving_weight,
          quantity: testFood.quantity
        });
        
        const servingSize = testFood.serving_weight || 100;
        const quantity = testFood.quantity || 1;
        
        if (testFood.serving_weight === 100) {
          console.log('   Quick food - using values directly');
          console.log('   Calculated:', {
            calories: Math.round(testFood.calories_per_100g || 0),
            protein: Math.round((testFood.protein_per_100g || 0) * 10) / 10,
            carbs: Math.round((testFood.carbs_per_100g || 0) * 10) / 10,
            fat: Math.round((testFood.fat_per_100g || 0) * 10) / 10
          });
        } else {
          const actualWeight = (servingSize * quantity) / 100;
          console.log('   Search result - converting from per 100g');
          console.log('   actualWeight:', actualWeight);
          console.log('   Calculated:', {
            calories: Math.round((testFood.calories_per_100g || 0) * actualWeight),
            protein: Math.round((testFood.protein_per_100g || 0) * actualWeight * 10) / 10,
            carbs: Math.round((testFood.carbs_per_100g || 0) * actualWeight * 10) / 10,
            fat: Math.round((testFood.fat_per_100g || 0) * actualWeight * 10) / 10
          });
        }
      }

      console.log('📡 About to call API...');
      const response = await apiService.createMealEntry(mealData);
      console.log('📡 API Response received:', response);
      
      if (response.success) {
        Alert.alert("Success", `Meal logged successfully!\nTotal calories: ${totalCalories} kcal`);
        setSelectedFoods([]);
        setSearchQuery("");
        // Refresh nutrition data and recent meals immediately
        await loadNutritionData();
        await loadRecentMeals();
        
        // Emit event to notify other components that meal data has been updated
        eventEmitter.emitMealLogged();
      } else {
        Alert.alert("Error", response.message || "Failed to save meal");
      }
    } catch (error: any) {
      console.error('❌ Error saving meal:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        name: error?.name || 'Unknown',
        stack: error?.stack || 'No stack trace'
      });
      Alert.alert("Error", "Failed to save meal. Please check your connection and try again.");
    }
  };

  // Remove food from selection
  const removeFood = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  // Increase food quantity
  const increaseQuantity = (index: number) => {
    setSelectedFoods(prev => {
      const updatedFoods = [...prev];
      const food = updatedFoods[index];
      updatedFoods[index] = {
        ...food,
        quantity: (food.quantity || 1) + 1
      };
      return updatedFoods;
    });
  };

  // Decrease food quantity
  const decreaseQuantity = (index: number) => {
    setSelectedFoods(prev => {
      const updatedFoods = [...prev];
      const food = updatedFoods[index];
      const currentQuantity = food.quantity || 1;
      
      if (currentQuantity <= 1) {
        // If quantity is 1 or less, remove the food
        return prev.filter((_, i) => i !== index);
      } else {
        // Decrease quantity
        updatedFoods[index] = {
          ...food,
          quantity: currentQuantity - 1
        };
        return updatedFoods;
      }
    });
  };

  const [dailyNutrition, setDailyNutrition] = useState({
    calories: { consumed: 0, goal: 2000 },
    protein: { consumed: 0, goal: 120 },
    carbs: { consumed: 0, goal: 250 },
    fat: { consumed: 0, goal: 65 },
  });
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [quickFoods, setQuickFoods] = useState<any[]>([]);
  const [isLoadingQuickFoods, setIsLoadingQuickFoods] = useState(false);

  // Load nutrition data and recent meals
  useEffect(() => {
    loadNutritionData();
    loadRecentMeals();
    loadQuickFoods();
    
    // Clean up old meal data (older than 24 hours)
    cleanupOldMealData();
    
    // Set up interval to refresh recent meals every hour
    const interval = setInterval(() => {
      loadRecentMeals();
      cleanupOldMealData(); // Clean up old data every hour
    }, 60 * 60 * 1000); // Refresh every hour
    
    return () => clearInterval(interval);
  }, []);

  // Clean up old meal data
  const cleanupOldMealData = async () => {
    try {
      if (isAuthenticated) {
        await apiService.cleanupOldMealData();
      }
    } catch (error) {
      // Silent error for cleanup
    }
  };

  // Load quick foods from user's preferences
  const loadQuickFoods = async () => {
    setIsLoadingQuickFoods(true);
    try {
      // Only load user's quick foods if authenticated
      if (isAuthenticated) {
        const response = await apiService.getQuickFoods();
        if (response.success && response.data && Array.isArray(response.data)) {
          const formattedQuickFoods = response.data.map((food: any) => ({
            ...food,
            // Map nutrition data from per_100g format to display format
            calories: food.calories_per_100g || 0,
            protein: food.protein_per_100g || 0,
            carbs: food.carbs_per_100g || 0,
            fat: food.fat_per_100g || 0,
            icon: getFoodIcon(food.category),
            color: getFoodColor(food.category),
          }));
          setQuickFoods(formattedQuickFoods);
        } else {
          // If no quick foods, load default foods
          setQuickFoods(getDefaultQuickFoods());
        }
      } else {
        // If not authenticated, use default foods
        setQuickFoods(getDefaultQuickFoods());
      }
    } catch (error: any) {
      // Don't log errors for loadQuickFoods as they're expected
      // Just fallback to default quick foods
      setQuickFoods(getDefaultQuickFoods());
    } finally {
      setIsLoadingQuickFoods(false);
    }
  };

  // Helper function to get food icon based on category
  const getFoodIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'rice dishes':
        return 'rice';
      case 'chicken dishes':
      case 'beef dishes':
        return 'food';
      case 'grilled dishes':
        return 'food-variant';
      case 'salads':
      case 'vegetables':
      case 'fruits':
        return 'food-apple';
      case 'soups':
        return 'cup';
      case 'noodle dishes':
        return 'food-variant';
      case 'snacks':
      case 'traditional snacks':
        return 'food-apple';
      case 'beverages':
        return 'cup-water';
      default:
        return 'food';
    }
  };

  // Helper function to get food color based on category
  const getFoodColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'rice dishes':
        return '#F59E0B';
      case 'chicken dishes':
        return '#EF4444';
      case 'grilled dishes':
        return '#3B82F6';
      case 'salads':
      case 'vegetables':
      case 'fruits':
        return '#10B981';
      case 'soups':
        return '#F59E0B';
      case 'beef dishes':
        return '#8B5CF6';
      case 'noodle dishes':
        return '#F59E0B';
      case 'snacks':
      case 'traditional snacks':
        return '#10B981';
      case 'beverages':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  // Default quick foods as fallback
  const getDefaultQuickFoods = () => [
    {
      id: "17",
      name: "Nasi Goreng",
      calories: 186,
      protein: 6.8,
      carbs: 28.5,
      fat: 6.2,
      icon: "rice",
      color: "#F59E0B",
    },
    {
      id: "18",
      name: "Ayam Goreng",
      calories: 239,
      protein: 23.5,
      carbs: 0,
      fat: 15.2,
      icon: "food",
      color: "#EF4444",
    },
    {
      id: "20",
      name: "Sate Ayam",
      calories: 185,
      protein: 25.8,
      carbs: 2.1,
      fat: 8.5,
      icon: "food-variant",
      color: "#3B82F6",
    },
    {
      id: "19",
      name: "Gado-gado",
      calories: 145,
      protein: 8.2,
      carbs: 12.5,
      fat: 8.1,
      icon: "food-apple",
      color: "#10B981",
    },
    {
      id: "21",
      name: "Soto Ayam",
      calories: 85,
      protein: 12.5,
      carbs: 8.2,
      fat: 2.1,
      icon: "cup",
      color: "#F59E0B",
    },
    {
      id: "22",
      name: "Rendang",
      calories: 320,
      protein: 28.5,
      carbs: 5.2,
      fat: 22.1,
      icon: "food",
      color: "#8B5CF6",
    },
    {
      id: "23",
      name: "Mie Goreng",
      calories: 165,
      protein: 8.5,
      carbs: 25.8,
      fat: 5.2,
      icon: "food-variant",
      color: "#F59E0B",
    },
    {
      id: "24",
      name: "Bakso",
      calories: 145,
      protein: 18.5,
      carbs: 8.2,
      fat: 5.8,
      icon: "food-apple",
      color: "#10B981",
    },
  ];

  const loadNutritionData = async () => {
    setIsLoadingNutrition(true);
    try {
      if (isAuthenticated) {
        const response = await apiService.getTodayNutrition();
        if (response.success && response.data) {
          const { totals } = response.data;
          setDailyNutrition({
            calories: { consumed: totals.calories || 0, goal: 2000 },
            protein: { consumed: Math.round(totals.protein || 0), goal: 120 },
            carbs: { consumed: Math.round(totals.carbs || 0), goal: 250 },
            fat: { consumed: Math.round(totals.fat || 0), goal: 65 },
          });
        }
      } else {
        // If not authenticated, show zero values
        setDailyNutrition({
          calories: { consumed: 0, goal: 2000 },
          protein: { consumed: 0, goal: 120 },
          carbs: { consumed: 0, goal: 250 },
          fat: { consumed: 0, goal: 65 },
        });
      }
    } catch (error) {
      // On error, show zero values
      setDailyNutrition({
        calories: { consumed: 0, goal: 2000 },
        protein: { consumed: 0, goal: 120 },
        carbs: { consumed: 0, goal: 250 },
        fat: { consumed: 0, goal: 65 },
      });
    } finally {
      setIsLoadingNutrition(false);
    }
  };

  const loadRecentMeals = async () => {
    try {
      if (isAuthenticated) {
        const userId = await apiService.getUserId();
        const response = await apiService.getMealHistory({ 
          limit: 50, // Get more meals to filter by time
        });
        
        if (response.success && response.data && Array.isArray(response.data)) {
          const allMeals: any[] = [];
          
          response.data.forEach((meal: any) => {
            if (meal.foods && meal.foods.length > 0) {
              // Format time from recorded_at
              const mealTime = meal.recorded_at ? 
                new Date(meal.recorded_at).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                }) : 'Unknown';
              
              // Create individual food items with meal context
              meal.foods.forEach((food: any, index: number) => {
                const foodCalories = parseFloat(food.calories) || 0;
                const mealType = meal.meal_type || 'meal';
                
                allMeals.push({
                  id: `${meal.id}-${index}`,
                  name: food.food_name || food.food_name_indonesian || 'Unknown Food',
                  time: mealTime,
                  calories: Math.round(foodCalories),
                  meal: mealType,
                  mealId: meal.id,
                  quantity: food.quantity,
                  unit: food.unit,
                  recordedAt: meal.recorded_at, // Store original timestamp for sorting
                });
              });
            }
          });
          
          // Sort by recorded time (most recent first) and limit to 10 items
          const sortedMeals = allMeals
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
            .slice(0, 10);
          
          setRecentMeals(sortedMeals);
        } else {
          setRecentMeals([]);
        }
      } else {
        // If not authenticated, show empty list
        setRecentMeals([]);
      }
    } catch (error) {
      console.error('Error loading recent meals:', error);
      setRecentMeals([]);
    }
  };

  const renderMealTab = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.mealTab,
        selectedMeal === item.id && styles.mealTabActive,
      ]}
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
    <View key={item.id} style={styles.quickFoodCard}>
      <TouchableOpacity 
        style={styles.quickFoodContent}
        onPress={() => addQuickFoodToMeal(item)}
      >
        <View
          style={[
            styles.quickFoodIcon,
            { backgroundColor: item.color + "20" },
          ]}
        >
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.quickFoodName}>{item.name}</Text>
        <Text style={styles.quickFoodCalories}>
          {item.calories} cal
        </Text>
        <View style={styles.quickFoodMacros}>
          <Text style={styles.quickFoodMacro}>
            P: {item.protein}g
          </Text>
          <Text style={styles.quickFoodMacro}>C: {item.carbs}g</Text>
          <Text style={styles.quickFoodMacro}>F: {item.fat}g</Text>
        </View>
      </TouchableOpacity>
      
      {/* Delete button */}
      <TouchableOpacity 
        style={styles.quickFoodDeleteButton}
        onPress={() => removeFromQuickFoods(item.food_id || item.id)}
      >
        <Icon name="close" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderRecentMeal = ({ item }: any) => (
    <View key={item.id} style={styles.recentMealCard}>
      <View style={styles.recentMealInfo}>
        <View style={styles.recentMealHeader}>
          <Text style={styles.recentMealName}>{item.name}</Text>
          <View style={styles.mealTypeBadge}>
            <Text style={styles.mealTypeText}>
              {item.meal.charAt(0).toUpperCase() + item.meal.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.recentMealDetails}>
          <Text style={styles.recentMealQuantity}>
            {item.quantity} {item.unit}
          </Text>
          <Text style={styles.recentMealTime}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.recentMealCalories}>
        <Text style={styles.recentMealCaloriesText}>
          {item.calories} cal
        </Text>
        <Icon
          name={
            item.meal === "breakfast"
              ? "weather-sunny"
              : item.meal === "lunch"
              ? "sun-wireless"
              : item.meal === "dinner"
              ? "moon-waning-crescent"
              : "food-apple"
          }
          size={16}
          color="#6B7280"
        />
      </View>
    </View>
  );

  const renderRecentMealTab = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.recentMealTab,
        selectedRecentMealTab === item.id && styles.recentMealTabActive,
      ]}
      onPress={() => setSelectedRecentMealTab(item.id)}
    >
      <Icon
        name={item.icon}
        size={16}
        color={selectedRecentMealTab === item.id ? "#FFFFFF" : item.color}
      />
              <Text
          style={[
            styles.recentMealTabText,
            selectedRecentMealTab === item.id && styles.recentMealTabTextActive,
          ]}
        >
          {item.name}
        </Text>
        {getMealCountByType(item.id) > 0 && (
          <View style={styles.recentMealTabBadge}>
            <Text style={styles.recentMealTabBadgeText}>
              {getMealCountByType(item.id)}
            </Text>
          </View>
        )}
    </TouchableOpacity>
  );

  const getFilteredRecentMeals = () => {
    if (selectedRecentMealTab === "all") {
      return recentMeals;
    }
    return recentMeals.filter(meal => meal.meal === selectedRecentMealTab);
  };

  const getMealCountByType = (mealType: string) => {
    if (mealType === "all") {
      return recentMeals.length;
    }
    return recentMeals.filter(meal => meal.meal === mealType).length;
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Main')}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={() => {
              console.log('🔘 Save button pressed!');
              console.log('🔘 Selected foods count:', selectedFoods.length);
              console.log('🔘 Selected meal type:', selectedMeal);
              saveMeal();
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="magnify" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCameraModal(true)}
              >
                <Icon name="camera" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {isSearching && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            )}
          </View>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <View style={styles.selectedFoodsContainer}>
              <Text style={styles.sectionTitle}>Selected Foods</Text>
              {selectedFoods.map((food, index) => (
                <View key={index} style={styles.selectedFoodCard}>
                  <View style={styles.selectedFoodInfo}>
                    <Text style={styles.selectedFoodName}>{food.name}</Text>
                    <Text style={styles.selectedFoodCalories}>
                      {food.calories_per_100g} cal/100g • {food.category}
                    </Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => decreaseQuantity(index)}
                    >
                      <Icon name="minus" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{food.quantity || 1}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => increaseQuantity(index)}
                    >
                      <Icon name="plus" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Meal Type Tabs */}
          <View style={styles.mealTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealTabsScroll}
            >
              {meals.map((meal) => (
                <View key={meal.id}>
                  {renderMealTab({ item: meal })}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Search Results */}
          {isSearching ? (
            <View style={styles.searchResultsContainer}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E22345" />
                <Text style={styles.loadingText}>Searching for foods...</Text>
              </View>
            </View>
          ) : searchResultsWithQuickStatus.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResultsWithQuickStatus.map((food) => (
                <View key={food.id} style={styles.searchResultCard}>
                  <TouchableOpacity
                    style={styles.searchResultMainContent}
                    onPress={() => addFoodToMeal(food)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultIconContainer}>
                      <View style={[
                        styles.searchResultIcon,
                        { backgroundColor: getFoodColor(food.category) + "15" }
                      ]}>
                        <Icon 
                          name={getFoodIcon(food.category)} 
                          size={18} 
                          color={getFoodColor(food.category)} 
                        />
                      </View>
                    </View>
                    
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>{food.name}</Text>
                      <Text style={styles.searchResultCategory}>{food.category}</Text>
                      <View style={styles.searchResultNutrition}>
                        <Text style={styles.searchResultCalories}>
                          {food.calories_per_100g} cal/100g
                        </Text>
                        <View style={styles.searchResultMacros}>
                          <Text style={styles.searchResultMacro}>
                            P: {food.protein_per_100g}g
                          </Text>
                          <Text style={styles.searchResultMacro}>
                            C: {food.carbs_per_100g}g
                          </Text>
                          <Text style={styles.searchResultMacro}>
                            F: {food.fat_per_100g}g
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Action buttons container */}
                  <View style={styles.searchResultActions}>
                    {/* Add to meal button */}
                    <TouchableOpacity
                      style={styles.searchResultAddButton}
                      onPress={() => addFoodToMeal(food)}
                      activeOpacity={0.7}
                    >
                      <Icon name="plus" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    {/* Love button for Quick Add */}
                    <TouchableOpacity
                      style={[
                        styles.searchResultLoveButton,
                        food.isQuickFood && styles.searchResultLoveButtonActive
                      ]}
                      onPress={() => food.isQuickFood ? removeFromQuickFoods(food.id.toString()) : addToQuickFoods(food)}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={food.isQuickFood ? "heart" : "heart-outline"} 
                        size={18} 
                        color={food.isQuickFood ? "#FFFFFF" : "#6B7280"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Today's Nutrition Summary */}
          <View style={styles.nutritionSummaryContainer}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            {isLoadingNutrition ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E22345" />
                <Text style={styles.loadingText}>Loading nutrition data...</Text>
              </View>
            ) : (
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
            )}
          </View>

          {/* Quick Foods */}
          <View style={styles.quickFoodsContainer}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            {isLoadingQuickFoods ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E22345" />
                <Text style={styles.loadingText}>Loading quick foods...</Text>
              </View>
            ) : (
            <View style={styles.quickFoodsGrid}>
              {quickFoods.map((food) => (
                <View key={food.id}>
                  {renderQuickFood({ item: food })}
                </View>
              ))}
            </View>
            )}
          </View>

          {/* Recent Meals */}
          <View style={styles.recentMealsContainer}>
            <View style={styles.recentMealsHeader}>
              <Text style={styles.sectionTitle}>Recent Meals</Text>
              <View style={styles.recentMealsInfo}>
                <Icon name="clock-outline" size={16} color="#ffffff" />
                <Text style={styles.recentMealsInfoText}>Last 24 hours only</Text>
              </View>
            </View>
            
            {/* Recent Meals Tabs */}
            <View style={styles.recentMealTabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentMealTabsScroll}
              >
                {recentMealTabs.map((tab) => (
                  <View key={tab.id}>
                    {renderRecentMealTab({ item: tab })}
                  </View>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.recentMealsList}>
              {getFilteredRecentMeals().length > 0 ? (
                getFilteredRecentMeals().map((meal) => renderRecentMeal({ item: meal }))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Icon name="food-variant" size={32} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>
                    {selectedRecentMealTab === "all" 
                      ? "No recent meals" 
                      : `No ${selectedRecentMealTab} meals`}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {selectedRecentMealTab === "all" 
                      ? "Your recent meals will appear here" 
                      : `Your recent ${selectedRecentMealTab} meals will appear here`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Search Modal */}
        <Portal>
          <Modal
            visible={showSearchModal}
            onDismiss={() => setShowSearchModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Search Food Database</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search for food..."
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            <ScrollView style={styles.modalSearchResults}>
              {searchResults.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.modalSearchResult}
                  onPress={() => addFoodToMeal(food)}
                >
                  <Text style={styles.modalSearchResultName}>{food.name}</Text>
                  <Text style={styles.modalSearchResultCalories}>
                    {food.calories_per_100g} cal/100g
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button onPress={() => setShowSearchModal(false)}>Close</Button>
          </Modal>
        </Portal>

        {/* Camera Modal */}
        <Portal>
          <Modal
            visible={showCameraModal}
            onDismiss={() => setShowCameraModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Scan Food</Text>
            <View style={styles.cameraOptions}>
              <TouchableOpacity
                style={styles.cameraOption}
                onPress={handleCameraCapture}
              >
                <Icon name="camera" size={32} color="#3B82F6" />
                <Text style={styles.cameraOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraOption}
                onPress={handleImagePicker}
              >
                <Icon name="image" size={32} color="#10B981" />
                <Text style={styles.cameraOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            <Button onPress={() => setShowCameraModal(false)}>Cancel</Button>
          </Modal>
        </Portal>
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
    paddingVertical: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#10B981",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  cameraButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  searchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#3B82F6",
  },
  selectedFoodsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  selectedFoodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  selectedFoodCalories: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
  },
  removeFoodButton: {
    padding: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  mealTabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mealTabsScroll: {
    alignItems: "center",
  },
  mealTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  mealTabActive: {
    backgroundColor: "#E22345",
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
  searchResultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  searchResultMainContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  searchResultCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  searchResultNutrition: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchResultCalories: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
  },
  searchResultMacros: {
    flexDirection: "row",
    gap: 4,
  },
  searchResultMacro: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchResultActions: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  searchResultAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchResultLoveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchResultLoveButtonActive: {
    backgroundColor: "#EF4444",
  },
  nutritionSummaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
    marginBottom: 32,
  },
  quickFoodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  quickFoodCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
    position: "relative",
  },
  quickFoodContent: {
    alignItems: "center",
  },
  quickFoodDeleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  quickFoodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickFoodName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 16,
  },
  quickFoodCalories: {
    fontSize: 12,
    color: "#E22345",
    fontWeight: "700",
    marginBottom: 8,
  },
  quickFoodMacros: {
    flexDirection: "row",
    gap: 6,
  },
  quickFoodMacro: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  recentMealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  recentMealsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  recentMealsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentMealsInfoText: {
    fontSize: 12,
    color: "#ffffff",
    marginLeft: 4,
    fontWeight: "500",
  },
  recentMealTabsContainer: {
    marginBottom: 16,
  },
  recentMealTabsScroll: {
    paddingHorizontal: 0,
  },
  recentMealTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  recentMealTabActive: {
    backgroundColor: "#E22345",
  },
  recentMealTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  recentMealTabTextActive: {
    color: "#FFFFFF",
  },
  recentMealTabBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  recentMealTabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E22345",
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
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 8,
  },
  recentMealInfo: {
    flex: 1,
  },
  recentMealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recentMealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  mealTypeBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  mealTypeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
    textTransform: "uppercase",
  },
  recentMealDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recentMealQuantity: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recentMealTime: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  recentMealCalories: {
    alignItems: "flex-end",
  },
  recentMealCaloriesText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E22345",
    marginBottom: 4,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    alignSelf: "center",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
    textAlign: "center",
  },
  modalSearchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#1F2937",
  },
  modalSearchResults: {
    maxHeight: 200,
    marginBottom: 15,
  },
  modalSearchResult: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalSearchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalSearchResultCalories: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
  },
  cameraOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  cameraOption: {
    alignItems: "center",
    paddingVertical: 15,
  },
     cameraOptionText: {
     fontSize: 14,
     color: "#1F2937",
     marginTop: 8,
   },
     sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
});

export default MealLoggingScreen;

