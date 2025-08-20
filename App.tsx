import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import TermsScreen from "./src/screens/TermsScreen";
import MainScreen from "./src/screens/MainScreen";
import AssessmentScreen from "./src/screens/AssessmentScreen";
import HealthEducationScreen from "./src/screens/HealthEducationScreen";
import FitnessScreen from "./src/screens/FitnessScreen";
import WellnessScreen from "./src/screens/WellnessScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import DetailDoctor from "./src/screens/DetailDoctor";
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

import ChatDetailScreen from "./src/screens/ChatDetailScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import MoodTrackingScreen from "./src/screens/MoodTrackingScreen";
import MoodInputScreen from "./src/screens/MoodInputScreen";
import HealthInsightsScreen from "./src/screens/HealthInsightsScreen";
import WaterTrackingScreen from "./src/screens/WaterTrackingScreen";
import SleepTrackingScreen from "./src/screens/SleepTrackingScreen";
import MealLoggingScreen from "./src/screens/MealLoggingScreen";
import FitnessTrackingScreen from "./src/screens/FitnessTrackingScreen";
import RealtimeFitnessScreen from "./src/screens/RealtimeFitnessScreen";
import ExerciseHistoryScreen from "./src/screens/ExerciseHistoryScreen";
// Clinic-related imports - temporarily commented out
// import ClinicBookingScreen from "./src/screens/ClinicBookingScreen";
// import BookingConfirmationScreen from "./src/screens/BookingConfirmationScreen";
// import BookingSuccessScreen from "./src/screens/BookingSuccessScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import BookingDetailScreen from "./src/screens/BookingDetailScreen";
import ConsultationBookingScreen from "./src/screens/ConsultationBookingScreen";
import ConsultationPaymentScreen from "./src/screens/ConsultationPaymentScreen";
import ConsultationDetailScreen from "./src/screens/ConsultationDetailScreen";
import ConsultationHistoryScreen from "./src/screens/ConsultationHistoryScreen";

// Import new separated apps
import WellnessApp, { TestWellnessApp } from "./src/screens/WellnessApp";
import WellnessDebugScreen from "./src/screens/WellnessDebugScreen";
// import ClinicsApp from "./src/screens/ClinicsApp"; // Temporarily commented out
import ActivityScreen from "./src/screens/ActivityScreen";
import WellnessActivityDetailScreen from "./src/screens/WellnessActivityDetailScreen";
import WellnessActivityCompletionScreen from "./src/screens/WellnessActivityCompletionScreen";
import AnthropometryScreen from "./src/screens/AnthropometryScreen";


// Import new profile screens
import HealthGoalsScreen from "./src/screens/HealthGoalsScreen";
import MedicalHistoryScreen from "./src/screens/MedicalHistoryScreen";
import WellnessHistoryScreen from "./src/screens/WellnessHistoryScreen";
import PrivacySettingsScreen from "./src/screens/PrivacySettingsScreen";
import HelpSupportScreen from "./src/screens/HelpSupportScreen";
import AboutAppScreen from "./src/screens/AboutAppScreen";
import DebugScreen from "./src/screens/DebugScreen";

// Import theme and context
import { theme } from "./src/theme/theme";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { RootStackParamList } from "./src/types/navigation";


