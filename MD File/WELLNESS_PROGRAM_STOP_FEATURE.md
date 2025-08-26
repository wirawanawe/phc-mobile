# Wellness Program Stop Feature Implementation

## 🎯 **Overview**
Implementasi fitur untuk menghentikan program wellness secara manual sebelum waktu berakhir. User dapat menghentikan program kapan saja dan sistem akan menyimpan data program ke history serta tracking jumlah program yang dihentikan.

## ✅ **Fitur yang Diimplementasikan**

### 1. **Database Enhancement**
- **Kolom baru di `mobile_users`**:
  - `wellness_program_stopped_count` - Jumlah kali user menghentikan program
  - `wellness_program_stopped_date` - Tanggal terakhir user menghentikan program
  - `wellness_program_stop_reason` - Alasan user menghentikan program

### 2. **API Endpoint**
- **File**: `dash-app/app/api/mobile/wellness/stop-program/route.js`
- **Methods**:
  - `POST` - Hentikan program wellness
  - `GET` - Ambil history program yang dihentikan

### 3. **Mobile App Integration**
- **Tombol "Hentikan Program"** di ProfileScreen
- **Stat card "Program Diikuti"** menampilkan jumlah siklus program
- **Informasi program yang dihentikan** di wellness status section

## 📊 **Database Schema**

### Migration Script
```sql
-- Add Wellness Program Stopped Tracking Fields
ALTER TABLE mobile_users 
ADD COLUMN wellness_program_stopped_count INT DEFAULT 0 COMMENT 'Jumlah kali user menghentikan program wellness secara manual',
ADD COLUMN wellness_program_stopped_date DATETIME NULL COMMENT 'Tanggal terakhir user menghentikan program wellness',
ADD COLUMN wellness_program_stop_reason VARCHAR(255) NULL COMMENT 'Alasan user menghentikan program wellness';

-- Add indexes for better performance
CREATE INDEX idx_wellness_program_stopped_count ON mobile_users(wellness_program_stopped_count);
CREATE INDEX idx_wellness_program_stopped_date ON mobile_users(wellness_program_stopped_date);
```

### Struktur Tabel Lengkap
```sql
-- Kolom wellness di mobile_users
wellness_program_joined BOOLEAN DEFAULT FALSE
wellness_join_date DATETIME NULL
wellness_program_duration INT NULL
wellness_program_completed BOOLEAN DEFAULT FALSE
wellness_program_end_date DATETIME NULL
wellness_program_completion_date DATETIME NULL
wellness_program_cycles INT DEFAULT 1
wellness_program_stopped_count INT DEFAULT 0  -- BARU
wellness_program_stopped_date DATETIME NULL   -- BARU
wellness_program_stop_reason VARCHAR(255) NULL -- BARU
```

## 🔧 **API Endpoints**

### 1. **Stop Wellness Program**
```http
POST /api/mobile/wellness/stop-program
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Alasan menghentikan program (opsional)"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Program wellness berhasil dihentikan",
  "data": {
    "user_id": 1,
    "stopped_at": "2024-01-15T10:30:00.000Z",
    "reason": "User stopped program",
    "total_stopped_count": 2
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Anda tidak sedang mengikuti program wellness"
}
```

### 2. **Get Stop History**
```http
GET /api/mobile/wellness/stop-program
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_cycles": 3,
    "stopped_count": 2,
    "last_stopped_date": "2024-01-15T10:30:00.000Z",
    "last_stop_reason": "Sibuk dengan pekerjaan",
    "stopped_programs": [
      {
        "id": 1,
        "program_start_date": "2024-01-01T00:00:00.000Z",
        "program_end_date": "2024-01-15T10:30:00.000Z",
        "program_duration": 30,
        "total_activities": 15,
        "completed_missions": 8,
        "total_points": 450,
        "completion_rate": 50.0
      }
    ]
  }
}
```

## 📱 **Mobile App Implementation**

### 1. **API Service Methods**
```typescript
// src/services/api.js
async stopWellnessProgram(reason = null) {
  return this.request('/wellness/stop-program', {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

async getWellnessProgramStopHistory() {
  return this.request('/wellness/stop-program');
}
```

### 2. **ProfileScreen Updates**

