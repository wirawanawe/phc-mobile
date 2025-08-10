const fs = require('fs');
const path = require('path');

/**
 * Script untuk mengganti logo aplikasi Play Store
 * 
 * Langkah-langkah:
 * 1. Siapkan logo baru dengan ukuran yang sesuai
 * 2. Jalankan script ini untuk mengganti file-file yang diperlukan
 * 3. Build ulang aplikasi dengan EAS Build
 */

const ASSETS_DIR = path.join(__dirname, '../assets');
const PLAYSTORE_DIR = path.join(ASSETS_DIR, 'playstore');

// File-file yang perlu diperbarui
const FILES_TO_UPDATE = {
  // Icon utama aplikasi (512x512px)
  mainIcon: path.join(ASSETS_DIR, 'icon.png'),
  
  // Adaptive icon untuk Android
  adaptiveIcon: path.join(ASSETS_DIR, 'adaptive-icon.png'),
  
  // Icon Play Store dalam berbagai ukuran
  playstoreIcons: [
    path.join(PLAYSTORE_DIR, 'playstore-icon-36.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-48.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-72.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-96.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-144.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-192.png'),
    path.join(PLAYSTORE_DIR, 'playstore-icon-512.png'),
  ],
  
  // Feature graphic untuk Play Store (1024x500px)
  featureGraphic: path.join(PLAYSTORE_DIR, 'playstore-feature-graphic.png'),
};

console.log('🎨 Panduan Mengganti Logo Aplikasi Play Store');
console.log('=============================================\n');

console.log('File-file yang perlu diperbarui:');
console.log('1. Icon utama: assets/icon.png (512x512px)');
console.log('2. Adaptive icon: assets/adaptive-icon.png (512x512px)');
console.log('3. Play Store icons: assets/playstore/playstore-icon-*.png');
console.log('4. Feature graphic: assets/playstore/playstore-feature-graphic.png (1024x500px)\n');

console.log('Langkah-langkah:');
console.log('1. Siapkan logo baru dengan ukuran yang sesuai');
console.log('2. Ganti file-file di atas dengan logo baru');
console.log('3. Jalankan: eas build --platform android --profile production');
console.log('4. Upload APK baru ke Google Play Console\n');

console.log('Tips:');
console.log('- Gunakan PNG format dengan latar belakang transparan');
console.log('- Pastikan logo terlihat jelas di berbagai ukuran');
console.log('- Test logo di device Android sebelum release');
console.log('- Backup file logo lama sebelum mengganti');

// Cek apakah file-file ada
console.log('\n📁 Status file logo saat ini:');
Object.entries(FILES_TO_UPDATE).forEach(([name, filePath]) => {
  if (Array.isArray(filePath)) {
    console.log(`${name}:`);
    filePath.forEach(fp => {
      const exists = fs.existsSync(fp);
      console.log(`  ${path.basename(fp)}: ${exists ? '✅' : '❌'}`);
    });
  } else {
    const exists = fs.existsSync(filePath);
    console.log(`${name}: ${exists ? '✅' : '❌'}`);
  }
}); 