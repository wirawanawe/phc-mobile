import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import ProgressRing from "../components/ProgressRing";

const { width } = Dimensions.get("window");

const HealthInsightsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  const weeklyData = [
    { day: "Mon", steps: 8500, calories: 2100, sleep: 7.5 },
    { day: "Tue", steps: 7200, calories: 1950, sleep: 8.0 },
    { day: "Wed", steps: 9100, calories: 2200, sleep: 7.0 },
    { day: "Thu", steps: 6800, calories: 1800, sleep: 8.5 },
    { day: "Fri", steps: 9500, calories: 2300, sleep: 7.8 },
    { day: "Sat", steps: 5500, calories: 1600, sleep: 9.0 },
    { day: "Sun", steps: 4200, calories: 1400, sleep: 8.2 },
  ];

  const healthMetrics = [
    {
      id: "1",
      title: "Heart Rate",
      value: "72",
      unit: "bpm",
      trend: "-3",
      trendPositive: true,
      icon: "heart-pulse",
      color: "#EF4444",
    },
    {
      id: "2",
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      trend: "Normal",
      trendPositive: true,
      icon: "heart",
      color: "#10B981",
    },
    {
      id: "3",
      title: "Sleep Quality",
      value: "85",
      unit: "%",
      trend: "+5",
      trendPositive: true,
      icon: "sleep",
      color: "#8B5CF6",
    },
    {
      id: "4",
      title: "Stress Level",
      value: "Low",
      unit: "",
      trend: "Stable",
      trendPositive: true,
      icon: "brain",
      color: "#3B82F6",
    },
  ];

  const recommendations = [
    {
      id: "1",
      title: "Increase Daily Steps",
      description:
        "Aim for 10,000 steps daily for better cardiovascular health",
      icon: "walk",
      color: "#10B981",
      priority: "High",
    },
    {
      id: "2",
      title: "Improve Sleep Schedule",
      description: "Try to maintain consistent sleep and wake times",
      icon: "sleep",
      color: "#8B5CF6",
      priority: "Medium",
    },
    {
      id: "3",
      title: "Hydration Reminder",
      description: "Drink 8 glasses of water daily for optimal health",
      icon: "water",
      color: "#3B82F6",
      priority: "Medium",
    },
    {
      id: "4",
      title: "Stress Management",
      description: "Practice 10 minutes of meditation daily",
      icon: "meditation",
      color: "#F59E0B",
      priority: "Low",
    },
  ];

  const renderHealthMetric = ({ item }: any) => (
    <View style={styles.healthMetricCard}>
      <View style={styles.healthMetricHeader}>
        <View
          style={[
            styles.healthMetricIcon,
            { backgroundColor: item.color + "20" },
          ]}
        >
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.healthMetricTitle}>{item.title}</Text>
      </View>
      <View style={styles.healthMetricValue}>
        <Text style={styles.healthMetricValueText}>
          {item.value}
          <Text style={styles.healthMetricUnit}> {item.unit}</Text>
        </Text>
      </View>
      <View style={styles.healthMetricTrend}>
        <Icon
          name={item.trendPositive ? "trending-up" : "trending-down"}
          size={14}
          color={item.trendPositive ? "#10B981" : "#EF4444"}
        />
        <Text
          style={[
            styles.healthMetricTrendText,
            { color: item.trendPositive ? "#10B981" : "#EF4444" },
          ]}
        >
          {item.trend}
        </Text>
      </View>
    </View>
  );

  const renderRecommendation = ({ item }: any) => (
    <TouchableOpacity style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <View
          style={[
            styles.recommendationIcon,
            { backgroundColor: item.color + "20" },
          ]}
        >
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.recommendationContent}>
          <Text style={styles.recommendationTitle}>{item.title}</Text>
          <Text style={styles.recommendationDescription}>
            {item.description}
          </Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor:
                item.priority === "High"
                  ? "#EF4444"
                  : item.priority === "Medium"
                  ? "#F59E0B"
                  : "#10B981",
            },
          ]}
        >
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWeeklyBar = ({ item, index }: any) => {
    const maxSteps = Math.max(...weeklyData.map((d) => d.steps));
    const barHeight = (item.steps / maxSteps) * 60;

    return (
      <View style={styles.weeklyBarContainer}>
        <View
          style={[
            styles.weeklyBar,
            {
              height: barHeight,
              backgroundColor: index === 6 ? "#E22345" : "#E5E7EB",
            },
          ]}
        />
        <Text style={styles.weeklyBarLabel}>{item.day}</Text>
        <Text style={styles.weeklyBarValue}>{item.steps}</Text>
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
            <Text style={styles.headerTitle}>Health Insights</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-variant" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Overall Health Score */}
          <View style={styles.healthScoreContainer}>
            <Text style={styles.sectionTitle}>Overall Health Score</Text>
            <View style={styles.healthScoreContent}>
              <ProgressRing
                progress={78}
                size={120}
                strokeWidth={12}
                strokeColor="#E22345"
              >
                <Text style={styles.healthScoreValue}>78</Text>
                <Text style={styles.healthScoreLabel}>Excellent</Text>
              </ProgressRing>
              <View style={styles.healthScoreDetails}>
                <Text style={styles.healthScoreDescription}>
                  Your health score is based on your daily activities, sleep
                  quality, and vital signs.
                </Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <Icon name="arrow-right" size={16} color="#E22345" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View style={styles.weeklyChartContainer}>
            <Text style={styles.sectionTitle}>Weekly Steps</Text>
            <View style={styles.weeklyChart}>
              {weeklyData.map((item, index) => (
                <View key={index} style={styles.weeklyBarContainer}>
                  <View
                    style={[
                      styles.weeklyBar,
                      {
                        height: (item.steps / 10000) * 80,
                        backgroundColor: index === 6 ? "#E22345" : "#E5E7EB",
                      },
                    ]}
                  />
                  <Text style={styles.weeklyBarLabel}>{item.day}</Text>
                  <Text style={styles.weeklyBarValue}>
                    {(item.steps / 1000).toFixed(1)}k
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Health Metrics */}
          <View style={styles.healthMetricsContainer}>
            <Text style={styles.sectionTitle}>Vital Signs</Text>
            <View style={styles.healthMetricsGrid}>
              {healthMetrics.map((metric) => (
                <View key={metric.id} style={styles.healthMetricCard}>
                  <View style={styles.healthMetricHeader}>
                    <View
                      style={[
                        styles.healthMetricIcon,
                        { backgroundColor: metric.color + "20" },
                      ]}
                    >
                      <Icon name={metric.icon} size={20} color={metric.color} />
                    </View>
                    <Text style={styles.healthMetricTitle}>{metric.title}</Text>
                  </View>
                  <View style={styles.healthMetricValue}>
                    <Text style={styles.healthMetricValueText}>
                      {metric.value}
                      <Text style={styles.healthMetricUnit}>
                        {" "}
                        {metric.unit}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.healthMetricTrend}>
                    <Icon
                      name={
                        metric.trendPositive ? "trending-up" : "trending-down"
                      }
                      size={14}
                      color={metric.trendPositive ? "#10B981" : "#EF4444"}
                    />
                    <Text
                      style={[
                        styles.healthMetricTrendText,
                        { color: metric.trendPositive ? "#10B981" : "#EF4444" },
                      ]}
                    >
                      {metric.trend}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Health Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>
              Personalized Recommendations
            </Text>
            <View style={styles.recommendationsList}>
              {recommendations.map((recommendation) => (
                <TouchableOpacity
                  key={recommendation.id}
                  style={styles.recommendationCard}
                >
                  <View style={styles.recommendationHeader}>
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
                      <Text style={styles.recommendationTitle}>
                        {recommendation.title}
                      </Text>
                      <Text style={styles.recommendationDescription}>
                        {recommendation.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            recommendation.priority === "High"
                              ? "#EF4444"
                              : recommendation.priority === "Medium"
                              ? "#F59E0B"
                              : "#10B981",
                        },
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {recommendation.priority}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
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
  shareButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  healthScoreContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  healthScoreContent: {
    flexDirection: "row",
    alignItems: "center",
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
  healthScoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E22345",
    letterSpacing: -0.5,
  },
  healthScoreLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 2,
  },
  healthScoreDetails: {
    flex: 1,
    marginLeft: 20,
  },
  healthScoreDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  learnMoreText: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
    marginRight: 4,
  },
  weeklyChartContainer: {
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
  weeklyBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
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
  healthMetricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  healthMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  healthMetricCard: {
    width: (width - 60) / 2,
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
  healthMetricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  healthMetricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  healthMetricTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  healthMetricValue: {
    marginBottom: 8,
  },
  healthMetricValueText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  healthMetricUnit: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  healthMetricTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthMetricTrendText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationCard: {
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
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recommendationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});

export default HealthInsightsScreen;
