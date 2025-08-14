import React, { useState } from "react";
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

const NotificationScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "health",
      title: "Health Assessment Reminder",
      message:
        "It's time for your monthly health assessment. Complete it to track your progress!",
      time: "2 hours ago",
      isRead: false,
      icon: "heart-pulse",
      color: "#EF4444",
    },
    {
      id: "2",
      type: "achievement",
      title: "New Achievement Unlocked!",
      message: "Congratulations! You've completed 30 days of daily missions.",
      time: "1 day ago",
      isRead: false,
      icon: "trophy",
      color: "#F59E0B",
    },
    {
      id: "3",
      type: "wellness",
      title: "Wellness Tip of the Day",
      message:
        "Stay hydrated! Drinking 8 glasses of water daily improves your overall health.",
      time: "2 days ago",
      isRead: true,
      icon: "lightbulb",
      color: "#10B981",
    },
    {
      id: "4",
      type: "consultation",
      title: "Consultation Scheduled",
      message:
        "Your consultation with Dr. Sarah Johnson is scheduled for tomorrow at 2:00 PM.",
      time: "3 days ago",
      isRead: true,
      icon: "account-tie",
      color: "#3B82F6",
    },
    {
      id: "5",
      type: "fitness",
      title: "Workout Reminder",
      message:
        "Don't forget your scheduled workout session. Keep up the great work!",
      time: "4 days ago",
      isRead: true,
      icon: "dumbbell",
      color: "#8B5CF6",
    },
    {
      id: "6",
      type: "nutrition",
      title: "Nutrition Goal Achieved",
      message:
        "You've successfully met your daily nutrition goals for the week!",
      time: "5 days ago",
      isRead: true,
      icon: "food-apple",
      color: "#06B6D4",
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.isRead).length;
  };

  const renderNotification = (notification: any) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: notification.color + "20" },
          ]}
        >
          <Icon name={notification.icon} size={20} color={notification.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Main')}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View> */}

        {/* Notification Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {getUnreadCount()} unread notification
            {getUnreadCount() !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <View key={notification.id}>
                {renderNotification(notification)}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="bell-off" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyMessage}>
                You're all caught up! Check back later for new updates.
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  countText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
    backgroundColor: "#F8FAFF",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default NotificationScreen;
