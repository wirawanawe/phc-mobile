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
import HealthInsightsScreen from "./src/screens/HealthInsightsScreen";
import WaterTrackingScreen from "./src/screens/WaterTrackingScreen";
import SleepTrackingScreen from "./src/screens/SleepTrackingScreen";
import MealLoggingScreen from "./src/screens/MealLoggingScreen";
import FitnessTrackingScreen from "./src/screens/FitnessTrackingScreen";
import RealtimeFitnessScreen from "./src/screens/RealtimeFitnessScreen";
import ClinicBookingScreen from "./src/screens/ClinicBookingScreen";
import BookingConfirmationScreen from "./src/screens/BookingConfirmationScreen";
import BookingSuccessScreen from "./src/screens/BookingSuccessScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import BookingDetailScreen from "./src/screens/BookingDetailScreen";
import ConsultationBookingScreen from "./src/screens/ConsultationBookingScreen";
import ConsultationPaymentScreen from "./src/screens/ConsultationPaymentScreen";
import ConsultationDetailScreen from "./src/screens/ConsultationDetailScreen";
import ConsultationHistoryScreen from "./src/screens/ConsultationHistoryScreen";

// Import new separated apps
import WellnessApp, { TestWellnessApp } from "./src/screens/WellnessApp";
import ClinicsApp from "./src/screens/ClinicsApp";
import ActivityScreen from "./src/screens/ActivityScreen";
import WellnessActivityDetailScreen from "./src/screens/WellnessActivityDetailScreen";
import ConnectionDebugScreen from "./src/screens/ConnectionDebugScreen";

// Import theme and context
import { theme } from "./src/theme/theme";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

const Stack = createStackNavigator();

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

  // Debug effect to monitor state changes
  React.useEffect(() => {
    console.log("App: State changed:", { 
      isFirstLaunch, 
      hasAcceptedTerms, 
      isLoading, 
      isAuthenticated,
      isAppReady 
    });
  }, [isFirstLaunch, hasAcceptedTerms, isLoading, isAuthenticated, isAppReady]);

  const checkAppState = async () => {
    try {
      console.log("App: Checking app state...");
      const firstLaunch = await AsyncStorage.getItem("isFirstLaunch");
      const termsAccepted = await AsyncStorage.getItem("hasAcceptedTerms");

      console.log("App: App state check results:", { firstLaunch, termsAccepted });
      
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
      console.log("App: Terms accepted, updating app state...");
      await AsyncStorage.setItem("isFirstLaunch", "false");
      await AsyncStorage.setItem("hasAcceptedTerms", "true");
      
      // Force immediate state update
      setIsFirstLaunch(false);
      setHasAcceptedTerms(true);
      
      console.log("App: App state updated successfully");
      
      // Add a small delay to ensure state is properly updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error("App: Error updating app state:", error);
    }
  };

  // Debug logging
  console.log("App: Current state:", { 
    isLoading, 
    isFirstLaunch, 
    hasAcceptedTerms, 
    isAuthenticated,
    isAppReady 
  });

  // Show loading screen while app is initializing
  if (isLoading || !isAppReady) {
    console.log("App: Showing loading screen");
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
            name="ConnectionDebug"
            component={ConnectionDebugScreen}
            options={{ title: "Connection Debug" }}
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
            name="RealtimeFitness"
            component={RealtimeFitnessScreen}
            options={{ title: "Real-time Fitness" }}
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
              />
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
                name="ClinicsApp"
                component={ClinicsApp}
                options={{ headerShown: false }}
              />
              
              {/* Clinics App Screens */}
              <Stack.Screen
                name="ClinicDetail"
                component={ClinicBookingScreen}
                options={{ title: "Detail Klinik" }}
              />
              <Stack.Screen
                name="BookingHistory"
                component={ClinicBookingScreen}
                options={{ title: "Riwayat Booking" }}
              />
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
