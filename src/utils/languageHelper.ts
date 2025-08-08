import { useLanguage } from "../contexts/LanguageContext";

// Helper function to get language-aware text
export const getLanguageText = (t: any, key: string, fallback?: string) => {
  return t(key) || fallback || key;
};

// Helper function to get conditional text based on language
export const getConditionalText = (t: any, englishText: string, indonesianText: string) => {
  return t("language.language") === "en" ? englishText : indonesianText;
};

// Common text patterns that need translation
export const commonTexts = {
  // Navigation
  home: "nav.home",
  profile: "nav.profile",
  wellness: "nav.wellness",
  clinics: "nav.clinics",
  news: "nav.news",
  activity: "nav.activity",
  doctor: "nav.doctor",
  consultation: "nav.consultation",
  booking: "nav.booking",
  history: "nav.history",

  // Common actions
  loading: "common.loading",
  error: "common.error",
  success: "common.success",
  cancel: "common.cancel",
  confirm: "common.confirm",
  save: "common.save",
  edit: "common.edit",
  delete: "common.delete",
  back: "common.back",
  next: "common.next",
  previous: "common.previous",
  close: "common.close",
  yes: "common.yes",
  no: "common.no",
  ok: "common.ok",
  submit: "common.submit",
  search: "common.search",
  filter: "common.filter",
  sort: "common.sort",
  refresh: "common.refresh",
  more: "common.more",
  less: "common.less",
  done: "common.done",
  skip: "common.skip",
  continue: "common.continue",
  finish: "common.finish",
  start: "common.start",
  stop: "common.stop",
  pause: "common.pause",
  resume: "common.resume",

  // Authentication
  login: "auth.login",
  register: "auth.register",
  logout: "auth.logout",
  email: "auth.email",
  password: "auth.password",
  confirmPassword: "auth.confirmPassword",
  forgotPassword: "auth.forgotPassword",
  rememberMe: "auth.rememberMe",
  loginWithGoogle: "auth.loginWithGoogle",
  loginWithApple: "auth.loginWithApple",
  dontHaveAccount: "auth.dontHaveAccount",
  alreadyHaveAccount: "auth.alreadyHaveAccount",
  createAccount: "auth.createAccount",
  signIn: "auth.signIn",

  // Forms
  name: "form.name",
  phone: "form.phone",
  address: "form.address",
  birthDate: "form.birthDate",
  gender: "form.gender",
  male: "form.male",
  female: "form.female",
  other: "form.other",
  age: "form.age",
  weight: "form.weight",
  height: "form.height",
  activityLevel: "form.activityLevel",
  fitnessGoal: "form.fitnessGoal",

  // Wellness
  dashboard: "wellness.dashboard",
  missions: "wellness.missions",
  tracking: "wellness.tracking",
  activities: "wellness.activities",
  todaySummary: "wellness.todaySummary",
  points: "wellness.points",
  completedMissions: "wellness.completedMissions",
  activeMissions: "wellness.activeMissions",
  completionRate: "wellness.completionRate",

  // Missions
  accept: "mission.accept",
  complete: "mission.complete",
  abandon: "mission.abandon",
  progress: "mission.progress",
  details: "mission.details",
  available: "mission.available",
  active: "mission.active",
  completed: "mission.completed",
  dueDate: "mission.dueDate",
  missionPoints: "mission.points",
  streak: "mission.streak",

  // Tracking
  water: "tracking.water",
  meal: "tracking.meal",
  fitness: "tracking.fitness",
  sleep: "tracking.sleep",
  mood: "tracking.mood",
  calories: "tracking.calories",
  steps: "tracking.steps",
  distance: "tracking.distance",
  duration: "tracking.duration",
  weight: "tracking.weight",
  height: "tracking.height",

  // Clinics
  searchClinics: "clinics.search",
  nearbyClinics: "clinics.nearby",
  popularClinics: "clinics.popular",
  booking: "clinics.booking",
  history: "clinics.history",
  services: "clinics.services",
  doctors: "clinics.doctors",
  rating: "clinics.rating",
  reviews: "clinics.reviews",
  price: "clinics.price",
  availability: "clinics.availability",

  // Alerts
  logoutTitle: "alert.logoutTitle",
  logoutMessage: "alert.logoutMessage",
  logoutSuccess: "alert.logoutSuccess",
  logoutSuccessMessage: "alert.logoutSuccessMessage",
  logoutError: "alert.logoutError",
  logoutErrorMessage: "alert.logoutErrorMessage",
  deleteTitle: "alert.deleteTitle",
  deleteMessage: "alert.deleteMessage",
  cancelTitle: "alert.cancelTitle",
  cancelMessage: "alert.cancelMessage",
  saveTitle: "alert.saveTitle",
  saveMessage: "alert.saveMessage",

  // Language
  indonesian: "language.indonesian",
  english: "language.english",
  select: "language.select",
};

// Hook to get language context
export const useLanguageHelper = () => {
  const { t, language } = useLanguage();
  
  return {
    t,
    language,
    getText: (key: string, fallback?: string) => getLanguageText(t, key, fallback),
    getConditional: (englishText: string, indonesianText: string) => 
      getConditionalText(t, englishText, indonesianText),
    isEnglish: language === "en",
    isIndonesian: language === "id",
  };
};
