import React, { useState, useEffect } from "react";
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
import NetInfo from "@react-native-community/netinfo";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import LogoPutih from "../components/LogoPutih";
import LoginErrorDisplay from "../components/LoginErrorDisplay";
import LoginAlert from "../components/LoginAlert";
import SocialLoginButtons from "../components/SocialLoginButtons";

import { safeGoBack } from "../utils/safeNavigation";
import { useAuth } from "../contexts/AuthContext";
import { parseAuthError } from "../utils/authErrorHandler";
import { handleError, parseError } from "../utils/errorHandler";
import { showSuccessAlert, showErrorAlert, showWarningAlert, showInfoAlert, ALERT_MESSAGES } from "../utils/alertUtils";

import { CommonActions } from "@react-navigation/native";

const LoginScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Login alert states
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('error');
  
  // Social login states
  const [socialLoading, setSocialLoading] = useState(false);

  // Network connectivity state
  const [isConnected, setIsConnected] = useState(true);

  // Check network connectivity on mount
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected ?? true);
      } catch (error) {
        console.log('Network check failed:', error);
        setIsConnected(true); // Assume connected if check fails
      }
    };

    checkConnectivity();

    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    // Clear previous errors
    setError("");
    setShowLoginAlert(false);

    // Check network connectivity first
    if (!isConnected) {
      setError("Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.");
      return false;
    }

    // Email validation
    if (!email.trim()) {
      setError("Email tidak boleh kosong");
      return false;
    }

    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Contoh: user@example.com");
      return false;
    }

    // Password validation
    if (!password.trim()) {
      setError("Password tidak boleh kosong");
      return false;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Login: Attempting login...");
      const result = await login(email, password);
      console.log("🔐 Login: Result:", result);

      if (result.success) {
        console.log("✅ Login: Success, navigating to Main");
        // Show success message before navigation
        showSuccessAlert(
          ALERT_MESSAGES.LOGIN_SUCCESS.title,
          ALERT_MESSAGES.LOGIN_SUCCESS.message,
          () => {
            // Navigate to Main screen
            setTimeout(() => {
              navigation.replace("Main");
            }, 100);
          }
        );
      } else {
        // Handle login failure with enhanced error handling
        const errorInfo = parseAuthError(new Error(result.message || "Login gagal"));
        
        // Show specific alert based on error type
        if (errorInfo.type === '401') {
          if (result.message?.includes('email tidak terdaftar')) {
            setAlertMessage("Email tidak terdaftar. Silakan daftar terlebih dahulu atau periksa kembali email Anda.");
            setAlertType('warning');
          } else if (result.message?.includes('password salah')) {
            setAlertMessage("Password salah. Silakan periksa kembali password Anda.");
            setAlertType('error');
          } else {
            setAlertMessage("Email atau password salah. Silakan periksa kembali kredensial Anda.");
            setAlertType('error');
          }
        } else if (errorInfo.type === '403') {
          setAlertMessage("Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan lebih lanjut.");
          setAlertType('warning');
        } else if (errorInfo.type === 'rate_limit') {
          setAlertMessage("Terlalu banyak percobaan login. Silakan tunggu 5 menit sebelum mencoba lagi.");
          setAlertType('warning');
        } else {
          setAlertMessage(errorInfo.userMessage);
          setAlertType('error');
        }
        
        setShowLoginAlert(true);
      }
    } catch (error: any) {
      console.error("❌ Login: Login error:", error);
      
      // Enhanced error parsing and handling
      const errorInfo = parseError(error);
      const authErrorInfo = parseAuthError(error);
      
      let finalMessage = authErrorInfo.userMessage;
      let finalType: 'error' | 'warning' | 'info' = 'error';
      
      // Handle specific error cases
      if (errorInfo.type === 'NETWORK') {
        finalMessage = "Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.";
        finalType = 'warning';
      } else if (errorInfo.type === 'TIMEOUT') {
        finalMessage = "Koneksi timeout. Silakan coba lagi.";
        finalType = 'warning';
      } else if (errorInfo.type === 'SERVER') {
        finalMessage = "Server sedang mengalami gangguan. Silakan coba lagi dalam beberapa menit.";
        finalType = 'warning';
      } else if (errorInfo.type === 'RATE_LIMIT') {
        finalMessage = "Terlalu banyak percobaan login. Silakan tunggu beberapa menit sebelum mencoba lagi.";
        finalType = 'warning';
      }
      
      setAlertMessage(finalMessage);
      setAlertType(finalType);
      setShowLoginAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  // Login Alert Handlers
  const handleAlertClose = () => {
    setShowLoginAlert(false);
  };

  const handleAlertRetry = () => {
    setShowLoginAlert(false);
    // Add small delay before retry
    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  const handleAlertRegister = () => {
    setShowLoginAlert(false);
    navigation.navigate("Register");
  };

  const handleAlertForgotPassword = () => {
    setShowLoginAlert(false);
    handleForgotPassword();
  };

  // Social login handlers
  const handleSocialLoginSuccess = async (data: any) => {
    try {
      setSocialLoading(true);
      
      // Use the social login method to properly authenticate the user
      const success = await socialLogin(data.user, data.accessToken);
      
      if (success) {
        showSuccessAlert(
          ALERT_MESSAGES.LOGIN_SUCCESS.title,
          ALERT_MESSAGES.LOGIN_SUCCESS.message,
          () => navigation.replace("Main")
        );
      } else {
        setError('Social login gagal. Silakan coba lagi.');
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      const errorInfo = parseError(error);
      setError(errorInfo.userMessage);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
    setSocialLoading(false);
  };

  // Network status indicator
  const renderNetworkStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.networkWarning}>
          <Icon name="wifi-off" size={16} color="#FFFFFF" />
          <Text style={styles.networkWarningText}>
            Tidak ada koneksi internet
          </Text>
        </View>
      );
    }
    return null;
  };

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
            {/* Network Status */}
            {renderNetworkStatus()}

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => safeGoBack(navigation, 'Main')}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LogoPutih size={500} />
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
                    onChangeText={(text) => {
                      setEmail(text);
                      // Clear error when user starts typing
                      if (error) setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
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
                    onChangeText={(text) => {
                      setPassword(text);
                      // Clear error when user starts typing
                      if (error) setError("");
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Display */}
              <LoginErrorDisplay
                error={error}
                onClearError={() => setError("")}
                onRetry={handleLogin}
              />

              {/* Login Alert */}
              <LoginAlert
                visible={showLoginAlert}
                message={alertMessage}
                type={alertType}
                onRetry={handleAlertRetry}
                onRegister={handleAlertRegister}
                onForgotPassword={handleAlertForgotPassword}
                onClose={handleAlertClose}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
                disabled={isLoading}
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
                disabled={isLoading || !isConnected}
                style={[
                  styles.loginButton,
                  (!isConnected || isLoading) && styles.loginButtonDisabled
                ]}
                labelStyle={styles.loginButtonText}
                buttonColor="#FFFFFF"
                textColor="#E22345"
              >
                {isLoading 
                  ? "Sedang Masuk..." 
                  : !isConnected
                  ? "Tidak Ada Koneksi"
                  : "Masuk"
                }
              </Button>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Tidak punya akun?{" "}
                  <Text style={styles.registerLink} onPress={handleRegister}>
                    Daftar
                  </Text>
                </Text>
              </View>
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
  networkWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  networkWarningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
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
  loginButtonDisabled: {
    opacity: 0.6,
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
