import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import wellnessDebugger from "../utils/wellnessDebugger";
import { safeGoBack } from "../utils/safeNavigation";

const WellnessDebugScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);
  const [isFixingIssues, setIsFixingIssues] = useState(false);

  useEffect(() => {
    // Auto-run diagnosis when component mounts
    runDiagnosis();
  }, []);

  const runDiagnosis = async () => {
    try {
      setIsRunningDiagnosis(true);
      console.log("🔍 Running wellness diagnosis...");
      
      // Log detailed state first
      await wellnessDebugger.logDetailedWellnessState();
      
      // Run full diagnosis
      const result = await wellnessDebugger.diagnoseWellnessAccess();
      setDiagnosis(result);
      
      console.log("📊 Diagnosis complete:", result);
    } catch (error) {
      console.error("❌ Error running diagnosis:", error);
      Alert.alert("Diagnosis Error", `Failed to run diagnosis: ${error.message}`);
    } finally {
      setIsRunningDiagnosis(false);
    }
  };

  const fixIssues = async () => {
    try {
      setIsFixingIssues(true);
      console.log("🔧 Attempting to fix common issues...");
      
      const result = await wellnessDebugger.fixCommonIssues();
      
      if (result.success) {
        Alert.alert(
          "Fixes Applied", 
          result.message + "\n\nFixes applied:\n" + result.fixes.join("\n"),
          [
            {
              text: "Run Diagnosis Again",
              onPress: runDiagnosis
            },
            {
              text: "Try Wellness App",
              onPress: () => {
                try {
                  navigation.navigate("WellnessApp");
                } catch (navError) {
                  Alert.alert("Navigation Error", "Could not navigate to WellnessApp");
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Fix Failed", result.message);
      }
    } catch (error) {
      console.error("❌ Error fixing issues:", error);
      Alert.alert("Fix Error", `Failed to apply fixes: ${error.message}`);
    } finally {
      setIsFixingIssues(false);
    }
  };

  const testWellnessNavigation = () => {
    try {
      console.log("🧪 Testing wellness navigation...");
      navigation.navigate("WellnessApp");
    } catch (error) {
      console.error("❌ Navigation test failed:", error);
      Alert.alert("Navigation Failed", `Cannot navigate to WellnessApp: ${error.message}`);
    }
  };

  const renderDiagnosisSection = (title: string, status: any, color: string) => (
    <View style={styles.diagnosisSection}>
      <View style={styles.diagnosisHeader}>
        <Icon 
          name={status === "CONNECTED" || status === "VALID" || status === "AUTHENTICATED" || status === "TOKEN_EXISTS" ? "check-circle" : "alert-circle"} 
          size={20} 
          color={color} 
        />
        <Text style={[styles.diagnosisTitle, { color }]}>{title}</Text>
      </View>
      <Text style={styles.diagnosisValue}>
        {typeof status === 'object' ? JSON.stringify(status, null, 2) : status || 'Unknown'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeGoBack(navigation, 'Main')}>
          <Icon name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness App Debugger</Text>
        <TouchableOpacity onPress={runDiagnosis}>
          <Icon name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Auth State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Authentication State</Text>
          <View style={styles.authInfo}>
            <Text style={styles.authLabel}>Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</Text>
            <Text style={styles.authLabel}>Auth Loading: {authLoading ? "🔄 Yes" : "✅ No"}</Text>
            <Text style={styles.authLabel}>User: {user ? `✅ ${user.name} (ID: ${user.id})` : "❌ No user"}</Text>
          </View>
        </View>

        {/* Diagnosis Results */}
        {diagnosis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnosis Results</Text>
            <Text style={styles.summaryText}>{diagnosis.summary}</Text>
            
            {renderDiagnosisSection("Token Status", diagnosis.tokenStatus, diagnosis.tokenStatus === "TOKEN_EXISTS" ? "#10B981" : "#EF4444")}
            {renderDiagnosisSection("API Connection", diagnosis.apiConnection, diagnosis.apiConnection === "CONNECTED" ? "#10B981" : "#EF4444")}
            {renderDiagnosisSection("User Profile", diagnosis.userProfile, diagnosis.userProfile === "VALID" ? "#10B981" : "#EF4444")}
            {renderDiagnosisSection("Wellness Status", diagnosis.wellnessStatus, diagnosis.wellnessStatus && typeof diagnosis.wellnessStatus === 'object' ? "#10B981" : "#EF4444")}
          </View>
        )}

        {/* Issues Found */}
        {diagnosis && diagnosis.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issues Found</Text>
            {diagnosis.issues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Icon name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {diagnosis && diagnosis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {diagnosis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="lightbulb" size={16} color="#F59E0B" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.diagnosisButton]}
            onPress={runDiagnosis}
            disabled={isRunningDiagnosis}
          >
            {isRunningDiagnosis ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="magnify" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {isRunningDiagnosis ? "Running..." : "Run Diagnosis"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.fixButton]}
            onPress={fixIssues}
            disabled={isFixingIssues}
          >
            {isFixingIssues ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="wrench" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {isFixingIssues ? "Fixing..." : "Fix Issues"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={testWellnessNavigation}
          >
            <Icon name="test-tube" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Test Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.loginButton]}
            onPress={() => navigation.navigate("Login")}
          >
            <Icon name="login" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Go to Login</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  authInfo: {
    gap: 8,
  },
  authLabel: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "monospace",
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  diagnosisSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  diagnosisTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  diagnosisValue: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    marginLeft: 28,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
  },
  issueText: {
    fontSize: 13,
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
  },
  recommendationText: {
    fontSize: 13,
    color: "#D97706",
    marginLeft: 8,
    flex: 1,
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  diagnosisButton: {
    backgroundColor: "#3B82F6",
  },
  fixButton: {
    backgroundColor: "#10B981",
  },
  testButton: {
    backgroundColor: "#8B5CF6",
  },
  loginButton: {
    backgroundColor: "#E22345",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default WellnessDebugScreen;
