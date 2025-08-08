import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import LogoPutih from "../components/LogoPutih";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { CommonActions } from "@react-navigation/native";
import { handleError } from "../utils/errorHandler";

const RegisterScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // Clear any previous errors
    setError("");

    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError(t("language.language") === "en" ? "Please fill in all required fields" : "Mohon isi semua field yang diperlukan");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError(t("language.language") === "en" ? "Please enter a valid email address" : "Mohon masukkan alamat email yang valid");
      return;
    }

    if (formData.password.length < 6) {
      setError(t("language.language") === "en" ? "Password must be at least 6 characters" : "Password minimal 6 karakter");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("language.language") === "en" ? "Passwords do not match" : "Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (result.success) {
        // Registration successful - navigate to Main screen
        navigation.replace("Main");
      } else {
        setError(result.message || (t("language.language") === "en" ? "Registration failed. Please try again." : "Pendaftaran gagal. Silakan coba lagi."));
      }
    } catch (error: any) {
      console.error("❌ Register: Registration error:", error);
      
      let errorMessage = t("language.language") === "en" ? "Registration failed. Please try again." : "Pendaftaran gagal. Silakan coba lagi.";
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes("email already exists") || message.includes("email sudah terdaftar")) {
          errorMessage = t("language.language") === "en" ? "Email already registered. Please login instead." : "Email sudah terdaftar. Silakan login.";
        } else if (message.includes("invalid email")) {
          errorMessage = t("language.language") === "en" ? "Please enter a valid email address" : "Mohon masukkan alamat email yang valid";
        } else if (message.includes("network") || message.includes("koneksi")) {
          errorMessage = t("language.language") === "en" ? "Connection failed. Check your internet and try again." : "Koneksi gagal. Periksa internet Anda dan coba lagi.";
        } else if (message.includes("server error")) {
          errorMessage = t("language.language") === "en" ? "Server error occurred. Please try again later." : "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LogoPutih size="large" />
              <Text style={styles.welcomeText}>
                {t("language.language") === "en" ? "Create Account" : "Buat Akun"}
              </Text>
              <Text style={styles.subtitleText}>
                {t("language.language") === "en" 
                  ? "Join us to start your health journey"
                  : "Bergabunglah untuk memulai perjalanan kesehatan Anda"
                }
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
                    placeholder={t("form.name")}
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
                    placeholder={t("auth.email")}
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
                    placeholder={t("form.phone")}
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
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
                    placeholder={t("auth.password")}
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
                    placeholder={t("auth.confirmPassword")}
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              {/* Error Display */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

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
                  ? (t("language.language") === "en" ? "Creating Account..." : "Membuat Akun...") 
                  : t("auth.createAccount")
                }
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {t("language.language") === "en" ? "or" : "atau"}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialText}>
                  {t("language.language") === "en" 
                    ? "Register with social media"
                    : "Daftar dengan media sosial"
                  }
                </Text>
                {/* Add social login buttons here */}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t("auth.alreadyHaveAccount")}{" "}
                <Text style={styles.loginLink} onPress={handleLogin}>
                  {t("auth.login")}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    top: 0,
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
