import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";

const PersonalInformationScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    ktp_number: "",
    address: "",
    insurance_type: "umum",
    insurance_provider: "",
    insurance_number: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success) {
        setUserInfo({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          date_of_birth: response.data.date_of_birth || "",
          gender: response.data.gender || "",
          ktp_number: response.data.ktp_number || "",
          address: response.data.address || "",
          insurance_type: response.data.insurance_type || "umum",
          insurance_provider: response.data.insurance_provider || "",
          insurance_number: response.data.insurance_number || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (userInfo.ktp_number && userInfo.ktp_number.length !== 16) {
        Alert.alert("Error", "KTP number must be exactly 16 digits");
        return;
      }

      if (userInfo.insurance_type !== "umum" && !userInfo.insurance_provider) {
        Alert.alert(
          "Error",
          "Insurance provider is required when insurance type is not Umum"
        );
        return;
      }

      if (userInfo.insurance_type !== "umum" && !userInfo.insurance_number) {
        Alert.alert(
          "Error",
          "Insurance number is required when insurance type is not Umum"
        );
        return;
      }

      setLoading(true);
      const response = await apiService.updateUserProfile(userInfo);

      if (response.success) {
        Alert.alert("Success", "Personal information updated successfully!");
        setIsEditing(false);
        // Refresh user data
        fetchUserProfile();
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    fetchUserProfile();
    setIsEditing(false);
  };

  const renderField = (
    label: string,
    value: string,
    key: keyof typeof userInfo,
    keyboardType:
      | "default"
      | "email-address"
      | "phone-pad"
      | "numeric" = "default",
    multiline: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={(text) => setUserInfo({ ...userInfo, [key]: text })}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={[styles.fieldValue, !value && styles.fieldValueEmpty]}>
          {value || "Not provided"}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInfo.name.charAt(0)}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userInfo.name}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  <Icon
                    name={isEditing ? "close" : "pencil"}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>{userInfo.email}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Information Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {renderField("Full Name", userInfo.name, "name")}
          {renderField("Email", userInfo.email, "email", "email-address")}
          {renderField("Phone", userInfo.phone, "phone", "phone-pad")}
          {renderField(
            "Date of Birth",
            userInfo.date_of_birth,
            "date_of_birth"
          )}
          {renderField("Gender", userInfo.gender, "gender")}
          {renderField("No. KTP", userInfo.ktp_number, "ktp_number", "numeric")}

          <Text style={styles.sectionTitle}>Address</Text>
          {renderField("Address", userInfo.address, "address", "default", true)}

          <Text style={styles.sectionTitle}>Insurance Information</Text>

          {/* Insurance Type Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Insurance Type</Text>
            {isEditing ? (
              <View style={styles.insuranceTypeContainer}>
                {["umum", "bpjs", "swasta"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.insuranceTypeButton,
                      userInfo.insurance_type === type &&
                        styles.insuranceTypeButtonActive,
                    ]}
                    onPress={() =>
                      setUserInfo({ ...userInfo, insurance_type: type })
                    }
                  >
                    <Text
                      style={[
                        styles.insuranceTypeText,
                        userInfo.insurance_type === type &&
                          styles.insuranceTypeTextActive,
                      ]}
                    >
                      {type === "umum"
                        ? "Umum"
                        : type === "bpjs"
                        ? "BPJS"
                        : "Swasta"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {userInfo.insurance_type === "umum"
                  ? "Umum"
                  : userInfo.insurance_type === "bpjs"
                  ? "BPJS"
                  : "Swasta"}
              </Text>
            )}
          </View>

          {/* Insurance Provider - only show if not umum */}
          {userInfo.insurance_type !== "umum" && (
            <>
              {renderField(
                "Insurance Provider",
                userInfo.insurance_provider,
                "insurance_provider"
              )}
              {renderField(
                "Insurance Number",
                userInfo.insurance_number,
                "insurance_number"
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  editButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6366F1",
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fieldValueEmpty: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  input: {
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  insuranceTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  insuranceTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  insuranceTypeButtonActive: {
    borderColor: "#6366F1",
    backgroundColor: "#6366F1",
  },
  insuranceTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  insuranceTypeTextActive: {
    color: "#FFFFFF",
  },
});

export default PersonalInformationScreen;
