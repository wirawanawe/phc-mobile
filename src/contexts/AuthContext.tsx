import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  points: number;
  level?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");

      if (authToken && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://10.0.2.2:5432/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (response.ok && responseData.success) {
        const userData: User = {
          id: responseData.data.user.id.toString(),
          name: responseData.data.user.name,
          email: responseData.data.user.email,
          phone: responseData.data.user.phone || "",
          date_of_birth: responseData.data.user.date_of_birth || "",
          gender: responseData.data.user.gender || "",
          points: responseData.data.user.points || 0,
          level: responseData.data.user.level || 1,
        };

        await AsyncStorage.setItem("authToken", responseData.data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setUser(userData);
        return true;
      } else {
        console.error("Login failed:", responseData);
        // Provide more specific error messages
        let errorMessage = "Login gagal. Silakan coba lagi.";

        if (responseData.message) {
          if (responseData.message.includes("Invalid credentials")) {
            errorMessage = "Email atau password salah. Silakan cek kembali.";
          } else if (responseData.message.includes("Account is deactivated")) {
            errorMessage = "Akun telah dinonaktifkan. Hubungi admin.";
          } else {
            errorMessage = responseData.message;
          }
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle network errors specifically
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        throw new Error(
          "Koneksi gagal. Pastikan internet Anda terhubung dan backend berjalan."
        );
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Tidak dapat terhubung ke server. Pastikan backend berjalan."
        );
      }

      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch("http://10.0.2.2:5432/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse registration response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (response.ok && responseData.success) {
        return true;
      } else {
        console.error("Registration failed:", responseData);
        // Provide more specific error messages
        let errorMessage = "Registrasi gagal. Silakan coba lagi.";

        if (responseData.message) {
          if (responseData.message.includes("already exists")) {
            errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
          } else if (responseData.message.includes("validation")) {
            errorMessage = "Data tidak valid. Silakan cek kembali.";
          } else {
            errorMessage = responseData.message;
          }
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Handle network errors specifically
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        throw new Error(
          "Koneksi gagal. Pastikan internet Anda terhubung dan backend berjalan."
        );
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Tidak dapat terhubung ke server. Pastikan backend berjalan."
        );
      }

      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          type: error.constructor.name,
        });
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
