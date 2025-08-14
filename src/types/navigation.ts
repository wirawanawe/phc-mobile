import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
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
  MissionDetail: { missionId: string };
  Notification: undefined;
  ChatAssistant: undefined;
  ChatDetail: undefined;
  Login: undefined;
  Register: undefined;
  MoodTracking: undefined;
  HealthInsights: undefined;
  WaterTracking: undefined;
  SleepTracking: undefined;
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
  Activity: undefined;
  WellnessActivityDetail: { activity: any };
  HealthGoals: undefined;
  MedicalHistory: undefined;
  PrivacySettings: undefined;
  HelpSupport: undefined;
  AboutApp: undefined;
  Debug: undefined;
  ChatDetail: { chatId: string };
  PaymentProof: { consultationId: string };
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

export type WellnessActivityDetailScreenProps = {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, 'WellnessActivityDetail'>;
};

export type ConsultationPaymentScreenProps = {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, 'ConsultationPayment'>;
};
