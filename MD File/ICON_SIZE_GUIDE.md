# Panduan Mengubah Ukuran Icon Aplikasi

## Icon Saat Ini
- **Icon utama**: `assets/icon.png` (1024x1024 pixels)
- **Icon Android adaptive**: `assets/icon.png` (1024x1024 pixels)
- **Favicon web**: `assets/favicon-32.png` (32x32 pixels)

## Opsi untuk Mengubah Ukuran Icon

### Opsi 1: Menggunakan Icon yang Sudah Ada
Anda dapat menggunakan icon yang sudah tersedia dengan ukuran berbeda:

#### Icon yang tersedia:
- `assets/icon.png` - 1024x1024 (saat ini digunakan)
- `assets/icon-1.png` - 1024x1024
- `assets/playstore-icon.png` - ukuran Play Store
- `assets/android-icons/icon-48.png` - 48x48
- `assets/android-icons/icon-72.png` - 72x72
- `assets/android-icons/icon-96.png` - 96x96
- `assets/android-icons/icon-144.png` - 144x144
- `assets/android-icons/icon-192.png` - 192x192

#### Cara mengubah:
Edit file `app.json` dan ubah baris berikut:

```json
{
  "expo": {
    "icon": "./assets/android-icons/icon-192.png",  // Ganti dengan path icon yang diinginkan
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icons/icon-192.png"  // Ganti dengan path icon yang diinginkan
      }
    }
  }
}
```

### Opsi 2: Membuat Icon Baru dengan Ukuran Kustom
Gunakan script yang sudah dibuat untuk menghasilkan icon dengan ukuran berbeda:

```bash
# Install ImageMagick jika belum ada
brew install imagemagick

# Jalankan script resize
./scripts/resize-icons.sh
```

Script ini akan membuat icon dengan ukuran:
- 512x512
- 256x256
- 128x128
- 64x64
- 32x32
- 16x16

### Opsi 3: Menggunakan Tool Online
Anda dapat menggunakan tool online untuk resize icon:
1. Upload icon `assets/icon.png`
2. Pilih ukuran yang diinginkan
3. Download hasil resize
4. Ganti file di `assets/` dan update `app.json`

## Rekomendasi Ukuran Icon

### Untuk Aplikasi Mobile:
- **iOS**: 1024x1024 (recommended)
- **Android**: 512x512 atau 1024x1024
- **Android Adaptive**: 108x108 (foreground) dengan background

### Untuk Web:
- **Favicon**: 32x32 atau 64x64
- **Touch Icon**: 192x192

## Langkah Setelah Mengubah Icon

1. **Test di development**:
   ```bash
   npx expo start
   ```

2. **Build ulang aplikasi**:
   ```bash
   # Untuk Android
   npx expo build:android
   
   # Untuk iOS
   npx expo build:ios
   ```

3. **Clear cache jika perlu**:
   ```bash
   npx expo start --clear
   ```

## Catatan Penting

- Icon harus berbentuk persegi (square)
- Format yang didukung: PNG, JPG
- Pastikan icon memiliki background yang solid
- Test icon di berbagai ukuran layar
- Icon akan otomatis di-resize oleh sistem operasi sesuai kebutuhan

## Troubleshooting

Jika icon tidak muncul dengan benar:
1. Pastikan path file benar di `app.json`
2. Clear cache Expo
3. Rebuild aplikasi
4. Periksa format file (harus PNG/JPG)
5. Pastikan ukuran file tidak terlalu besar
