#!/bin/bash

echo "🔄 RESET LENGKAP DATABASE DAN MOBILE APP"
echo "========================================"
echo "⚠️  PERINGATAN: Script ini akan menghapus SEMUA data!"
echo ""

# Step 1: Database Truncate
echo "🗄️  STEP 1: Database Truncate"
echo "------------------------------"

# Cek apakah MySQL tersedia
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL tidak ditemukan. Pastikan MySQL terinstall."
    exit 1
fi

# Jalankan truncate database
echo "🔗 Menjalankan truncate database..."
if mysql -u root -p phc_dashboard < scripts/truncate-all-data.sql; then
    echo "✅ Database berhasil di-truncate!"
else
    echo "❌ Gagal truncate database"
    exit 1
fi

# Step 2: Mobile App Reset Instructions
echo ""
echo "📱 STEP 2: Mobile App Reset"
echo "------------------------------"
echo "Untuk reset mobile app, lakukan langkah berikut:"
echo ""
echo "1. Buka mobile app"
echo "2. Buka Developer Menu (shake device atau Cmd+D di simulator)"
echo "3. Pilih 'Clear Storage' atau 'Reset App'"
echo "4. Atau restart app dan login ulang"
echo ""
echo "Alternatif: Gunakan script clear-mobile-storage.js di dalam app"
echo ""

# Step 3: Verification
echo "🔍 STEP 3: Verification"
echo "------------------------------"
echo "Verifikasi bahwa data telah dihapus:"
echo ""

# Cek jumlah data di beberapa tabel
echo "📊 Jumlah data di tabel tracking:"
mysql -u root -p phc_dashboard -e "
SELECT 
    'fitness_tracking' as table_name, COUNT(*) as count FROM fitness_tracking
UNION ALL
SELECT 'mood_tracking', COUNT(*) FROM mood_tracking
UNION ALL
SELECT 'water_tracking', COUNT(*) FROM water_tracking
UNION ALL
SELECT 'sleep_tracking', COUNT(*) FROM sleep_tracking
UNION ALL
SELECT 'meal_tracking', COUNT(*) FROM meal_tracking
UNION ALL
SELECT 'wellness_activities', COUNT(*) FROM wellness_activities
UNION ALL
SELECT 'user_missions', COUNT(*) FROM user_missions;
"

echo ""
echo "🎉 RESET LENGKAP BERHASIL!"
echo "=========================="
echo "✅ Database: Semua data tracking dihapus"
echo "✅ Mobile App: Siap untuk reset"
echo ""
echo "📋 LANGKAH SELANJUTNYA:"
echo "1. Restart mobile app"
echo "2. Login ulang dengan akun baru"
echo "3. Mulai tracking data dari awal"
echo "4. Data akan mulai terakumulasi lagi"
echo ""
echo "💡 Tips:"
echo "- Pastikan backend server berjalan"
echo "- Cek koneksi internet"
echo "- Jika ada masalah, restart app dan coba lagi"
