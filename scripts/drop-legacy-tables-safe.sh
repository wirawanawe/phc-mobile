#!/bin/bash

echo "🗑️  DROP LEGACY TABLES - SAFE EXECUTION"
echo "========================================"
echo "⚠️  PERINGATAN: Script ini akan menghapus tabel legacy!"
echo ""

# Legacy tables to drop
LEGACY_TABLES=(
  "assessments"
  "clinic_polyclinics"
  "clinic_rooms"
  "doctor_specializations"
  "examinations"
  "phc_office_admin"
  "visits"
)

echo "📋 Legacy tables yang akan di-drop:"
for table in "${LEGACY_TABLES[@]}"; do
  echo "   - $table"
done

echo ""
echo "❓ Apakah Anda yakin ingin melanjutkan? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "❌ Operasi dibatalkan."
  exit 0
fi

echo ""
echo "🔄 Memulai proses drop legacy tables..."

# Step 1: Backup legacy tables
echo ""
echo "📄 STEP 1: Backup Legacy Tables"
echo "------------------------------"

echo "🔗 Menjalankan backup legacy tables..."
if mysql -u root -p phc_dashboard < scripts/backup-legacy-tables.sql; then
  echo "✅ Backup legacy tables berhasil!"
else
  echo "❌ Gagal backup legacy tables"
  exit 1
fi

# Step 2: Drop legacy tables
echo ""
echo "🗑️  STEP 2: Drop Legacy Tables"
echo "------------------------------"

echo "🔗 Menjalankan drop legacy tables..."
if mysql -u root -p phc_dashboard < scripts/drop-legacy-tables.sql; then
  echo "✅ Drop legacy tables berhasil!"
else
  echo "❌ Gagal drop legacy tables"
  exit 1
fi

# Step 3: Verification
echo ""
echo "🔍 STEP 3: Verification"
echo "------------------------------"

echo "📊 Verifikasi tabel yang tersisa:"
mysql -u root -p phc_dashboard -e "
SELECT 
    'Total tables after drop:' as info,
    COUNT(*) as count 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
AND TABLE_TYPE = 'BASE TABLE';

SELECT 
    'Remaining tables:' as info,
    TABLE_NAME as table_name
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
"

echo ""
echo "🎉 DROP LEGACY TABLES BERHASIL!"
echo "================================"
echo "✅ Backup legacy tables: Completed"
echo "✅ Drop legacy tables: Completed"
echo "✅ Verification: Completed"
echo ""
echo "📋 LANGKAH SELANJUTNYA:"
echo "1. Test aplikasi untuk memastikan tidak ada error"
echo "2. Cek apakah semua fitur masih berfungsi"
echo "3. Monitor error log aplikasi"
echo "4. Jika ada masalah, restore dari backup"
echo ""
echo "💡 Tips:"
echo "- Backup tables tersimpan dengan prefix 'backup_legacy_'"
echo "- Jika ada masalah, bisa restore dengan: CREATE TABLE table_name AS SELECT * FROM backup_legacy_table_name;"
echo "- Monitor aplikasi selama beberapa hari untuk memastikan stabil"
