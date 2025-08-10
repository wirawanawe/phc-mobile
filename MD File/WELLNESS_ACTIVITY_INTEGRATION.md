# Wellness Activity Integration di Activity Screen

## Overview

Fitur ini menambahkan kemampuan untuk input aktivitas wellness langsung dari tab Activity di MainScreen. Ketika aktivitas wellness diselesaikan, nilai activity wellness akan bertambah secara otomatis.

## Fitur Baru

### 1. Tab Selector di Activity Screen
- **Fitness Tab**: Untuk input aktivitas fitness (existing)
- **Wellness Tab**: Untuk input aktivitas wellness (new)

### 2. Wellness Activities List
- Menampilkan daftar aktivitas wellness yang tersedia
- Setiap aktivitas menampilkan:
  - Judul aktivitas
  - Deskripsi
  - Durasi (menit)
  - Poin yang didapat
  - Level kesulitan

### 3. Wellness Activity Completion
- User dapat memilih aktivitas wellness
- Input durasi aktivitas
- Tambahkan catatan (opsional)
- Submit untuk menyelesaikan aktivitas

## Implementasi Teknis

### Frontend Changes

#### ActivityScreen.tsx
```typescript
// New state variables
const [activeTab, setActiveTab] = useState<'fitness' | 'wellness'>('fitness');
const [wellnessActivities, setWellnessActivities] = useState<WellnessActivity[]>([]);
const [selectedWellnessActivity, setSelectedWellnessActivity] = useState<WellnessActivity | null>(null);
const [wellnessDuration, setWellnessDuration] = useState('');
const [wellnessNotes, setWellnessNotes] = useState('');

// New functions
const loadWellnessActivities = async () => {
  const response = await api.getWellnessActivities();
  if (response.success) {
    setWellnessActivities(response.data || []);
  }
};

const handleWellnessSubmit = async () => {
  const wellnessData = {
    user_id: await api.getUserId(),
    activity_id: selectedWellnessActivity.id,
    duration_minutes: parseFloat(wellnessDuration),
    notes: wellnessNotes,
    completed_at: new Date().toISOString(),
  };

  const response = await api.completeWellnessActivity(wellnessData);
  // Handle success/error
};
```

### Backend Integration

#### API Endpoints
- `GET /api/mobile/wellness/activities` - Daftar aktivitas wellness
- `POST /api/mobile/wellness/activities/complete` - Selesaikan aktivitas wellness
- `GET /api/mobile/wellness/data` - Data wellness user
- `GET /api/mobile/wellness/stats` - Statistik wellness

#### Database Schema
```sql
-- Wellness activities table
wellness_activities: id, title, description, category, duration_minutes, difficulty, points, is_active

-- User wellness activities tracking
user_wellness_activities: user_id, activity_id, completed_at, duration_minutes, points_earned, notes
```

## Flow Aktivitas Wellness

### 1. User membuka Activity Screen
- Tab Fitness (default)
- Tab Wellness (new)

### 2. User memilih tab Wellness
- Load daftar aktivitas wellness dari API
- Tampilkan dalam format card yang menarik

### 3. User memilih aktivitas wellness
- Pilih dari daftar aktivitas
- Auto-fill durasi default
- User dapat edit durasi

### 4. User submit aktivitas
- Validasi input
- Kirim ke API `/wellness/activities/complete`
- Update wellness statistics

### 5. Feedback ke user
- Alert success dengan poin yang didapat
- Reset form untuk aktivitas berikutnya

## Wellness Statistics

Ketika aktivitas wellness diselesaikan, nilai berikut akan bertambah:

### Total Activities Completed
```javascript
wellnessStats.total_activities_completed += 1;
```

### Total Points Earned
```javascript
wellnessStats.total_points_earned += activity.points;
```

### Total Duration Minutes
```javascript
wellnessStats.total_duration_minutes += activity.duration_minutes;
```

### Category Breakdown
```javascript
wellnessStats.category_breakdown[activity.category].count++;
wellnessStats.category_breakdown[activity.category].points += activity.points;
wellnessStats.category_breakdown[activity.category].duration += activity.duration_minutes;
```

## UI/UX Features

### Tab Design
- Modern tab selector dengan gradient
- Icon untuk setiap tab (dumbbell untuk fitness, heart-pulse untuk wellness)
- Active state dengan warna berbeda

### Activity Cards
- Clean card design dengan shadow
- Icon untuk setiap aktivitas
- Informasi lengkap (durasi, poin, kesulitan)
- Touch feedback

### Form Validation
- Required fields validation
- Duration validation (harus > 0)
- User-friendly error messages

### Loading States
- Loading indicator saat fetch data
- Disabled state saat submit
- Progress feedback

## Testing

### Manual Testing
1. Buka Activity Screen
2. Switch ke tab Wellness
3. Pilih aktivitas wellness
4. Input durasi
5. Submit aktivitas
6. Verifikasi poin bertambah

### Automated Testing
```bash
# Run wellness activity test
node scripts/test-wellness-activity.js
```

## Error Handling

### Network Errors
- Retry mechanism
- Fallback to cached data
- User-friendly error messages

### Validation Errors
- Client-side validation
- Server-side validation
- Clear error messages

### Duplicate Prevention
- Check if activity already completed today
- Prevent duplicate submissions
- Inform user if already completed

## Performance Considerations

### Data Loading
- Lazy loading wellness activities
- Cache activities data
- Optimize API calls

### UI Performance
- FlatList untuk large datasets
- Optimized re-renders
- Memory management

## Future Enhancements

### Planned Features
1. **Wellness Challenges**: Multi-day challenges
2. **Progress Tracking**: Visual progress indicators
3. **Achievements**: Badges and rewards
4. **Social Features**: Share achievements
5. **Personalization**: Custom wellness goals

### Technical Improvements
1. **Offline Support**: Cache activities locally
2. **Push Notifications**: Reminder for wellness activities
3. **Analytics**: Track user engagement
4. **A/B Testing**: Optimize UI/UX

## Dependencies

### Frontend
- React Native
- Expo Linear Gradient
- React Native Vector Icons
- React Native Paper

### Backend
- Next.js API Routes
- MySQL Database
- JWT Authentication

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/phc_dashboard

# JWT
JWT_SECRET=your-secret-key

# API
API_BASE_URL=http://localhost:3000/api/mobile
```

### API Configuration
```javascript
// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/mobile';

// Wellness activities endpoint
const WELLNESS_ACTIVITIES_ENDPOINT = '/wellness/activities';
const WELLNESS_COMPLETE_ENDPOINT = '/wellness/activities/complete';
```

## Troubleshooting

### Common Issues

#### 1. Activities not loading
- Check API endpoint
- Verify database connection
- Check authentication

#### 2. Activity completion fails
- Validate user authentication
- Check activity exists
- Verify duplicate prevention

#### 3. Statistics not updating
- Check database triggers
- Verify calculation logic
- Test API endpoints

### Debug Commands
```bash
# Test wellness API
curl -X GET http://localhost:3000/api/mobile/wellness/activities

# Test activity completion
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "activity_id": 1, "duration_minutes": 30}'

# Check wellness data
curl -X GET "http://localhost:3000/api/mobile/wellness/data?user_id=1"
```

## Conclusion

Fitur wellness activity integration berhasil menambahkan kemampuan untuk input aktivitas wellness dari Activity Screen. Ketika aktivitas diselesaikan, nilai activity wellness akan bertambah secara otomatis, memberikan user experience yang seamless untuk tracking kesehatan dan kebugaran. 