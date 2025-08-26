# 🎯 How to Use Mission Sub-Category System

## 📋 **Overview**

Panduan lengkap cara menggunakan sistem misi dengan sub-kategori yang telah diimplementasikan. Sistem ini memungkinkan setiap misi mengambil data tracking yang tepat sesuai dengan kategorinya.

## 🚀 **Quick Start**

### 1. **Jalankan Implementasi**
```bash
# Dari root directory project
./scripts/run-mission-sub-category-implementation.sh
```

### 2. **Verifikasi Implementasi**
```sql
-- Check missions dengan sub-category
SELECT category, sub_category, COUNT(*) as count 
FROM missions 
WHERE sub_category IS NOT NULL 
GROUP BY category, sub_category;
```

## 📊 **Struktur Sub-Kategori**

### **FITNESS** (4 Sub-kategori)
- **STEPS**: Mengambil data dari `fitness_tracking.steps`
- **DURATION**: Mengambil data dari `fitness_tracking.exercise_minutes`
- **DISTANCE**: Mengambil data dari `fitness_tracking.distance_km`
- **CALORIES**: Mengambil data dari `fitness_tracking.calories_burned`

### **HEALTH_TRACKING** (3 Sub-kategori)
- **WATER_INTAKE**: Mengambil data dari `water_tracking.amount_ml`
- **SLEEP_DURATION**: Mengambil data dari `sleep_tracking.sleep_duration_hours`
- **SLEEP_QUALITY**: Mengambil data dari `sleep_tracking.sleep_quality`

### **NUTRITION** (3 Sub-kategori)
- **CALORIES_INTAKE**: Mengambil data dari `meal_logging.calories` (SUM)
- **MEAL_COUNT**: Mengambil data dari `meal_logging.meal_type` (COUNT DISTINCT)
- **PROTEIN_INTAKE**: Mengambil data dari `meal_logging.protein` (SUM)

### **MENTAL_HEALTH** (3 Sub-kategori)
- **MOOD_SCORE**: Mengambil data dari `mood_tracking.mood_score`
- **STRESS_LEVEL**: Mengambil data dari `mood_tracking.stress_level`
- **ENERGY_LEVEL**: Mengambil data dari `mood_tracking.energy_level`

## 🔧 **Backend Implementation**

### 1. **Auto-Update Missions API**

File: `dash-app/app/api/mobile/tracking/auto-update-missions/route.js`

