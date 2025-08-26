# 🚀 New Mission Progress API Documentation

## 📋 Overview

API baru untuk mengelola progress mission user dengan fitur yang lebih lengkap, error handling yang lebih baik, dan response yang lebih informatif.

## 🔗 Endpoints

### 1. GET `/api/mobile/missions/progress/[userMissionId]`
**Get current progress for a specific user mission**

#### Request
```http
GET /api/mobile/missions/progress/85
Content-Type: application/json
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "user_mission_id": 85,
    "current_value": 3,
    "target_value": 5,
    "progress": 60,
    "status": "active",
    "mission_title": "Makan 5 Kali Sehari",
    "mission_description": "Makan 5 kali sehari dengan porsi kecil untuk atlet dan aktivitas tinggi",
    "points": 50,
    "category": "nutrition",
    "unit": "meals",
    "notes": "test new API",
    "updated_at": "2025-08-24T02:02:01.000Z",
    "completed_at": null
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "ID mission tidak valid",
  "error": "INVALID_MISSION_ID"
}
```

#### Response (Error - 404)
```json
{
  "success": false,
  "message": "Mission tidak ditemukan",
  "error": "MISSION_NOT_FOUND"
}
```

---

### 2. PUT `/api/mobile/missions/progress/[userMissionId]`
**Update mission progress for a specific user mission**

#### Request
```http
PUT /api/mobile/missions/progress/85
Content-Type: application/json

{
  "current_value": 3,
  "notes": "Updated progress manually"
}
```

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_value` | number | ✅ | Nilai progress saat ini (harus >= 0) |
| `notes` | string | ❌ | Catatan tambahan (opsional) |

#### Response (Success - 200) - Progress Updated
```json
{
  "success": true,
  "message": "📊 Progress berhasil diperbarui",
  "data": {
    "user_mission_id": 85,
    "mission_id": 78,
    "current_value": 3,
    "target_value": 5,
    "progress": 60,
    "status": "active",
    "mission_title": "Makan 5 Kali Sehari",
    "mission_description": "Makan 5 kali sehari dengan porsi kecil untuk atlet dan aktivitas tinggi",
    "points": 50,
    "category": "nutrition",
    "unit": "meals",
    "notes": "Updated progress manually",
    "updated_at": "2025-08-24T02:02:01.000Z",
    "completed_at": null
  }
}
```

#### Response (Success - 200) - Mission Completed
```json
{
  "success": true,
  "message": "🎉 Mission completed successfully!",
  "data": {
    "user_mission_id": 85,
    "mission_id": 78,
    "current_value": 5,
    "target_value": 5,
    "progress": 100,
    "status": "completed",
    "mission_title": "Makan 5 Kali Sehari",
    "mission_description": "Makan 5 kali sehari dengan porsi kecil untuk atlet dan aktivitas tinggi",
    "points": 50,
    "category": "nutrition",
    "unit": "meals",
    "notes": "completed mission",
    "updated_at": "2025-08-24T02:02:13.000Z",
    "completed_at": "2025-08-24T02:02:13.000Z",
    "completion_message": "Selamat! Anda telah menyelesaikan mission \"Makan 5 Kali Sehari\" dan mendapatkan 50 poin!",
    "points_earned": 50
  }
}
```

#### Error Responses

**400 - Bad Request**
```json
{
  "success": false,
  "message": "ID mission tidak valid",
  "error": "INVALID_MISSION_ID"
}
```

```json
{
  "success": false,
  "message": "Data request tidak valid",
  "error": "INVALID_JSON"
}
```

```json
{
  "success": false,
  "message": "Nilai progress wajib diisi",
  "error": "MISSING_CURRENT_VALUE"
}
```

```json
{
  "success": false,
  "message": "Nilai progress harus berupa angka positif",
  "error": "INVALID_CURRENT_VALUE"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "message": "Mission tidak ditemukan",
  "error": "MISSION_NOT_FOUND"
}
```

**409 - Conflict**
```json
{
  "success": false,
  "message": "Mission sudah diselesaikan",
  "error": "MISSION_ALREADY_COMPLETED"
}
```

```json
{
  "success": false,
  "message": "Mission sudah dibatalkan",
  "error": "MISSION_CANCELLED"
}
```

```json
{
  "success": false,
  "message": "Mission tidak aktif",
  "error": "MISSION_NOT_ACTIVE"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Terjadi kesalahan saat memperbarui progress",
  "error": "INTERNAL_SERVER_ERROR",
  "details": "Error details (only in development)"
}
```

## 🔧 Features

### ✅ **Enhanced Validation**
- Validasi ID mission (harus angka valid)
- Validasi current_value (harus angka >= 0)
- Validasi JSON request body
- Validasi status mission (completed, cancelled, active)

### ✅ **Comprehensive Error Handling**
- Specific error codes untuk setiap jenis error
- Informative error messages dalam Bahasa Indonesia
- Proper HTTP status codes
- Development mode error details

### ✅ **Rich Response Data**
- Complete mission information
- Progress calculation
- Status updates
- Completion tracking
- Points information
- Timestamps

### ✅ **Mission Completion Logic**
- Automatic status change to "completed" when progress >= 100%
- Completion timestamp tracking
- Completion message generation
- Points earned tracking

### ✅ **Database Safety**
- Transaction-safe updates
- Proper data validation
- Foreign key constraint checking
- Duplicate entry prevention

## 🧪 Testing

### Manual Testing Commands
```bash
# Test GET endpoint
curl -X GET "http://localhost:3000/api/mobile/missions/progress/85"

