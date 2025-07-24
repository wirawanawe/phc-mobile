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
  };
}

export const theme: CustomTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#D32F2F", // Merah PHC
    secondary: "#B71C1C", // Merah gelap
    tertiary: "#FF6B6B", // Merah muda
    background: "#FAFAFA", // Very light gray
    surface: "#FFFFFF", // Pure white
    surfaceVariant: "#F3F4F6", // Light gray
    onPrimary: "#FFFFFF", // White text on primary
    onSecondary: "#FFFFFF", // White text on secondary
    onBackground: "#1F2937", // Dark gray text
    onSurface: "#1F2937", // Dark gray text
    error: "#EF4444", // Red for errors
  },
  customColors: {
    lightGreen: "#D1FAE5", // Very light green
    lightRed: "#FEE2E2", // Very light red
    darkRed: "#DC2626", // Darker red
    darkGreen: "#059669", // Darker green
    // PHC-inspired colors
    primaryGradient: ["#D32F2F", "#B71C1C"], // Merah gradient
    secondaryGradient: ["#FF6B6B", "#FF8A80"], // Merah muda gradient
    accentBlue: "#3B82F6", // Blue accent
    softPink: "#F472B6", // Soft pink
    warmOrange: "#FB923C", // Warm orange
    lightPurple: "#A78BFA", // Light purple
    softGray: "#F9FAFB", // Very soft gray
    darkGray: "#374151", // Dark gray
    successGreen: "#10B981", // Success green
    warningYellow: "#F59E0B", // Warning yellow
    infoBlue: "#3B82F6", // Info blue
  },
};
