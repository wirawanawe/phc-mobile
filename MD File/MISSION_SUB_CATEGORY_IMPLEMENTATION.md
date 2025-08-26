# 🎯 Mission Sub-Category Implementation - Sistem Misi yang Lebih Akurat

## 🎯 **Overview**

Implementasi sistem misi dengan sub-kategori yang lebih akurat, dimana setiap kategori misi memiliki sub-kategori spesifik yang mengambil data tracking yang tepat.

## 📊 **Struktur Sub-Kategori Misi**

### 1. **FITNESS** - Sub-kategori berdasarkan data tracking

#### **Sub-kategori: STEPS**
- **Data Source**: `fitness_tracking.steps`
- **Unit**: `steps`, `langkah`
- **Misi Contoh**:
  - "Jalan 5.000 Langkah" (target: 5000, unit: steps)
  - "Jalan 10.000 Langkah" (target: 10000, unit: steps)
  - "Jalan 15.000 Langkah" (target: 15000, unit: steps)

#### **Sub-kategori: DURATION**
- **Data Source**: `fitness_tracking.exercise_minutes` atau `fitness_tracking.duration_minutes`
- **Unit**: `minutes`, `menit`
- **Misi Contoh**:
  - "Olahraga 15 Menit" (target: 15, unit: minutes)
  - "Olahraga 30 Menit" (target: 30, unit: minutes)
  - "Olahraga 60 Menit" (target: 60, unit: minutes)

#### **Sub-kategori: DISTANCE**
- **Data Source**: `fitness_tracking.distance_km`
- **Unit**: `km`, `kilometer`
- **Misi Contoh**:
  - "Jalan 2 KM" (target: 2, unit: km)
  - "Jalan 5 KM" (target: 5, unit: km)
  - "Jalan 10 KM" (target: 10, unit: km)

#### **Sub-kategori: CALORIES**
- **Data Source**: `fitness_tracking.calories_burned`
- **Unit**: `calories`, `kalori`
- **Misi Contoh**:
  - "Bakar 200 Kalori" (target: 200, unit: calories)
  - "Bakar 500 Kalori" (target: 500, unit: calories)
  - "Bakar 1000 Kalori" (target: 1000, unit: calories)

### 2. **HEALTH_TRACKING** - Sub-kategori berdasarkan data tracking

#### **Sub-kategori: WATER_INTAKE**
- **Data Source**: `water_tracking.amount_ml`
- **Unit**: `ml`, `liter`
- **Misi Contoh**:
  - "Minum 2 Liter Air" (target: 2000, unit: ml)
  - "Minum 3 Liter Air" (target: 3000, unit: ml)
  - "Minum 4 Liter Air" (target: 4000, unit: ml)

#### **Sub-kategori: SLEEP_DURATION**
- **Data Source**: `sleep_tracking.sleep_duration_hours` atau `sleep_tracking.sleep_duration_minutes`
- **Unit**: `hours`, `jam` atau `minutes`, `menit`
- **Misi Contoh**:
  - "Tidur 7 Jam" (target: 7, unit: hours)
  - "Tidur 8 Jam" (target: 8, unit: hours)
  - "Tidur 9 Jam" (target: 9, unit: hours)

#### **Sub-kategori: SLEEP_QUALITY**
- **Data Source**: `sleep_tracking.sleep_quality`
- **Unit**: `quality_score` (1-10)
- **Misi Contoh**:
  - "Tidur Berkualitas Baik" (target: 7, unit: quality_score)
  - "Tidur Berkualitas Sangat Baik" (target: 8, unit: quality_score)

### 3. **NUTRITION** - Sub-kategori berdasarkan data tracking

#### **Sub-kategori: CALORIES_INTAKE**
- **Data Source**: `meal_logging.calories` (SUM per hari)
- **Unit**: `calories`, `kalori`
- **Misi Contoh**:
  - "Konsumsi 1500 Kalori" (target: 1500, unit: calories)
  - "Konsumsi 2000 Kalori" (target: 2000, unit: calories)
  - "Konsumsi 2500 Kalori" (target: 2500, unit: calories)

