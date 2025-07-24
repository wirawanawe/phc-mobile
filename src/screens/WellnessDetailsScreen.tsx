import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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

const WellnessDetailsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  const wellnessMetrics = [
    {
      id: "1",
      title: "Physical Health",
      score: 78,
      color: "#10B981",
      icon: "heart-pulse",
      details: "Based on your activity, sleep, and vital signs",
    },
    {
      id: "2",
      title: "Mental Wellness",
      score: 65,
      color: "#8B5CF6",
      icon: "brain",
      details: "Based on stress levels and mood tracking",
    },
    {
      id: "3",
      title: "Nutrition",
      score: 82,
      color: "#F59E0B",
      icon: "food-apple",
      details: "Based on your daily food intake and hydration",
    },
    {
      id: "4",
      title: "Social Connection",
      score: 71,
      color: "#3B82F6",
      icon: "account-group",
      details: "Based on social interactions and support network",
    },
  ];

  const weeklyProgress = [
    { day: "Mon", score: 45 },
    { day: "Tue", score: 52 },
    { day: "Wed", score: 48 },
    { day: "Thu", score: 61 },
    { day: "Fri", score: 58 },
    { day: "Sat", score: 67 },
    { day: "Sun", score: 54 },
  ];

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
        <Text style={styles.headerTitle}>Wellness Details</Text>
        <Icon name="dots-vertical" size={24} color="#1F2937" />
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Overall Wellness Score */}
        <View style={styles.overallScoreContainer}>
          <Text style={styles.sectionTitle}>Overall Wellness Score</Text>
          <View style={styles.scoreCircleContainer}>
            <ProgressRing
              progress={54}
              size={150}
              strokeWidth={15}
              strokeColor="#F59E0B"
            >
              <Text style={styles.overallScoreValue}>54</Text>
              <Text style={styles.overallScoreLabel}>Good</Text>
            </ProgressRing>
          </View>
          <Text style={styles.scoreDescription}>
            Your wellness score is based on multiple factors including physical
            health, mental wellness, nutrition, and social connections.
          </Text>
        </View>

        {/* Detailed Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>
          {wellnessMetrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={styles.metricIconContainer}>
                  <Icon name={metric.icon} size={24} color={metric.color} />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <Text style={styles.metricDetails}>{metric.details}</Text>
                </View>
                <View style={styles.metricScore}>
                  <Text
                    style={[styles.metricScoreValue, { color: metric.color }]}
                  >
                    {metric.score}
                  </Text>
                  <Text style={styles.metricScoreLabel}>/100</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${metric.score}%`,
                        backgroundColor: metric.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Progress */}
        <View style={styles.weeklyContainer}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.weeklyChart}>
            {weeklyProgress.map((item, index) => (
              <View key={index} style={styles.weeklyBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.score / 100) * 120}%`,
                        backgroundColor:
                          item.score >= 60 ? "#10B981" : "#F59E0B",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationCard}>
            <Icon name="lightbulb" size={24} color="#F59E0B" />
            <Text style={styles.recommendationText}>
              Try to increase your daily step count to improve your physical
              health score.
            </Text>
          </View>
          <View style={styles.recommendationCard}>
            <Icon name="meditation" size={24} color="#8B5CF6" />
            <Text style={styles.recommendationText}>
              Practice mindfulness exercises to boost your mental wellness.
            </Text>
          </View>
          <View style={styles.recommendationCard}>
            <Icon name="water" size={24} color="#3B82F6" />
            <Text style={styles.recommendationText}>
              Increase your water intake to improve your nutrition score.
            </Text>
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
  overallScoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  scoreCircleContainer: {
    marginVertical: 20,
  },
  overallScoreValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: -1,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 4,
  },
  scoreDescription: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  metricDetails: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  metricScore: {
    alignItems: "flex-end",
  },
  metricScoreValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  metricScoreLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  weeklyContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 20,
  },
  weeklyBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  barContainer: {
    width: 24,
    height: 120,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  bar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 12,
    fontWeight: "500",
  },
});

export default WellnessDetailsScreen;
