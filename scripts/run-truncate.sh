#!/bin/bash

# Script untuk menjalankan truncate database
echo "🗑️  MEMULAI TRUNCATE DATABASE"
echo "================================"
echo "⚠️  PERINGATAN: Script ini akan menghapus SEMUA data tracking!"
echo ""

# Cek apakah MySQL tersedia
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL tidak ditemukan. Pastikan MySQL terinstall."
    exit 1
fi

# Coba koneksi ke database
echo "🔗 Mencoba koneksi ke database..."

# Coba beberapa konfigurasi database
DATABASES=("phc_dashboard" "phc_mobile")
USERS=("root" "root")
PASSWORDS=("" "root")

for db in "${DATABASES[@]}"; do
    for user in "${USERS[@]}"; do
        for pass in "${PASSWORDS[@]}"; do
            echo "Mencoba: $user@localhost/$db"
            
            if [ -z "$pass" ]; then
                # Tanpa password
                if mysql -u "$user" -h localhost -e "USE $db; SELECT 1;" 2>/dev/null; then
                    echo "✅ Berhasil koneksi ke $db dengan user $user"
                    echo ""
                    echo "🗑️  Menjalankan truncate..."
                    mysql -u "$user" -h localhost "$db" < scripts/truncate-all-data.sql
                    echo ""
                    echo "🎉 TRUNCATE BERHASIL!"
                    echo "📊 Database $db telah di-reset"
                    exit 0
                fi
            else
                # Dengan password
                if mysql -u "$user" -p"$pass" -h localhost -e "USE $db; SELECT 1;" 2>/dev/null; then
                    echo "✅ Berhasil koneksi ke $db dengan user $user"
                    echo ""
                    echo "🗑️  Menjalankan truncate..."
                    mysql -u "$user" -p"$pass" -h localhost "$db" < scripts/truncate-all-data.sql
                    echo ""
                    echo "🎉 TRUNCATE BERHASIL!"
                    echo "📊 Database $db telah di-reset"
                    exit 0
                fi
            fi
        done
    done
done

echo "❌ Tidak dapat terhubung ke database dengan konfigurasi apapun"
echo ""
echo "💡 Tips:"
echo "1. Pastikan MySQL server berjalan"
echo "2. Cek konfigurasi database di dash-app/.env.local"
echo "3. Coba jalankan manual: mysql -u root -p < scripts/truncate-all-data.sql"
exit 1
