# Panduan Mengganti Logo Aplikasi Play Store

## 📋 Daftar File yang Perlu Diperbarui

### 1. Icon Utama Aplikasi
- **File**: `assets/icon.png`
- **Ukuran**: 512x512 px
- **Format**: PNG
- **Keterangan**: Icon utama yang digunakan di app.json

### 2. Adaptive Icon untuk Android
- **File**: `assets/adaptive-icon.png`
- **Ukuran**: 512x512 px
- **Format**: PNG
- **Keterangan**: Icon yang beradaptasi dengan berbagai bentuk di Android

### 3. Play Store Icons (Berbagai Ukuran)
- **File**: `assets/playstore/playstore-icon-*.png`
- **Ukuran**: 36x36, 48x48, 72x72, 96x96, 144x144, 192x192, 512x512 px
- **Format**: PNG
- **Keterangan**: Icon untuk ditampilkan di Play Store

### 4. Feature Graphic
- **File**: `assets/playstore/playstore-feature-graphic.png`
- **Ukuran**: 1024x500 px
- **Format**: PNG
- **Keterangan**: Banner yang ditampilkan di halaman aplikasi Play Store

## 🎨 Persyaratan Logo

### Format dan Kualitas
- **Format**: PNG dengan latar belakang transparan atau solid
- **Kualitas**: High resolution, tidak blur
- **Warna**: Konsisten dengan brand identity

### Ukuran yang Disarankan
- **Icon**: Minimal 512x512 px (akan di-resize otomatis)
- **Feature Graphic**: 1024x500 px (fixed size)

## 🔄 Langkah-langkah Mengganti Logo

### Langkah 1: Siapkan Logo Baru
1. Buat logo dengan ukuran yang sesuai
2. Pastikan logo terlihat jelas di berbagai ukuran
3. Test logo di device Android

### Langkah 2: Backup Logo Lama
```bash
# Buat backup folder
mkdir assets/backup-$(date +%Y%m%d)
cp assets/icon.png assets/backup-$(date +%Y%m%d)/
cp assets/adaptive-icon.png assets/backup-$(date +%Y%m%d)/
cp assets/playstore/*.png assets/backup-$(date +%Y%m%d)/
```

### Langkah 3: Ganti File Logo
1. Ganti `assets/icon.png` dengan logo baru (512x512px)
2. Ganti `assets/adaptive-icon.png` dengan logo baru (512x512px)
3. Generate berbagai ukuran untuk Play Store:
   - 36x36 px
   - 48x48 px
   - 72x72 px
   - 96x96 px
   - 144x144 px
   - 192x192 px
   - 512x512 px
4. Ganti `assets/playstore/playstore-feature-graphic.png` (1024x500px)

### Langkah 4: Build Aplikasi
```bash
# Build untuk production
eas build --platform android --profile production
```

### Langkah 5: Upload ke Play Store
1. Download APK dari EAS Build
2. Upload ke Google Play Console
3. Update metadata jika diperlukan
4. Release update

## 🛠️ Tools yang Membantu

### Script Pengecekan
```bash
# Jalankan script untuk melihat status file logo
node scripts/update-playstore-logo.js
```

### Online Image Resizer
- [Canva](https://www.canva.com/)
- [Figma](https://www.figma.com/)
- [GIMP](https://www.gimp.org/)

## ⚠️ Tips Penting

1. **Test di Device**: Selalu test logo di device Android sebelum release
2. **Backup**: Selalu backup logo lama sebelum mengganti
3. **Konsistensi**: Pastikan logo konsisten di semua ukuran
4. **Brand Guidelines**: Ikuti brand guidelines yang sudah ditetapkan
5. **Legal**: Pastikan logo tidak melanggar hak cipta

## 🔍 Troubleshooting

### Logo Terlihat Blur
- Pastikan menggunakan gambar high resolution
- Gunakan format PNG
- Periksa ukuran minimal yang disyarankan

### Logo Tidak Muncul di Play Store
- Tunggu beberapa jam setelah upload
- Periksa apakah APK sudah di-approve
- Pastikan file logo sudah benar

### Build Error
- Periksa path file di app.json
- Pastikan file logo ada dan tidak corrupt
- Coba build ulang dengan clean cache

## 📞 Support

Jika mengalami masalah, hubungi tim development atau buat issue di repository proyek. 