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
  Modal,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import LogoPutih from "../components/LogoPutih";
import { useAuth } from "../contexts/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const RegisterScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const updateFormData = (field: string, value: string) => {
    // Special handling for phone number - only allow digits
    if (field === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Masukkan alamat email yang valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = "Nomor telepon hanya boleh berisi angka";
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = "Nomor telepon minimal 10 digit";
    } else if (formData.phone.trim().length > 15) {
      newErrors.phone = "Nomor telepon maksimal 15 digit";
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Tanggal lahir wajib diisi";
    }

    if (!formData.gender.trim()) {
      newErrors.gender = "Jenis kelamin wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for backend (remove confirmPassword and ensure proper field names)
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender.toLowerCase(),
      };

      const success = await register(registerData);

      if (success) {
        Alert.alert(
          "Registrasi Berhasil",
          "Akun Anda telah berhasil dibuat. Silakan masuk.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registrasi gagal. Silakan coba lagi.";

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
        } else if (error.message.includes("Network request failed")) {
          errorMessage = "Koneksi gagal. Pastikan internet Anda terhubung.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Koneksi timeout. Silakan coba lagi.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error Registrasi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    field: string,
    placeholder: string,
    icon: string,
    keyboardType: any = "default",
    secureTextEntry?: boolean,
    showEyeIcon?: boolean,
    onEyePress?: () => void
  ) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <Icon name={icon} size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => updateFormData(field, value)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={field === "email" ? "none" : "words"}
          autoCorrect={false}
        />
        {showEyeIcon && (
          <TouchableOpacity onPress={onEyePress} style={styles.eyeIcon}>
            <Icon
              name={secureTextEntry ? "eye-off" : "eye"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Date picker handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      updateFormData("dateOfBirth", iso);
    }
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LogoPutih size="medium" />
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>
                Join PHC Mobile for better health
              </Text>
            </View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              {renderInput("name", "Full Name", "account-outline")}
              {renderInput(
                "email",
                "Email Address",
                "email-outline",
                "email-address"
              )}
              {renderInput("phone", "Phone Number", "phone-outline", "numeric")}
              {/* Date of Birth Picker */}
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="calendar"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.textInput,
                      { color: formData.dateOfBirth ? "#1F2937" : "#9CA3AF" },
                    ]}
                  >
                    {formData.dateOfBirth
                      ? formData.dateOfBirth
                      : "Date of Birth"}
                  </Text>
                </TouchableOpacity>
                {errors.dateOfBirth && (
                  <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              {/* Gender Dropdown */}
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    errors.gender && styles.inputError,
                  ]}
                  onPress={() => setShowGenderDropdown(true)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="gender-male-female"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.textInput,
                      { color: formData.gender ? "#1F2937" : "#9CA3AF" },
                    ]}
                  >
                    {formData.gender
                      ? formData.gender.charAt(0).toUpperCase() +
                        formData.gender.slice(1)
                      : "Pilih Jenis Kelamin"}
                  </Text>
                  <Icon
                    name={showGenderDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>
              {renderInput(
                "password",
                "Password",
                "lock-outline",
                "default",
                !showPassword,
                true,
                () => setShowPassword(!showPassword)
              )}
              {renderInput(
                "confirmPassword",
                "Confirm Password",
                "lock-check-outline",
                "default",
                !showConfirmPassword,
                true,
                () => setShowConfirmPassword(!showConfirmPassword)
              )}

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </View>

            {/* Gender Dropdown Modal */}
            <Modal
              visible={showGenderDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowGenderDropdown(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowGenderDropdown(false)}
              >
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Pilih Jenis Kelamin</Text>
                  {["male", "female", "other"].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.dropdownItem,
                        formData.gender === gender &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        updateFormData("gender", gender);
                        setShowGenderDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          formData.gender === gender &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                      {formData.gender === gender && (
                        <Icon name="check" size={20} color="#E22345" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate("Login")}
                >
                  Sign In
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
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 0,
    padding: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingTop: 10,
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
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginLink: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  helpText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    marginLeft: 4,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(226, 35, 69, 0.1)",
    borderColor: "#E22345",
    borderWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  dropdownItemTextSelected: {
    color: "#E22345",
    fontWeight: "600",
  },
});

export default RegisterScreen;
