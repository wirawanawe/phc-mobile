import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { Text, useTheme, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import SimpleDatePicker from "../components/SimpleDatePicker";
import { CustomTheme } from "../theme/theme";
import api from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";
import eventEmitter from "../utils/eventEmitter";

const { width } = Dimensions.get("window");

// Workout types with their parameters
const WORKOUT_TYPES = {
  "Weight Lifting": {
    icon: "dumbbell",
    parameters: [
      { name: "weight_kg", label: "Berat (kg)", unit: "kg" },
      { name: "sets", label: "Set", unit: "set" },
      { name: "reps", label: "Repetisi", unit: "reps" }
    ]
  },
  "Running": {
    icon: "run",
    parameters: [
      { name: "distance_km", label: "Jarak", unit: "km" },
      { name: "pace_min_km", label: "Kecepatan", unit: "min/km" }
    ]
  },
  "Cycling": {
    icon: "bike",
    parameters: [
      { name: "distance_km", label: "Jarak", unit: "km" },
      { name: "speed_kmh", label: "Kecepatan", unit: "km/h" }
    ]
  },
  "Swimming": {
    icon: "swim",
    parameters: [
      { name: "distance_m", label: "Jarak", unit: "m" },
      { name: "stroke_type", label: "Gaya Renang", unit: "" }
    ]
  },
  "Yoga": {
    icon: "yoga",
    parameters: [
      { name: "intensity", label: "Intensitas", unit: "" }
    ]
  },
  "Walking": {
    icon: "walk",
    parameters: [
      { name: "distance_km", label: "Jarak", unit: "km" },
      { name: "steps", label: "Langkah", unit: "langkah" }
    ]
  }
};

interface TrackingData {
  mood?: any;
  fitness?: any;
  water?: any;
  sleep?: any;
  meal?: any;
  anthropometry?: any;
}

interface TrackingCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  data: any;
  hasData: boolean;
}

const WellnessDetailsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date selection states
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Tracking data states
  const [trackingData, setTrackingData] = useState<TrackingData>({});
  const [hasData, setHasData] = useState(false);
  
  // Category selection states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [trackingCategories, setTrackingCategories] = useState<TrackingCategory[]>([]);

  useEffect(() => {
    fetchTrackingData();
    
    // Listen for tracking-related events to refresh data
    const handleDataRefresh = () => {
      console.log('🔍 WellnessDetailsScreen: Data refresh event received, refreshing data...');
      fetchTrackingData();
    };

    // Register event listeners
    eventEmitter.on('moodLogged', handleDataRefresh);
    eventEmitter.on('fitnessLogged', handleDataRefresh);
    eventEmitter.on('waterLogged', handleDataRefresh);
    eventEmitter.on('sleepLogged', handleDataRefresh);
    eventEmitter.on('mealLogged', handleDataRefresh);
    eventEmitter.on('anthropometryLogged', handleDataRefresh);
    eventEmitter.on('wellnessActivityCompleted', handleDataRefresh);
    eventEmitter.on('wellnessActivityUpdated', handleDataRefresh);
    eventEmitter.on('wellnessActivityDeleted', handleDataRefresh);
    eventEmitter.on('dataRefresh', handleDataRefresh);

    // Cleanup event listeners on unmount
    return () => {
      eventEmitter.off('moodLogged', handleDataRefresh);
      eventEmitter.off('fitnessLogged', handleDataRefresh);
      eventEmitter.off('waterLogged', handleDataRefresh);
      eventEmitter.off('sleepLogged', handleDataRefresh);
      eventEmitter.off('mealLogged', handleDataRefresh);
      eventEmitter.off('anthropometryLogged', handleDataRefresh);
      eventEmitter.off('wellnessActivityCompleted', handleDataRefresh);
      eventEmitter.off('wellnessActivityUpdated', handleDataRefresh);
      eventEmitter.off('wellnessActivityDeleted', handleDataRefresh);
      eventEmitter.off('dataRefresh', handleDataRefresh);
    };
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    fetchTrackingData();
  }, [selectedDate]);

  const fetchTrackingData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Convert to local date string to match database timezone
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      console.log(`Fetching tracking data for date: ${dateString}`);

      // Fetch all tracking data for the selected date
      const [moodResponse, fitnessResponse, waterResponse, sleepResponse, mealResponse, anthropometryResponse] = await Promise.all([
        api.getMoodHistory({ date: dateString }),
        api.getFitnessHistory({ date: dateString }),
        api.getWaterHistory({ date: dateString }),
        api.getSleepHistory({ sleep_date: dateString }),
        api.getMealHistory({ date: dateString }),
        api.getAnthropometryHistory({ measured_date: dateString }),
      ]);

      const newTrackingData: TrackingData = {};
      let hasAnyData = false;



      // Process mood data
      if (moodResponse.success && moodResponse.data?.entries?.length > 0) {
        newTrackingData.mood = moodResponse.data;
        hasAnyData = true;
        console.log("✅ Mood data processed:", moodResponse.data.entries.length, "entries");
      } else if (moodResponse.success && moodResponse.moodData?.length > 0) {
        // Handle case where data is in moodData field
        newTrackingData.mood = { entries: moodResponse.moodData };
        hasAnyData = true;
        console.log("✅ Mood data processed (moodData format):", moodResponse.moodData.length, "entries");
      } else if (moodResponse.success && Array.isArray(moodResponse.data) && moodResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.mood = { entries: moodResponse.data };
        hasAnyData = true;
        console.log("✅ Mood data processed (array format):", moodResponse.data.length, "entries");
      } else {
        console.log("❌ Mood data not available or empty");
      }

      // Process fitness data
      if (fitnessResponse.success && fitnessResponse.data?.entries?.length > 0) {
        newTrackingData.fitness = fitnessResponse.data;
        hasAnyData = true;
        console.log("✅ Fitness data processed:", fitnessResponse.data.entries.length, "entries");
      } else if (fitnessResponse.success && Array.isArray(fitnessResponse.data) && fitnessResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.fitness = { entries: fitnessResponse.data };
        hasAnyData = true;
        console.log("✅ Fitness data processed (array format):", fitnessResponse.data.length, "entries");
      } else if (fitnessResponse.success === false && fitnessResponse.message === "Authentication required") {
        console.log("⚠️ Fitness data requires authentication - skipping");
      } else {
        console.log("❌ Fitness data not available or empty");
      }

      // Process water data
      if (waterResponse.success && waterResponse.data?.entries?.length > 0) {
        newTrackingData.water = waterResponse.data;
        hasAnyData = true;
        console.log("✅ Water data processed:", waterResponse.data.entries.length, "entries");
      } else if (waterResponse.success && Array.isArray(waterResponse.data) && waterResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.water = { entries: waterResponse.data };
        hasAnyData = true;
        console.log("✅ Water data processed (array format):", waterResponse.data.length, "entries");
      } else {
        console.log("❌ Water data not available or empty");
      }

      // Process sleep data
      if (sleepResponse.success && sleepResponse.data?.sleepData?.length > 0) {
        newTrackingData.sleep = sleepResponse.data;
        hasAnyData = true;
        console.log("✅ Sleep data processed:", sleepResponse.data.sleepData.length, "entries");
      } else if (sleepResponse.success && sleepResponse.sleepData?.length > 0) {
        // Handle case where data is in sleepData field
        newTrackingData.sleep = { sleepData: sleepResponse.sleepData };
        hasAnyData = true;
        console.log("✅ Sleep data processed (sleepData format):", sleepResponse.sleepData.length, "entries");
      } else if (sleepResponse.success && Array.isArray(sleepResponse.data) && sleepResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.sleep = { sleepData: sleepResponse.data };
        hasAnyData = true;
        console.log("✅ Sleep data processed (array format):", sleepResponse.data.length, "entries");
      } else {
        console.log("❌ Sleep data not available or empty");
      }

      // Process meal data
      if (mealResponse.success && mealResponse.data?.entries?.length > 0) {
        newTrackingData.meal = mealResponse.data;
        hasAnyData = true;
        console.log("✅ Meal data processed:", mealResponse.data.entries.length, "entries");
      } else if (mealResponse.success && Array.isArray(mealResponse.data) && mealResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.meal = { entries: mealResponse.data };
        hasAnyData = true;
        console.log("✅ Meal data processed (array format):", mealResponse.data.length, "entries");
      } else {
        console.log("❌ Meal data not available or empty");
      }

      // Process anthropometry data
      if (anthropometryResponse.success && anthropometryResponse.data?.length > 0) {
        newTrackingData.anthropometry = { entries: anthropometryResponse.data };
        hasAnyData = true;
        console.log("✅ Anthropometry data processed:", anthropometryResponse.data.length, "entries");
        console.log("🔍 Anthropometry data structure:", JSON.stringify(anthropometryResponse.data[0], null, 2));
      } else if (anthropometryResponse.success && Array.isArray(anthropometryResponse.data) && anthropometryResponse.data.length > 0) {
        // Handle case where data is directly an array
        newTrackingData.anthropometry = { entries: anthropometryResponse.data };
        hasAnyData = true;
        console.log("✅ Anthropometry data processed (array format):", anthropometryResponse.data.length, "entries");
        console.log("🔍 Anthropometry data structure:", JSON.stringify(anthropometryResponse.data[0], null, 2));
      } else {
        console.log("❌ Anthropometry data not available or empty");
        console.log("🔍 Anthropometry response:", JSON.stringify(anthropometryResponse, null, 2));
      }

      setTrackingData(newTrackingData);
      setHasData(hasAnyData);

      // Create tracking categories
      const categories: TrackingCategory[] = [
        {
          id: 'all',
          title: 'Semua',
          icon: 'view-dashboard',
          color: '#4CAF50',
          data: newTrackingData,
          hasData: hasAnyData
        },
        {
          id: 'mood',
          title: 'Mood', // TODO: translate to indonesia
          icon: 'emoticon',
          color: '#FF9800',
          data: newTrackingData.mood,
          hasData: newTrackingData.mood?.entries?.length > 0
        },
        {
          id: 'water',
          title: 'Air Minum',
          icon: 'cup-water',
          color: '#2196F3',
          data: newTrackingData.water,
          hasData: newTrackingData.water?.entries?.length > 0
        },
        {
          id: 'fitness',
          title: 'Fitness', // TODO: translate to indonesia
          icon: 'dumbbell',
          color: '#9C27B0',
          data: newTrackingData.fitness,
          hasData: newTrackingData.fitness?.entries?.length > 0
        },
        {
          id: 'sleep',
          title: 'Tidur',
          icon: 'sleep',
          color: '#673AB7',
          data: newTrackingData.sleep,
          hasData: newTrackingData.sleep?.sleepData?.length > 0
        },
        {
          id: 'meal',
          title: 'Makan',
          icon: 'food-apple',
          color: '#FF5722',
          data: newTrackingData.meal,
          hasData: newTrackingData.meal?.entries?.length > 0
        },
        {
          id: 'anthropometry',
          title: 'Antropometri',
          icon: 'human-male-height',
          color: '#795548',
          data: newTrackingData.anthropometry,
          hasData: newTrackingData.anthropometry?.entries?.length > 0
        }
      ];

      setTrackingCategories(categories);

      console.log("Tracking Data:", newTrackingData);
      console.log("Has Data:", hasAnyData);
      console.log("Categories:", categories);

    } catch (err) {
      console.error("Error fetching tracking data:", err);
      setError("Failed to load tracking data. Please try again.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    fetchTrackingData(true);
  };

  // Category Slider Component
  const CategorySlider = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categorySlider}
      contentContainerStyle={styles.categorySliderContent}
    >
      {trackingCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedCategory === category.id && styles.categoryItemActive,
            !category.hasData && styles.categoryItemDisabled
          ]}
          onPress={() => setSelectedCategory(category.id)}
          disabled={!category.hasData}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive,
            !category.hasData && styles.categoryTextDisabled
          ]}>
            {category.title}
          </Text>
          {category.hasData && (
            <View style={[
              styles.categoryBadge,
              { backgroundColor: category.color }
            ]}>
              <Text style={styles.categoryBadgeText}>
                {category.id === 'all' ? 
                  Object.values(trackingData).filter(data => 
                    data?.entries?.length > 0 || data?.sleepData?.length > 0
                  ).length :
                  category.id === 'sleep' ? 
                    category.data?.sleepData?.length || 0 :
                    category.data?.entries?.length || 0
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render content based on selected category
  const renderContent = () => {
    if (selectedCategory === 'all') {
      return (
        <>
          {trackingData.mood && trackingData.mood.entries?.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Pelacakan Mood</Text>
              {trackingData.mood.entries.map((entry: any, index: number) => (
                <Card key={index} style={styles.trackingCard}>
                  <Card.Content>
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingIconContainer}>
                        <Icon 
                          name={getMoodIcon(entry.mood_level)} 
                          size={24} 
                          color={getMoodColor(entry.mood_level)} 
                        />
                      </View>
                      <View style={styles.trackingInfo}>
                        <Text style={styles.trackingTitle}>
                          {entry.mood_level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          Skor: {entry.mood_score}/10
                        </Text>
                        {entry.tracking_time && (
                          <Text style={styles.trackingTime}>
                            {formatTime(entry.tracking_time)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.trackingScore}>
                        <Text style={[styles.trackingScoreValue, { color: getMoodColor(entry.mood_level) }]}>
                          {entry.mood_score}
                        </Text>
                        <Text style={styles.trackingScoreLabel}>/10</Text>
                      </View>
                    </View>
                    {entry.notes && (
                      <Text style={styles.trackingNotes}>{entry.notes}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}

          {trackingData.water && trackingData.water.entries?.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Air Minum</Text>
              {trackingData.water.entries.map((entry: any, index: number) => (
                <Card key={index} style={styles.trackingCard}>
                  <Card.Content>
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingIconContainer}>
                        <Icon name="cup-water" size={24} color="#2196F3" />
                      </View>
                      <View style={styles.trackingInfo}>
                        <Text style={styles.trackingTitle}>
                          {entry.amount_ml}ml Water
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          {entry.tracking_time && formatTime(entry.tracking_time)}
                        </Text>
                      </View>
                      <View style={styles.trackingScore}>
                        <Text style={[styles.trackingScoreValue, { color: "#2196F3" }]}>
                          {entry.amount_ml}
                        </Text>
                        <Text style={styles.trackingScoreLabel}>ml</Text>
                      </View>
                    </View>
                    {entry.notes && (
                      <Text style={styles.trackingNotes}>{entry.notes}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}

          {trackingData.fitness && trackingData.fitness.entries?.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Aktivitas Fitness</Text>
              {trackingData.fitness.entries.map((entry: any, index: number) => {
                const workoutParameters = getWorkoutParameters(entry);
                const actualNotes = getActualNotes(entry);
                
                return (
                  <Card key={index} style={styles.trackingCard}>
                    <Card.Content>
                      <View style={styles.trackingHeader}>
                        <View style={styles.trackingIconContainer}>
                          <Icon name={getActivityIcon(entry.activity_type)} size={24} color="#9C27B0" />
                        </View>
                        <View style={styles.trackingInfo}>
                          <Text style={styles.trackingTitle}>
                            {entry.activity_name || entry.activity_type}
                          </Text>
                          <Text style={styles.trackingSubtitle}>
                            {entry.duration_minutes || entry.exercise_minutes} minutes • {entry.calories_burned} calories
                          </Text>
                          {entry.tracking_time && (
                            <Text style={styles.trackingTime}>
                              {formatTime(entry.tracking_time)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.trackingScore}>
                          <Text style={[styles.trackingScoreValue, { color: "#9C27B0" }]}>
                            {entry.duration_minutes || entry.exercise_minutes}
                          </Text>
                          <Text style={styles.trackingScoreLabel}>min</Text>
                        </View>
                      </View>
                      
                      {/* Workout Parameters */}
                      {workoutParameters.length > 0 && (
                        <View style={styles.workoutParametersContainer}>
                          <Text style={styles.workoutParametersTitle}>Parameter Latihan:</Text>
                          <View style={styles.workoutParametersGrid}>
                            {workoutParameters.map((param, paramIndex) => (
                              <View key={paramIndex} style={styles.workoutParameterItem}>
                                <Text style={styles.workoutParameterLabel}>{param.label}</Text>
                                <Text style={styles.workoutParameterValue}>
                                  {param.value} {param.unit}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {/* Notes */}
                      {actualNotes && (
                        <Text style={styles.trackingNotes}>{actualNotes}</Text>
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}

          {trackingData.sleep && trackingData.sleep.sleepData?.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Pelacakan Tidur</Text>
              {trackingData.sleep.sleepData.map((entry: any, index: number) => (
                <Card key={index} style={styles.trackingCard}>
                  <Card.Content>
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingIconContainer}>
                        <Icon name="sleep" size={24} color="#673AB7" />
                      </View>
                      <View style={styles.trackingInfo}>
                        <Text style={styles.trackingTitle}>
                          {entry.sleep_hours || (entry.sleep_duration_minutes / 60).toFixed(1)} hours
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          {entry.bedtime} - {entry.wake_time}
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          Quality: {entry.sleep_quality}
                        </Text>
                      </View>
                      <View style={styles.trackingScore}>
                        <Text style={[styles.trackingScoreValue, { color: "#673AB7" }]}>
                          {entry.sleep_hours || (entry.sleep_duration_minutes / 60).toFixed(1)}
                        </Text>
                        <Text style={styles.trackingScoreLabel}>hrs</Text>
                      </View>
                    </View>
                    {entry.notes && (
                      <Text style={styles.trackingNotes}>{entry.notes}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}

          {trackingData.meal && trackingData.meal.entries?.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Pelacakan Makan</Text>
              {trackingData.meal.entries.map((entry: any, index: number) => (
                <Card key={index} style={styles.trackingCard}>
                  <Card.Content>
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingIconContainer}>
                        <Icon name="food-apple" size={24} color="#FF5722" />
                      </View>
                      <View style={styles.trackingInfo}>
                        <Text style={styles.trackingTitle}>
                          {entry.meal_type.charAt(0).toUpperCase() + entry.meal_type.slice(1)}
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          {entry.recorded_at && formatTime(entry.recorded_at.split('T')[1])}
                        </Text>
                      </View>
                      <View style={styles.trackingScore}>
                        <Text style={[styles.trackingScoreValue, { color: "#FF5722" }]}>
                          {entry.foods?.length || 0}
                        </Text>
                        <Text style={styles.trackingScoreLabel}>items</Text>
                      </View>
                    </View>
                    
                    {/* Food Items and Nutritional Content */}
                    {entry.foods && entry.foods.length > 0 && (
                      <View style={styles.foodItemsContainer}>
                        <Text style={styles.foodItemsTitle}>Makanan:</Text>
                        {entry.foods.map((food: any, foodIndex: number) => (
                          <View key={foodIndex} style={styles.foodItem}>
                            <View style={styles.foodItemHeader}>
                              <Text style={styles.foodItemName}>
                                {food.food_name_indonesian || food.food_name || 'Unknown Food'}
                              </Text>
                              <Text style={styles.foodItemQuantity}>
                                {food.quantity} {food.unit}
                              </Text>
                            </View>
                            <View style={styles.nutritionInfo}>
                              <View style={styles.nutritionItem}>
                                <Text style={styles.nutritionLabel}>Kalori</Text>
                                <Text style={styles.nutritionValue}>{Math.round(food.calories || 0)} kcal</Text>
                              </View>
                              <View style={styles.nutritionItem}>
                                <Text style={styles.nutritionLabel}>Protein</Text>
                                <Text style={styles.nutritionValue}>{parseFloat(food.protein || 0).toFixed(1)}g</Text>
                              </View>
                              <View style={styles.nutritionItem}>
                                <Text style={styles.nutritionLabel}>Karbohidrat</Text>
                                <Text style={styles.nutritionValue}>{parseFloat(food.carbs || 0).toFixed(1)}g</Text>
                              </View>
                              <View style={styles.nutritionItem}>
                                <Text style={styles.nutritionLabel}>Lemak</Text>
                                <Text style={styles.nutritionValue}>{parseFloat(food.fat || 0).toFixed(1)}g</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {entry.notes && (
                      <Text style={styles.trackingNotes}>{entry.notes}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </>
      );
    }

    // Render specific category
    const category = trackingCategories.find(cat => cat.id === selectedCategory);
    if (!category || !category.hasData) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name={category?.icon || "calendar-blank"} size={64} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.noDataTitle}>No {category?.title || 'Tracking'} Data</Text>
          <Text style={styles.noDataText}>
            No {category?.title?.toLowerCase() || 'tracking'} data found for {formatDate(selectedDate)}.
          </Text>
        </View>
      );
    }

    // Render specific category content
    switch (selectedCategory) {
      case 'mood':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pelacakan Mood</Text>
            {category.data.entries.map((entry: any, index: number) => (
              <Card key={index} style={styles.trackingCard}>
                <Card.Content>
                  <View style={styles.trackingHeader}>
                    <View style={styles.trackingIconContainer}>
                      <Icon 
                        name={getMoodIcon(entry.mood_level)} 
                        size={24} 
                        color={getMoodColor(entry.mood_level)} 
                      />
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingTitle}>
                        {entry.mood_level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        Skor: {entry.mood_score}/10
                      </Text>
                      {entry.tracking_time && (
                        <Text style={styles.trackingTime}>
                          {formatTime(entry.tracking_time)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.trackingScore}>
                      <Text style={[styles.trackingScoreValue, { color: getMoodColor(entry.mood_level) }]}>
                        {entry.mood_score}
                      </Text>
                      <Text style={styles.trackingScoreLabel}>/10</Text>
                    </View>
                  </View>
                  {entry.notes && (
                    <Text style={styles.trackingNotes}>{entry.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      case 'water':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Air Minum</Text>
            {category.data.entries.map((entry: any, index: number) => (
              <Card key={index} style={styles.trackingCard}>
                <Card.Content>
                  <View style={styles.trackingHeader}>
                    <View style={styles.trackingIconContainer}>
                      <Icon name="cup-water" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingTitle}>
                        {entry.amount_ml}ml Water
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        {entry.tracking_time && formatTime(entry.tracking_time)}
                      </Text>
                    </View>
                    <View style={styles.trackingScore}>
                      <Text style={[styles.trackingScoreValue, { color: "#2196F3" }]}>
                        {entry.amount_ml}
                      </Text>
                      <Text style={styles.trackingScoreLabel}>ml</Text>
                    </View>
                  </View>
                  {entry.notes && (
                    <Text style={styles.trackingNotes}>{entry.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      case 'fitness':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Aktivitas Fitness</Text>
            {category.data.entries.map((entry: any, index: number) => {
              const workoutParameters = getWorkoutParameters(entry);
              const actualNotes = getActualNotes(entry);
              
              return (
                <Card key={index} style={styles.trackingCard}>
                  <Card.Content>
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingIconContainer}>
                        <Icon name={getActivityIcon(entry.activity_type)} size={24} color="#9C27B0" />
                      </View>
                      <View style={styles.trackingInfo}>
                        <Text style={styles.trackingTitle}>
                          {entry.activity_name || entry.activity_type}
                        </Text>
                        <Text style={styles.trackingSubtitle}>
                          {entry.duration_minutes || entry.exercise_minutes} minutes • {entry.calories_burned} calories
                        </Text>
                        {entry.tracking_time && (
                          <Text style={styles.trackingTime}>
                            {formatTime(entry.tracking_time)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.trackingScore}>
                        <Text style={[styles.trackingScoreValue, { color: "#9C27B0" }]}>
                          {entry.duration_minutes || entry.exercise_minutes}
                        </Text>
                        <Text style={styles.trackingScoreLabel}>min</Text>
                      </View>
                    </View>
                    
                    {/* Workout Parameters */}
                    {workoutParameters.length > 0 && (
                      <View style={styles.workoutParametersContainer}>
                        <Text style={styles.workoutParametersTitle}>Parameter Latihan:</Text>
                        <View style={styles.workoutParametersGrid}>
                          {workoutParameters.map((param, paramIndex) => (
                            <View key={paramIndex} style={styles.workoutParameterItem}>
                              <Text style={styles.workoutParameterLabel}>{param.label}</Text>
                              <Text style={styles.workoutParameterValue}>
                                {param.value} {param.unit}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {/* Notes */}
                    {actualNotes && (
                      <Text style={styles.trackingNotes}>{actualNotes}</Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        );

      case 'sleep':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pelacakan Tidur</Text>
            {category.data.sleepData.map((entry: any, index: number) => (
              <Card key={index} style={styles.trackingCard}>
                <Card.Content>
                  <View style={styles.trackingHeader}>
                    <View style={styles.trackingIconContainer}>
                      <Icon name="sleep" size={24} color="#673AB7" />
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingTitle}>
                        {entry.sleep_hours || (entry.sleep_duration_minutes / 60).toFixed(1)} hours
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        {entry.bedtime} - {entry.wake_time}
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        Quality: {entry.sleep_quality}
                      </Text>
                    </View>
                    <View style={styles.trackingScore}>
                      <Text style={[styles.trackingScoreValue, { color: "#673AB7" }]}>
                        {entry.sleep_hours || (entry.sleep_duration_minutes / 60).toFixed(1)}
                      </Text>
                      <Text style={styles.trackingScoreLabel}>hrs</Text>
                    </View>
                  </View>
                  {entry.notes && (
                    <Text style={styles.trackingNotes}>{entry.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      case 'meal':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pelacakan Makan</Text>
            {category.data.entries.map((entry: any, index: number) => (
              <Card key={index} style={styles.trackingCard}>
                <Card.Content>
                  <View style={styles.trackingHeader}>
                    <View style={styles.trackingIconContainer}>
                      <Icon name="food-apple" size={24} color="#FF5722" />
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingTitle}>
                        {entry.meal_type.charAt(0).toUpperCase() + entry.meal_type.slice(1)}
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        {entry.recorded_at && formatTime(entry.recorded_at.split('T')[1])}
                      </Text>
                    </View>
                    <View style={styles.trackingScore}>
                      <Text style={[styles.trackingScoreValue, { color: "#FF5722" }]}>
                        {entry.foods?.length || 0}
                      </Text>
                      <Text style={styles.trackingScoreLabel}>items</Text>
                    </View>
                  </View>
                  
                  {/* Food Items and Nutritional Content */}
                  {entry.foods && entry.foods.length > 0 && (
                    <View style={styles.foodItemsContainer}>
                      <Text style={styles.foodItemsTitle}>Makanan:</Text>
                      {entry.foods.map((food: any, foodIndex: number) => (
                        <View key={foodIndex} style={styles.foodItem}>
                          <View style={styles.foodItemHeader}>
                            <Text style={styles.foodItemName}>
                              {food.food_name_indonesian || food.food_name || 'Unknown Food'}
                            </Text>
                            <Text style={styles.foodItemQuantity}>
                              {food.quantity} {food.unit}
                            </Text>
                          </View>
                          <View style={styles.nutritionInfo}>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Kalori</Text>
                              <Text style={styles.nutritionValue}>{Math.round(food.calories || 0)} kcal</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Protein</Text>
                              <Text style={styles.nutritionValue}>{parseFloat(food.protein || 0).toFixed(1)}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Karbohidrat</Text>
                              <Text style={styles.nutritionValue}>{parseFloat(food.carbs || 0).toFixed(1)}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionLabel}>Lemak</Text>
                              <Text style={styles.nutritionValue}>{parseFloat(food.fat || 0).toFixed(1)}g</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {entry.notes && (
                    <Text style={styles.trackingNotes}>{entry.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      case 'anthropometry':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Antropometri</Text>
            {category.data?.entries?.filter((entry: any) => entry).map((entry: any, index: number) => (
              <Card key={index} style={styles.trackingCard}>
                <Card.Content>
                  <View style={styles.trackingHeader}>
                    <View style={styles.trackingIconContainer}>
                      <Icon name="human-male-height" size={24} color="#795548" />
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingTitle}>
                        Pengukuran Antropometri
                      </Text>
                      <Text style={styles.trackingSubtitle}>
                        {entry.measured_date ? new Date(entry.measured_date).toLocaleDateString('id-ID') : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.trackingScore}>
                      <Text style={[styles.trackingScoreValue, { color: "#795548" }]}>
                        {entry.bmi && (typeof entry.bmi === 'number' || !isNaN(parseFloat(entry.bmi))) ? parseFloat(entry.bmi).toFixed(1) : 'N/A'}
                      </Text>
                      <Text style={styles.trackingScoreLabel}>BMI</Text>
                    </View>
                  </View>
                  
                  {/* Anthropometry Details */}
                  <View style={styles.anthropometryDetails}>
                    <View style={styles.anthropometryRow}>
                      <View style={styles.anthropometryItem}>
                        <Text style={styles.anthropometryLabel}>Berat Badan</Text>
                        <Text style={styles.anthropometryValue}>
                          {entry.weight && (typeof entry.weight === 'number' || !isNaN(parseFloat(entry.weight))) ? `${parseFloat(entry.weight)} kg` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.anthropometryItem}>
                        <Text style={styles.anthropometryLabel}>Tinggi Badan</Text>
                        <Text style={styles.anthropometryValue}>
                          {entry.height && (typeof entry.height === 'number' || !isNaN(parseFloat(entry.height))) ? `${parseFloat(entry.height)} cm` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.anthropometryRow}>
                      <View style={styles.anthropometryItem}>
                        <Text style={styles.anthropometryLabel}>BMI</Text>
                        <Text style={styles.anthropometryValue}>
                          {entry.bmi && (typeof entry.bmi === 'number' || !isNaN(parseFloat(entry.bmi))) ? `${parseFloat(entry.bmi).toFixed(1)} kg/m²` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.anthropometryItem}>
                        <Text style={styles.anthropometryLabel}>Kategori</Text>
                        <Text style={[styles.anthropometryValue, { color: getBMICategoryColor(entry.bmi_category || '') }]}>
                          {entry.bmi_category || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Progress Information */}
                    {(entry.weight_change !== null || entry.bmi_change !== null) && (
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>Progress:</Text>
                        {entry.weight_change !== null && (typeof entry.weight_change === 'number' || !isNaN(parseFloat(entry.weight_change))) && (
                          <Text style={[styles.progressText, { color: parseFloat(entry.weight_change) < 0 ? '#4CAF50' : '#F44336' }]}>
                            Berat: {parseFloat(entry.weight_change) > 0 ? '+' : ''}{parseFloat(entry.weight_change).toFixed(1)} kg
                            {entry.weight_change_percentage && (typeof entry.weight_change_percentage === 'number' || !isNaN(parseFloat(entry.weight_change_percentage))) && 
                              ` (${parseFloat(entry.weight_change_percentage) > 0 ? '+' : ''}${parseFloat(entry.weight_change_percentage).toFixed(1)}%)`}
                          </Text>
                        )}
                        {entry.bmi_change !== null && (typeof entry.bmi_change === 'number' || !isNaN(parseFloat(entry.bmi_change))) && (
                          <Text style={[styles.progressText, { color: parseFloat(entry.bmi_change) < 0 ? '#4CAF50' : '#F44336' }]}>
                            BMI: {parseFloat(entry.bmi_change) > 0 ? '+' : ''}{parseFloat(entry.bmi_change).toFixed(2)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  
                  {entry.notes && (
                    <Text style={styles.trackingNotes}>{entry.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMoodIcon = (moodLevel: string) => {
    const moodIcons: { [key: string]: string } = {
      'very_happy': 'emoticon-happy',
      'happy': 'emoticon-happy-outline',
      'neutral': 'emoticon-neutral',
      'sad': 'emoticon-sad',
      'very_sad': 'emoticon-cry'
    };
    return moodIcons[moodLevel] || 'emoticon-neutral';
  };

  const getBMICategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'Kurus': '#FF9800',
      'Normal': '#4CAF50',
      'Gemuk': '#FF5722',
      'Obesitas': '#F44336'
    };
    return categoryColors[category] || '#757575';
  };

  const getMoodColor = (moodLevel: string) => {
    const moodColors: { [key: string]: string } = {
      'very_happy': '#10B981',
      'happy': '#34D399',
      'neutral': '#F59E0B',
      'sad': '#F97316',
      'very_sad': '#EF4444'
    };
    return moodColors[moodLevel] || '#F59E0B';
  };

  const getActivityIcon = (activityType: string) => {
    const activityIcons: { [key: string]: string } = {
      'Weight Lifting': 'dumbbell',
      'Running': 'run',
      'Cycling': 'bike',
      'Swimming': 'swim',
      'Yoga': 'yoga',
      'Walking': 'walk',
      'Cardio': 'heart-pulse',
      'Strength Training': 'weight-lifter'
    };
    return activityIcons[activityType] || 'run';
  };

  // Function to extract workout parameters from notes
  const getWorkoutParameters = (entry: any) => {
    const workoutType = entry.workout_type || entry.activity_type;
    const workoutConfig = WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES];
    
    if (!workoutConfig) {
      console.log(`⚠️ No workout config found for: ${workoutType}`);
      return [];
    }

    const parameters: Array<{label: string, value: string, unit: string}> = [];
    console.log(`🔍 Processing parameters for ${workoutType}:`, {
      id: entry.id,
      workout_type: workoutType,
      exercise_minutes: entry.exercise_minutes,
      duration_minutes: entry.duration_minutes,
      distance_km: entry.distance_km,
      steps: entry.steps,
      intensity: entry.intensity,
      notes: entry.notes
    });
    
    // Track which parameters we've already added to avoid duplicates
    const addedParams = new Set<string>();
    
    // Add duration (always available)
    const duration = entry.exercise_minutes || entry.duration_minutes;
    if (duration && typeof duration === 'number' && duration > 0) {
      parameters.push({
        label: "Durasi",
        value: duration.toString(),
        unit: "menit"
      });
      addedParams.add("duration");
    }

    // Try to extract additional parameters from notes if it's JSON
    if (entry.notes) {
      try {
        const notesData = JSON.parse(entry.notes);
        if (notesData.workoutParameters) {
          const workoutParams = notesData.workoutParameters;
          
          console.log(`🔍 Workout params for ${workoutType}:`, workoutParams);
          
          // Add parameters based on workout type
          workoutConfig.parameters.forEach(param => {
            console.log(`🔍 Checking param ${param.name} for ${workoutType}:`, workoutParams[param.name]);
            
            if (workoutParams[param.name] && workoutParams[param.name] !== "") {
              parameters.push({
                label: param.label,
                value: workoutParams[param.name],
                unit: param.unit
              });
              addedParams.add(param.name);
            }
          });
        }
      } catch (error) {
        // If notes is not JSON, it's just a regular note
        // We'll handle this in the notes display
        console.log(`📝 Notes is not JSON for ${workoutType}:`, entry.notes);
      }
    }

    // Add fallback parameters from database fields if not already added from JSON
    // Only add distance for workout types that use distance (not Yoga)
    if (workoutType !== "Yoga" && !addedParams.has("distance_km") && entry.distance_km && typeof entry.distance_km === 'number' && entry.distance_km > 0) {
      parameters.push({
        label: "Jarak",
        value: entry.distance_km.toFixed(1),
        unit: "km"
      });
    }

    // Only add steps for workout types that use steps (Walking, Running)
    if ((workoutType === "Walking" || workoutType === "Running") && !addedParams.has("steps") && entry.steps && typeof entry.steps === 'number' && entry.steps > 0) {
      parameters.push({
        label: "Langkah",
        value: entry.steps.toLocaleString(),
        unit: "langkah"
      });
    }

    // Add intensity only for Yoga (from database field)
    if (workoutType === "Yoga" && !addedParams.has("intensity") && entry.intensity && typeof entry.intensity === 'string' && entry.intensity.trim() !== '') {
      parameters.push({
        label: "Intensitas",
        value: entry.intensity.charAt(0).toUpperCase() + entry.intensity.slice(1),
        unit: ""
      });
    }

    // Special handling for Swimming distance (convert to meters if stored as km)
    if (workoutType === "Swimming" && !addedParams.has("distance_m") && entry.distance_km && typeof entry.distance_km === 'number' && entry.distance_km > 0) {
      parameters.push({
        label: "Jarak",
        value: (entry.distance_km * 1000).toString(),
        unit: "m"
      });
    }



    return parameters;
  };

  // Function to get actual notes (not JSON parameters)
  const getActualNotes = (entry: any) => {
    if (!entry.notes) {
      return "";
    }

    try {
      const notesData = JSON.parse(entry.notes);
      return notesData.userNotes || "";
    } catch (error) {
      // If notes is not JSON, return as is
      return entry.notes;
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Memuat riwayat pelacakan...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchTrackingData(false)}>
              <Text style={styles.retryButtonText}>Tekan untuk mencoba lagi</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>Riwayat Pelacakan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={["#FFFFFF"]}
            />
          }
        >
          {/* Date Selector */}
          <SimpleDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            title="Pilih Tanggal Tracking"
            variant="dark"
          />

          {/* Category Slider */}
          {hasData && trackingCategories.length > 0 && (
            <View style={styles.categorySliderWrapper}>
              <CategorySlider />
            </View>
          )}

          {/* Content based on selected category */}
          {hasData ? renderContent() : (
            <View style={styles.noDataContainer}>
              <Icon name="calendar-blank" size={64} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.noDataTitle}>Tidak ada data pelacakan</Text>
              <Text style={styles.noDataText}>
                Tidak ada data pelacakan ditemukan untuk {formatDate(selectedDate)}. 
                Mulai melacak aktivitas kesehatan Anda untuk melihat riwayatnya di sini.
              </Text>
            </View>
          )}


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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  trackingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  trackingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  trackingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  trackingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  trackingTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  trackingScore: {
    alignItems: "flex-end",
  },
  trackingScoreValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  trackingScoreLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  trackingNotes: {
    fontSize: 14,
    color: "#64748B",
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  fitnessDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  fitnessDetail: {
    fontSize: 12,
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sleepDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  sleepDetail: {
    fontSize: 12,
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealDetails: {
    marginTop: 8,
  },
  mealDetailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  mealDetail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  datePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  datePicker: {
    width: "100%",
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  datePickerButtonPrimary: {
    backgroundColor: "#10B981",
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  datePickerButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Category Slider Styles
  categorySliderWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  categorySlider: {
    marginTop: 8,
    marginBottom: 8,
  },
  categorySliderContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
    minWidth: 80,
  },
  categoryItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  categoryItemDisabled: {
    opacity: 0.5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  categoryTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  categoryBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Food Items and Nutritional Content Styles
  foodItemsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  foodItemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  foodItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  foodItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  foodItemQuantity: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  nutritionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  nutritionItem: {
    alignItems: "center",
    minWidth: 60,
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  // Anthropometry Styles
  anthropometryDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  anthropometryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  anthropometryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  anthropometryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  anthropometryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  progressInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  // Workout Parameters Styles
  workoutParametersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  workoutParametersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  workoutParametersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  workoutParameterItem: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 80,
    alignItems: "center",
  },
  workoutParameterLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
    textAlign: "center",
  },
  workoutParameterValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});

export default WellnessDetailsScreen;