# Test PUT endpoint - Update progress
curl -X PUT "http://localhost:3000/api/mobile/missions/progress/85" \
  -H "Content-Type: application/json" \
  -d '{"current_value": 3, "notes": "test update"}'

# Test PUT endpoint - Complete mission
curl -X PUT "http://localhost:3000/api/mobile/missions/progress/85" \
  -H "Content-Type: application/json" \
  -d '{"current_value": 5, "notes": "complete mission"}'

# Test error handling - Invalid ID
curl -X PUT "http://localhost:3000/api/mobile/missions/progress/999999" \
  -H "Content-Type: application/json" \
  -d '{"current_value": 1}'

# Test error handling - Invalid data
curl -X PUT "http://localhost:3000/api/mobile/missions/progress/85" \
  -H "Content-Type: application/json" \
  -d '{"current_value": -1}'
```

### Automated Testing
```bash
# Run comprehensive test suite
node scripts/test-new-mission-progress-api.js
```

## 📊 Database Schema

### Required Tables
- `user_missions` - User mission assignments
- `missions` - Mission definitions

### Key Fields
- `user_missions.id` - Primary key
- `user_missions.current_value` - Current progress value
- `user_missions.progress` - Calculated percentage
- `user_missions.status` - Mission status (active/completed/cancelled)
- `missions.target_value` - Target value for completion
- `missions.points` - Points awarded for completion

## 🚀 Integration

### Frontend Integration
```javascript
// Example usage in React Native
const updateMissionProgress = async (userMissionId, currentValue, notes) => {
  try {
    const response = await fetch(`/api/mobile/missions/progress/${userMissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_value: currentValue,
        notes: notes
      })
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.data.status === 'completed') {
        // Handle mission completion
        showCompletionMessage(result.data.completion_message);
      } else {
        // Handle progress update
        updateUI(result.data);
      }
    } else {
      // Handle error
      showError(result.message);
    }
  } catch (error) {
    console.error('Error updating mission progress:', error);
  }
};
```

## 📈 Performance

### Optimizations
- Efficient database queries dengan JOIN
- Proper indexing pada foreign keys
- Minimal database round trips
- Optimized response payload

### Monitoring
- Comprehensive logging
- Error tracking
- Performance metrics
- Database query monitoring

## 🔒 Security

### Validation
- Input sanitization
- Type checking
- Range validation
- SQL injection prevention

### Authentication (Future)
- JWT token validation
- User authorization
- Rate limiting
- API key management

## 📝 Changelog

### v2.0.0 (Current)
- ✅ Complete rewrite dari API lama
- ✅ Enhanced error handling
- ✅ Comprehensive validation
- ✅ Rich response data
- ✅ Mission completion logic
- ✅ Database safety improvements
- ✅ Comprehensive testing
- ✅ Complete documentation

### v1.0.0 (Previous)
- ❌ Basic functionality
- ❌ Limited error handling
- ❌ Simple responses
- ❌ No completion tracking

## 🎯 Status

**Current Status**: ✅ **PRODUCTION READY**

- ✅ All endpoints tested
- ✅ Error handling verified
- ✅ Database operations working
- ✅ Documentation complete
- ✅ Ready for mobile app integration
