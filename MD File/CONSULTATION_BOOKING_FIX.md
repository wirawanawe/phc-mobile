# 🔧 Consultation Booking Fix - Time Format Issue

## 🐛 Issue Description

**Error**: `"Valid time format is required (HH:MM)"` when booking consultations

**Root Cause**: The `DetailDoctor.tsx` screen was using `slot.id` instead of `slot.time` for time selection, causing invalid time formats like `"5"` instead of `"17:00"`.

## ✅ Fixes Applied

### 1. Fixed Time Selection in DetailDoctor.tsx

**Before**:
```javascript
onPress={() => setSelectedTimeSlot(slot.id)}  // Was using "5", "1", etc.
```

**After**:
```javascript
onPress={() => setSelectedTimeSlot(slot.time)}  // Now uses "17:00", "09:00", etc.
```

### 2. Added Time Format Validation

Added validation in `DetailDoctor.tsx` to ensure proper time format before navigation:

```javascript
// Validate time format (should be HH:MM)
if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(selectedTimeSlot)) {
  Alert.alert(
    "Format Waktu Salah",
    "Format waktu harus dalam bentuk HH:MM (contoh: 17:00)",
    [{ text: "OK" }]
  );
  return;
}
```

### 3. Enhanced Debugging

Added debug logging in `ConsultationBookingScreen.tsx` to track booking data:

```javascript
console.log('🔍 Booking consultation with data:', {
  doctor_id: selectedDoctor.id,
  consultation_type: consultationType,
  scheduled_date: selectedDate,
  scheduled_time: selectedTime,
  complaint: complaint.trim(),
});
```

## 🧪 Test Cases

Created `scripts/test-time-format.js` to verify time format validation:

- ✅ Valid times: `"09:00"`, `"17:00"`, `"23:59"`, `"00:00"`
- ❌ Invalid times: `"5"`, `"17"`, `"17:5"`, `"25:00"`, `"17:60"`

## 🔍 How to Test

1. **Navigate to a doctor detail page**
2. **Select a time slot** (should now show proper time format)
3. **Click "Book Konsultasi"**
4. **Verify the time format** in the consultation booking screen
5. **Complete the booking process**

## 📋 Expected Behavior

### Before Fix:
- Time slots showed correct labels (`"17:00 WIB"`)
- But selected `slot.id` (`"5"`) instead of `slot.time` (`"17:00"`)
- Backend validation failed with "Valid time format is required (HH:MM)"

### After Fix:
- Time slots show correct labels (`"17:00 WIB"`)
- Selects `slot.time` (`"17:00"`) correctly
- Backend validation passes
- Consultation booking succeeds

## 🛠️ Files Modified

1. **`src/screens/DetailDoctor.tsx`**
   - Fixed time slot selection logic
   - Added time format validation
   - Updated UI state management

2. **`src/screens/ConsultationBookingScreen.tsx`**
   - Added debug logging for booking data

3. **`scripts/test-time-format.js`** (new)
   - Created test script for time format validation

## 🔄 Related Components

- **DetailDoctor.tsx** - Doctor detail page with time slot selection
- **ConsultationBookingScreen.tsx** - Consultation booking form
- **Backend validation** - `/api/consultations/book` endpoint

## 📞 Support

If you encounter similar issues:

1. **Check console logs** for the booking data format
2. **Verify time format** matches `HH:MM` pattern
3. **Test with different time slots** to ensure consistency
4. **Check backend validation** in `backend/routes/consultations.js`

## 🎯 Prevention

To prevent similar issues:

1. **Always use semantic field names** (`time` instead of `id` for time values)
2. **Add client-side validation** before API calls
3. **Include debug logging** for critical data transformations
4. **Test edge cases** with various input formats 