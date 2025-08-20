# 🍽️ Quantity Feature for Selected Foods - Implementation Summary

## 🎯 Objective
Menambahkan fitur quantity pada card selected foods, dimana apabila user memilih foods yang sama hanya menambah quantity saja bukan muncul card baru.

## ✅ Implementasi yang Telah Dilakukan

### 1. **Update Interface FoodItem**
```typescript
interface FoodItem {
  // ... existing fields
  quantity?: number; // Add quantity field
}
```

### 2. **Modifikasi Fungsi addFoodToMeal**
- **Sebelum**: Selalu menambah food baru ke array
- **Sesudah**: Mengecek apakah food sudah ada
  - Jika sudah ada: menambah quantity +1
  - Jika belum ada: menambah food baru dengan quantity 1

```typescript
const addFoodToMeal = (food: FoodItem) => {
  setSelectedFoods(prev => {
    const existingFoodIndex = prev.findIndex(item => item.id === food.id);
    
    if (existingFoodIndex !== -1) {
      // If food exists, increase quantity
      const updatedFoods = [...prev];
      const existingFood = updatedFoods[existingFoodIndex];
      updatedFoods[existingFoodIndex] = {
        ...existingFood,
        quantity: (existingFood.quantity || 1) + 1
      };
      return updatedFoods;
    } else {
      // If food doesn't exist, add it with quantity 1
      return [...prev, { ...food, quantity: 1 }];
    }
  });
};
```

### 3. **Modifikasi Fungsi addQuickFoodToMeal**
- Menerapkan logika yang sama untuk quick foods
- Mengecek duplikasi dan menambah quantity jika sudah ada

### 4. **Fungsi Baru untuk Quantity Management**
```typescript
// Increase food quantity
const increaseQuantity = (index: number) => {
  setSelectedFoods(prev => {
    const updatedFoods = [...prev];
    const food = updatedFoods[index];
    updatedFoods[index] = {
      ...food,
      quantity: (food.quantity || 1) + 1
    };
    return updatedFoods;
  });
};

// Decrease food quantity
const decreaseQuantity = (index: number) => {
  setSelectedFoods(prev => {
    const updatedFoods = [...prev];
    const food = updatedFoods[index];
    const currentQuantity = food.quantity || 1;
    
    if (currentQuantity <= 1) {
      // If quantity is 1 or less, remove the food
      return prev.filter((_, i) => i !== index);
    } else {
      // Decrease quantity
      updatedFoods[index] = {
        ...food,
        quantity: currentQuantity - 1
      };
      return updatedFoods;
    }
  });
};
```

### 5. **Update Tampilan Selected Foods**
- **Sebelum**: Hanya menampilkan nama food dan tombol remove
- **Sesudah**: Menampilkan quantity dengan tombol +/- untuk mengubah quantity

```tsx
{selectedFoods.map((food, index) => (
  <View key={index} style={styles.selectedFoodCard}>
    <View style={styles.selectedFoodInfo}>
      <Text style={styles.selectedFoodName}>{food.name}</Text>
      <Text style={styles.selectedFoodCalories}>
        {food.calories_per_100g} cal/100g • {food.category}
      </Text>
    </View>
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        style={styles.quantityButton}
        onPress={() => decreaseQuantity(index)}
      >
        <Icon name="minus" size={16} color="#6B7280" />
      </TouchableOpacity>
      <Text style={styles.quantityText}>{food.quantity || 1}</Text>
      <TouchableOpacity
        style={styles.quantityButton}
        onPress={() => increaseQuantity(index)}
      >
        <Icon name="plus" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  </View>
))}
```

### 6. **Styles Baru untuk Quantity UI**
```typescript
quantityContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
},
quantityButton: {
  padding: 6,
  borderRadius: 8,
  backgroundColor: "#FFFFFF",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},
quantityText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1F2937",
  marginHorizontal: 12,
  minWidth: 20,
  textAlign: "center",
},
```

### 7. **Update Perhitungan Nutrisi**
- Semua perhitungan nutrisi (calories, protein, carbs, fat, dll) sekarang menggunakan `food.quantity`
- Jika quantity tidak ada, default ke 1

```typescript
const totalCalories = selectedFoods.reduce((sum, food) => {
  const servingSize = food.serving_weight || 100;
  const quantity = food.quantity || 1; // Use food.quantity or default to 1
  
  let actualCalories;
  if (food.serving_weight === 100) {
    // For quick foods, values are already actual values
    actualCalories = Math.round((food.calories_per_100g || 0) * quantity);
  } else {
    // For regular foods, calculate based on serving size
    const actualWeight = (servingSize * quantity) / 100;
    actualCalories = Math.round((food.calories_per_100g || 0) * actualWeight);
  }
  
  return sum + actualCalories;
}, 0);
```

## 🎉 Fitur yang Tersedia

### 1. **Auto Quantity Management**
- Ketika user memilih food yang sama, quantity otomatis bertambah
- Tidak ada card duplikat untuk food yang sama

### 2. **Manual Quantity Control**
- Tombol **+** untuk menambah quantity
- Tombol **-** untuk mengurangi quantity
- Jika quantity = 1 dan user tekan **-**, food akan dihapus

### 3. **Visual Feedback**
- Quantity ditampilkan dengan jelas di antara tombol + dan -
- UI yang clean dan mudah digunakan

### 4. **Accurate Nutrition Calculation**
- Semua perhitungan nutrisi memperhitungkan quantity
- Total calories, protein, carbs, fat akurat sesuai quantity

## 📱 User Experience

### **Sebelum:**
- User pilih "Apple" → Card Apple muncul
- User pilih "Apple" lagi → Card Apple kedua muncul
- Total: 2 card Apple

### **Sesudah:**
- User pilih "Apple" → Card Apple muncul dengan quantity 1
- User pilih "Apple" lagi → Card Apple quantity menjadi 2
- Total: 1 card Apple dengan quantity 2

## 🚀 Status Implementasi

**✅ Fitur quantity untuk selected foods telah berhasil diimplementasikan!**

- ✅ Interface FoodItem diupdate dengan quantity field
- ✅ Fungsi addFoodToMeal dimodifikasi untuk handle duplikasi
- ✅ Fungsi addQuickFoodToMeal dimodifikasi untuk handle duplikasi
- ✅ Fungsi increaseQuantity dan decreaseQuantity ditambahkan
- ✅ UI selected foods diupdate dengan quantity controls
- ✅ Styles untuk quantity UI ditambahkan
- ✅ Perhitungan nutrisi diupdate untuk menggunakan quantity
- ✅ User experience yang lebih baik dengan auto-merge food yang sama

**🎯 Tujuan tercapai: User sekarang bisa menambah quantity pada selected foods dan food yang sama akan otomatis digabung!**
