#!/usr/bin/env node

/**
 * Script untuk mengecek waktu sistem aplikasi
 * Menampilkan informasi waktu lokal, UTC, dan timezone
 */

console.log('🕐 CHECKING SYSTEM TIME FOR PHC MOBILE APP');
console.log('==========================================\n');

// Waktu saat ini
const now = new Date();

// Informasi waktu lokal
const localTime = now.toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

// Informasi waktu UTC
const utcTime = now.toUTCString();

// Timezone
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Offset timezone
const timezoneOffset = now.getTimezoneOffset();
const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
const offsetMinutes = Math.abs(timezoneOffset % 60);
const offsetSign = timezoneOffset > 0 ? '-' : '+';

// Format tanggal untuk aplikasi
const appDate = now.toISOString().split('T')[0]; // Format UTC (YYYY-MM-DD)
const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // Format lokal

// Jam dalam format 24 jam
const currentHour = now.getHours();
const currentMinute = now.getMinutes();
const currentSecond = now.getSeconds();

console.log('📅 DATE INFORMATION:');
console.log(`   Local Date: ${localDate}`);
console.log(`   UTC Date: ${appDate}`);
console.log(`   Full Local: ${localTime}`);
console.log(`   Full UTC: ${utcTime}`);
console.log('');

console.log('🕐 TIME INFORMATION:');
console.log(`   Current Hour: ${currentHour}:${String(currentMinute).padStart(2, '0')}:${String(currentSecond).padStart(2, '0')}`);
console.log(`   Time Format: 24-hour`);
console.log('');

console.log('🌍 TIMEZONE INFORMATION:');
console.log(`   Timezone: ${timezone}`);
console.log(`   Offset: UTC${offsetSign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`);
console.log(`   Offset Minutes: ${timezoneOffset}`);
console.log('');

// Cek greeting berdasarkan waktu
const getGreeting = (hour) => {
  if (hour >= 5 && hour < 12) return 'Selamat Pagi';
  if (hour >= 12 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

console.log('👋 GREETING INFORMATION:');
console.log(`   Current Greeting: ${getGreeting(currentHour)}`);
console.log('');

// Cek apakah ada perbedaan tanggal
const dateDifference = appDate !== localDate;
console.log('⚠️  DATE DIFFERENCE CHECK:');
console.log(`   Local Date: ${localDate}`);
console.log(`   UTC Date: ${appDate}`);
console.log(`   Has Difference: ${dateDifference ? 'YES' : 'NO'}`);
if (dateDifference) {
  console.log(`   ⚠️  WARNING: There's a date difference between local and UTC!`);
  console.log(`   💡 This might cause issues with date-based features in the app.`);
}
console.log('');

// Informasi tambahan untuk debugging
console.log('🔧 DEBUG INFORMATION:');
console.log(`   Timestamp: ${now.getTime()}`);
console.log(`   ISO String: ${now.toISOString()}`);
console.log(`   Locale String: ${now.toLocaleString()}`);
console.log('');

console.log('✅ SYSTEM TIME CHECK COMPLETED');
console.log('==========================================');
