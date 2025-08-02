import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = ({ navigation }: any) => {
  const { logout, user, isAuthenticated } = useAuth();

  // Function to get initials from full name
  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    }
  };

  // Use data from AuthContext if authenticated, otherwise use default
  const userProfile =
    isAuthenticated && user
      ? {
          name: user.name,
          email: user.email,
          avatar: getInitials(user.name),
          memberSince: "March 2024", // You can add this field to User interface if needed
          points: user.points,
          level: "Gold", // You can add this field to User interface if needed
        }
      : {
          name: "Wellness WeCare",
          email: "wellness@wecare.com",
          avatar: "W",
          memberSince: "March 2024",
          points: 1250,
          level: "Gold",
        };

  const profileMenuItems = [
    {
      id: "1",
      title: "Personal Information",
      subtitle: "Manage your personal details",
      icon: "account-edit",
      color: "#3B82F6",
      screenName: "PersonalInformation",
    },
    ...(user?.role === "admin" ? [{
      id: "admin",
      title: "Admin Dashboard",
      subtitle: "Manage system and users",
      icon: "view-dashboard",
      color: "#DC2626",
      screenName: "AdminDashboard",
    }] : []),
    {
      id: "2",
      title: "Health Goals",
      subtitle: "Set and track your health objectives",
      icon: "target",
      color: "#10B981",
      screenName: null,
    },
    {
      id: "3",
      title: "Medical History",
      subtitle: "View your health records",
      icon: "medical-bag",
      color: "#F59E0B",
      screenName: null,
    },
    {
      id: "4",
      title: "Notifications",
      subtitle: "Configure your notification preferences",
      icon: "bell-outline",
      color: "#8B5CF6",
      screenName: null,
    },
    {
      id: "5",
      title: "Privacy Settings",
      subtitle: "Manage your privacy and security",
      icon: "shield-account",
      color: "#EF4444",
      screenName: null,
    },
    {
      id: "6",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle-outline",
      color: "#06B6D4",
      screenName: null,
    },
    {
      id: "7",
      title: "About App",
      subtitle: "Learn more about Wellness WeCare",
      icon: "information-outline",
      color: "#6366F1",
      screenName: null,
    },
    {
      id: "8",
      title: "Logout",
      subtitle: "Sign out of your account",
      icon: "logout",
      color: "#6B7280",
      screenName: "Welcome",
    },
  ];

  const handleMenuPress = (item: any) => {
    if (item.title === "Logout") {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigate back to main screen after logout
              navigation.goBack();
              // Show success message
              Alert.alert(
                "Logout Successful",
                "You have been logged out successfully."
              );
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]);
    } else if (item.screenName) {
      navigation.navigate(item.screenName);
    } else {
      Alert.alert("Coming Soon", `${item.title} feature is coming soon!`, [
        { text: "OK" },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userProfile.avatar}</Text>
                  </View>
                  <View style={styles.levelBadge}>
                    <Icon name="crown" size={14} color="#F59E0B" />
                    <Text style={styles.levelText}>{userProfile.level}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <Text style={styles.userEmail}>{userProfile.email}</Text>
                <Text style={styles.memberSince}>
                  Member since {userProfile.memberSince}
                </Text>
              </View>
            </View>

            <View style={styles.pointsContainer}>
              <Icon name="star" size={18} color="#F59E0B" />
              <Text style={styles.pointsText}>{userProfile.points} points</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
              <Icon name="calendar-check" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F59E0B20" }]}>
              <Icon name="trophy" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#EF444420" }]}>
              <Icon name="heart-pulse" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Health Score</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {profileMenuItems
            .filter((item) => {
              // Only show logout if user is authenticated
              if (item.title === "Logout") {
                return isAuthenticated;
              }
              return true;
            })
            .map((item, index, filteredItems) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === filteredItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}

          {/* Show login button if not authenticated */}
          {!isAuthenticated && (
            <TouchableOpacity
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={() => navigation.navigate("Login")}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#E2234515" }]}>
                <Icon name="login" size={22} color="#E22345" />
              </View>
              <View style={styles.menuContent}>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Login</Text>
                  <Text style={styles.menuSubtitle}>
                    Sign in to your account
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarSection: {
    marginRight: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#667eea",
  },
  levelBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
    marginLeft: 3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    color: "#E0E7FF",
    marginBottom: 4,
    fontWeight: "500",
  },
  memberSince: {
    fontSize: 13,
    color: "#C7D2FE",
    fontWeight: "500",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#667eea",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});

export default ProfileScreen;