#### State Management
```typescript
const [wellnessStopHistory, setWellnessStopHistory] = useState({
  total_cycles: 0,
  stopped_count: 0,
  last_stopped_date: null,
  last_stop_reason: null,
  stopped_programs: []
});
```

#### Stop Program Function
```typescript
const handleStopProgram = () => {
  Alert.alert(
    "Hentikan Program Wellness",
    "Apakah Anda yakin ingin menghentikan program wellness saat ini? Program akan disimpan ke riwayat dan Anda dapat mendaftar ulang kapan saja.",
    [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hentikan", 
        style: "destructive",
        onPress: () => stopProgram(null)
      }
    ]
  );
};

const stopProgram = async (reason: string | null) => {
  try {
    setLoading(true);
    const response = await apiService.stopWellnessProgram(reason);
    
    if (response.success) {
      Alert.alert(
        "Program Dihentikan",
        "Program wellness berhasil dihentikan. Anda dapat mendaftar ulang kapan saja.",
        [{ text: "OK", onPress: () => fetchUserData() }]
      );
    } else {
      Alert.alert("Gagal", response.message);
    }
  } catch (error) {
    Alert.alert("Terjadi kesalahan", "Gagal menghentikan program wellness");
  } finally {
    setLoading(false);
  }
};
```

### 3. **UI Components**

#### Stop Program Button
```tsx
{wellnessProgramStatus.program_status === 'active' && (
  <TouchableOpacity
    style={styles.stopProgramButton}
    onPress={handleStopProgram}
  >
    <Icon name="stop-circle" size={16} color="#EF4444" />
    <Text style={styles.stopProgramButtonText}>Hentikan Program</Text>
  </TouchableOpacity>
)}
```

#### Program Cycles Stat Card
```tsx
<View style={styles.statCard}>
  <View style={[styles.statIcon, { backgroundColor: "#8B5CF620" }]}>
    <Icon name="refresh" size={20} color="#8B5CF6" />
  </View>
  <Text style={styles.statValue}>
    {loading ? "..." : wellnessProgramStatus.program_cycles || 0}
  </Text>
  <Text style={styles.statLabel}>Program Diikuti</Text>
</View>
```

#### Stop History Display
```tsx
{wellnessStopHistory.stopped_count > 0 && (
  <View style={styles.wellnessStopInfo}>
    <Text style={styles.wellnessStopText}>
      Program dihentikan: {wellnessStopHistory.stopped_count} kali
    </Text>
    {wellnessStopHistory.last_stop_reason && (
      <Text style={styles.wellnessStopReasonText}>
        Alasan terakhir: {wellnessStopHistory.last_stop_reason}
      </Text>
    )}
  </View>
)}
```

## 🎨 **UI Styles**

### Stop Program Button
```typescript
stopProgramButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FEF2F2",
  borderWidth: 1,
  borderColor: "#FECACA",
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginTop: 12,
  alignSelf: "flex-start",
},
stopProgramButtonText: {
  color: "#EF4444",
  fontSize: 12,
  fontWeight: "600",
  marginLeft: 4,
},
```

### Stop History Info
```typescript
wellnessStopInfo: {
  marginBottom: 16,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: "#F1F5F9",
},
wellnessStopText: {
  fontSize: 12,
  color: "#EF4444",
  fontWeight: "600",
  marginBottom: 2,
},
wellnessStopReasonText: {
  fontSize: 11,
  color: "#9CA3AF",
  fontStyle: "italic",
},
```

### Stats Layout (2x2 Grid)
```typescript
statsContainer: {
  paddingHorizontal: 20,
  marginBottom: 32,
},
statsRow: {
  flexDirection: "row",
  gap: 12,
  marginBottom: 12,
},
statCard: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
  borderWidth: 1,
  borderColor: "#F1F5F9",
},
```

## 🔄 **Workflow Program Stop**

### 1. **User Flow**
```
User membuka ProfileScreen → 
Melihat program wellness aktif → 
Klik tombol "Hentikan Program" → 
Konfirmasi dialog → 
Program dihentikan → 
Data disimpan ke history → 
Status program direset → 
User dapat mendaftar ulang
```

### 2. **System Process**
```
1. Validasi user memiliki program aktif
2. Mark program sebagai stopped dan save ke history
3. Update wellness_program_stopped_count + 1
4. Set wellness_program_stopped_date = NOW()
5. Set wellness_program_stop_reason
6. Reset wellness_program_joined = FALSE
7. Clear program data (join_date, duration, end_date, etc.)
8. Return success response
```

