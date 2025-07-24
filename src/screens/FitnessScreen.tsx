import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  ProgressBar,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTheme } from "../theme/theme";

const FitnessScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);

  const challenges = [
    {
      id: "1",
      title: "Step Challenge",
      description: "Walk 10,000 steps daily for a week",
      icon: "👟",
      points: 100,
      progress: 0.7,
      participants: 45,
      endDate: "2024-01-22",
      category: "Cardio",
    },
    {
      id: "2",
      title: "Office Yoga",
      description: "Complete 5 yoga sessions this week",
      icon: "🧘‍♀️",
      points: 75,
      progress: 0.4,
      participants: 28,
      endDate: "2024-01-20",
      category: "Flexibility",
    },
    {
      id: "3",
      title: "Hydration Hero",
      description: "Drink 8 glasses of water daily",
      icon: "💧",
      points: 50,
      progress: 0.9,
      participants: 67,
      endDate: "2024-01-25",
      category: "Wellness",
    },
  ];

  const activities = [
    {
      id: "1",
      name: "Desk Stretches",
      description: "Simple stretches you can do at your desk",
      calories: 15,
      duration: 5,
      difficulty: "easy",
      points: 10,
      completed: false,
    },
    {
      id: "2",
      name: "Office Walk",
      description: "Take a 10-minute walk around the office",
      calories: 45,
      duration: 10,
      difficulty: "easy",
      points: 15,
      completed: true,
    },
    {
      id: "3",
      name: "Stair Climbing",
      description: "Use stairs instead of elevator",
      calories: 80,
      duration: 15,
      difficulty: "medium",
      points: 25,
      completed: false,
    },
    {
      id: "4",
      name: "Lunch Break Workout",
      description: "Quick workout during lunch break",
      calories: 120,
      duration: 20,
      difficulty: "medium",
      points: 30,
      completed: false,
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", points: 1850, department: "Marketing" },
    { rank: 2, name: "Mike Chen", points: 1720, department: "Engineering" },
    { rank: 3, name: "Lisa Rodriguez", points: 1680, department: "HR" },
    { rank: 4, name: "David Kim", points: 1550, department: "Sales" },
    { rank: 5, name: "Emma Wilson", points: 1420, department: "Finance" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return theme.customColors.lightGreen;
      case "medium":
        return theme.customColors.lightRed;
      case "hard":
        return theme.colors.primary;
      default:
        return theme.customColors.lightGreen;
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return theme.customColors.darkGreen;
      case "medium":
        return theme.customColors.darkRed;
      case "hard":
        return theme.colors.onPrimary;
      default:
        return theme.customColors.darkGreen;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Stats */}
        <View style={styles.statsContainer}>
          <Card
            style={[
              styles.statsCard,
              { backgroundColor: theme.customColors.lightGreen },
            ]}
          >
            <Card.Content>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: theme.customColors.darkGreen },
                    ]}
                  >
                    {userPoints}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    Total Points
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: theme.customColors.darkGreen },
                    ]}
                  >
                    Level {userLevel}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    Current Level
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={0.75}
                color={theme.customColors.darkGreen}
                style={styles.levelProgress}
              />
              <Text
                style={[styles.levelText, { color: theme.colors.onBackground }]}
              >
                750 points to next level
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Active Challenges */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Active Challenges
          </Text>
          {challenges.map((challenge) => (
            <Card key={challenge.id} style={styles.challengeCard}>
              <Card.Content>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                  <View style={styles.challengeInfo}>
                    <Text
                      style={[
                        styles.challengeTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {challenge.title}
                    </Text>
                    <Text
                      style={[
                        styles.challengeDescription,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {challenge.description}
                    </Text>
                  </View>
                  <View style={styles.challengePoints}>
                    <Text
                      style={[
                        styles.pointsText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {challenge.points}
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

                <View style={styles.challengeProgress}>
                  <ProgressBar
                    progress={challenge.progress}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.progressText,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {Math.round(challenge.progress * 100)}% Complete
                  </Text>
                </View>

                <View style={styles.challengeFooter}>
                  <Chip
                    compact
                    style={[
                      styles.categoryChip,
                      { backgroundColor: theme.customColors.lightRed },
                    ]}
                    textStyle={[
                      styles.categoryText,
                      { color: theme.customColors.darkRed },
                    ]}
                  >
                    {challenge.category}
                  </Chip>
                  <Text
                    style={[
                      styles.participantsText,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {challenge.participants} participants
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Quick Activities */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Quick Activities
          </Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <Card
                key={activity.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: activity.completed
                      ? theme.customColors.lightGreen
                      : getDifficultyColor(activity.difficulty),
                  },
                ]}
              >
                <Card.Content style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityName,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {activity.name}
                  </Text>
                  <Text
                    style={[
                      styles.activityDescription,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {activity.description}
                  </Text>

                  <View style={styles.activityStats}>
                    <View style={styles.activityStat}>
                      <Text
                        style={[
                          styles.statValue,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {activity.calories}
                      </Text>
                      <Text
                        style={[
                          styles.statUnit,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        cal
                      </Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text
                        style={[
                          styles.statValue,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {activity.duration}
                      </Text>
                      <Text
                        style={[
                          styles.statUnit,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        min
                      </Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text
                        style={[
                          styles.statValue,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {activity.points}
                      </Text>
                      <Text
                        style={[
                          styles.statUnit,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        pts
                      </Text>
                    </View>
                  </View>

                  <Chip
                    compact
                    style={[
                      styles.difficultyChip,
                      {
                        backgroundColor: getDifficultyColor(
                          activity.difficulty
                        ),
                      },
                    ]}
                    textStyle={[
                      styles.difficultyText,
                      { color: getDifficultyTextColor(activity.difficulty) },
                    ]}
                  >
                    {activity.difficulty}
                  </Chip>

                  <Button
                    mode="contained"
                    onPress={() => {
                      /* Mark activity as completed */
                    }}
                    disabled={activity.completed}
                    style={[
                      styles.activityButton,
                      {
                        backgroundColor: activity.completed
                          ? theme.customColors.darkGreen
                          : theme.colors.primary,
                      },
                    ]}
                    labelStyle={styles.activityButtonLabel}
                  >
                    {activity.completed ? "Completed" : "Start"}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Leaderboard
          </Text>
          <Card style={styles.leaderboardCard}>
            <Card.Content>
              {leaderboard.map((user, index) => (
                <View key={user.rank} style={styles.leaderboardRow}>
                  <View style={styles.rankContainer}>
                    <Text
                      style={[styles.rankText, { color: theme.colors.primary }]}
                    >
                      #{user.rank}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {user.name}
                    </Text>
                    <Text
                      style={[
                        styles.userDepartment,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {user.department}
                    </Text>
                  </View>
                  <Text
                    style={[styles.userPoints, { color: theme.colors.primary }]}
                  >
                    {user.points} pts
                  </Text>
                </View>
              ))}
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statsCard: {
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  levelProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 5,
  },
  levelText: {
    fontSize: 12,
    textAlign: "center",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  challengeCard: {
    marginBottom: 15,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  challengeIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  challengePoints: {
    alignItems: "center",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pointsLabel: {
    fontSize: 12,
  },
  challengeProgress: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 5,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    height: 24,
  },
  categoryText: {
    fontSize: 10,
  },
  participantsText: {
    fontSize: 12,
    opacity: 0.7,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: "48%",
    marginBottom: 15,
    elevation: 2,
  },
  activityContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 16,
  },
  activityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  activityStat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statUnit: {
    fontSize: 10,
  },
  difficultyChip: {
    height: 20,
    marginBottom: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  activityButton: {
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  activityButtonLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  leaderboardCard: {
    elevation: 2,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userDepartment: {
    fontSize: 12,
    opacity: 0.7,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FitnessScreen;