const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(
    null
  );
  const [hasAcceptedTerms, setHasAcceptedTerms] = React.useState<
    boolean | null
  >(null);
  const [isAppReady, setIsAppReady] = React.useState(false);

  React.useEffect(() => {
    checkAppState();
  }, []);



  const checkAppState = async () => {
    try {
      const firstLaunch = await AsyncStorage.getItem("isFirstLaunch");
      const termsAccepted = await AsyncStorage.getItem("hasAcceptedTerms");
      
      setIsFirstLaunch(firstLaunch === null);
      setHasAcceptedTerms(termsAccepted === "true");
      setIsAppReady(true);
    } catch (error) {
      console.error("App: Error checking app state:", error);
      setIsFirstLaunch(true);
      setHasAcceptedTerms(false);
      setIsAppReady(true);
    }
  };

  const handleTermsAccepted = async () => {
    try {
      await AsyncStorage.setItem("isFirstLaunch", "false");
      await AsyncStorage.setItem("hasAcceptedTerms", "true");
      
      // Force immediate state update
      setIsFirstLaunch(false);
      setHasAcceptedTerms(true);
      
      // Add a small delay to ensure state is properly updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error("App: Error updating app state:", error);
    }
  };

  // Show loading screen while app is initializing
  if (isLoading || !isAppReady) {
    return null; // Loading state
  }

  // If first launch, show welcome
  if (isFirstLaunch) {
    console.log("App: Showing first launch flow");
    return (
      <PaperProvider theme={theme}>
        <NavigationContainer key="first-launch">
          <StatusBar style="light" backgroundColor="#D32F2F" />
          <Stack.Navigator>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Terms"
              component={(props: any) => (
                <TermsScreen {...props} onTermsAccepted={handleTermsAccepted} />
              )}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    );
  }

  // Show main app with proper navigation
  console.log("App: Showing main app with proper navigation");

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer key="main-app">
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
          {/* Main app screens - accessible without authentication */}
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          
          {/* Authentication screens - always available */}
          <Stack.Screen
            name="Terms"
            component={(props: any) => (
              <TermsScreen {...props} onTermsAccepted={handleTermsAccepted} />
            )}
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
            name="Activity"
            component={ActivityScreen}
            options={{ title: "Activity Tracking" }}
          />
          <Stack.Screen
            name="WellnessActivityDetail"
            component={WellnessActivityDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WellnessActivityCompletion"
            component={WellnessActivityCompletionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DetailDoctor"
            component={DetailDoctor}
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
            component={(props: any) => <ArticleDetailScreen {...props} />}
            options={{ title: "Article Details" }}
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
            name="ChatDetail"
            component={ChatDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MoodTracking"
            component={MoodTrackingScreen}
            options={{ title: "Mood & Wellness" }}
          />
          <Stack.Screen
            name="MoodInput"
            component={MoodInputScreen}
            options={{ headerShown: false }}
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
            name="FitnessTracking"
            component={FitnessTrackingScreen}
            options={{ title: "Track Fitness" }}
          />
          <Stack.Screen
            name="Anthropometry"
            component={AnthropometryScreen}
            options={{ title: "Antropometri" }}
          />
          <Stack.Screen
            name="RealtimeFitness"
            component={RealtimeFitnessScreen}
            options={{ title: "Real-time Fitness" }}
          />
          <Stack.Screen
            name="ExerciseHistory"
            component={ExerciseHistoryScreen}
            options={{ title: "Exercise History" }}
          />
          
          {/* Authentication-required screens */}
          {isAuthenticated && (
            <>
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Dashboard & Reports" }}
              />
              <Stack.Screen
                name="DailyMission"
                component={DailyMissionScreen}
                options={{ title: "Daily Mission" }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profile" }}
              />
              <Stack.Screen
                name="HealthGoals"
                component={HealthGoalsScreen}
                options={{ title: "Health Goals" }}
              />
              <Stack.Screen
                name="MedicalHistory"
                component={MedicalHistoryScreen}
                options={{ title: "Medical History" }}
              />
              <Stack.Screen
                name="WellnessHistory"
                component={WellnessHistoryScreen}
                options={{ title: "Wellness History" }}
              />
              <Stack.Screen
                name="PrivacySettings"
                component={PrivacySettingsScreen}
                options={{ title: "Privacy Settings" }}
              />
              <Stack.Screen
                name="HelpSupport"
                component={HelpSupportScreen}
                options={{ title: "Help & Support" }}
              />
              <Stack.Screen
                name="AboutApp"
                component={AboutAppScreen}
                options={{ title: "About App" }}
              />
              <Stack.Screen
                name="Debug"
                component={DebugScreen}
                options={{ title: "Debug Tools" }}
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
              {/* Clinic-related screens - temporarily commented out */}
              {/* <Stack.Screen
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
              <Stack.Screen
                name="BookingDetail"
                component={BookingDetailScreen}
                options={{ headerShown: false }}
              /> */}
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: "Admin Dashboard" }}
              />
              
              {/* Consultation Screens */}
              <Stack.Screen
                name="ConsultationBooking"
                component={ConsultationBookingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConsultationPayment"
                component={ConsultationPaymentScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConsultationDetail"
                component={ConsultationDetailScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConsultationHistory"
                component={ConsultationHistoryScreen}
                options={{ headerShown: false }}
              />
              
              {/* New separated apps - require authentication */}
              <Stack.Screen
                name="WellnessApp"
                component={WellnessApp}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="WellnessDebug"
                component={WellnessDebugScreen}
                options={{ headerShown: false }}
              />
              {/* ClinicsApp and related screens - temporarily commented out */}
              {/* <Stack.Screen
                name="ClinicsApp"
                component={ClinicsApp}
                options={{ headerShown: false }}
              />
              
              <Stack.Screen
                name="ClinicDetail"
                component={ClinicBookingScreen}
                options={{ title: "Detail Klinik" }}
              />
              <Stack.Screen
                name="BookingHistory"
                component={ClinicBookingScreen}
                options={{ title: "Riwayat Booking" }}
              /> */}
            </>
          )}
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
