import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  id: {
    // Profile Screen
    "profile.settings": "Pengaturan",
    "profile.personalInformation": "Informasi Pribadi",
    "profile.personalInformationSubtitle": "Kelola detail pribadi Anda",
    "profile.healthGoals": "Tujuan Kesehatan",
    "profile.healthGoalsSubtitle": "Atur dan lacak tujuan kesehatan Anda",
    "profile.medicalHistory": "Riwayat Medis",
    "profile.medicalHistorySubtitle": "Lihat catatan kesehatan Anda",
    "profile.privacySettings": "Pengaturan Privasi",
    "profile.privacySettingsSubtitle": "Kelola privasi dan keamanan Anda",
    "profile.helpSupport": "Bantuan & Dukungan",
    "profile.helpSupportSubtitle": "Dapatkan bantuan dan hubungi dukungan",
    "profile.aboutApp": "Tentang Aplikasi",
    "profile.aboutAppSubtitle": "Pelajari lebih lanjut tentang Wellness WeCare",
    "profile.logout": "Keluar",
    "profile.logoutSubtitle": "Keluar dari akun Anda",
    "profile.login": "Masuk",
    "profile.loginSubtitle": "Masuk ke akun Anda",
    "profile.memberSince": "Anggota sejak",
    "profile.points": "poin",
    "profile.daysActive": "Hari Aktif",
    "profile.achievements": "Pencapaian",
    "profile.healthScore": "Skor Kesehatan",
    "profile.adminDashboard": "Dashboard Admin",
    "profile.adminDashboardSubtitle": "Kelola sistem dan pengguna",
    "profile.version": "Versi 1.0.0",

    // Common
    "common.loading": "Memuat...",
    "common.error": "Terjadi kesalahan",
    "common.success": "Berhasil",
    "common.cancel": "Batal",
    "common.confirm": "Konfirmasi",
    "common.save": "Simpan",
    "common.edit": "Edit",
    "common.delete": "Hapus",
    "common.back": "Kembali",
    "common.next": "Selanjutnya",
    "common.previous": "Sebelumnya",
    "common.close": "Tutup",
    "common.yes": "Ya",
    "common.no": "Tidak",
    "common.ok": "OK",
    "common.submit": "Kirim",
    "common.search": "Cari",
    "common.filter": "Filter",
    "common.sort": "Urutkan",
    "common.refresh": "Segarkan",
    "common.more": "Selengkapnya",
    "common.less": "Kurang",
    "common.done": "Selesai",
    "common.skip": "Lewati",
    "common.continue": "Lanjutkan",
    "common.finish": "Selesai",
    "common.start": "Mulai",
    "common.stop": "Berhenti",
    "common.pause": "Jeda",
    "common.resume": "Lanjutkan",

    // Navigation
    "nav.home": "Beranda",
    "nav.profile": "Profil",
    "nav.wellness": "Wellness",
    "nav.clinics": "Klinik",
    "nav.news": "Berita",
    "nav.activity": "Aktivitas",
    "nav.doctor": "Dokter",
    "nav.consultation": "Konsultasi",
    "nav.booking": "Booking",
    "nav.history": "Riwayat",

    // Wellness
    "wellness.dashboard": "Dashboard",
    "wellness.missions": "Misi",
    "wellness.tracking": "Pelacakan",
    "wellness.activities": "Aktivitas",
    "wellness.todaySummary": "Ringkasan Hari Ini",
    "wellness.points": "Poin",
    "wellness.completedMissions": "Misi Selesai",
    "wellness.activeMissions": "Misi Aktif",
    "wellness.completionRate": "Tingkat Penyelesaian",

    // Missions
    "mission.accept": "Terima Misi",
    "mission.complete": "Selesaikan",
    "mission.abandon": "Tinggalkan",
    "mission.progress": "Progress",
    "mission.details": "Detail Misi",
    "mission.available": "Misi Tersedia",
    "mission.active": "Misi Aktif",
    "mission.completed": "Misi Selesai",
    "mission.dueDate": "Batas Waktu",
    "mission.points": "Poin",
    "mission.streak": "Streak",

    // Tracking
    "tracking.water": "Air Minum",
    "tracking.meal": "Makanan",
    "tracking.fitness": "Olahraga",
    "tracking.sleep": "Tidur",
    "tracking.mood": "Suasana Hati",
    "tracking.calories": "Kalori",
    "tracking.steps": "Langkah",
    "tracking.distance": "Jarak",
    "tracking.duration": "Durasi",
    "tracking.weight": "Berat Badan",
    "tracking.height": "Tinggi Badan",

    // Clinics
    "clinics.search": "Cari Klinik",
    "clinics.nearby": "Klinik Terdekat",
    "clinics.popular": "Klinik Populer",
    "clinics.booking": "Booking",
    "clinics.history": "Riwayat",
    "clinics.services": "Layanan",
    "clinics.doctors": "Dokter",
    "clinics.rating": "Rating",
    "clinics.reviews": "Ulasan",
    "clinics.price": "Harga",
    "clinics.availability": "Ketersediaan",

    // Authentication
    "auth.login": "Masuk",
    "auth.register": "Daftar",
    "auth.logout": "Keluar",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Konfirmasi Password",
    "auth.forgotPassword": "Lupa Password",
    "auth.rememberMe": "Ingat Saya",
    "auth.loginWithGoogle": "Masuk dengan Google",
    "auth.loginWithApple": "Masuk dengan Apple",
    "auth.dontHaveAccount": "Tidak punya akun?",
    "auth.alreadyHaveAccount": "Sudah punya akun?",
    "auth.createAccount": "Buat Akun",
    "auth.signIn": "Masuk ke Akun",

    // Forms
    "form.name": "Nama",
    "form.email": "Email",
    "form.phone": "Telepon",
    "form.address": "Alamat",
    "form.birthDate": "Tanggal Lahir",
    "form.gender": "Jenis Kelamin",
    "form.male": "Pria",
    "form.female": "Wanita",
    "form.other": "Lainnya",
    "form.age": "Usia",
    "form.weight": "Berat Badan (kg)",
    "form.height": "Tinggi Badan (cm)",
    "form.activityLevel": "Level Aktivitas",
    "form.fitnessGoal": "Tujuan Fitness",

    // Alerts
    "alert.logoutTitle": "Keluar",
    "alert.logoutMessage": "Apakah Anda yakin ingin keluar?",
    "alert.logoutSuccess": "Keluar Berhasil",
    "alert.logoutSuccessMessage": "Anda telah berhasil keluar.",
    "alert.logoutError": "Gagal Keluar",
    "alert.logoutErrorMessage": "Gagal keluar. Silakan coba lagi.",
    "alert.deleteTitle": "Hapus",
    "alert.deleteMessage": "Apakah Anda yakin ingin menghapus?",
    "alert.cancelTitle": "Batal",
    "alert.cancelMessage": "Apakah Anda yakin ingin membatalkan?",
    "alert.saveTitle": "Simpan",
    "alert.saveMessage": "Apakah Anda yakin ingin menyimpan perubahan?",

    // Language
    "language.indonesian": "Bahasa Indonesia",
    "language.english": "English",
    "language.select": "Pilih Bahasa",
  },
  en: {
    // Profile Screen
    "profile.settings": "Settings",
    "profile.personalInformation": "Personal Information",
    "profile.personalInformationSubtitle": "Manage your personal details",
    "profile.healthGoals": "Health Goals",
    "profile.healthGoalsSubtitle": "Set and track your health objectives",
    "profile.medicalHistory": "Medical History",
    "profile.medicalHistorySubtitle": "View your health records",
    "profile.privacySettings": "Privacy Settings",
    "profile.privacySettingsSubtitle": "Manage your privacy and security",
    "profile.helpSupport": "Help & Support",
    "profile.helpSupportSubtitle": "Get help and contact support",
    "profile.aboutApp": "About App",
    "profile.aboutAppSubtitle": "Learn more about Wellness WeCare",
    "profile.logout": "Logout",
    "profile.logoutSubtitle": "Sign out of your account",
    "profile.login": "Login",
    "profile.loginSubtitle": "Sign in to your account",
    "profile.memberSince": "Member since",
    "profile.points": "points",
    "profile.daysActive": "Days Active",
    "profile.achievements": "Achievements",
    "profile.healthScore": "Health Score",
    "profile.adminDashboard": "Admin Dashboard",
    "profile.adminDashboardSubtitle": "Manage system and users",
    "profile.version": "Version 1.0.0",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.close": "Close",
    "common.yes": "Yes",
    "common.no": "No",
    "common.ok": "OK",
    "common.submit": "Submit",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.refresh": "Refresh",
    "common.more": "More",
    "common.less": "Less",
    "common.done": "Done",
    "common.skip": "Skip",
    "common.continue": "Continue",
    "common.finish": "Finish",
    "common.start": "Start",
    "common.stop": "Stop",
    "common.pause": "Pause",
    "common.resume": "Resume",

    // Navigation
    "nav.home": "Home",
    "nav.profile": "Profile",
    "nav.wellness": "Wellness",
    "nav.clinics": "Clinics",
    "nav.news": "News",
    "nav.activity": "Activity",
    "nav.doctor": "Doctor",
    "nav.consultation": "Consultation",
    "nav.booking": "Booking",
    "nav.history": "History",

    // Wellness
    "wellness.dashboard": "Dashboard",
    "wellness.missions": "Missions",
    "wellness.tracking": "Tracking",
    "wellness.activities": "Activities",
    "wellness.todaySummary": "Today's Summary",
    "wellness.points": "Points",
    "wellness.completedMissions": "Completed Missions",
    "wellness.activeMissions": "Active Missions",
    "wellness.completionRate": "Completion Rate",

    // Missions
    "mission.accept": "Accept Mission",
    "mission.complete": "Complete",
    "mission.abandon": "Abandon",
    "mission.progress": "Progress",
    "mission.details": "Mission Details",
    "mission.available": "Available Missions",
    "mission.active": "Active Missions",
    "mission.completed": "Completed Missions",
    "mission.dueDate": "Due Date",
    "mission.points": "Points",
    "mission.streak": "Streak",

    // Tracking
    "tracking.water": "Water",
    "tracking.meal": "Meal",
    "tracking.fitness": "Fitness",
    "tracking.sleep": "Sleep",
    "tracking.mood": "Mood",
    "tracking.calories": "Calories",
    "tracking.steps": "Steps",
    "tracking.distance": "Distance",
    "tracking.duration": "Duration",
    "tracking.weight": "Weight",
    "tracking.height": "Height",

    // Clinics
    "clinics.search": "Search Clinics",
    "clinics.nearby": "Nearby Clinics",
    "clinics.popular": "Popular Clinics",
    "clinics.booking": "Booking",
    "clinics.history": "History",
    "clinics.services": "Services",
    "clinics.doctors": "Doctors",
    "clinics.rating": "Rating",
    "clinics.reviews": "Reviews",
    "clinics.price": "Price",
    "clinics.availability": "Availability",

    // Authentication
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password",
    "auth.rememberMe": "Remember Me",
    "auth.loginWithGoogle": "Login with Google",
    "auth.loginWithApple": "Login with Apple",
    "auth.dontHaveAccount": "Don't have an account?",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.createAccount": "Create Account",
    "auth.signIn": "Sign In",

    // Forms
    "form.name": "Name",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.address": "Address",
    "form.birthDate": "Birth Date",
    "form.gender": "Gender",
    "form.male": "Male",
    "form.female": "Female",
    "form.other": "Other",
    "form.age": "Age",
    "form.weight": "Weight (kg)",
    "form.height": "Height (cm)",
    "form.activityLevel": "Activity Level",
    "form.fitnessGoal": "Fitness Goal",

    // Alerts
    "alert.logoutTitle": "Logout",
    "alert.logoutMessage": "Are you sure you want to logout?",
    "alert.logoutSuccess": "Logout Successful",
    "alert.logoutSuccessMessage": "You have been logged out successfully.",
    "alert.logoutError": "Logout Failed",
    "alert.logoutErrorMessage": "Failed to logout. Please try again.",
    "alert.deleteTitle": "Delete",
    "alert.deleteMessage": "Are you sure you want to delete?",
    "alert.cancelTitle": "Cancel",
    "alert.cancelMessage": "Are you sure you want to cancel?",
    "alert.saveTitle": "Save",
    "alert.saveMessage": "Are you sure you want to save changes?",

    // Language
    "language.indonesian": "Bahasa Indonesia",
    "language.english": "English",
    "language.select": "Select Language",
  },
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage && (savedLanguage === "id" || savedLanguage === "en")) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem("language", lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};
