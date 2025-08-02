# 🔧 Consultation Booking Screen Simplification

## 🎯 Objective
Menyederhanakan halaman booking konsultasi agar hanya menampilkan:
1. **Informasi dokter** (yang sudah dipilih dari halaman detail)
2. **Pilihan jenis konsultasi** (chat, video call, telepon)
3. **Input keluhan**
4. **Ringkasan booking**

## ✅ Changes Made

### 1. Removed Unnecessary Components
- ❌ **Doctor selection** - dokter sudah dipilih dari halaman detail
- ❌ **Date selection** - tanggal otomatis hari ini
- ❌ **Time selection** - waktu sudah dipilih dari halaman detail
- ❌ **Loading states** - tidak perlu loading karena data sudah tersedia

### 2. Simplified State Management
```javascript
// Before
const [doctors, setDoctors] = useState<Doctor[]>([]);
const [loadingDoctors, setLoadingDoctors] = useState(true);
// ... many other states

// After
const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
const [consultationType, setConsultationType] = useState<'chat' | 'video_call' | 'phone'>('chat');
const [selectedDate, setSelectedDate] = useState<string>('');
const [selectedTime, setSelectedTime] = useState<string>('');
const [complaint, setComplaint] = useState<string>('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 3. Removed Unused Functions
- ❌ `fetchDoctors()` - tidak perlu fetch dokter
- ❌ `generateDateTimeSlots()` - tidak perlu generate slot
- ❌ `getAvailableDates()` - tidak perlu pilih tanggal
- ❌ `getAvailableTimes()` - tidak perlu pilih waktu
- ❌ `renderDateTimeSelection()` - tidak perlu render pilihan tanggal/waktu

### 4. Simplified Validation
```javascript
// Before
if (!selectedDoctor) {
  Alert.alert('Error', 'Please select a doctor');
  return;
}
if (!selectedDate || !selectedTime) {
  Alert.alert('Error', 'Please select date and time');
  return;
}

// After
if (!selectedDoctor) {
  Alert.alert('Error', 'Data dokter tidak ditemukan');
  return;
}
if (!complaint.trim()) {
  Alert.alert('Error', 'Mohon isi keluhan Anda');
  return;
}
```

### 5. Updated UI Flow
```javascript
// Before: Complex flow with multiple selections
1. Select doctor from list
2. Select consultation type
3. Select date from calendar
4. Select time from available slots
5. Enter complaint
6. Review and book

// After: Simplified flow
1. View selected doctor info (read-only)
2. Select consultation type
3. Enter complaint
4. Review and book
```

## 📱 Current Screen Layout

### Header
- Back button
- "Book Konsultasi" title

### Content (ScrollView)
1. **Doctor Info Section**
   - Doctor card with name, specialization, rating
   - Read-only information

2. **Consultation Types Section**
   - Chat, Video Call, Phone options
   - User can select one type

3. **Complaint Input Section**
   - Text area for complaint description
   - Required field

4. **Summary Card**
   - Doctor name
   - Date (today)
   - Time (from doctor detail)
   - Consultation type
   - Price

### Footer
- "Book Konsultasi" button

## 🔄 Data Flow

### From Doctor Detail Page
```javascript
navigation.navigate('ConsultationBooking', {
  doctor: doctorData,
  selectedTimeSlot: selectedTime, // e.g., "17:00"
});
```

### In Consultation Booking Screen
```javascript
useEffect(() => {
  if (route.params?.doctor) {
    setSelectedDoctor(route.params.doctor);
    if (route.params.selectedTimeSlot) {
      setSelectedTime(route.params.selectedTimeSlot);
    }
    // Set today's date
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }
}, [route.params?.doctor, route.params?.selectedTimeSlot]);
```

### To Backend API
```javascript
const response = await apiService.bookConsultation({
  doctor_id: selectedDoctor.id,
  consultation_type: consultationType,
  scheduled_date: selectedDate, // Today
  scheduled_time: selectedTime, // From doctor detail
  complaint: complaint.trim(),
});
```

## 🎯 Benefits

1. **Simplified UX** - User hanya perlu pilih jenis konsultasi dan isi keluhan
2. **Reduced Complexity** - Menghilangkan pilihan yang tidak perlu
3. **Faster Booking** - Proses booking lebih cepat
4. **Better UX** - Flow yang lebih natural dari detail dokter ke booking
5. **Less Error Prone** - Mengurangi kemungkinan error dalam pemilihan

## 📋 Testing Checklist

- [ ] Navigate from doctor detail page
- [ ] Verify doctor info is displayed correctly
- [ ] Test consultation type selection
- [ ] Test complaint input validation
- [ ] Verify summary shows correct information
- [ ] Test booking process
- [ ] Verify date is set to today
- [ ] Verify time is from doctor detail selection 