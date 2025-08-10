# Fix: Endpoint Fitness Tracking dan Penambahan DELETE Endpoint

## Masalah yang Ditemukan

### 1. Error 404 saat Menghapus Fitness Entry
```
ERROR ❌ API: Response error text: <!DOCTYPE html><html lang="id" class="__variable_e8ce0c">
ERROR ❌ API Request failed (attempt 1/3): {"baseURL": "http://10.242.90.103:3000/api/mobile", "endpoint": "/tracking/fitness/8", "error": "Resource not found.", "errorType": "Error"}
ERROR Error deleting exercise entry: [Error: Resource not found.]
```

### 2. Server Port Conflict
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

## Solusi yang Diterapkan

### 1. Penambahan Endpoint DELETE

#### File: `dash-app/app/api/mobile/tracking/fitness/[id]/route.js`

**Endpoint DELETE untuk menghapus fitness entry:**
```javascript
export async function DELETE(request, { params }) {
  try {
    // Get user information from token
    const userPayload = await getUserFromToken(request);
    
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
      }, { status: 401 });
    }

    const entryId = params.id;
    
    // Check if entry exists and belongs to user
    const checkSql = `
      SELECT id, user_id, activity_type, duration_minutes, calories_burned, distance_km, steps
      FROM fitness_tracking
      WHERE id = ? AND user_id = ?
    `;
    
    const [existingEntry] = await query(checkSql, [entryId, userPayload.id]);
    
    if (existingEntry.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Fitness entry not found or you don't have permission to delete it",
      }, { status: 404 });
    }

    // Delete the entry
    const deleteSql = `
      DELETE FROM fitness_tracking
      WHERE id = ? AND user_id = ?
    `;
    
    await query(deleteSql, [entryId, userPayload.id]);
    
    return NextResponse.json({
      success: true,
      message: "Fitness entry deleted successfully",
      data: { deletedId: entryId },
    });
    
  } catch (error) {
    console.error("❌ Error deleting fitness entry:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal menghapus fitness entry",
      error: error.message,
    }, { status: 500 });
  }
}
```

**Endpoint GET untuk mengambil fitness entry spesifik:**
```javascript
export async function GET(request, { params }) {
  // Similar authentication and schema detection logic
  // Returns specific fitness entry by ID
}
```

### 2. Perbaikan Server Management

#### Kill Process yang Menggunakan Port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

#### Restart Server
```bash
cd /Volumes/Data\ 2/Project/phc-mobile/dash-app
npm run dev
```

### 3. Testing Script

#### File: `scripts/test-fitness-endpoints.js`

Script test untuk memverifikasi semua endpoint berfungsi:

```javascript
// Test 1: GET fitness history
// Test 2: GET today's fitness
// Test 3: POST new fitness entry
// Test 4: DELETE created entry
// Test 5: Test DELETE with invalid ID
```

## Fitur Endpoint yang Ditambahkan

### 1. DELETE `/api/mobile/tracking/fitness/[id]`
- **Fungsi**: Menghapus fitness entry berdasarkan ID
- **Autentikasi**: Required (Bearer token)
- **Validasi**: 
  - Entry harus ada
  - Entry harus milik user yang sedang login
- **Response**: 
  - Success: `{ success: true, message: "Fitness entry deleted successfully" }`
  - Error: `{ success: false, message: "Fitness entry not found" }`

### 2. GET `/api/mobile/tracking/fitness/[id]`
- **Fungsi**: Mengambil fitness entry spesifik berdasarkan ID
- **Autentikasi**: Required (Bearer token)
- **Response**: 
  - Success: `{ success: true, data: { fitness_entry_data } }`
  - Error: `{ success: false, message: "Fitness entry not found" }`

## Cara Menjalankan Test

### 1. Update Database Password
Edit file `scripts/test-fitness-endpoints.js`:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_actual_password_here', // Update ini
  database: 'phc_dashboard'
};
```

### 2. Install Dependencies (jika belum)
```bash
cd /Volumes/Data\ 2/Project/phc-mobile
npm install axios mysql2
```

### 3. Jalankan Test
```bash
node scripts/test-fitness-endpoints.js
```

## Hasil yang Diharapkan

Setelah perbaikan ini:

### ✅ **Endpoint DELETE berfungsi**
- Tidak ada lagi error 404 saat menghapus fitness entry
- Validasi keamanan (hanya user yang punya entry yang bisa hapus)
- Response yang konsisten

### ✅ **Server berjalan dengan stabil**
- Tidak ada konflik port
- Server restart dengan clean

### ✅ **Testing yang komprehensif**
- Test semua endpoint (GET, POST, DELETE)
- Test dengan data valid dan invalid
- Test database connection

### ✅ **Kompatibilitas dengan skema database**
- Mendukung skema lama dan baru
- Deteksi otomatis kolom yang tersedia
- Query yang fleksibel

## Monitoring dan Debugging

### 1. Cek Log Server
```bash
# Di terminal server
npm run dev
```

### 2. Test Endpoint Manual
```bash
# Test GET
curl -X GET http://localhost:3000/api/mobile/tracking/fitness \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test DELETE
curl -X DELETE http://localhost:3000/api/mobile/tracking/fitness/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Cek Database
```sql
-- Cek struktur tabel
DESCRIBE fitness_tracking;

-- Cek data yang ada
SELECT * FROM fitness_tracking ORDER BY created_at DESC LIMIT 5;
```

## Troubleshooting

### Jika masih ada error 404:
1. Pastikan server sudah restart
2. Cek apakah file `[id]/route.js` sudah dibuat
3. Cek log server untuk error detail

### Jika ada error autentikasi:
1. Pastikan token valid
2. Cek apakah user ID ada di database
3. Test dengan user yang berbeda

### Jika ada error database:
1. Cek koneksi database
2. Cek struktur tabel fitness_tracking
3. Cek permission user database

## Catatan Penting

- **Security**: Endpoint DELETE memvalidasi kepemilikan entry
- **Error Handling**: Semua endpoint memiliki error handling yang konsisten
- **Logging**: Semua operasi di-log untuk debugging
- **Testing**: Script test mencakup semua skenario penting
- **Documentation**: Semua perubahan terdokumentasi dengan baik
