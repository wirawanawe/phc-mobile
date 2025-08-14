#!/usr/bin/env node

/**
 * Script untuk mengambil screenshot dari setiap halaman aplikasi
 * Menggunakan React Native CLI dan simulator/emulator
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Daftar screen yang akan di-screenshot
const screens = [
  // Auth Screens
  { name: 'WelcomeScreen', route: 'Welcome', description: 'Halaman Selamat Datang' },
  { name: 'TermsScreen', route: 'Terms', description: 'Halaman Syarat & Ketentuan' },
  { name: 'LoginScreen', route: 'Login', description: 'Halaman Login' },
  { name: 'RegisterScreen', route: 'Register', description: 'Halaman Registrasi' },
  
  // Main App Screens
  { name: 'MainScreen', route: 'Main', description: 'Halaman Utama' },
  { name: 'ProfileScreen', route: 'Profile', description: 'Halaman Profil' },
  { name: 'DashboardScreen', route: 'Dashboard', description: 'Dashboard' },
  
  // Wellness & Health
  { name: 'WellnessApp', route: 'WellnessApp', description: 'Aplikasi Wellness' },
  { name: 'ActivityScreen', route: 'Activity', description: 'Halaman Aktivitas' },
  { name: 'MoodTrackingScreen', route: 'MoodTracking', description: 'Pelacakan Mood' },
  { name: 'SleepTrackingScreen', route: 'SleepTracking', description: 'Pelacakan Tidur' },
  { name: 'WaterTrackingScreen', route: 'WaterTracking', description: 'Pelacakan Air' },
  { name: 'FitnessTrackingScreen', route: 'FitnessTracking', description: 'Pelacakan Fitness' },
  { name: 'MealLoggingScreen', route: 'MealLogging', description: 'Pencatatan Makanan' },
  
  // Health & Medical
  { name: 'HealthEducationScreen', route: 'HealthEducation', description: 'Edukasi Kesehatan' },
  { name: 'HealthInsightsScreen', route: 'HealthInsights', description: 'Wawasan Kesehatan' },
  { name: 'MedicalHistoryScreen', route: 'MedicalHistory', description: 'Riwayat Medis' },
  { name: 'HealthGoalsScreen', route: 'HealthGoals', description: 'Tujuan Kesehatan' },
  
  // Consultation & Booking
  { name: 'DetailDoctor', route: 'DetailDoctor', description: 'Detail Dokter' },
  { name: 'ConsultationBookingScreen', route: 'ConsultationBooking', description: 'Booking Konsultasi' },
  { name: 'ConsultationHistoryScreen', route: 'ConsultationHistory', description: 'Riwayat Konsultasi' },
  { name: 'ChatAssistantScreen', route: 'ChatAssistant', description: 'Asisten Chat' },
  
  // News & Content
  { name: 'NewsPortalScreen', route: 'NewsPortal', description: 'Portal Berita' },
  { name: 'ArticleDetailScreen', route: 'ArticleDetail', description: 'Detail Artikel' },
  { name: 'PersonalizedContentScreen', route: 'PersonalizedContent', description: 'Konten Personal' },
  
  // Calculators & Tools
  { name: 'CalculatorScreen', route: 'Calculator', description: 'Kalkulator Kesehatan' },
  { name: 'AllCalculatorsScreen', route: 'AllCalculators', description: 'Semua Kalkulator' },
  
  // Missions & Gamification
  { name: 'DailyMissionScreen', route: 'DailyMission', description: 'Misi Harian' },
  { name: 'MissionDetailScreen', route: 'MissionDetail', description: 'Detail Misi' },
  
  // Settings & Profile
  { name: 'PersonalInformationScreen', route: 'PersonalInformation', description: 'Informasi Pribadi' },
  { name: 'PrivacySettingsScreen', route: 'PrivacySettings', description: 'Pengaturan Privasi' },
  { name: 'HelpSupportScreen', route: 'HelpSupport', description: 'Bantuan & Dukungan' },
  { name: 'AboutAppScreen', route: 'AboutApp', description: 'Tentang Aplikasi' },
  
  // Notifications
  { name: 'NotificationScreen', route: 'Notification', description: 'Notifikasi' },
];

const screenshotDir = path.join(__dirname, '..', 'screenshots', 'app-screens');

// Pastikan direktori screenshot ada
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

console.log('🚀 Memulai proses screenshot aplikasi...');
console.log(`📁 Screenshots akan disimpan di: ${screenshotDir}`);

// Fungsi untuk mengambil screenshot
async function takeScreenshot(screen, index) {
  try {
    console.log(`\n📸 [${index + 1}/${screens.length}] Mengambil screenshot: ${screen.description}`);
    
    // Tunggu sebentar untuk memastikan screen sudah dimuat
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Ambil screenshot menggunakan simulator
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${String(index + 1).padStart(2, '0')}_${screen.name}_${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);
    
    // Command untuk mengambil screenshot (iOS Simulator)
    try {
      execSync(`xcrun simctl io booted screenshot "${filepath}"`, { stdio: 'inherit' });
      console.log(`✅ Screenshot berhasil: ${filename}`);
      
      // Buat file info untuk screenshot
      const infoFile = path.join(screenshotDir, `${String(index + 1).padStart(2, '0')}_${screen.name}_info.txt`);
      const info = `Screen: ${screen.name}\nRoute: ${screen.route}\nDescription: ${screen.description}\nTimestamp: ${new Date().toISOString()}\n`;
      fs.writeFileSync(infoFile, info);
      
    } catch (error) {
      console.log(`❌ Gagal mengambil screenshot untuk ${screen.name}: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Error pada ${screen.name}: ${error.message}`);
  }
}

// Fungsi utama
async function main() {
  console.log('\n⚠️  INSTRUKSI MANUAL:');
  console.log('1. Pastikan iOS Simulator atau Android Emulator sudah berjalan');
  console.log('2. Pastikan aplikasi sudah terbuka di simulator/emulator');
  console.log('3. Script ini akan mengambil screenshot setiap 3 detik');
  console.log('4. Anda perlu MANUAL navigate ke setiap screen saat diminta');
  console.log('\n🔄 Memulai dalam 5 detik...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    
    console.log(`\n🎯 Selanjutnya: ${screen.description}`);
    console.log(`📱 Silakan navigate ke screen: ${screen.route}`);
    console.log('⏳ Menunggu 10 detik untuk navigasi manual...');
    
    // Tunggu user untuk navigate
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Ambil screenshot
    await takeScreenshot(screen, i);
  }
  
  console.log('\n🎉 Proses screenshot selesai!');
  console.log(`📁 Semua screenshot tersimpan di: ${screenshotDir}`);
  
  // Buat index file
  const indexFile = path.join(screenshotDir, 'index.md');
  let indexContent = '# Screenshots Aplikasi PHC Mobile\n\n';
  indexContent += `Generated on: ${new Date().toISOString()}\n\n`;
  indexContent += '## Daftar Screenshots\n\n';
  
  screens.forEach((screen, index) => {
    indexContent += `${index + 1}. **${screen.description}** (${screen.name})\n`;
    indexContent += `   - Route: ${screen.route}\n`;
    indexContent += `   - File: ${String(index + 1).padStart(2, '0')}_${screen.name}_*.png\n\n`;
  });
  
  fs.writeFileSync(indexFile, indexContent);
  console.log(`📋 Index file created: ${indexFile}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { takeScreenshot, screens };
