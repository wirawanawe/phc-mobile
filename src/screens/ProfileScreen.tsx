import React, { useState, useEffect } from "react";
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
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

const ProfileScreen = ({ navigation }: any) => {
  const { logout, user, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = useState({
    daysActive: 0,
    achievements: 0,
    healthScore: 0,
  });
  const [loading, setLoading] = useState(true);

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

  // Fetch user statistics from database
  useEffect(() => {
    const fetchUserStats = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);
          
          // Fetch wellness progress which includes user statistics
          const wellnessResponse = await apiService.getWellnessProgress();
          
          if (wellnessResponse.success && wellnessResponse.progress) {
            const progress = wellnessResponse.progress;
            
            // Calculate days active (days since user joined wellness program)
            const joinDate = wellnessResponse.user?.wellness_join_date;
            let daysActive = 0;
            if (joinDate) {
              const join = new Date(joinDate);
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - join.getTime());
              daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            
            // Calculate achievements (completed missions)
            const achievements = progress.completedMissions || 0;
            
            // Calculate health score based on various factors
            let healthScore = 0;
            if (progress.completionRate > 0) {
              healthScore = Math.min(100, Math.round(progress.completionRate));
            } else {
              // Fallback calculation based on wellness score
              healthScore = Math.min(100, Math.round(progress.wellnessScore || 0));
            }
            
            setUserStats({
              daysActive: Math.max(daysActive, 1), // Minimum 1 day
              achievements,
              healthScore,
            });
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
          // Use default values if API fails
          setUserStats({
            daysActive: 1,
            achievements: 0,
            healthScore: 0,
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [isAuthenticated, user]);

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
      title: "Informasi Pribadi",
      subtitle: "Kelola detail pribadi Anda",
      icon: "account-edit",
      color: "#3B82F6",
      screenName: "PersonalInformation",
    },
    ...(user?.role === "admin" ? [{
      id: "admin",
      title: "Dashboard Admin",
      subtitle: "Kelola sistem dan pengguna",
      icon: "view-dashboard",
      color: "#DC2626",
      screenName: "AdminDashboard",
    }] : []),
    {
      id: "2",
      title: "Tujuan Kesehatan",
      subtitle: "Atur dan lacak tujuan kesehatan Anda",
      icon: "target",
      color: "#10B981",
      screenName: "HealthGoals",
    },
    {
      id: "3",
      title: "Riwayat Medis",
      subtitle: "Lihat catatan kesehatan Anda",
      icon: "medical-bag",
      color: "#F59E0B",
      screenName: "MedicalHistory",
    },
    {
      id: "4",
      title: "Pengaturan Privasi",
      subtitle: "Kelola privasi dan keamanan Anda",
      icon: "shield-account",
      color: "#EF4444",
      screenName: "PrivacySettings",
    },
    {
      id: "5",
      title: "Bantuan & Dukungan",
      subtitle: "Dapatkan bantuan dan hubungi dukungan",
      icon: "help-circle-outline",
      color: "#06B6D4",
      screenName: "HelpSupport",
    },
    {
      id: "6",
      title: "Tentang Aplikasi",
      subtitle: "Pelajari lebih lanjut tentang Wellness WeCare",
      icon: "information-outline",
      color: "#6366F1",
      screenName: "AboutApp",
    },
    {
      id: "7",
      title: "Keluar",
      subtitle: "Keluar dari akun Anda",
      icon: "logout",
      color: "#6B7280",
      screenName: "Welcome",
    },
  ];

  const handleMenuPress = (item: any) => {
    if (item.title === "Keluar") {
      Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigate back to main screen after logout
              safeGoBack(navigation, 'Main');
              // Show success message
              Alert.alert(
                "Keluar Berhasil",
                "Anda telah berhasil keluar."
              );
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Terjadi kesalahan", "Gagal keluar. Silakan coba lagi.");
            }
          },
        },
      ]);
    } else if (item.screenName) {
      // Check if it's the medical history feature
      if (item.screenName === "MedicalHistory") {
        Alert.alert(
          "Fitur dalam Pengembangan", 
          "Menu Riwayat Medis masih dalam proses pengembangan. Fitur ini akan segera hadir dengan data riwayat medis yang lengkap dan terintegrasi dengan sistem kesehatan.",
          [
            { text: "OK" },
          ]
        );
      } else {
        navigation.navigate(item.screenName);
      }
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
                  Anggota sejak {userProfile.memberSince}
                </Text>
              </View>
            </View>

            <View style={styles.pointsContainer}>
              <Icon name="star" size={18} color="#F59E0B" />
              <Text style={styles.pointsText}>{userProfile.points} poin</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
              <Icon name="calendar-check" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>
              {loading ? "..." : userStats.daysActive}
            </Text>
            <Text style={styles.statLabel}>Hari Aktif</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F59E0B20" }]}>
              <Icon name="trophy" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>
              {loading ? "..." : userStats.achievements}
            </Text>
            <Text style={styles.statLabel}>Pencapaian</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#EF444420" }]}>
              <Icon name="heart-pulse" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>
              {loading ? "..." : `${userStats.healthScore}%`}
            </Text>
            <Text style={styles.statLabel}>Skor Kesehatan</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
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
                  <Text style={styles.menuTitle}>Masuk</Text>
                  <Text style={styles.menuSubtitle}>
                    Masuk ke akun Anda
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versi 0.0.1</Text>
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
