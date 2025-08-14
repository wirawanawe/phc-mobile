import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { safeGoBack } from "../utils/safeNavigation";

const AllCalculatorsScreen = ({ navigation }: any) => {
  // All Calculator Programs Data
  const allCalculatorPrograms = [
    {
      id: "1",
      title: "BMI Calculator",
      description: "Calculate your Body Mass Index",
      icon: "scale-bathroom",
      color: "#10B981",
    },
    {
      id: "2",
      title: "PHQ-9 Assessment",
      description: "Depression screening tool",
      icon: "brain",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "GAD-7 Assessment",
      description: "Anxiety screening tool",
      icon: "heart-pulse",
      color: "#8B5CF6",
    },
    {
      id: "4",
      title: "Calorie Calculator",
      description: "Calculate daily calorie needs",
      icon: "calculator",
      color: "#F59E0B",
    },
    {
      id: "5",
      title: "Water Intake",
      description: "Calculate daily water needs",
      icon: "water",
      color: "#06B6D4",
    },
    {
      id: "6",
      title: "Sleep Tracker",
      description: "Track your sleep patterns",
      icon: "sleep",
      color: "#6366F1",
    },
    {
      id: "7",
      title: "Body Fat Calculator",
      description: "Calculate body fat percentage",
      icon: "human",
      color: "#EC4899",
    },
    {
      id: "8",
      title: "BMR Calculator",
      description: "Calculate Basal Metabolic Rate",
      icon: "fire",
      color: "#F97316",
    },
    {
      id: "9",
      title: "TDEE Calculator",
      description: "Total Daily Energy Expenditure",
      icon: "lightning-bolt",
      color: "#EAB308",
    },
    {
      id: "10",
      title: "Macro Calculator",
      description: "Calculate macronutrient needs",
      icon: "food-apple",
      color: "#22C55E",
    },
    {
      id: "11",
      title: "Heart Rate Zone",
      description: "Calculate target heart rate zones",
      icon: "heart-pulse",
      color: "#EF4444",
    },
    {
      id: "12",
      title: "Pregnancy Calculator",
      description: "Pregnancy due date calculator",
      icon: "baby-face",
      color: "#F472B6",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => safeGoBack(navigation, 'Main')}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Calculators</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.banner}>
            <Icon name="calculator" size={32} color="#FFFFFF" />
            <Text style={styles.bannerTitle}>Health Calculators</Text>
            <Text style={styles.bannerDescription}>
              Access all our health and wellness calculators
            </Text>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesRow}>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Nutrition</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Mental Health</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Calculators Grid */}
        <View style={styles.calculatorsContainer}>
          <Text style={styles.sectionTitle}>Available Calculators</Text>
          <View style={styles.calculatorsGrid}>
            {allCalculatorPrograms.map((program) => (
              <TouchableOpacity
                key={program.id}
                style={styles.calculatorCard}
                onPress={() => navigation.navigate("Calculator", { program })}
              >
                <View
                  style={[
                    styles.calculatorIcon,
                    { backgroundColor: program.color + "20" },
                  ]}
                >
                  <Icon name={program.icon} size={24} color={program.color} />
                </View>
                <Text style={styles.calculatorTitle}>{program.title}</Text>
                <Text style={styles.calculatorDescription}>
                  {program.description}
                </Text>
                <View style={styles.calculatorArrow}>
                  <Icon name="chevron-right" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity style={styles.quickAccessCard}>
              <Icon name="star" size={20} color="#F59E0B" />
              <Text style={styles.quickAccessText}>Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <Icon name="history" size={20} color="#6366F1" />
              <Text style={styles.quickAccessText}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <Icon name="download" size={20} color="#10B981" />
              <Text style={styles.quickAccessText}>Download</Text>
            </TouchableOpacity>
          </View>
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
  searchButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  banner: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  calculatorsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  calculatorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  calculatorCard: {
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
    borderColor: "#E2E8F0",
    position: "relative",
  },
  calculatorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 20,
  },
  calculatorDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 12,
  },
  calculatorArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  quickAccessContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 6,
  },
});

export default AllCalculatorsScreen;
