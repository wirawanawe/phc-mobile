import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import TermsScreen from "./src/screens/TermsScreen";
import MainScreen from "./src/screens/MainScreen";
import AssessmentScreen from "./src/screens/AssessmentScreen";
import HealthEducationScreen from "./src/screens/HealthEducationScreen";
import FitnessScreen from "./src/screens/FitnessScreen";
import WellnessScreen from "./src/screens/WellnessScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ConsultationScreen from "./src/screens/ConsultationScreen";
import NewsPortalScreen from "./src/screens/NewsPortalScreen";
import WellnessDetailsScreen from "./src/screens/WellnessDetailsScreen";
import PersonalizedContentScreen from "./src/screens/PersonalizedContentScreen";
import DailyMissionScreen from "./src/screens/DailyMissionScreen";
import NutritionDetailsScreen from "./src/screens/NutritionDetailsScreen";
import CategoryDetailScreen from "./src/screens/CategoryDetailScreen";
import ArticleDetailScreen from "./src/screens/ArticleDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CalculatorScreen from "./src/screens/CalculatorScreen";
import AllCalculatorsScreen from "./src/screens/AllCalculatorsScreen";
import PersonalInformationScreen from "./src/screens/PersonalInformationScreen";
import MissionDetailScreen from "./src/screens/MissionDetailScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import ChatAssistantScreen from "./src/screens/ChatAssistantScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import MoodTrackingScreen from "./src/screens/MoodTrackingScreen";
import HealthInsightsScreen from "./src/screens/HealthInsightsScreen";
import WaterTrackingScreen from "./src/screens/WaterTrackingScreen";
import SleepTrackingScreen from "./src/screens/SleepTrackingScreen";
import MealLoggingScreen from "./src/screens/MealLoggingScreen";
import ClinicBookingScreen from "./src/screens/ClinicBookingScreen";
import BookingConfirmationScreen from "./src/screens/BookingConfirmationScreen";
import BookingSuccessScreen from "./src/screens/BookingSuccessScreen";

// Import theme and context
import { theme } from "./src/theme/theme";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

const Stack = createStackNavigator();

function AppContent() {
  const { isLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(
    null
  );
  const [hasAcceptedTerms, setHasAcceptedTerms] = React.useState<
    boolean | null
  >(null);

  React.useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      const firstLaunch = await AsyncStorage.getItem("isFirstLaunch");
      const termsAccepted = await AsyncStorage.getItem("hasAcceptedTerms");

      setIsFirstLaunch(firstLaunch === null);
      setHasAcceptedTerms(termsAccepted === "true");
    } catch (error) {
      console.error("Error checking app state:", error);
      setIsFirstLaunch(true);
      setHasAcceptedTerms(false);
    }
  };

  if (isLoading || isFirstLaunch === null || hasAcceptedTerms === null) {
    return null; // Loading state
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#D32F2F" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#D32F2F",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {isFirstLaunch && (
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
          )}
          {!hasAcceptedTerms && (
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Assessment"
            component={AssessmentScreen}
            options={{ title: "Health Assessment" }}
          />
          <Stack.Screen
            name="HealthEducation"
            component={HealthEducationScreen}
            options={{ title: "Health Education" }}
          />
          <Stack.Screen
            name="Fitness"
            component={FitnessScreen}
            options={{ title: "Fitness Gamification" }}
          />
          <Stack.Screen
            name="Wellness"
            component={WellnessScreen}
            options={{ title: "Wellness Activities" }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: "Dashboard & Reports" }}
          />
          <Stack.Screen
            name="Consultation"
            component={ConsultationScreen}
            options={{ title: "Expert Consultation" }}
          />
          <Stack.Screen
            name="NewsPortal"
            component={NewsPortalScreen}
            options={{ title: "Health News Portal" }}
          />
          <Stack.Screen
            name="WellnessDetails"
            component={WellnessDetailsScreen}
            options={{ title: "Wellness Details" }}
          />
          <Stack.Screen
            name="PersonalizedContent"
            component={PersonalizedContentScreen}
            options={{ title: "Personalized Content" }}
          />
          <Stack.Screen
            name="DailyMission"
            component={DailyMissionScreen}
            options={{ title: "Daily Mission" }}
          />
          <Stack.Screen
            name="NutritionDetails"
            component={NutritionDetailsScreen}
            options={{ title: "Nutrition Details" }}
          />
          <Stack.Screen
            name="CategoryDetail"
            component={CategoryDetailScreen}
            options={{ title: "Category Details" }}
          />
          <Stack.Screen
            name="ArticleDetail"
            component={ArticleDetailScreen}
            options={{ title: "Article Details" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
          <Stack.Screen
            name="Calculator"
            component={CalculatorScreen}
            options={{ title: "Health Calculator" }}
          />
          <Stack.Screen
            name="AllCalculators"
            component={AllCalculatorsScreen}
            options={{ title: "All Calculators" }}
          />
          <Stack.Screen
            name="PersonalInformation"
            component={PersonalInformationScreen}
            options={{ title: "Personal Information" }}
          />
          <Stack.Screen
            name="MissionDetail"
            component={MissionDetailScreen}
            options={{ title: "Mission Details" }}
          />
          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
            options={{ title: "Notifications" }}
          />
          <Stack.Screen
            name="ChatAssistant"
            component={ChatAssistantScreen}
            options={{ title: "AI Health Assistant" }}
          />
          <Stack.Screen
            name="MoodTracking"
            component={MoodTrackingScreen}
            options={{ title: "Mood & Wellness" }}
          />
          <Stack.Screen
            name="HealthInsights"
            component={HealthInsightsScreen}
            options={{ title: "Health Insights" }}
          />
          <Stack.Screen
            name="WaterTracking"
            component={WaterTrackingScreen}
            options={{ title: "Water Tracking" }}
          />
          <Stack.Screen
            name="SleepTracking"
            component={SleepTrackingScreen}
            options={{ title: "Sleep Tracking" }}
          />
          <Stack.Screen
            name="MealLogging"
            component={MealLoggingScreen}
            options={{ title: "Log Meal" }}
          />
          <Stack.Screen
            name="ClinicBooking"
            component={ClinicBookingScreen}
            options={{ title: "Booking Klinik" }}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ title: "Konfirmasi Booking" }}
          />
          <Stack.Screen
            name="BookingSuccess"
            component={BookingSuccessScreen}
            options={{ title: "Booking Berhasil" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
