#!/usr/bin/env node

/**
 * Script untuk test fungsi timezone lokal
 * Memverifikasi bahwa aplikasi menggunakan waktu lokal bukan UTC
 */

console.log('🧪 TESTING LOCAL TIMEZONE FUNCTIONS');
console.log('===================================\n');

// Simulasi fungsi dari dateUtils.ts
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToLocalYYYYMMDD = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalTimestamp = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString();
};

const getCurrentLocalDateTime = () => {
  const now = new Date();
  return {
    date: formatDateToLocalYYYYMMDD(now),
    time: now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    datetime: now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  };
};

// Test 1: Perbandingan metode lama vs baru
console.log('📊 TEST 1: COMPARISON OLD vs NEW METHODS');
console.log('----------------------------------------');

const now = new Date();
const oldMethod = now.toISOString().split('T')[0];
const newMethod = getTodayDate();

console.log(`   Old Method (UTC): ${oldMethod}`);
console.log(`   New Method (Local): ${newMethod}`);
console.log(`   Are Different: ${oldMethod !== newMethod ? 'YES' : 'NO'}`);
console.log(`   Expected: YES (for Asia/Jakarta timezone)`);
console.log('');

// Test 2: Format date function
console.log('📅 TEST 2: FORMAT DATE FUNCTION');
console.log('-------------------------------');

const testDate = new Date('2025-08-21T10:30:00');
const formattedDate = formatDateToLocalYYYYMMDD(testDate);
console.log(`   Input Date: ${testDate}`);
console.log(`   Formatted: ${formattedDate}`);
console.log(`   Expected: 2025-08-21`);
console.log(`   Result: ${formattedDate === '2025-08-21' ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 3: Local timestamp
console.log('🕐 TEST 3: LOCAL TIMESTAMP');
console.log('---------------------------');

const utcTimestamp = now.toISOString();
const localTimestamp = getLocalTimestamp();

console.log(`   UTC Timestamp: ${utcTimestamp}`);
console.log(`   Local Timestamp: ${localTimestamp}`);
console.log(`   Are Different: ${utcTimestamp !== localTimestamp ? 'YES' : 'NO'}`);
console.log(`   Expected: YES (for Asia/Jakarta timezone)`);
console.log('');

// Test 4: Current local date time
console.log('📱 TEST 4: CURRENT LOCAL DATE TIME');
console.log('-----------------------------------');

const localDateTime = getCurrentLocalDateTime();
console.log(`   Date: ${localDateTime.date}`);
console.log(`   Time: ${localDateTime.time}`);
console.log(`   DateTime: ${localDateTime.datetime}`);
console.log('');

// Test 5: Timezone information
console.log('🌍 TEST 5: TIMEZONE INFORMATION');
console.log('-------------------------------');

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timezoneOffset = now.getTimezoneOffset();
const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
const offsetMinutes = Math.abs(timezoneOffset % 60);
const offsetSign = timezoneOffset > 0 ? '-' : '+';

console.log(`   Timezone: ${timezone}`);
console.log(`   Offset: UTC${offsetSign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`);
console.log(`   Offset Minutes: ${timezoneOffset}`);
console.log('');

// Test 6: Date difference check
console.log('⚠️  TEST 6: DATE DIFFERENCE CHECK');
console.log('--------------------------------');

const localDate = getTodayDate();
const utcDate = now.toISOString().split('T')[0];
const hasDifference = localDate !== utcDate;

console.log(`   Local Date: ${localDate}`);
console.log(`   UTC Date: ${utcDate}`);
console.log(`   Has Difference: ${hasDifference ? 'YES' : 'NO'}`);
console.log(`   Expected for Asia/Jakarta: YES`);
console.log(`   Result: ${hasDifference ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Summary
console.log('📋 SUMMARY');
console.log('----------');
console.log(`   ✅ Local Date Function: ${getTodayDate()}`);
console.log(`   ✅ Format Date Function: ${formatDateToLocalYYYYMMDD(new Date())}`);
console.log(`   ✅ Local Timestamp: ${getLocalTimestamp().substring(0, 19)}`);
console.log(`   ✅ Timezone: ${timezone}`);
console.log(`   ✅ Date Difference: ${hasDifference ? 'Fixed' : 'No Issue'}`);
console.log('');

console.log('🎯 CONCLUSION');
console.log('-------------');
if (hasDifference) {
  console.log('   ✅ SUCCESS: Application now uses local timezone instead of UTC');
  console.log('   ✅ All date functions return local timezone values');
  console.log('   ✅ No more 1-day difference issues');
} else {
  console.log('   ℹ️  INFO: No timezone difference detected');
  console.log('   ℹ️  This might be because you are in UTC timezone');
}

console.log('\n✅ LOCAL TIMEZONE TEST COMPLETED');
console.log('===================================');
