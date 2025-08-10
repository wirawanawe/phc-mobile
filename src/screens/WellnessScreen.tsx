import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";

const WellnessScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("fitness");
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);

  const categories = [
    { id: "fitness", name: "Fitness", icon: "dumbbell", color: "#EF4444" },
    { id: "yoga", name: "Yoga", icon: "yoga", color: "#8B5CF6" },
    { id: "meditation", name: "Meditation", icon: "meditation", color: "#10B981" },
    { id: "cardio", name: "Cardio", icon: "heart-pulse", color: "#F59E0B" },
  ];

  const quickActivities = [
    {
      id: "1",
      name: "Jogging",
      category: "Cardio",
      duration_minutes: 30,
      calories_burned: 300,
      icon: "run",
      color: "#F59E0B",
    },
    {
      id: "2",
      name: "Yoga Flow",
      category: "Yoga",
      duration_minutes: 45,
      calories_burned: 150,
      icon: "yoga",
      color: "#8B5CF6",
    },
    {
      id: "3",
      name: "Weight Training",
      category: "Fitness",
      duration_minutes: 60,
      calories_burned: 400,
      icon: "dumbbell",
      color: "#EF4444",
    },
    {
      id: "4",
      name: "Meditation",
      category: "Meditation",
      duration_minutes: 20,
      calories_burned: 50,
      icon: "meditation",
      color: "#10B981",
    },
  ];

  const addQuickActivity = (activity: any) => {
    setSelectedActivities(prev => [...prev, activity]);
    Alert.alert("Success", `${activity.name} added to your wellness session!`);
  };

  const removeActivity = (index: number) => {
    setSelectedActivities(prev => prev.filter((_, i) => i !== index));
  };

  const saveWellnessSession = () => {
    if (selectedActivities.length === 0) {
      Alert.alert("No Activity Selected", "Please add at least one activity to your wellness session");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to save your wellness session");
      return;
    }

    Alert.alert("Success", "Wellness session saved successfully!");
    setSelectedActivities([]);
  };

  const renderCategoryTab = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Icon
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? "#FFFFFF" : item.color}
      />
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.selectedCategoryTabText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderQuickActivity = ({ item }: any) => (
    <TouchableOpacity
      style={styles.quickActivityCard}
      onPress={() => addQuickActivity(item)}
    >
      <LinearGradient
        colors={[item.color, item.color + "80"]}
        style={styles.quickActivityIcon}
      >
        <Icon name={item.icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.quickActivityInfo}>
        <Text style={styles.quickActivityName}>{item.name}</Text>
        <Text style={styles.quickActivityDetails}>
          {item.duration_minutes} min • {item.calories_burned} cal
        </Text>
      </View>
    </TouchableOpacity>
  );

  const totalDuration = selectedActivities.reduce((sum, activity) => sum + activity.duration_minutes, 0);
  const totalCalories = selectedActivities.reduce((sum, activity) => sum + activity.calories_burned, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Session</Text>
        <TouchableOpacity>
          <Icon name="magnify" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsList}
          />
        </View>

        {/* Quick Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={quickActivities}
            renderItem={renderQuickActivity}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActivitiesList}
          />
        </View>

        {/* Selected Activities */}
        {selectedActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selected Activities</Text>
              <Text style={styles.selectedCount}>{selectedActivities.length} activities</Text>
            </View>
            <View style={styles.selectedActivitiesContainer}>
              {selectedActivities.map((activity, index) => (
                <View key={index} style={styles.selectedActivityCard}>
                  <View style={styles.selectedActivityInfo}>
                    <Icon
                      name={activity.icon}
                      size={20}
                      color={activity.color}
                    />
                    <View style={styles.selectedActivityDetails}>
                      <Text style={styles.selectedActivityName}>{activity.name}</Text>
                      <Text style={styles.selectedActivityStats}>
                        {activity.duration_minutes} min • {activity.calories_burned} cal
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeActivity(index)}
                  >
                    <Icon name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Session Summary */}
            <View style={styles.sessionSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Duration</Text>
                <Text style={styles.summaryValue}>{totalDuration} min</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Calories</Text>
                <Text style={styles.summaryValue}>{totalCalories} cal</Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={saveWellnessSession}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}
            >
              Save Wellness Session
            </Button>
          </View>
        )}

        {/* Wellness Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.statIconContainer}
              >
                <Icon name="clock-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.statIconContainer}
              >
                <Icon name="fire" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>250</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={styles.statIconContainer}
              >
                <Icon name="check-circle" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.statIconContainer}
              >
                <Icon name="flame" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  categoryTabsContainer: {
    marginVertical: 20,
  },
  categoryTabsList: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  selectedCategoryTab: {
    backgroundColor: "#3B82F6",
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectedCategoryTabText: {
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  quickActivitiesList: {
    paddingHorizontal: 20,
  },
  quickActivityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  quickActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickActivityInfo: {
    flex: 1,
  },
  quickActivityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  quickActivityDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  selectedActivitiesContainer: {
    paddingHorizontal: 20,
  },
  selectedActivityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedActivityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedActivityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  selectedActivityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  selectedActivityStats: {
    fontSize: 12,
    color: "#6B7280",
  },
  removeButton: {
    padding: 8,
  },
  selectedCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  sessionSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  saveButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default WellnessScreen;