#### **Sub-kategori: MEAL_COUNT**
- **Data Source**: `meal_logging.meal_type` (COUNT DISTINCT per hari)
- **Unit**: `meals`, `makanan`
- **Misi Contoh**:
  - "Makan 3 Kali Sehari" (target: 3, unit: meals)
  - "Makan 4 Kali Sehari" (target: 4, unit: meals)
  - "Makan 5 Kali Sehari" (target: 5, unit: meals)

#### **Sub-kategori: PROTEIN_INTAKE**
- **Data Source**: `meal_logging.protein` (SUM per hari)
- **Unit**: `grams`, `gram`
- **Misi Contoh**:
  - "Konsumsi 50g Protein" (target: 50, unit: grams)
  - "Konsumsi 80g Protein" (target: 80, unit: grams)
  - "Konsumsi 120g Protein" (target: 120, unit: grams)

### 4. **MENTAL_HEALTH** - Sub-kategori berdasarkan data tracking

#### **Sub-kategori: MOOD_SCORE**
- **Data Source**: `mood_tracking.mood_score` atau konversi dari `mood_tracking.mood_level`
- **Unit**: `mood_score` (1-10)
- **Misi Contoh**:
  - "Mood Stabil" (target: 6, unit: mood_score)
  - "Mood Baik Seharian" (target: 7, unit: mood_score)
  - "Mood Sangat Baik" (target: 8, unit: mood_score)

#### **Sub-kategori: STRESS_LEVEL**
- **Data Source**: `mood_tracking.stress_level` (konversi ke angka)
- **Unit**: `stress_level` (1-4, dimana 1=low, 4=very_high)
- **Misi Contoh**:
  - "Stress Level Rendah" (target: 2, unit: stress_level)
  - "Stress Level Minimal" (target: 1, unit: stress_level)

#### **Sub-kategori: ENERGY_LEVEL**
- **Data Source**: `mood_tracking.energy_level` (konversi ke angka)
- **Unit**: `energy_level` (1-5, dimana 1=very_low, 5=very_high)
- **Misi Contoh**:
  - "Energi Tinggi" (target: 4, unit: energy_level)
  - "Energi Sangat Tinggi" (target: 5, unit: energy_level)

## 🔧 **Implementasi Database**

### 1. **Update Missions Table Structure**

```sql
-- Add sub_category column to missions table
ALTER TABLE missions 
ADD COLUMN sub_category VARCHAR(50) COMMENT 'Sub-kategori misi untuk mapping data tracking yang lebih spesifik';

-- Add tracking_mapping column for JSON configuration
ALTER TABLE missions 
ADD COLUMN tracking_mapping JSON COMMENT 'Mapping konfigurasi untuk data tracking yang digunakan';

-- Update existing missions with sub-categories
UPDATE missions SET sub_category = 'STEPS' WHERE category = 'fitness' AND unit IN ('steps', 'langkah');
UPDATE missions SET sub_category = 'DURATION' WHERE category = 'fitness' AND unit IN ('minutes', 'menit');
UPDATE missions SET sub_category = 'DISTANCE' WHERE category = 'fitness' AND unit IN ('km', 'kilometer');
UPDATE missions SET sub_category = 'CALORIES' WHERE category = 'fitness' AND unit IN ('calories', 'kalori');

UPDATE missions SET sub_category = 'WATER_INTAKE' WHERE category = 'health_tracking' AND unit IN ('ml', 'liter');
UPDATE missions SET sub_category = 'SLEEP_DURATION' WHERE category = 'health_tracking' AND unit IN ('hours', 'jam', 'minutes', 'menit');
UPDATE missions SET sub_category = 'SLEEP_QUALITY' WHERE category = 'health_tracking' AND unit IN ('quality_score');

UPDATE missions SET sub_category = 'CALORIES_INTAKE' WHERE category = 'nutrition' AND unit IN ('calories', 'kalori');
UPDATE missions SET sub_category = 'MEAL_COUNT' WHERE category = 'nutrition' AND unit IN ('meals', 'makanan');
UPDATE missions SET sub_category = 'PROTEIN_INTAKE' WHERE category = 'nutrition' AND unit IN ('grams', 'gram');

UPDATE missions SET sub_category = 'MOOD_SCORE' WHERE category = 'mental_health' AND unit IN ('mood_score');
UPDATE missions SET sub_category = 'STRESS_LEVEL' WHERE category = 'mental_health' AND unit IN ('stress_level');
UPDATE missions SET sub_category = 'ENERGY_LEVEL' WHERE category = 'mental_health' AND unit IN ('energy_level');
```

