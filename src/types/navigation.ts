import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Terms: undefined;
  Main: undefined;
  Assessment: undefined;
  HealthEducation: undefined;
  Fitness: undefined;
  Wellness: undefined;
  Dashboard: undefined;
  DetailDoctor: { doctorId: string };
  NewsPortal: undefined;
  WellnessDetails: undefined;
  PersonalizedContent: undefined;
  DailyMission: undefined;
  NutritionDetails: undefined;
  CategoryDetail: undefined;
  ArticleDetail: undefined;
  Profile: undefined;
  Calculator: undefined;
  AllCalculators: undefined;
  PersonalInformation: undefined;
  MissionDetail: { 
    mission: any; 
    userMission: any; 
  };

  Notification: undefined;
  ChatAssistant: undefined;
  Login: undefined;
  Register: undefined;
  MoodTracking: undefined;
  MoodInput: { isEditMode?: boolean; existingMood?: any };
  HealthInsights: undefined;
  WaterTracking: undefined;
  SleepTracking: undefined;
  SleepHistory: undefined;
  MealLogging: undefined;
  FitnessTracking: undefined;
  RealtimeFitness: undefined;
  ExerciseHistory: undefined;
  AdminDashboard: undefined;
  BookingDetail: { bookingId: string };
  ConsultationBooking: undefined;
  ConsultationPayment: { consultationId: string };
  ConsultationDetail: { consultationId: string };
  ConsultationHistory: undefined;
  WellnessApp: undefined;
  TestWellnessApp: undefined;
  WellnessDebug: undefined;
  Activity: undefined;
  HabitActivity: undefined;
  WellnessActivityDetail: { activity: any };
  WellnessActivityCompletion: { activity: any };
  HealthGoals: undefined;
  MedicalHistory: undefined;
  WellnessHistory: undefined;
  PinSettings: undefined;
  PrivacySettings: undefined;
  HelpSupport: undefined;
  AboutApp: undefined;
  Debug: undefined;
  ChatDetail: { chatId: string };
  PaymentProof: { consultationId: string };
  Anthropometry: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  ForgotPin: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

export type WellnessActivityDetailScreenProps = {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, 'WellnessActivityDetail'>;
};

export type WellnessActivityCompletionScreenProps = {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, 'WellnessActivityCompletion'>;
};

export type ConsultationPaymentScreenProps = {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, 'ConsultationPayment'>;
};
