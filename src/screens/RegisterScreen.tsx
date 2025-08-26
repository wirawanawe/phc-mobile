import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CustomTheme } from "../theme/theme";
import LogoPutih from "../components/LogoPutih";
import CustomAlert from "../components/CustomAlert";
import useAlert from "../hooks/useAlert";
import { useAuth } from "../contexts/AuthContext";
import { safeGoBack } from "../utils/safeNavigation";
import { CommonActions } from "@react-navigation/native";
import { handleError } from "../utils/errorHandler";

const RegisterScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { register } = useAuth();
  const { alertState, showAlert, hideAlert, showSuccessAlert, showErrorAlert, showWarningAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: new Date('1990-01-01'), // Default date
    gender: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.gender) {
      showWarningAlert(
        "Data Tidak Lengkap",
        "Mohon isi semua field yang diperlukan termasuk tanggal lahir dan jenis kelamin"
      );
      return;
    }

    if (!isValidEmail(formData.email)) {
      showWarningAlert(
        "Email Tidak Valid",
        "Mohon masukkan alamat email yang valid"
      );
      return;
    }

    if (formData.password.length < 6) {
      showWarningAlert(
        "Password Terlalu Pendek",
        "Password minimal 6 karakter"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showWarningAlert(
        "Password Tidak Cocok",
        "Password dan konfirmasi password tidak sama"
      );
      return;
    }

    // Validate date of birth (user must be at least 13 years old)
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (formData.dateOfBirth > minDate) {
      showWarningAlert(
        "Tanggal Lahir Tidak Valid",
        "Anda harus berusia minimal 13 tahun untuk mendaftar"
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
        gender: formData.gender,
      });

      if (result.success) {
        showSuccessAlert(
          "Pendaftaran Berhasil",
          "Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.",
          () => {
            // Registration successful - navigate to Main screen
            navigation.replace("Main");
          }
        );
      } else {
        showErrorAlert(
          "Pendaftaran Gagal",
          result.message || "Pendaftaran gagal. Silakan coba lagi."
        );
      }
    } catch (error: any) {
      console.error("❌ Register: Registration error:", error);
      
      let errorMessage = "Pendaftaran gagal. Silakan coba lagi.";
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes("email already exists") || message.includes("email sudah terdaftar")) {
          errorMessage = "Email sudah terdaftar. Silakan login.";
        } else if (message.includes("invalid email")) {
          errorMessage = "Mohon masukkan alamat email yang valid";
        } else if (message.includes("network") || message.includes("koneksi")) {
          errorMessage = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
        } else if (message.includes("server error")) {
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        }
      }
      
      showErrorAlert("Pendaftaran Gagal", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGenderSelect = (gender: string) => {
    setFormData({ ...formData, gender });
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#E22345", "#C53030"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => safeGoBack(navigation, 'Main')}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LogoPutih size={400} />
              <Text style={styles.welcomeText}>
                Buat Akun
              </Text>
              <Text style={styles.subtitleText}>
                Bergabunglah untuk memulai perjalanan kesehatan Anda
              </Text>
            </View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="account-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nama"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="email-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="phone-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Telepon"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Date of Birth Input */}
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <Text style={[styles.textInput, { color: formData.dateOfBirth ? '#1F2937' : '#9CA3AF' }]}>
                    {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : "Tanggal Lahir"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gender Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.genderLabel}>Jenis Kelamin</Text>
                <View style={styles.genderContainer}>
                  {[
                    { value: 'male', label: 'Laki-laki', icon: 'gender-male' },
                    { value: 'female', label: 'Perempuan', icon: 'gender-female' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderButton,
                        formData.gender === option.value && styles.genderButtonActive
                      ]}
                      onPress={() => handleGenderSelect(option.value)}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={formData.gender === option.value ? '#FFFFFF' : '#9CA3AF'}
                        style={styles.genderIcon}
                      />
                      <Text style={[
                        styles.genderText,
                        formData.gender === option.value && styles.genderTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Konfirmasi Password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                buttonColor="#FFFFFF"
                textColor="#E22345"
              >
                {isLoading 
                  ? "Membuat Akun..." 
                  : "Buat Akun"
                }
              </Button>

              {/* Divider */}
              {/* <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  atau
                </Text>
                <View style={styles.dividerLine} />
              </View> */}

              {/* Social Login Buttons */}
              {/* <View style={styles.socialContainer}>
                <Text style={styles.socialText}>
                  Daftar dengan media sosial
                </Text> */}
                {/* Add social login buttons here */}
              {/* </View> */}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Sudah punya akun?{" "}
                <Text style={styles.loginLink} onPress={handleLogin}>
                  Masuk
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date('1900-01-01')}
          />
        )}

        {/* Custom Alert Modal */}
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          onPress={alertState.onPress}
          onCancel={alertState.onCancel}
          buttonText={alertState.buttonText}
          cancelButtonText={alertState.cancelButtonText}
          showCancelButton={alertState.showCancelButton}
          autoClose={alertState.autoClose}
          autoCloseDelay={alertState.autoCloseDelay}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingTop: 10,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    marginLeft: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButtonActive: {
    backgroundColor: "#E22345",
  },
  genderIcon: {
    marginRight: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
  registerButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  socialText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginLink: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