### 3. **Data Preservation**
- **History**: Program data disimpan di `wellness_program_history`
- **Cycles**: `wellness_program_cycles` tetap diincrement
- **Stop Count**: `wellness_program_stopped_count` diincrement
- **Health Data**: Data kesehatan tetap tersimpan
- **Activities**: Aktivitas wellness tetap tersimpan dengan completion dates

## 📈 **Monitoring & Analytics**

### 1. **Database Queries**
```sql
-- Total users who stopped programs
SELECT COUNT(*) as total_users_stopped
FROM mobile_users 
WHERE wellness_program_stopped_count > 0;

-- Average stop count per user
SELECT AVG(wellness_program_stopped_count) as avg_stops
FROM mobile_users 
WHERE wellness_program_stopped_count > 0;

-- Most common stop reasons
SELECT wellness_program_stop_reason, COUNT(*) as count
FROM mobile_users 
WHERE wellness_program_stop_reason IS NOT NULL
GROUP BY wellness_program_stop_reason
ORDER BY count DESC;
```

### 2. **User Statistics**
- **Total Cycles**: Jumlah program yang pernah diikuti
- **Stopped Count**: Jumlah program yang dihentikan
- **Completion Rate**: Persentase program yang selesai vs dihentikan
- **Average Duration**: Rata-rata durasi program sebelum dihentikan

## 🛡️ **Error Handling**

### 1. **Validation Checks**
- User must have active wellness program
- Program must not be already completed
- User must be authenticated
- Valid JWT token required

### 2. **Error Responses**
```json
// No active program
{
  "success": false,
  "message": "Anda tidak sedang mengikuti program wellness"
}

// Program already completed
{
  "success": false,
  "message": "Program wellness sudah selesai"
}

// Authentication error
{
  "success": false,
  "message": "Invalid token"
}
```

### 3. **Fallback Behavior**
- If API fails, show error message
- Don't logout user automatically
- Preserve existing data
- Allow retry functionality

## 🚀 **Setup Instructions**

### 1. **Database Migration**
```bash
cd dash-app
mysql -u root -ppr1k1t1w phc_dashboard < scripts/add-wellness-program-stopped-tracking.sql
```

### 2. **Test API Endpoints**
```bash
# Test stop program (requires valid token)
curl -X POST "http://localhost:3000/api/mobile/wellness/stop-program" \
  -H "Authorization: Bearer <valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing stop feature"}'

# Test get stop history
curl -X GET "http://localhost:3000/api/mobile/wellness/stop-program" \
  -H "Authorization: Bearer <valid-token>"
```

### 3. **Mobile App Testing**
1. Login ke aplikasi
2. Join program wellness
3. Buka ProfileScreen
4. Klik tombol "Hentikan Program"
5. Konfirmasi dialog
6. Verifikasi program berhenti
7. Cek stat card "Program Diikuti"
8. Cek informasi stop history

## ✅ **Testing Results**

### 1. **Database Migration**
```bash
✅ Migration script executed successfully
✅ New columns added to mobile_users table
✅ Indexes created for performance
✅ 12 users in database, 0 users with stopped programs
```

### 2. **API Endpoints**
```bash
✅ POST /api/mobile/wellness/stop-program - Working
✅ GET /api/mobile/wellness/stop-program - Working
✅ Authentication validation - Working
✅ Error handling - Working
```

### 3. **Mobile App**
```bash
✅ Stop program button - Added to ProfileScreen
✅ Program cycles stat card - Added to stats section
✅ Stop history display - Added to wellness status
✅ Error handling - Working
✅ Loading states - Working
```

## 🎯 **Summary**

Implementasi fitur stop program wellness telah berhasil dengan fitur:

✅ **Database enhancement** dengan kolom tracking program yang dihentikan  
✅ **API endpoints** untuk stop program dan get history  
✅ **Mobile app integration** dengan tombol stop dan stat cards  
✅ **Data preservation** ke history table  
✅ **User experience** yang smooth dengan konfirmasi dialog  
✅ **Error handling** yang comprehensive  
✅ **Monitoring capabilities** untuk analytics  

Fitur siap untuk digunakan dan dapat membantu user mengelola program wellness mereka dengan lebih fleksibel.
