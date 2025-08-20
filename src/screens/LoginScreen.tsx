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
import LoginErrorDisplay from "../components/LoginErrorDisplay";
import SocialLoginButtons from "../components/SocialLoginButtons";
import OTPVerification from "../components/OTPVerification";
import { safeGoBack } from "../utils/safeNavigation";
import { useAuth } from "../contexts/AuthContext";

import { CommonActions } from "@react-navigation/native";
import { handleError } from "../utils/errorHandler";


const LoginScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Social login states
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [socialLoginData, setSocialLoginData] = useState<any>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleLogin = async () => {
    // Clear any previous errors
    setError("");

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setError("Mohon isi semua field yang diperlukan");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Mohon masukkan alamat email yang valid");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Login successful - navigate to Main screen
        navigation.replace("Main");
      } else {
        setError(result.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("❌ Login: Login error:", error);
      
      // Enhanced error handling for invalid credentials
      let errorMessage = "Login gagal. Silakan coba lagi.";
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        
        // Handle specific invalid credential cases
        if (message.includes("invalid credentials") || 
            message.includes("email atau password salah") ||
            message.includes("kredensial tidak valid")) {
          errorMessage = "Email atau password salah. Silakan periksa kembali.";
        } else if (message.includes("user not found") || 
                   message.includes("user tidak ditemukan")) {
          errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
        } else if (message.includes("account is deactivated") || 
                   message.includes("akun dinonaktifkan")) {
          errorMessage = "Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.";
        } else if (message.includes("too many attempts") || 
                   message.includes("terlalu banyak percobaan")) {
          errorMessage = "Terlalu banyak percobaan login. Silakan tunggu beberapa menit.";
        } else if (message.includes("network") || 
                   message.includes("koneksi")) {
          errorMessage = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
        } else if (message.includes("authentication failed")) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (message.includes("server error")) {
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        } else if (message.includes("timeout")) {
          errorMessage = "Koneksi timeout. Silakan coba lagi.";
        } else {
          errorMessage = error.message;
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

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be implemented soon.",
      [{ text: "OK" }]
    );
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };



  // Social login handlers
  const handleSocialLoginSuccess = (data: any) => {
    setSocialLoginData(data);
    setShowOTPVerification(true);
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  const handleOTPVerificationSuccess = async (data: any) => {
    try {
      // OTP verification successful - complete social login process
      
      // Use the social login method to properly authenticate the user
      const success = await socialLogin(data.user, data.token);
      
      if (success) {
        navigation.replace("Main");
      }
    } catch (error) {
      setError('Social login verification failed. Please try again.');
    }
  };

  const handleOTPVerificationError = (error: string) => {
    setError(error);
    setShowOTPVerification(false);
  };

  const handleResendOTP = async () => {
    // Re-trigger the social login process to get a new OTP
    setSocialLoading(true);
    try {
      // This would typically call the social auth service again
      // For now, we'll just show a success message
      Alert.alert('Success', 'New OTP has been sent');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTPVerification(false);
    setSocialLoginData(null);
    setError('');
  };

  // Show OTP verification screen if needed
  if (showOTPVerification && socialLoginData) {
    return (
      <OTPVerification
        email={socialLoginData.user.email}
        authMethod={socialLoginData.authMethod}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onVerificationError={handleOTPVerificationError}
        onResendOTP={handleResendOTP}
        onCancel={handleCancelOTP}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#E22345", "#C41E3A"]} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
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
              <LogoPutih size="large" />
              <Text style={styles.welcomeText}>
          Selamat Datang Kembali!
        </Text>
                              <Text style={styles.subtitleText}>
                  Masuk untuk melanjutkan perjalanan kesehatan Anda
                </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="email-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {/* Error Display */}
              <LoginErrorDisplay
                error={error}
                onClearError={() => setError("")}
                onRetry={handleLogin}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>
                  Lupa Password?
                </Text>
              </TouchableOpacity>

             

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                buttonColor="#FFFFFF"
                textColor="#E22345"
              >
                {isLoading 
                  ? "Sedang Masuk..." 
                  : "Masuk"
                }
              </Button>



              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  atau
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <SocialLoginButtons
                onSocialLoginSuccess={handleSocialLoginSuccess}
                onSocialLoginError={handleSocialLoginError}
                loading={socialLoading}
              />


            </View>

                          {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Tidak punya akun?{" "}
                  <Text style={styles.registerLink} onPress={handleRegister}>
                    Daftar
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
    top: 50,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  logo: {
    width: 100,
    height: 100,
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
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  registerLink: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

});

export default LoginScreen;
