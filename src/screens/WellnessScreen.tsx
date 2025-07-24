import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, Chip, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTheme } from "../theme/theme";

const WellnessScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Activities" },
    { id: "yoga", label: "Yoga & Meditation" },
    { id: "fitness", label: "Group Fitness" },
    { id: "nutrition", label: "Nutrition" },
    { id: "mental", label: "Mental Health" },
    { id: "social", label: "Social Wellness" },
  ];

  const activities = [
    {
      id: "1",
      title: "Morning Yoga Session",
      description: "Start your day with gentle yoga and meditation",
      category: "yoga",
      duration: 30,
      participants: 12,
      maxParticipants: 20,
      date: "2024-01-20",
      time: "07:00 AM",
      location: "Conference Room A",
      points: 25,
      instructor: "Sarah Johnson",
      icon: "🧘‍♀️",
    },
    {
      id: "2",
      title: "Lunch Break Walking Group",
      description: "Join colleagues for a refreshing walk during lunch",
      category: "fitness",
      duration: 20,
      participants: 8,
      maxParticipants: 15,
      date: "2024-01-20",
      time: "12:00 PM",
      location: "Office Park",
      points: 15,
      instructor: "Mike Chen",
      icon: "🚶‍♂️",
    },
    {
      id: "3",
      title: "Healthy Cooking Workshop",
      description: "Learn to prepare nutritious meals for busy professionals",
      category: "nutrition",
      duration: 60,
      participants: 6,
      maxParticipants: 12,
      date: "2024-01-21",
      time: "05:00 PM",
      location: "Kitchen Area",
      points: 40,
      instructor: "Lisa Rodriguez",
      icon: "👨‍🍳",
    },
    {
      id: "4",
      title: "Stress Management Seminar",
      description: "Learn effective techniques to manage workplace stress",
      category: "mental",
      duration: 45,
      participants: 18,
      maxParticipants: 25,
      date: "2024-01-22",
      time: "03:00 PM",
      location: "Training Room",
      points: 30,
      instructor: "Dr. Emma Wilson",
      icon: "🧠",
    },
    {
      id: "5",
      title: "Team Building Exercise",
      description: "Fun team activities to build camaraderie and wellness",
      category: "social",
      duration: 90,
      participants: 15,
      maxParticipants: 30,
      date: "2024-01-23",
      time: "04:00 PM",
      location: "Outdoor Area",
      points: 35,
      instructor: "David Kim",
      icon: "🤝",
    },
    {
      id: "6",
      title: "Evening Meditation Circle",
      description: "Unwind with guided meditation and mindfulness",
      category: "yoga",
      duration: 25,
      participants: 10,
      maxParticipants: 18,
      date: "2024-01-23",
      time: "06:00 PM",
      location: "Quiet Room",
      points: 20,
      instructor: "Sarah Johnson",
      icon: "🧘‍♂️",
    },
  ];

  const filteredActivities = activities.filter(
    (activity) =>
      selectedCategory === "all" || activity.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "yoga":
        return theme.customColors.lightGreen;
      case "fitness":
        return theme.customColors.lightRed;
      case "nutrition":
        return theme.customColors.lightGreen;
      case "mental":
        return theme.customColors.lightRed;
      case "social":
        return theme.customColors.lightGreen;
      default:
        return theme.customColors.lightGreen;
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case "yoga":
        return theme.customColors.darkGreen;
      case "fitness":
        return theme.customColors.darkRed;
      case "nutrition":
        return theme.customColors.darkGreen;
      case "mental":
        return theme.customColors.darkRed;
      case "social":
        return theme.customColors.darkGreen;
      default:
        return theme.customColors.darkGreen;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Activity Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? theme.colors.primary
                          : theme.customColors.lightGreen,
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    {
                      color:
                        selectedCategory === category.id
                          ? theme.colors.onPrimary
                          : theme.customColors.darkGreen,
                    },
                  ]}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Upcoming Activities
          </Text>
          {filteredActivities.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <Card.Content>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[
                        styles.activityTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.title}
                    </Text>
                    <Text
                      style={[
                        styles.activityDescription,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.description}
                    </Text>
                  </View>
                  <View style={styles.activityPoints}>
                    <Text
                      style={[
                        styles.pointsText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {activity.points}
                    </Text>
                    <Text
                      style={[
                        styles.pointsLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      points
                    </Text>
                  </View>
                </View>

                <View style={styles.activityDetails}>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📅 Date:
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.date}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      ⏰ Time:
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📍 Location:
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.location}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      👨‍🏫 Instructor:
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.instructor}
                    </Text>
                  </View>
                </View>

                <View style={styles.activityFooter}>
                  <View style={styles.participantsInfo}>
                    <Text
                      style={[
                        styles.participantsText,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.participants}/{activity.maxParticipants}{" "}
                      participants
                    </Text>
                    <Text
                      style={[
                        styles.durationText,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.duration} min
                    </Text>
                  </View>

                  <Chip
                    compact
                    style={[
                      styles.categoryChip,
                      { backgroundColor: getCategoryColor(activity.category) },
                    ]}
                    textStyle={[
                      styles.categoryText,
                      { color: getCategoryTextColor(activity.category) },
                    ]}
                  >
                    {
                      categories.find((cat) => cat.id === activity.category)
                        ?.label
                    }
                  </Chip>
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    /* Join activity */
                  }}
                  disabled={activity.participants >= activity.maxParticipants}
                  style={[
                    styles.joinButton,
                    {
                      backgroundColor:
                        activity.participants >= activity.maxParticipants
                          ? theme.colors.surfaceVariant
                          : theme.colors.primary,
                    },
                  ]}
                  labelStyle={styles.joinButtonLabel}
                >
                  {activity.participants >= activity.maxParticipants
                    ? "Full"
                    : "Join Activity"}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Featured Wellness Tips */}
        <View style={styles.tipsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Wellness Tips
          </Text>
          <Card
            style={[
              styles.tipsCard,
              { backgroundColor: theme.customColors.lightGreen },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.tipsTitle,
                  { color: theme.customColors.darkGreen },
                ]}
              >
                💡 Daily Wellness Reminders
              </Text>
              <View style={styles.tipsList}>
                <Text
                  style={[styles.tipItem, { color: theme.colors.onBackground }]}
                >
                  • Take regular breaks from your computer screen
                </Text>
                <Text
                  style={[styles.tipItem, { color: theme.colors.onBackground }]}
                >
                  • Stay hydrated throughout the day
                </Text>
                <Text
                  style={[styles.tipItem, { color: theme.colors.onBackground }]}
                >
                  • Practice deep breathing exercises
                </Text>
                <Text
                  style={[styles.tipItem, { color: theme.colors.onBackground }]}
                >
                  • Connect with colleagues during breaks
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: "row",
    paddingRight: 20,
  },
  chip: {
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activityCard: {
    marginBottom: 15,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  activityIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  activityPoints: {
    alignItems: "center",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pointsLabel: {
    fontSize: 12,
  },
  activityDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  participantsInfo: {
    flex: 1,
  },
  participantsText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  durationText: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryChip: {
    height: 24,
  },
  categoryText: {
    fontSize: 10,
  },
  joinButton: {
    borderRadius: 20,
  },
  joinButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tipsContainer: {
    paddingHorizontal: 20,
  },
  tipsCard: {
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tipsList: {
    marginLeft: 10,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default WellnessScreen;
