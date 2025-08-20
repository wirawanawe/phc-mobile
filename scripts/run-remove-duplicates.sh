#!/bin/bash

# Script untuk menjalankan penghapusan data duplikat dokter
# Pastikan berada di direktori yang benar dan database sudah siap

echo "🔍 PHC Mobile - Doctor Duplicate Removal Script"
echo "================================================"
echo ""

# Cek apakah file script ada
if [ ! -f "scripts/remove-duplicate-doctors.js" ]; then
    echo "❌ Error: Script remove-duplicate-doctors.js tidak ditemukan!"
    echo "   Pastikan Anda berada di direktori root project."
    exit 1
fi

# Cek apakah Node.js terinstall
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js tidak terinstall!"
    echo "   Install Node.js terlebih dahulu."
    exit 1
fi

# Cek apakah mysql2 terinstall
if ! node -e "require('mysql2')" &> /dev/null; then
    echo "⚠️  Warning: mysql2 package tidak terinstall."
    echo "   Installing mysql2..."
    npm install mysql2
fi

# Cek apakah dotenv terinstall
if ! node -e "require('dotenv')" &> /dev/null; then
    echo "⚠️  Warning: dotenv package tidak terinstall."
    echo "   Installing dotenv..."
    npm install dotenv
fi

echo "✅ Dependencies checked successfully!"
echo ""

# Konfirmasi sebelum menjalankan
echo "⚠️  PERINGATAN: Script ini akan menghapus data duplikat dari tabel doctors!"
echo "   Pastikan Anda telah backup database sebelum melanjutkan."
echo ""
read -p "Apakah Anda yakin ingin melanjutkan? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Script dibatalkan."
    exit 0
fi

echo ""
echo "🚀 Menjalankan script penghapusan duplikat..."
echo ""

# Jalankan script
node scripts/remove-duplicate-doctors.js

echo ""
echo "✅ Script selesai dijalankan!"
