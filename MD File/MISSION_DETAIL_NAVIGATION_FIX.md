# Mission Detail Navigation Fix

## Problem Description

Pengguna tidak bisa membuka halaman detail misi (Mission Detail Screen). Ketika mencoba navigasi ke halaman detail misi, aplikasi mengalami error atau tidak merespons.

## Root Cause Analysis

Setelah investigasi mendalam, ditemukan bahwa masalah utama adalah:

1. **Missing API Method**: `MissionDetailScreen` mencoba memanggil `apiService.getUserMission(userMission.id)` tetapi method ini tidak ada di `src/services/api.js`

2. **Missing Server Endpoint**: Tidak ada endpoint API di server untuk mengambil data user mission individual

3. **Navigation Parameters**: Navigasi ke MissionDetail sudah benar, tetapi data tidak bisa di-refresh karena API method yang hilang

## Solution Implemented

### 1. Added Missing API Method

**File**: `src/services/api.js`

Menambahkan method `getUserMission` yang hilang:

```javascript
async getUserMission(userMissionId) {
  try {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await this.request(`/missions/user-mission/${userMissionId}`);
    return response;
  } catch (error) {
    if (error.message.includes("Network") || error.message.includes("connection")) {
      // For network errors, try to get from my-missions as fallback
      const myMissionsResponse = await this.getMyMissions();
      if (myMissionsResponse.success && myMissionsResponse.data) {
        const userMission = myMissionsResponse.data.find(
          (um) => um.id === userMissionId
        );
        if (userMission) {
          return {
            success: true,
            data: userMission,
            message: "Retrieved from cached data"
          };
        }
      }
      return {
        success: false,
        message: "User mission not found"
      };
    }
    throw error;
  }
}
```

### 2. Added Mock API Method

**File**: `src/services/mockApi.js`

Menambahkan method `getUserMission` untuk konsistensi dengan mock API:

```javascript
async getUserMission(userMissionId) {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    const user = JSON.parse(userData);
    const userMission = this.mockUserMissions.find(um => um.id === userMissionId && um.user_id === user.id);
    
    if (!userMission) {
      return {
        success: false,
        message: "User mission not found"
      };
    }
    
    return {
      success: true,
      data: userMission
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get user mission",
      error: error.message
    };
  }
}
```

### 3. Added Server Endpoint

**File**: `dash-app/app/api/mobile/missions/user-mission/[id]/route.js`

Membuat endpoint API baru untuk mengambil data user mission individual:

```javascript
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user mission with mission details
    const sql = `
      SELECT 
        um.id,
        um.user_id,
        um.mission_id,
        um.status,
        um.current_value,
        um.target_value,
        um.progress,
        um.notes,
        um.points_earned,
        um.created_at,
        um.updated_at,
        um.completed_date,
        um.cancelled_at,
        m.title as mission_title,
        m.description as mission_description,
        m.category as mission_category,
        m.points as mission_points,
        m.target_value as mission_target_value,
        m.unit as mission_unit,
        m.difficulty as mission_difficulty,
        m.icon as mission_icon,
        m.color as mission_color,
        m.type as mission_type
      FROM user_missions um
      LEFT JOIN missions m ON um.mission_id = m.id
      WHERE um.id = ? AND um.user_id = ?
    `;

    const userMissions = await query(sql, [id, user.id]);

    if (userMissions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User mission not found' },
        { status: 404 }
      );
    }

    // Format response
    const userMission = userMissions[0];
    const formattedUserMission = {
      id: userMission.id,
      user_id: userMission.user_id,
      mission_id: userMission.mission_id,
      status: userMission.status,
      current_value: userMission.current_value || 0,
      target_value: userMission.target_value || userMission.mission_target_value || 0,
      progress: userMission.progress || 0,
      notes: userMission.notes || '',
      points_earned: userMission.points_earned || 0,
      created_at: userMission.created_at,
      updated_at: userMission.updated_at,
      completed_date: userMission.completed_date,
      cancelled_at: userMission.cancelled_at,
      mission: {
        id: userMission.mission_id,
        title: userMission.mission_title,
        description: userMission.mission_description,
        category: userMission.mission_category,
        points: userMission.mission_points,
        target_value: userMission.mission_target_value,
        unit: userMission.mission_unit,
        difficulty: userMission.mission_difficulty,
        icon: userMission.mission_icon,
        color: userMission.mission_color,
        type: userMission.mission_type
      }
    };

    return NextResponse.json({
      success: true,
      data: formattedUserMission
    });

  } catch (error) {
    console.error('Error fetching user mission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user mission' },
      { status: 500 }
    );
  }
}
```

### 4. Created Test Script

**File**: `scripts/test-mission-detail.js`

Membuat script test untuk memverifikasi bahwa fix berhasil:

```javascript
// Test script untuk memverifikasi mission detail functionality
// Menjalankan: node scripts/test-mission-detail.js
```

## Testing

### Manual Testing Steps

1. **Login ke aplikasi** dengan akun yang valid
2. **Buka halaman Daily Mission** atau Dashboard
3. **Tap pada salah satu misi** untuk membuka detail
4. **Verifikasi bahwa halaman detail misi terbuka** dengan data yang benar
5. **Test update progress** misi
6. **Test accept mission** jika belum diterima

### Expected Behavior

- ✅ Halaman detail misi terbuka tanpa error
- ✅ Data misi ditampilkan dengan benar
- ✅ Progress misi bisa diupdate
- ✅ Status misi (active/completed/cancelled) ditampilkan dengan benar
- ✅ Navigasi kembali ke halaman sebelumnya berfungsi

## Files Modified

1. `src/services/api.js` - Added `getUserMission` method
2. `src/services/mockApi.js` - Added `getUserMission` method
3. `dash-app/app/api/mobile/missions/user-mission/[id]/route.js` - New API endpoint
4. `scripts/test-mission-detail.js` - Test script
5. `MD File/MISSION_DETAIL_NAVIGATION_FIX.md` - This documentation

## Impact

- ✅ **Fixed**: Mission detail navigation tidak berfungsi
- ✅ **Improved**: Error handling untuk network issues
- ✅ **Enhanced**: Fallback mechanism menggunakan cached data
- ✅ **Maintained**: Backward compatibility dengan existing code

## Notes

- Pastikan server berjalan untuk testing lengkap
- Jika masih ada masalah, cek console log untuk error details
- Method `getUserMission` sekarang tersedia di API service dan bisa digunakan di screen lain jika diperlukan
