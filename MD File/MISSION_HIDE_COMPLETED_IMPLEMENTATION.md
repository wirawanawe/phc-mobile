# 🎯 Mission Hide Completed Implementation - Misi Completed Otomatis Tersembunyi

## 🎯 **Overview**

Implementasi fitur untuk menyembunyikan misi yang sudah completed dan menampilkan misi active di atas. Sistem ini akan memberikan user experience yang lebih baik dengan fokus pada misi yang masih perlu diselesaikan.

## 📊 **Fitur yang Diimplementasikan**

### 1. **Auto-Hide Completed Missions**
- Misi yang statusnya 'completed' otomatis tersembunyi
- Misi active selalu ditampilkan di atas
- User dapat memilih untuk menampilkan misi completed jika diinginkan

### 2. **Smart Mission Sorting**
- Misi active diurutkan berdasarkan progress (descending)
- Misi dengan progress tertinggi ditampilkan di atas
- Misi baru (progress 0%) ditampilkan di bawah

### 3. **User Preference Settings**
- Opsi untuk menampilkan/menyembunyikan misi completed
- Setting tersimpan per user
- Default: misi completed tersembunyi

## 🔧 **Implementasi Database**

### 1. **User Mission Preferences Table**

```sql
-- Create user_mission_preferences table
CREATE TABLE IF NOT EXISTS user_mission_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_completed_missions BOOLEAN DEFAULT FALSE,
    sort_by ENUM('progress', 'difficulty', 'points', 'category') DEFAULT 'progress',
    sort_order ENUM('asc', 'desc') DEFAULT 'desc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user (user_id),
    FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

### 2. **Enhanced User Missions Query**

```sql
-- Query untuk mengambil misi dengan filter dan sorting
SELECT 
    um.id as user_mission_id,
    um.mission_id,
    um.current_value,
    um.progress,
    um.status,
    um.mission_date,
    m.title,
    m.description,
    m.category,
    m.sub_category,
    m.target_value,
    m.unit,
    m.points,
    m.difficulty,
    m.icon,
    m.color,
    m.tracking_mapping,
    CASE 
        WHEN um.status = 'completed' THEN 0
        ELSE 1
    END as is_active,
    CASE 
        WHEN um.status = 'active' THEN um.progress
        ELSE 0
    END as sort_progress
FROM user_missions um
JOIN missions m ON um.mission_id = m.id
WHERE um.user_id = ?
  AND um.mission_date = ?
  AND (
    ? = TRUE -- show_completed_missions
    OR um.status = 'active'
  )
ORDER BY 
    is_active DESC, -- Active missions first
    sort_progress DESC, -- Higher progress first
    m.points DESC, -- Higher points first
    m.difficulty ASC; -- Easier missions first