```javascript
export async function POST(request) {
  try {
    const { tracking_type, current_value, date, unit } = await request.json();
    
    // Get user from token
    const userPayload = await getUserFromToken(request);
    
    // Get active missions based on tracking type and unit
    const activeMissionsQuery = `
      SELECT 
        um.id as user_mission_id,
        um.mission_id,
        um.current_value,
        um.progress,
        um.status,
        m.title,
        m.category,
        m.sub_category,
        m.target_value,
        m.unit,
        m.tracking_mapping
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? 
        AND um.status = 'active'
        AND m.category = ?
        AND m.unit = ?
        AND um.mission_date = ?
    `;

    const [activeMissions] = await query(activeMissionsQuery, [
      userPayload.id, 
      tracking_type, 
      unit, 
      date
    ]);

    let updatedCount = 0;

    for (const mission of activeMissions) {
      const trackingMapping = mission.tracking_mapping ? JSON.parse(mission.tracking_mapping) : null;
      
      if (trackingMapping) {
        // Use tracking mapping configuration
        const newValue = current_value;
        const progress = Math.min((newValue / mission.target_value) * 100, 100);
        const status = newValue >= mission.target_value ? 'completed' : 'active';

        // Update user mission
        await query(`
          UPDATE user_missions 
          SET current_value = ?, progress = ?, status = ?, updated_at = NOW()
          WHERE id = ?
        `, [newValue, progress, status, mission.user_mission_id]);

        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} missions`,
      updated_count: updatedCount
    });

  } catch (error) {
    console.error('Error updating missions:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
```

### 2. **Mission Progress Calculator**

File: `dash-app/lib/missionProgressCalculator.js`

```javascript
class MissionProgressCalculator {
  static async calculateProgressForUser(userId, date) {
    const missions = await this.getUserActiveMissions(userId, date);
    const results = [];

    for (const mission of missions) {
      const trackingMapping = mission.tracking_mapping ? JSON.parse(mission.tracking_mapping) : null;
      
      if (trackingMapping) {
        const currentValue = await this.getTrackingValue(
          userId, 
          date, 
          trackingMapping
        );
        
        const progress = Math.min((currentValue / mission.target_value) * 100, 100);
        const status = currentValue >= mission.target_value ? 'completed' : 'active';

        results.push({
          mission_id: mission.mission_id,
          current_value: currentValue,
          progress: progress,
          status: status
        });
      }
    }

    return results;
  }

  static async getTrackingValue(userId, date, trackingMapping) {
    const { table, column, aggregation, date_column } = trackingMapping;
    
    let query = '';
    
    switch (aggregation) {
      case 'SUM':
        query = `SELECT SUM(${column}) as value FROM ${table} WHERE user_id = ? AND ${date_column} = ?`;
        break;
      case 'AVG':
        query = `SELECT AVG(${column}) as value FROM ${table} WHERE user_id = ? AND ${date_column} = ?`;
        break;
      case 'COUNT_DISTINCT':
        query = `SELECT COUNT(DISTINCT ${column}) as value FROM ${table} WHERE user_id = ? AND ${date_column} = ?`;
        break;
      default:
        query = `SELECT ${column} as value FROM ${table} WHERE user_id = ? AND ${date_column} = ? ORDER BY created_at DESC LIMIT 1`;
    }

    const [result] = await query(query, [userId, date]);
    return result.value || 0;
  }
}

module.exports = MissionProgressCalculator;
```

## 📱 **Frontend Implementation**

### 1. **Enhanced Mission Service**

File: `src/services/MissionService.ts`

```typescript
export interface MissionSubCategory {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  unit: string;
  aggregation: 'SUM' | 'AVG' | 'COUNT_DISTINCT';
}

export interface MissionWithSubCategory extends Mission {
  sub_category: string;
  tracking_mapping: {
    table: string;
    column: string;
    aggregation: string;
    date_column: string;
  };
}

export class MissionService {
  static async getMissionsBySubCategory(category: string, subCategory?: string): Promise<MissionWithSubCategory[]> {
    try {
      const response = await api.get(`/missions?category=${category}${subCategory ? `&sub_category=${subCategory}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching missions by sub-category:', error);
      throw error;
    }
  }

  static async getMissionProgress(userId: number, date: string): Promise<any[]> {
    try {
      const response = await api.get(`/missions/progress?user_id=${userId}&date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mission progress:', error);
      throw error;
    }
  }
}
```

### 2. **Enhanced Mission Screen**

File: `src/screens/MissionScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MissionService, MissionWithSubCategory } from '../services/MissionService';

const MissionScreen = () => {
  const [missions, setMissions] = useState<MissionWithSubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const subCategories = {
    fitness: [
      { id: 'STEPS', name: 'Steps', description: 'Jumlah langkah harian' },
      { id: 'DURATION', name: 'Duration', description: 'Durasi olahraga' },
      { id: 'DISTANCE', name: 'Distance', description: 'Jarak yang ditempuh' },
      { id: 'CALORIES', name: 'Calories', description: 'Kalori yang dibakar' }
    ],
    health_tracking: [
      { id: 'WATER_INTAKE', name: 'Water Intake', description: 'Asupan air minum' },
      { id: 'SLEEP_DURATION', name: 'Sleep Duration', description: 'Durasi tidur' },
      { id: 'SLEEP_QUALITY', name: 'Sleep Quality', description: 'Kualitas tidur' }
    ],
    nutrition: [
      { id: 'CALORIES_INTAKE', name: 'Calories Intake', description: 'Asupan kalori' },
      { id: 'MEAL_COUNT', name: 'Meal Count', description: 'Jumlah makan' },
      { id: 'PROTEIN_INTAKE', name: 'Protein Intake', description: 'Asupan protein' }
    ],
    mental_health: [
      { id: 'MOOD_SCORE', name: 'Mood Score', description: 'Skor mood' },
      { id: 'STRESS_LEVEL', name: 'Stress Level', description: 'Level stress' },
      { id: 'ENERGY_LEVEL', name: 'Energy Level', description: 'Level energi' }
    ]
  };

  useEffect(() => {
    loadMissions();
  }, [selectedCategory, selectedSubCategory]);

  const loadMissions = async () => {
    try {
      const missionsData = await MissionService.getMissionsBySubCategory(
        selectedCategory, 
        selectedSubCategory || undefined
      );
      setMissions(missionsData);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  };

  const renderSubCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.subCategoryItem,
        selectedSubCategory === item.id && styles.selectedSubCategory
      ]}
      onPress={() => setSelectedSubCategory(selectedSubCategory === item.id ? null : item.id)}
    >
      <Text style={styles.subCategoryName}>{item.name}</Text>
      <Text style={styles.subCategoryDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderMissionItem = ({ item }: { item: MissionWithSubCategory }) => (
    <View style={styles.missionItem}>
      <Text style={styles.missionTitle}>{item.title}</Text>
      <Text style={styles.missionSubCategory}>Sub-category: {item.sub_category}</Text>
      <Text style={styles.missionTarget}>
        Target: {item.target_value} {item.unit}
      </Text>
      <Text style={styles.missionPoints}>Points: {item.points}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missions by Sub-Category</Text>
      
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

      {/* Missions List */}
      <Text style={styles.sectionTitle}>Missions:</Text>
      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={item => item.id.toString()}
        style={styles.missionsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
    marginBottom: 20
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
  missionsList: {
    flex: 1
  },
  missionItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  missionSubCategory: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4
  },
  missionTarget: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  missionPoints: {
    fontSize: 12,
    color: '#666'
  }
});

export default MissionScreen;
```

## 🧪 **Testing**

### 1. **Unit Testing**

File: `tests/missionSubCategory.test.js`

```javascript
const MissionProgressCalculator = require('../dash-app/lib/missionProgressCalculator');

describe('Mission Sub-Category System', () => {
  test('should correctly map fitness steps missions', async () => {
    const mission = {
      category: 'fitness',
      sub_category: 'STEPS',
      unit: 'steps',
      tracking_mapping: {
        table: 'fitness_tracking',
        column: 'steps',
        aggregation: 'SUM'
      }
    };

    const result = await MissionProgressCalculator.getTrackingValue(1, '2024-01-01', mission.tracking_mapping);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test('should correctly map water intake missions', async () => {
    const mission = {
      category: 'health_tracking',
      sub_category: 'WATER_INTAKE',
      unit: 'ml',
      tracking_mapping: {
        table: 'water_tracking',
        column: 'amount_ml',
        aggregation: 'SUM'
      }
    };

    const result = await MissionProgressCalculator.getTrackingValue(1, '2024-01-01', mission.tracking_mapping);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
```

### 2. **Integration Testing**

File: `tests/missionIntegration.test.js`

```javascript
describe('Mission Integration Tests', () => {
  test('should auto-update missions when tracking data is submitted', async () => {
    // Submit fitness tracking data
    const fitnessData = {
      steps: 5000,
      exercise_minutes: 30,
      distance_km: 3.5,
      calories_burned: 250
    };

    const response = await request(app)
      .post('/api/mobile/tracking/fitness')
      .send(fitnessData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    // Check if missions were updated
    const missionsResponse = await request(app)
      .get('/api/mobile/missions/progress')
      .set('Authorization', `Bearer ${token}`);

    expect(missionsResponse.status).toBe(200);
    expect(missionsResponse.body.data).toHaveLength(4); // Should have 4 fitness missions
  });
});
```

## 📊 **Monitoring & Analytics**

### 1. **Database Queries untuk Monitoring**

```sql
-- Check mission completion rate by sub-category
SELECT 
    m.category,
    m.sub_category,
    COUNT(*) as total_missions,
    COUNT(CASE WHEN um.status = 'completed' THEN 1 END) as completed_missions,
    ROUND(COUNT(CASE WHEN um.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM missions m
LEFT JOIN user_missions um ON m.id = um.mission_id
WHERE m.sub_category IS NOT NULL
GROUP BY m.category, m.sub_category
ORDER BY completion_rate DESC;

-- Check user engagement by sub-category
SELECT 
    m.sub_category,
    COUNT(DISTINCT um.user_id) as active_users,
    AVG(um.progress) as avg_progress,
    MAX(um.progress) as max_progress
FROM missions m
JOIN user_missions um ON m.id = um.mission_id
WHERE um.status = 'active'
GROUP BY m.sub_category
ORDER BY active_users DESC;
```

### 2. **Performance Metrics**

- **Mission Completion Rate**: Persentase misi yang berhasil diselesaikan per sub-kategori
- **User Engagement**: Jumlah user aktif per sub-kategori
- **Progress Accuracy**: Akurasi perhitungan progress berdasarkan data tracking
- **Auto-Update Success Rate**: Tingkat keberhasilan auto-update misi

## 🔧 **Troubleshooting**

### 1. **Common Issues**

#### **Issue: Missions not updating automatically**
**Solution:**
- Check if tracking mapping is correctly configured
- Verify that tracking data is being saved to the correct table
- Check if auto-update API is being called with correct parameters

#### **Issue: Wrong data being used for mission progress**
**Solution:**
- Verify tracking_mapping configuration in missions table
- Check if aggregation type is correct (SUM, AVG, COUNT_DISTINCT)
- Ensure date_column is pointing to the correct column

#### **Issue: Performance issues with mission queries**
**Solution:**
- Check if indexes are created properly
- Optimize queries using sub-category filtering
- Consider caching frequently accessed mission data

### 2. **Debug Queries**

```sql
-- Check tracking mapping configuration
SELECT 
    id,
    title,
    category,
    sub_category,
    tracking_mapping
FROM missions 
WHERE tracking_mapping IS NOT NULL
ORDER BY category, sub_category;

-- Check mission progress for specific user
SELECT 
    um.id,
    m.title,
    m.sub_category,
    um.current_value,
    m.target_value,
    um.progress,
    um.status
FROM user_missions um
JOIN missions m ON um.mission_id = m.id
WHERE um.user_id = 1
  AND um.mission_date = '2024-01-01'
ORDER BY m.category, m.sub_category;

-- Check tracking data availability
SELECT 
    'fitness_tracking' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM fitness_tracking
WHERE tracking_date = '2024-01-01'
UNION ALL
SELECT 
    'water_tracking' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM water_tracking
WHERE tracking_date = '2024-01-01';
```

## 🚀 **Best Practices**

### 1. **Database Design**
- Always use indexes on frequently queried columns
- Use JSON for flexible configuration storage
- Implement proper foreign key constraints

### 2. **API Design**
- Use consistent error handling
- Implement proper authentication and authorization
- Add request validation

### 3. **Frontend Design**
- Implement proper loading states
- Add error handling for failed requests
- Use TypeScript for better type safety

### 4. **Testing**
- Write unit tests for all business logic
- Implement integration tests for API endpoints
- Use mock data for testing

## 📝 **Conclusion**

Sistem misi dengan sub-kategori telah berhasil diimplementasikan dan siap digunakan. Sistem ini memberikan akurasi yang lebih tinggi dalam perhitungan progress misi dan memungkinkan pengembangan yang lebih mudah di masa depan.

Untuk menggunakan sistem ini, pastikan untuk:
1. Menjalankan script implementasi
2. Mengupdate backend API sesuai dengan contoh yang diberikan
3. Mengupdate frontend untuk menampilkan sub-kategori
4. Melakukan testing untuk memastikan semua berfungsi dengan baik
5. Memonitor performa dan akurasi sistem
