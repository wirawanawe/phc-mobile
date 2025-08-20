# Logo PHC Terpotong - Fix Documentation

## 🐛 Masalah
Logo PHC di aplikasi mobile terpotong, menampilkan "OCT PH Indones" alih-alih "PHC Indonesia" yang lengkap.

## 🔍 Analisis Masalah
Masalah terjadi karena:
1. **ViewBox terlalu sempit**: SVG menggunakan viewBox "0 0 200 120" tetapi teks "INDONESIA" diposisikan di koordinat 130-150
2. **Aspect ratio tidak sesuai**: Logo menggunakan aspect ratio 5:3 yang tidak cukup untuk menampung teks lengkap
3. **Teks terpotong**: Elemen teks "INDONESIA" berada di luar area yang dapat dilihat

## ✅ Solusi yang Diterapkan

### 1. Memperluas ViewBox
- **Sebelum**: `viewBox="0 0 200 120"`
- **Sesudah**: `viewBox="0 0 300 120"`

### 2. Menambahkan Teks "INDONESIA"
```svg
<!-- Indonesia Text -->
<text x="130" y="90" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#D32F2F">INDONESIA</text>
```

### 3. Menyesuaikan Aspect Ratio
- **Sebelum**: `aspectRatio: 5/3`
- **Sesudah**: `aspectRatio: 5/2.5`

### 4. Memperbesar Ukuran Output
- **Sebelum**: 400x240 px
- **Sesudah**: 600x240 px

## 📁 File yang Diperbarui

### Scripts
- `scripts/generate-logo-image.js` - Logo merah dengan teks lengkap
- `scripts/generate-logo-white.js` - Logo putih untuk mobile app
- `scripts/generate-app-icon.js` - Icon aplikasi dengan teks lengkap
- `scripts/generate-all-logos.js` - Script komprehensif untuk semua varian

### Components
- `src/components/LogoPutih.tsx` - Updated aspect ratio

### Assets
- `assets/phc-logo.png` - Logo merah (600x240)
- `assets/logo-phc-putih.png` - Logo putih (600x240)
- `assets/icon.png` - Icon aplikasi (512x512)
- `assets/adaptive-icon.png` - Adaptive icon (512x512)
- `assets/playstore/` - Icon Play Store berbagai ukuran

## 🚀 Cara Menjalankan

### Generate Semua Logo
```bash
node scripts/generate-all-logos.js
```

### Generate Logo Tertentu
```bash
# Logo merah
node scripts/generate-logo-image.js

# Logo putih
node scripts/generate-logo-white.js

# Icon aplikasi
node scripts/generate-app-icon.js
```

## 📱 Hasil Akhir

### Sebelum
- Logo terpotong: "OCT PH Indones"
- ViewBox: 200x120
- Aspect ratio: 5:3

### Sesudah
- Logo lengkap: "PHC Indonesia"
- ViewBox: 300x120
- Aspect ratio: 5:2.5
- Ukuran: 600x240 px

## 🎯 Varian Logo yang Tersedia

1. **Logo Merah** (`phc-logo.png`)
   - Untuk penggunaan umum
   - Background transparan
   - Teks merah (#D32F2F)

2. **Logo Putih** (`logo-phc-putih.png`)
   - Untuk mobile app
   - Background transparan
   - Teks putih (#FFFFFF)

3. **Icon Aplikasi** (`icon.png`)
   - Untuk Play Store dan home screen
   - Background merah (#D32F2F)
   - Teks putih (#FFFFFF)

4. **Play Store Icons**
   - Berbagai ukuran: 36x36, 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
   - Feature graphic: 1024x500

## 🔧 Dependencies
- `sharp` - Untuk konversi SVG ke PNG
- `fs` - Untuk operasi file
- `path` - Untuk path manipulation

## 📝 Catatan Penting
- Semua logo sekarang menampilkan teks "PHC Indonesia" yang lengkap
- Aspect ratio telah disesuaikan untuk mencegah pemotongan
- Logo kompatibel dengan berbagai ukuran layar
- Kualitas gambar tetap tinggi dengan resolusi yang sesuai

## 🎉 Status
✅ **FIXED** - Logo truncation issue telah diperbaiki sepenuhnya
