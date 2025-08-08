import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Text, useTheme, Button, Card, Switch } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PrivacySettingsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [privacySettings, setPrivacySettings] = useState({
    biometricEnabled: true,
    dataSharing: false,
    locationSharing: true,
    healthDataSharing: false,
    notifications: true,
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert(t("error"), t("privacy.fillAllFields"));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert(t("error"), t("privacy.passwordMismatch"));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert(t("error"), t("privacy.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update password in AsyncStorage (for demo purposes)
      await AsyncStorage.setItem("userPassword", passwordData.newPassword);
      
      Alert.alert(
        t("success"),
        t("privacy.passwordChanged"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              setShowPasswordModal(false);
              setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(t("error"), t("privacy.passwordChangeError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySettingChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      t("privacy.logoutAllDevices.title"),
      t("privacy.logoutAllDevices.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("privacy.logoutAllDevices.confirm"),
          style: "destructive",
          onPress: () => {
            // Implement logout all devices logic
            Alert.alert(t("success"), t("privacy.logoutAllDevices.success"));
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("privacy.deleteAccount.title"),
      t("privacy.deleteAccount.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("privacy.deleteAccount.confirm"),
          style: "destructive",
          onPress: () => {
            // Implement account deletion logic
            Alert.alert(t("success"), t("privacy.deleteAccount.success"));
          },
        },
      ]
    );
  };

  const renderPrivacyOption = (
    title: string,
    subtitle: string,
    icon: string,
    key: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.privacyOption}>
      <View style={styles.optionInfo}>
        <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Icon name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color={theme.colors.primary}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("privacy.title")}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.security.title")}</Text>
          <Card style={styles.card}>
            <Card.Content>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowPasswordModal(true)}
              >
                <View style={styles.menuItemInfo}>
                  <View style={[styles.menuItemIcon, { backgroundColor: "#EF444420" }]}>
                    <Icon name="lock" size={20} color="#EF4444" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{t("privacy.changePassword.title")}</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {t("privacy.changePassword.subtitle")}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogoutAllDevices}
              >
                <View style={styles.menuItemInfo}>
                  <View style={[styles.menuItemIcon, { backgroundColor: "#F59E0B20" }]}>
                    <Icon name="logout" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{t("privacy.logoutAllDevices.title")}</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {t("privacy.logoutAllDevices.subtitle")}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>

        {/* Privacy Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.settings.title")}</Text>
          <Card style={styles.card}>
            <Card.Content>
              {renderPrivacyOption(
                t("privacy.biometric.title"),
                t("privacy.biometric.subtitle"),
                "fingerprint",
                "biometricEnabled",
                privacySettings.biometricEnabled,
                (value) => handlePrivacySettingChange("biometricEnabled", value)
              )}

              <View style={styles.divider} />

              {renderPrivacyOption(
                t("privacy.dataSharing.title"),
                t("privacy.dataSharing.subtitle"),
                "share-variant",
                "dataSharing",
                privacySettings.dataSharing,
                (value) => handlePrivacySettingChange("dataSharing", value)
              )}

              <View style={styles.divider} />

              {renderPrivacyOption(
                t("privacy.location.title"),
                t("privacy.location.subtitle"),
                "map-marker",
                "locationSharing",
                privacySettings.locationSharing,
                (value) => handlePrivacySettingChange("locationSharing", value)
              )}

              <View style={styles.divider} />

              {renderPrivacyOption(
                t("privacy.healthData.title"),
                t("privacy.healthData.subtitle"),
                "heart-pulse",
                "healthDataSharing",
                privacySettings.healthDataSharing,
                (value) => handlePrivacySettingChange("healthDataSharing", value)
              )}

              <View style={styles.divider} />

              {renderPrivacyOption(
                t("privacy.notifications.title"),
                t("privacy.notifications.subtitle"),
                "bell",
                "notifications",
                privacySettings.notifications,
                (value) => handlePrivacySettingChange("notifications", value)
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Account Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.accountManagement.title")}</Text>
          <Card style={styles.card}>
            <Card.Content>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeleteAccount}
              >
                <View style={styles.menuItemInfo}>
                  <View style={[styles.menuItemIcon, { backgroundColor: "#DC262620" }]}>
                    <Icon name="delete" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, { color: "#DC2626" }]}>
                      {t("privacy.deleteAccount.title")}
                    </Text>
                    <Text style={styles.menuItemSubtitle}>
                      {t("privacy.deleteAccount.subtitle")}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#DC2626" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ubah Password</Text>
                <TouchableOpacity
                  onPress={() => setShowPasswordModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password Saat Ini</Text>
                <TextInput
                  style={styles.textInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  placeholder="Masukkan password saat ini"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password Baru</Text>
                <TextInput
                  style={styles.textInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  placeholder="Masukkan password baru"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Konfirmasi Password Baru</Text>
                <TextInput
                  style={styles.textInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  placeholder="Konfirmasi password baru"
                  secureTextEntry
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowPasswordModal(false)}
                  style={styles.cancelButton}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handlePasswordChange}
                  loading={loading}
                  disabled={loading}
                  style={styles.saveButton}
                >
                  Ubah Password
                </Button>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    borderColor: "#D1D5DB",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
});

export default PrivacySettingsScreen;
