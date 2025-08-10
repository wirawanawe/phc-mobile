import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface DashboardStats {
  users: number;
  clinics: number;
  doctors: number;
  bookings: number;
  assessments: number;
  healthData: number;
  mealLogs: number;
  sleepLogs: number;
  waterLogs: number;
  moodLogs: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface RecentBooking {
  id: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  clinic: {
    name: string;
  };
}

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.request("/admin/dashboard");
      if (response.success) {
        setStats(response.data.stats);
        setRecentUsers(response.data.recentUsers);
        setRecentBookings(response.data.recentBookings);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const RecentItem = ({
    title,
    subtitle,
    date,
    status,
  }: {
    title: string;
    subtitle: string;
    date: string;
    status?: string;
  }) => (
    <View style={styles.recentItem}>
      <View style={styles.recentContent}>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentSubtitle}>{subtitle}</Text>
        <Text style={styles.recentDate}>
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>
      {status && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "completed":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  const QuickActionButton = ({
    title,
    icon,
    onPress,
    color,
  }: {
    title: string;
    icon: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color="white" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back, {user?.name}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Icon name="account-circle" size={40} color="#E53E3E" />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats?.users || 0}
              icon="people"
              color="#E53E3E"
            />
            <StatCard
              title="Clinics"
              value={stats?.clinics || 0}
              icon="local-hospital"
              color="#3182CE"
            />
            <StatCard
              title="Doctors"
              value={stats?.doctors || 0}
              icon="medical-services"
              color="#38A169"
            />
            <StatCard
              title="Bookings"
              value={stats?.bookings || 0}
              icon="event"
              color="#D69E2E"
            />
            <StatCard
              title="Assessments"
              value={stats?.assessments || 0}
              icon="assessment"
              color="#805AD5"
            />
            <StatCard
              title="Health Data"
              value={stats?.healthData || 0}
              icon="favorite"
              color="#E53E3E"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Manage Users"
              icon="people"
              color="#E53E3E"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "User management will be available soon"
                )
              }
            />
            <QuickActionButton
              title="Manage Clinics"
              icon="local-hospital"
              color="#3182CE"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Clinic management will be available soon"
                )
              }
            />
            <QuickActionButton
              title="Manage Doctors"
              icon="medical-services"
              color="#38A169"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Doctor management will be available soon"
                )
              }
            />
            <QuickActionButton
              title="View Bookings"
              icon="event"
              color="#D69E2E"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Booking management will be available soon"
                )
              }
            />
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Users</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentList}>
            {recentUsers.map((user) => (
              <RecentItem
                key={user.id}
                title={user.name}
                subtitle={user.email}
                date={user.createdAt}
              />
            ))}
            {recentUsers.length === 0 && (
              <Text style={styles.emptyText}>No recent users</Text>
            )}
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentList}>
            {recentBookings.map((booking) => (
              <RecentItem
                key={booking.id}
                title={`${booking.user.name} - ${booking.clinic.name}`}
                subtitle={booking.user.email}
                date={booking.createdAt}
                status={booking.status}
              />
            ))}
            {recentBookings.length === 0 && (
              <Text style={styles.emptyText}>No recent bookings</Text>
            )}
          </View>
        </View>

        {/* Tracking Data Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tracking Data</Text>
          <View style={styles.trackingStats}>
            <View style={styles.trackingItem}>
              <Icon name="restaurant" size={20} color="#E53E3E" />
              <Text style={styles.trackingValue}>{stats?.mealLogs || 0}</Text>
              <Text style={styles.trackingLabel}>Meal Logs</Text>
            </View>
            <View style={styles.trackingItem}>
              <Icon name="bedtime" size={20} color="#3182CE" />
              <Text style={styles.trackingValue}>{stats?.sleepLogs || 0}</Text>
              <Text style={styles.trackingLabel}>Sleep Logs</Text>
            </View>
            <View style={styles.trackingItem}>
              <Icon name="water-drop" size={20} color="#38A169" />
              <Text style={styles.trackingValue}>{stats?.waterLogs || 0}</Text>
              <Text style={styles.trackingLabel}>Water Logs</Text>
            </View>
            <View style={styles.trackingItem}>
              <Icon name="mood" size={20} color="#D69E2E" />
              <Text style={styles.trackingValue}>{stats?.moodLogs || 0}</Text>
              <Text style={styles.trackingLabel}>Mood Logs</Text>
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
    backgroundColor: "#F7FAFC",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#718096",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#718096",
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  section: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#E53E3E",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 80) / 2,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C",
  },
  statTitle: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: (width - 80) / 2,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A202C",
  },
  recentSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  recentDate: {
    fontSize: 10,
    color: "#A0AEC0",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  emptyText: {
    textAlign: "center",
    color: "#718096",
    fontSize: 14,
    fontStyle: "italic",
  },
  trackingStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackingItem: {
    alignItems: "center",
    flex: 1,
  },
  trackingValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C",
    marginTop: 4,
  },
  trackingLabel: {
    fontSize: 10,
    color: "#718096",
    marginTop: 2,
    textAlign: "center",
  },
});

export default AdminDashboardScreen;
