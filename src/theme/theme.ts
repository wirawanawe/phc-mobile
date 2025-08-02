import { MD3LightTheme, MD3Theme } from "react-native-paper";

export interface CustomTheme extends MD3Theme {
  customColors: {
    lightGreen: string;
    lightRed: string;
    darkRed: string;
    darkGreen: string;
    // WeCare-inspired colors
    primaryGradient: string[];
    secondaryGradient: string[];
    accentBlue: string;
    softPink: string;
    warmOrange: string;
    lightPurple: string;
    softGray: string;
    darkGray: string;
    successGreen: string;
    warningYellow: string;
    infoBlue: string;
    // Modern UI colors
    cardBackground: string;
    shadowColor: string;
    borderColor: string;
    textSecondary: string;
    textTertiary: string;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

export const theme: CustomTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#E53E3E", // Merah PHC yang lebih modern
    secondary: "#C53030", // Merah gelap yang lebih soft
    tertiary: "#FF6B8A", // Pink accent yang modern
    background: "#FAFBFC", // Background yang lebih warm
    surface: "#FFFFFF", // Pure white
    surfaceVariant: "#F7FAFC", // Light gray yang lebih soft
    onPrimary: "#FFFFFF", // White text on primary
    onSecondary: "#FFFFFF", // White text on secondary
    onBackground: "#2D3748", // Dark gray text yang lebih modern
    onSurface: "#2D3748", // Dark gray text
    error: "#E53E3E", // Red for errors
    outline: "#E2E8F0", // Border color yang soft
  },
  customColors: {
    lightGreen: "#F0FDF4", // Very light green
    lightRed: "#FEF2F2", // Very light red
    darkRed: "#C53030", // Darker red yang modern
    darkGreen: "#16A34A", // Darker green
    // PHC-inspired colors
    primaryGradient: ["#E53E3E", "#C53030"], // Merah gradient yang modern
    secondaryGradient: ["#FF6B8A", "#FFB8D6"], // Pink gradient yang soft
    accentBlue: "#3182CE", // Blue accent yang lebih deep
    softPink: "#ED64A6", // Soft pink
    warmOrange: "#ED8936", // Warm orange
    lightPurple: "#9F7AEA", // Light purple
    softGray: "#F7FAFC", // Very soft gray
    darkGray: "#4A5568", // Dark gray yang modern
    successGreen: "#38A169", // Success green
    warningYellow: "#D69E2E", // Warning yellow
    infoBlue: "#3182CE", // Info blue
    // Modern UI colors
    cardBackground: "#FFFFFF",
    shadowColor: "rgba(16, 24, 40, 0.1)",
    borderColor: "#E2E8F0",
    textSecondary: "#718096",
    textTertiary: "#A0AEC0",
  },
  shadows: {
    small: {
      shadowColor: "rgba(16, 24, 40, 0.08)",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "rgba(16, 24, 40, 0.12)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: "rgba(16, 24, 40, 0.16)",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
};
