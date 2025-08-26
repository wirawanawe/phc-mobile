import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

const ProfileScreen = ({ navigation }: any) => {
  const { logout, user, isAuthenticated, refreshAuth } = useAuth();
  const [userStats, setUserStats] = useState({
    daysActive: 0,
    achievements: 0,
    healthScore: 0,
  });
  const [wellnessProgramStatus, setWellnessProgramStatus] = useState({
    program_status: 'not_joined',
    should_renew: false,
    days_remaining: 0,
    days_completed: 0,
    program_duration: 0,
    program_cycles: 0,
    program_history: []
  });
  const [wellnessStopHistory, setWellnessStopHistory] = useState({
    total_cycles: 0,
    stopped_count: 0,
    last_stopped_date: null,
    last_stop_reason: null,
    stopped_programs: []
  });
  const [loading, setLoading] = useState(true);
  
  // Use refs to prevent infinite loops
  const refreshAuthRef = useRef(refreshAuth);
  const lastRefreshRef = useRef(0);

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

  // Fetch user statistics and wellness program status from database
  const fetchUserData = async () => {
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

        // Fetch wellness program status
        const programStatusResponse = await apiService.checkWellnessProgramStatus();
        console.log('🔍 Wellness program status response:', programStatusResponse);
        if (programStatusResponse.success && programStatusResponse.data) {
          console.log('🔍 Setting wellness program status:', programStatusResponse.data);
          setWellnessProgramStatus(programStatusResponse.data);
        }

        // Fetch wellness program stop history
        try {
          const stopHistoryResponse = await apiService.getWellnessProgramStopHistory();
          if (stopHistoryResponse.success && stopHistoryResponse.data) {
            setWellnessStopHistory(stopHistoryResponse.data);
          }
        } catch (error) {
          console.log("Wellness stop history not available:", error instanceof Error ? error.message : String(error));
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Check if it's an authentication error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isAuthError = errorMessage.includes('Authentication failed') || 
                           errorMessage.includes('401') ||
                           errorMessage.includes('Unauthorized') ||
                           errorMessage.includes('Token');
        
        if (isAuthError) {
          console.log("🔐 ProfileScreen: Authentication error detected, but not logging out automatically");
          // Don't logout automatically, let the user continue using cached data
        }
        
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

  useEffect(() => {
    console.log('🔄 ProfileScreen: useEffect triggered', { isAuthenticated, userId: user?.id });
    
    fetchUserData().catch(error => {
      console.error('Error in fetchUserData:', error);
    });
  }, [isAuthenticated, user?.id]); // Only depend on user ID, not the entire user object

  // Update ref when refreshAuth changes
  useEffect(() => {
    refreshAuthRef.current = refreshAuth;
  }, [refreshAuth]);

  // Refresh user data when screen comes into focus (only if needed)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 ProfileScreen: useFocusEffect triggered', { isAuthenticated, userId: user?.id });
      
      if (isAuthenticated && user?.id) {
        // Only refresh if user data is stale (older than 5 minutes)
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - lastRefreshRef.current > fiveMinutes) {
          console.log('🔄 ProfileScreen: Refreshing user data on focus');
          lastRefreshRef.current = now;
          
          // Use try-catch to prevent logout on refresh errors
          refreshAuthRef.current().catch(error => {
            console.log('⚠️ ProfileScreen: Refresh failed, but not logging out:', error.message);
          });
        }
      }
    }, [isAuthenticated, user?.id]) // Remove refreshAuth from dependencies
  );

  // Function to format member since date
  const formatMemberSince = (createdAt: string) => {
    if (!createdAt) return "March 2024";
    
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return "March 2024";
      
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (error) {
      return "March 2024";
    }
  };

  // Use data from AuthContext if authenticated, otherwise use default
  const userProfile =
    isAuthenticated && user
      ? {
          name: user.name,
          email: user.email,
          avatar: getInitials(user.name),
          memberSince: formatMemberSince(user.created_at || ''),
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
      id: "wellness-history",
      title: "Riwayat Program Wellness",
      subtitle: "Lihat summary program wellness yang telah selesai",
      icon: "history",
      color: "#8B5CF6",
      screenName: "WellnessHistory",
    },
    {
      id: "4",
      title: "Pengaturan PIN",
      subtitle: "Kelola PIN keamanan aplikasi",
      icon: "lock",
      color: "#EF4444",
      screenName: "PinSettings",
    },
    {
      id: "5",
      title: "Pengaturan Privasi",
      subtitle: "Kelola privasi dan keamanan Anda",
      icon: "shield-account",
      color: "#8B5CF6",
      screenName: "PrivacySettings",
    },
    {
      id: "6",
      title: "Bantuan & Dukungan",
      subtitle: "Dapatkan bantuan dan hubungi dukungan",
      icon: "help-circle-outline",
      color: "#06B6D4",
      screenName: "HelpSupport",
    },
    {
      id: "7",
      title: "Tentang Aplikasi",
      subtitle: "Pelajari lebih lanjut tentang Doctor PHC",
      icon: "information-outline",
      color: "#6366F1",
      screenName: "AboutApp",
    },

    {
      id: "8",
      title: "Keluar",
      subtitle: "Keluar dari akun Anda",
      icon: "logout",
      color: "#6B7280",
      screenName: "Welcome",
    },
  ];

  const handleRenewProgram = () => {
    Alert.alert(
      "Perpanjang Program Wellness",
      "Program wellness Anda telah selesai. Apakah Anda ingin mendaftar ulang untuk program baru?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Daftar Ulang",
          onPress: () => {
            navigation.navigate("WellnessApp");
          },
        },
      ]
    );
  };

  const handleStopProgram = () => {
    console.log('🛑 Stop program button pressed');
    console.log('Current wellness status:', wellnessProgramStatus);
    
    Alert.alert(
      "Hentikan Program Wellness",
      "Apakah Anda yakin ingin menghentikan program wellness saat ini? Program akan disimpan ke riwayat dan Anda dapat mendaftar ulang kapan saja.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hentikan",
          style: "destructive",
          onPress: () => {
            console.log('🛑 User confirmed stop program');
            stopProgram('User stopped program');
          },
        },
      ]
    );
  };

  const stopProgram = async (reason: any) => {
    try {
      console.log('🛑 Starting stop program process...');
      setLoading(true);
      
      console.log('🛑 Calling API stopWellnessProgram...');
      const response = await apiService.stopWellnessProgram(reason);
      console.log('🛑 API response:', response);
      
      if (response.success) {
        console.log('🛑 Program stopped successfully');
        Alert.alert(
          "Program Dihentikan",
          "Program wellness berhasil dihentikan. Anda dapat mendaftar ulang kapan saja.",
          [
            {
              text: "OK",
              onPress: () => {
                console.log('🛑 Refreshing user data after stop');
                fetchUserData();
              },
            },
          ]
        );
      } else {
        console.log('🛑 Failed to stop program:', response.message);
        Alert.alert("Gagal", response.message || "Gagal menghentikan program wellness");
      }
    } catch (error) {
      console.error("🛑 Error stopping wellness program:", error);
      Alert.alert("Terjadi kesalahan", "Gagal menghentikan program wellness. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

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

            {/* <View style={styles.pointsContainer}>
              <Icon name="star" size={18} color="#F59E0B" />
              <Text style={styles.pointsText}>{userProfile.points} poin</Text>
            </View> */}
          </LinearGradient>
        </View>

        {/* User Statistics */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
                <Icon name="calendar-clock" size={20} color="#10B981" />
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
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#3B82F620" }]}>
                <Icon name="heart-pulse" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>
                {loading ? "..." : userStats.healthScore}
              </Text>
              <Text style={styles.statLabel}>Skor Kesehatan</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#8B5CF620" }]}>
                <Icon name="refresh" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>
                {loading ? "..." : wellnessProgramStatus.program_cycles || 0}
              </Text>
              <Text style={styles.statLabel}>Program Diikuti</Text>
            </View>
          </View>
        </View> */}

        {/* Wellness Program Status */}
        {wellnessProgramStatus.program_status !== 'not_joined' && (
          <View style={styles.wellnessStatusContainer}>
            <Text style={styles.sectionTitle}>Status Program Wellness</Text>
            <View style={styles.wellnessStatusCard}>
              {/* Cycle Badge */}
              {wellnessProgramStatus.program_status === 'active' && (
                <View style={styles.cycleBadge}>
                  <Text style={styles.cycleBadgeText}>
                    #{wellnessProgramStatus.program_cycles || 1}
                  </Text>
                </View>
              )}
              
              <View style={styles.wellnessStatusHeader}>
                <Icon 
                  name={wellnessProgramStatus.program_status === 'active' ? 'play-circle' : 'check-circle'} 
                  size={24} 
                  color={wellnessProgramStatus.program_status === 'active' ? '#10B981' : '#8B5CF6'} 
                />
                <Text style={styles.wellnessStatusTitle}>
                  {wellnessProgramStatus.program_status === 'active' ? 'Program Aktif' : 'Program Selesai'}
                </Text>
              </View>
              
              {wellnessProgramStatus.program_status === 'active' && (
                <View style={styles.wellnessProgressInfo}>
                  <Text style={styles.wellnessProgressText}>
                    {wellnessProgramStatus.days_completed || 0} dari {wellnessProgramStatus.program_duration || 0} hari
                  </Text>
                  <Text style={styles.wellnessProgressText}>
                    Sisa {wellnessProgramStatus.days_remaining || 0} hari
                  </Text>
                  
                  {/* Stop Program Button */}
                  <TouchableOpacity
                    style={styles.stopProgramButton}
                    onPress={handleStopProgram}
                    disabled={loading}
                  >
                    <Icon name="stop-circle" size={16} color="#EF4444" />
                    <Text style={styles.stopProgramButtonText}>
                      {loading ? 'Menghentikan...' : 'Hentikan Program'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {wellnessProgramStatus.program_status === 'completed' && (
                <View style={styles.wellnessCompletedInfo}>
                  <Text style={styles.wellnessCompletedText}>
                    Program selesai! Total {wellnessProgramStatus.program_cycles} siklus program
                  </Text>
                  {wellnessProgramStatus.program_history.length > 0 && (
                    <Text style={styles.wellnessHistoryText}>
                      {wellnessProgramStatus.program_history.length} program sebelumnya
                    </Text>
                  )}
                </View>
              )}

              {/* Show stop history if user has stopped programs */}
              {wellnessStopHistory.stopped_count > 0 && (
                <View style={styles.wellnessStopInfo}>
                  <Text style={styles.wellnessStopText}>
                    Program dihentikan: {wellnessStopHistory.stopped_count} kali
                  </Text>
                  {wellnessStopHistory.last_stop_reason && (
                    <Text style={styles.wellnessStopReasonText}>
                      Alasan terakhir: {wellnessStopHistory.last_stop_reason}
                    </Text>
                  )}
                </View>
              )}

              {wellnessProgramStatus.should_renew && (
                <TouchableOpacity
                  style={styles.renewButton}
                  onPress={handleRenewProgram}
                >
                  <Text style={styles.renewButtonText}>Daftar Program Baru</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

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
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
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
  wellnessStatusContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  wellnessStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  cycleBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  cycleBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  wellnessStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  wellnessStatusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  wellnessProgressInfo: {
    marginBottom: 16,
  },
  wellnessProgressText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  wellnessCompletedInfo: {
    marginBottom: 16,
  },
  wellnessCompletedText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  wellnessHistoryText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  wellnessStopInfo: {
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  wellnessStopText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
    marginBottom: 2,
  },
  wellnessStopReasonText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  renewButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  renewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  stopProgramButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  stopProgramButtonText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
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
