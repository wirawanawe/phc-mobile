#!/usr/bin/env node

/**
 * Script untuk mengambil screenshot dari aplikasi Android
 * Menggunakan ADB (Android Debug Bridge)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '..', 'screenshots', 'app-screens');

// Pastikan direktori screenshot ada
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Daftar screen dengan deskripsi
const screenDescriptions = [
  { name: '01_WelcomeScreen', description: 'Halaman Selamat Datang' },
  { name: '02_TermsScreen', description: 'Halaman Syarat & Ketentuan' },
  { name: '03_LoginScreen', description: 'Halaman Login' },
  { name: '04_RegisterScreen', description: 'Halaman Registrasi' },
  { name: '05_MainScreen_Home', description: 'Halaman Utama - Tab Home' },
  { name: '06_MainScreen_Activity', description: 'Halaman Utama - Tab Activity' },
  { name: '07_MainScreen_Wellness', description: 'Halaman Utama - Tab Wellness' },
  { name: '08_MainScreen_Clinics', description: 'Halaman Utama - Tab Klinik' },
  { name: '09_MainScreen_News', description: 'Halaman Utama - Tab Berita' },
  { name: '10_ProfileScreen', description: 'Halaman Profil' },
  { name: '11_DashboardScreen', description: 'Dashboard' },
  { name: '12_WellnessApp', description: 'Aplikasi Wellness' },
  { name: '13_ActivityScreen', description: 'Halaman Aktivitas' },
  { name: '14_MoodTrackingScreen', description: 'Pelacakan Mood' },
  { name: '15_SleepTrackingScreen', description: 'Pelacakan Tidur' },
  { name: '16_WaterTrackingScreen', description: 'Pelacakan Air Minum' },
  { name: '17_FitnessTrackingScreen', description: 'Pelacakan Fitness' },
  { name: '18_MealLoggingScreen', description: 'Pencatatan Makanan' },
  { name: '19_HealthEducationScreen', description: 'Edukasi Kesehatan' },
  { name: '20_HealthInsightsScreen', description: 'Wawasan Kesehatan' },
  { name: '21_MedicalHistoryScreen', description: 'Riwayat Medis' },
  { name: '22_HealthGoalsScreen', description: 'Tujuan Kesehatan' },
  { name: '23_DetailDoctor', description: 'Detail Dokter' },
  { name: '24_ConsultationBookingScreen', description: 'Booking Konsultasi' },
  { name: '25_ConsultationHistoryScreen', description: 'Riwayat Konsultasi' },
  { name: '26_ChatAssistantScreen', description: 'Asisten Chat AI' },
  { name: '27_NewsPortalScreen', description: 'Portal Berita Kesehatan' },
  { name: '28_ArticleDetailScreen', description: 'Detail Artikel' },
  { name: '29_CalculatorScreen', description: 'Kalkulator Kesehatan' },
  { name: '30_AllCalculatorsScreen', description: 'Semua Kalkulator' },
  { name: '31_DailyMissionScreen', description: 'Misi Harian' },
  { name: '32_MissionDetailScreen', description: 'Detail Misi' },
  { name: '33_PersonalInformationScreen', description: 'Informasi Pribadi' },
  { name: '34_PrivacySettingsScreen', description: 'Pengaturan Privasi' },
  { name: '35_HelpSupportScreen', description: 'Bantuan & Dukungan' },
  { name: '36_AboutAppScreen', description: 'Tentang Aplikasi' },
  { name: '37_NotificationScreen', description: 'Notifikasi' },
];

function checkAdbConnection() {
  try {
    execSync('adb devices', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ ADB tidak ditemukan. Pastikan Android SDK terinstall.');
    return false;
  }
}

function takeScreenshot(screenName, description) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${screenName}_${timestamp}.png`;
    const tempPath = `/sdcard/${filename}`;
    const localPath = path.join(screenshotDir, filename);
    
    console.log(`📸 Mengambil screenshot: ${description}`);
    
    // Ambil screenshot di device
    execSync(`adb shell screencap -p ${tempPath}`, { stdio: 'pipe' });
    
    // Copy ke komputer
    execSync(`adb pull ${tempPath} "${localPath}"`, { stdio: 'pipe' });
    
    // Hapus file temporary di device
    execSync(`adb shell rm ${tempPath}`, { stdio: 'pipe' });
    
    console.log(`✅ Screenshot berhasil: ${filename}`);
    
    // Buat file info
    const infoFile = path.join(screenshotDir, `${screenName}_info.txt`);
    const info = `Screen: ${screenName}\nDescription: ${description}\nTimestamp: ${new Date().toISOString()}\n`;
    fs.writeFileSync(infoFile, info);
    
    return true;
  } catch (error) {
    console.error(`❌ Gagal mengambil screenshot: ${error.message}`);
    return false;
  }
}

async function interactiveMode() {
  console.log('\n🎯 MODE INTERAKTIF');
  console.log('Tekan ENTER setelah Anda siap untuk screenshot, atau ketik "skip" untuk melewati');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  for (let i = 0; i < screenDescriptions.length; i++) {
    const screen = screenDescriptions[i];
    
    console.log(`\n[${i + 1}/${screenDescriptions.length}] ${screen.description}`);
    
    const answer = await new Promise(resolve => {
      readline.question('Tekan ENTER untuk screenshot (atau "skip"/"quit"): ', resolve);
    });
    
    if (answer.toLowerCase() === 'quit') {
      console.log('🛑 Dihentikan oleh user');
      break;
    }
    
    if (answer.toLowerCase() === 'skip') {
      console.log('⏭️  Dilewati');
      continue;
    }
    
    takeScreenshot(screen.name, screen.description);
    
    // Tunggu sebentar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  readline.close();
}

async function autoMode() {
  console.log('\n🤖 MODE OTOMATIS');
  console.log('Screenshot akan diambil setiap 5 detik');
  console.log('Pastikan Anda navigate ke screen yang sesuai');
  
  for (let i = 0; i < screenDescriptions.length; i++) {
    const screen = screenDescriptions[i];
    
    console.log(`\n[${i + 1}/${screenDescriptions.length}] ${screen.description}`);
    console.log('⏳ Menunggu 5 detik...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    takeScreenshot(screen.name, screen.description);
  }
}

async function main() {
  console.log('📱 Screenshot Tool untuk PHC Mobile App');
  console.log('=====================================\n');
  
  // Check ADB connection
  if (!checkAdbConnection()) {
    return;
  }
  
  console.log('📁 Screenshots akan disimpan di:', screenshotDir);
  console.log('\n🔧 Pilih mode:');
  console.log('1. Interactive Mode (Tekan ENTER untuk setiap screenshot)');
  console.log('2. Auto Mode (Screenshot otomatis setiap 5 detik)');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const mode = await new Promise(resolve => {
    readline.question('\nPilih mode (1/2): ', resolve);
  });
  
  readline.close();
  
  if (mode === '1') {
    await interactiveMode();
  } else if (mode === '2') {
    await autoMode();
  } else {
    console.log('❌ Mode tidak valid');
    return;
  }
  
  console.log('\n🎉 Proses screenshot selesai!');
  console.log(`📁 Semua screenshot tersimpan di: ${screenshotDir}`);
  
  // Buat index file
  createIndexFile();
}

function createIndexFile() {
  const indexFile = path.join(screenshotDir, 'README.md');
  let indexContent = '# Screenshots Aplikasi PHC Mobile\n\n';
  indexContent += `Generated on: ${new Date().toISOString()}\n\n`;
  indexContent += '## Daftar Screenshots\n\n';
  
  screenDescriptions.forEach((screen, index) => {
    indexContent += `${index + 1}. **${screen.description}**\n`;
    indexContent += `   - File: ${screen.name}_*.png\n\n`;
  });
  
  fs.writeFileSync(indexFile, indexContent);
  console.log(`📋 Index file created: ${indexFile}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { takeScreenshot, screenDescriptions };