### 2. **Tracking Mapping Configuration**

```sql
-- Update missions with tracking mapping configuration
UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'fitness_tracking',
  'column', 'steps',
  'aggregation', 'SUM',
  'date_column', 'tracking_date'
) WHERE sub_category = 'STEPS';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'fitness_tracking',
  'column', 'exercise_minutes',
  'aggregation', 'SUM',
  'date_column', 'tracking_date'
) WHERE sub_category = 'DURATION';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'fitness_tracking',
  'column', 'distance_km',
  'aggregation', 'SUM',
  'date_column', 'tracking_date'
) WHERE sub_category = 'DISTANCE';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'fitness_tracking',
  'column', 'calories_burned',
  'aggregation', 'SUM',
  'date_column', 'tracking_date'
) WHERE sub_category = 'CALORIES';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'water_tracking',
  'column', 'amount_ml',
  'aggregation', 'SUM',
  'date_column', 'tracking_date'
) WHERE sub_category = 'WATER_INTAKE';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'sleep_tracking',
  'column', 'sleep_duration_hours',
  'aggregation', 'AVG',
  'date_column', 'sleep_date'
) WHERE sub_category = 'SLEEP_DURATION';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'meal_logging',
  'column', 'calories',
  'aggregation', 'SUM',
  'date_column', 'recorded_at'
) WHERE sub_category = 'CALORIES_INTAKE';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'meal_logging',
  'column', 'meal_type',
  'aggregation', 'COUNT_DISTINCT',
  'date_column', 'recorded_at'
) WHERE sub_category = 'MEAL_COUNT';

UPDATE missions SET tracking_mapping = JSON_OBJECT(
  'table', 'mood_tracking',
  'column', 'mood_score',
  'aggregation', 'AVG',
  'date_column', 'tracking_date'
) WHERE sub_category = 'MOOD_SCORE';
```

## 🚀 **Implementasi Backend API**

### 1. **Enhanced Auto-Update Missions Service**

```javascript
// dash-app/app/api/mobile/tracking/auto-update-missions/route.js

export async function POST(request) {
  try {
    const { tracking_type, current_value, date, unit } = await request.json();
    
    // Get user from token
    const userPayload = await getUserFromToken(request);
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

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

### 2. **Enhanced Mission Progress Calculation**

```javascript
// dash-app/lib/missionProgressCalculator.js

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

## 📱 **Implementasi Frontend**

### 1. **Enhanced Mission Service**

```typescript
// src/services/MissionService.ts

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

```typescript
// src/screens/MissionScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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

## 🧪 **Testing & Validation**

### 1. **Unit Testing**

```javascript
// tests/missionSubCategory.test.js

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

```javascript
// tests/missionIntegration.test.js

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

## 📈 **Benefits of Sub-Category System**

### 1. **Accuracy**
- Setiap misi mengambil data tracking yang tepat
- Tidak ada konflik antara misi yang berbeda dalam kategori yang sama
- Progress calculation yang akurat

### 2. **Scalability**
- Mudah menambah sub-kategori baru
- Konfigurasi tracking mapping yang fleksibel
- Support untuk berbagai jenis aggregasi data

### 3. **User Experience**
- Misi yang lebih relevan dan personal
- Progress tracking yang real-time
- Feedback yang lebih akurat

### 4. **Maintainability**
- Kode yang lebih terorganisir
- Konfigurasi yang terpusat
- Testing yang lebih mudah

## 🚀 **Next Steps**

1. **Implementasi Database Changes**
2. **Update Backend API**
3. **Update Frontend Components**
4. **Testing & Validation**
5. **Deployment & Monitoring**

Dengan implementasi ini, sistem misi akan menjadi lebih akurat dan setiap sub-kategori akan mengambil data tracking yang tepat sesuai dengan kebutuhan misi tersebut.