```

## 🚀 **Implementasi Backend API**

### 1. **Enhanced Missions API**

File: `dash-app/app/api/mobile/missions/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - Get user missions with smart filtering and sorting
export async function GET(request) {
  try {
    const userPayload = await getUserFromToken(request);
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const showCompleted = searchParams.get('show_completed') === 'true';
    const category = searchParams.get('category');
    const subCategory = searchParams.get('sub_category');

    // Get user preferences
    const [preferences] = await query(`
      SELECT show_completed_missions, sort_by, sort_order
      FROM user_mission_preferences
      WHERE user_id = ?
    `, [userPayload.id]);

    const userShowCompleted = preferences.length > 0 ? preferences[0].show_completed_missions : false;
    const finalShowCompleted = showCompleted !== null ? showCompleted : userShowCompleted;

    // Build query with filters
    let missionsQuery = `
      SELECT 
        um.id as user_mission_id,
        um.mission_id,
        um.current_value,
        um.progress,
        um.status,
        um.mission_date,
        m.title,
        m.description,
        m.category,
        m.sub_category,
        m.target_value,
        m.unit,
        m.points,
        m.difficulty,
        m.icon,
        m.color,
        m.tracking_mapping,
        CASE 
          WHEN um.status = 'completed' THEN 0
          ELSE 1
        END as is_active,
        CASE 
          WHEN um.status = 'active' THEN um.progress
          ELSE 0
        END as sort_progress
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ?
        AND um.mission_date = ?
        AND (
          ? = TRUE
          OR um.status = 'active'
        )
    `;

    const queryParams = [userPayload.id, date, finalShowCompleted];

    // Add category filter
    if (category) {
      missionsQuery += " AND m.category = ?";
      queryParams.push(category);
    }

    // Add sub-category filter
    if (subCategory) {
      missionsQuery += " AND m.sub_category = ?";
      queryParams.push(subCategory);
    }

    // Add sorting
    missionsQuery += `
      ORDER BY 
        is_active DESC,
        sort_progress DESC,
        m.points DESC,
        m.difficulty ASC
    `;

    const [missions] = await query(missionsQuery, queryParams);

    // Group missions by status
    const activeMissions = missions.filter(m => m.status === 'active');
    const completedMissions = missions.filter(m => m.status === 'completed');

    return NextResponse.json({
      success: true,
      data: {
        missions: missions,
        active_count: activeMissions.length,
        completed_count: completedMissions.length,
        total_count: missions.length,
        show_completed: finalShowCompleted
      }
    });

  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
```

### 2. **User Mission Preferences API**

File: `dash-app/app/api/mobile/missions/preferences/route.js`

```javascript
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - Get user mission preferences
export async function GET(request) {
  try {
    const userPayload = await getUserFromToken(request);
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const [preferences] = await query(`
      SELECT show_completed_missions, sort_by, sort_order
      FROM user_mission_preferences
      WHERE user_id = ?
    `, [userPayload.id]);

    const defaultPreferences = {
      show_completed_missions: false,
      sort_by: 'progress',
      sort_order: 'desc'
    };

    return NextResponse.json({
      success: true,
      data: preferences.length > 0 ? preferences[0] : defaultPreferences
    });

  } catch (error) {
    console.error('Error fetching mission preferences:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Update user mission preferences
export async function POST(request) {
  try {
    const userPayload = await getUserFromToken(request);
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const { show_completed_missions, sort_by, sort_order } = await request.json();

    // Upsert preferences
    await query(`
      INSERT INTO user_mission_preferences (user_id, show_completed_missions, sort_by, sort_order)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        show_completed_missions = VALUES(show_completed_missions),
        sort_by = VALUES(sort_by),
        sort_order = VALUES(sort_order),
        updated_at = NOW()
    `, [userPayload.id, show_completed_missions, sort_by, sort_order]);

    return NextResponse.json({
      success: true,
      message: "Mission preferences updated successfully"
    });

  } catch (error) {
    console.error('Error updating mission preferences:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
```

## 📱 **Implementasi Frontend**

### 1. **Enhanced Mission Service**

File: `src/services/MissionService.ts`

```typescript
export interface MissionPreferences {
  show_completed_missions: boolean;
  sort_by: 'progress' | 'difficulty' | 'points' | 'category';
  sort_order: 'asc' | 'desc';
}

export interface MissionWithStatus extends Mission {
  user_mission_id: number;
  current_value: number;
  progress: number;
  status: 'active' | 'completed';
  mission_date: string;
  is_active: number;
  sort_progress: number;
}

export interface MissionResponse {
  missions: MissionWithStatus[];
  active_count: number;
  completed_count: number;
  total_count: number;
  show_completed: boolean;
}

export class MissionService {
  static async getMissions(
    date: string, 
    showCompleted?: boolean,
    category?: string,
    subCategory?: string
  ): Promise<MissionResponse> {
    try {
      const params = new URLSearchParams({
        date,
        ...(showCompleted !== undefined && { show_completed: showCompleted.toString() }),
        ...(category && { category }),
        ...(subCategory && { sub_category: subCategory })
      });

      const response = await api.get(`/missions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching missions:', error);
      throw error;
    }
  }

  static async getMissionPreferences(): Promise<MissionPreferences> {
    try {
      const response = await api.get('/missions/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching mission preferences:', error);
      throw error;
    }
  }

  static async updateMissionPreferences(preferences: Partial<MissionPreferences>): Promise<void> {
    try {
      await api.post('/missions/preferences', preferences);
    } catch (error) {
      console.error('Error updating mission preferences:', error);
      throw error;
    }
  }
}
```

### 2. **Enhanced Mission Screen**

File: `src/screens/MissionScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MissionService, MissionWithStatus, MissionPreferences } from '../services/MissionService';

const MissionScreen = () => {
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [preferences, setPreferences] = useState<MissionPreferences>({
    show_completed_missions: false,
    sort_by: 'progress',
    sort_order: 'desc'
  });
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    loadMissions();
  }, [selectedCategory, selectedSubCategory, showCompleted]);

  const loadPreferences = async () => {
    try {
      const userPreferences = await MissionService.getMissionPreferences();
      setPreferences(userPreferences);
      setShowCompleted(userPreferences.show_completed_missions);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadMissions = async () => {
    try {
      setLoading(true);
      const missionsData = await MissionService.getMissions(
        new Date().toISOString().split('T')[0],
        showCompleted,
        selectedCategory,
        selectedSubCategory || undefined
      );
      setMissions(missionsData.missions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowCompletedToggle = async (value: boolean) => {
    try {
      setShowCompleted(value);
      await MissionService.updateMissionPreferences({
        show_completed_missions: value
      });
      setPreferences(prev => ({ ...prev, show_completed_missions: value }));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const renderMissionItem = ({ item }: { item: MissionWithStatus }) => (
    <View style={[
      styles.missionItem,
      item.status === 'completed' && styles.completedMission
    ]}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'completed' ? styles.completedBadge : styles.activeBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Completed' : 'Active'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.missionSubCategory}>Sub-category: {item.sub_category}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${item.progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {item.current_value} / {item.target_value} {item.unit} ({item.progress.toFixed(1)}%)
        </Text>
      </View>
      
      <View style={styles.missionFooter}>
        <Text style={styles.missionPoints}>Points: {item.points}</Text>
        <Text style={styles.missionDifficulty}>Difficulty: {item.difficulty}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Missions</Text>
      
      {/* Show Completed Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Show Completed</Text>
        <Switch
          value={showCompleted}
          onValueChange={handleShowCompletedToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={showCompleted ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        {Object.keys(subCategories).map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryText}>{category.replace('_', ' ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-Category Selector */}
      <Text style={styles.sectionTitle}>Sub-Categories:</Text>
      <FlatList
        data={subCategories[selectedCategory as keyof typeof subCategories]}
        renderItem={renderSubCategoryItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subCategoryList}
      />

      {/* Mission Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Active: {missions.filter(m => m.status === 'active').length} | 
          Completed: {missions.filter(m => m.status === 'completed').length}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={item => item.user_mission_id.toString()}
        ListHeaderComponent={renderHeader}
        style={styles.missionsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20
  },
  selectedCategory: {
    backgroundColor: '#007AFF'
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  subCategoryList: {
    marginBottom: 16
  },
  subCategoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 120
  },
  selectedSubCategory: {
    backgroundColor: '#007AFF'
  },
  subCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  subCategoryDescription: {
    fontSize: 12,
    color: '#666'
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 8
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  missionsList: {
    flex: 1
  },
  missionItem: {
    backgroundColor: '#fff',
    margin: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  completedMission: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa'
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  activeBadge: {
    backgroundColor: '#007AFF'
  },
  completedBadge: {
    backgroundColor: '#34C759'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff'
  },
  missionSubCategory: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 12
  },
  progressContainer: {
    marginBottom: 12
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  missionPoints: {
    fontSize: 12,
    color: '#666'
  },
  missionDifficulty: {
    fontSize: 12,
    color: '#666'
  }
});

export default MissionScreen;
```

## 🧪 **Testing**

### 1. **Unit Testing**

```javascript
describe('Mission Hide Completed System', () => {
  test('should hide completed missions by default', async () => {
    const response = await MissionService.getMissions('2024-01-01');
    const completedMissions = response.missions.filter(m => m.status === 'completed');
    expect(completedMissions.length).toBe(0);
  });

  test('should show completed missions when toggle is enabled', async () => {
    const response = await MissionService.getMissions('2024-01-01', true);
    const completedMissions = response.missions.filter(m => m.status === 'completed');
    expect(completedMissions.length).toBeGreaterThan(0);
  });

  test('should sort active missions by progress', async () => {
    const response = await MissionService.getMissions('2024-01-01');
    const activeMissions = response.missions.filter(m => m.status === 'active');
    
    for (let i = 1; i < activeMissions.length; i++) {
      expect(activeMissions[i-1].progress).toBeGreaterThanOrEqual(activeMissions[i].progress);
    }
  });
});
```

## 📊 **Monitoring & Analytics**

### 1. **User Engagement Metrics**

```sql
-- Check user preferences distribution
SELECT 
    show_completed_missions,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_mission_preferences
GROUP BY show_completed_missions;

-- Check mission completion visibility impact
SELECT 
    DATE(um.mission_date) as date,
    COUNT(*) as total_missions,
    COUNT(CASE WHEN um.status = 'completed' THEN 1 END) as completed_missions,
    COUNT(CASE WHEN um.status = 'active' THEN 1 END) as active_missions,
    ROUND(COUNT(CASE WHEN um.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM user_missions um
WHERE um.mission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(um.mission_date)
ORDER BY date DESC;
```

## 🚀 **Cara Menjalankan Implementasi**

### 1. **Jalankan SQL Script**

```sql
-- Create user_mission_preferences table
CREATE TABLE IF NOT EXISTS user_mission_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_completed_missions BOOLEAN DEFAULT FALSE,
    sort_by ENUM('progress', 'difficulty', 'points', 'category') DEFAULT 'progress',
    sort_order ENUM('asc', 'desc') DEFAULT 'desc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user (user_id),
    FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

### 2. **Update Backend API**

Implementasikan kode API yang telah diberikan di atas.

### 3. **Update Frontend**

Implementasikan kode frontend yang telah diberikan di atas.

## 🎯 **Benefits**

1. **Better User Experience**: User fokus pada misi yang masih perlu diselesaikan
2. **Reduced Clutter**: Interface lebih bersih tanpa misi completed
3. **Smart Sorting**: Misi dengan progress tertinggi ditampilkan di atas
4. **User Control**: User dapat memilih untuk menampilkan misi completed
5. **Performance**: Query lebih efisien dengan filtering

## 📝 **Kesimpulan**

Implementasi ini memberikan user experience yang lebih baik dengan menyembunyikan misi completed secara default dan menampilkan misi active di atas dengan sorting yang smart berdasarkan progress. User tetap memiliki kontrol penuh untuk menampilkan misi completed jika diinginkan.
