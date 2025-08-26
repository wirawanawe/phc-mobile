/**
 * Manual App Reset Script
 * Run this in browser console or React Native debugger to force reset the app
 */

console.log('🔄 MANUAL APP RESET');
console.log('==================\n');

// Function to force daily reset
const forceDailyReset = () => {
  console.log('📅 Forcing daily reset...');
  
  // Clear AsyncStorage
  const clearAsyncStorage = async () => {
    try {
      const keys = [
        'lastCheckedDate',
        'todayMealData',
        'todaySummaryData',
        'todayNutritionData',
        'todayWaterIntake',
        'todayFitnessData',
        'todaySleepData',
        'todayMoodData',
        'mealHistory',
        'nutritionData',
        'recentMeals',
        'dailyNutrition',
        'forceZeroCalories',
        'mealResetFlag',
        'dailyResetTriggered'
      ];
      
      for (const key of keys) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`   ✅ Cleared: ${key}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to clear: ${key}`);
        }
      }
      
      console.log('✅ AsyncStorage cleared');
    } catch (error) {
      console.error('❌ Error clearing AsyncStorage:', error);
    }
  };
  
  // Emit reset events
  const emitResetEvents = () => {
    console.log('📡 Emitting reset events...');
    
    if (typeof eventEmitter !== 'undefined') {
      eventEmitter.emit('dailyReset');
      eventEmitter.emit('mealReset');
      eventEmitter.emit('waterReset');
      eventEmitter.emit('fitnessReset');
      eventEmitter.emit('sleepReset');
      eventEmitter.emit('moodReset');
      eventEmitter.emit('dataRefresh');
      console.log('✅ Reset events emitted');
    } else {
      console.log('⚠️  eventEmitter not available');
    }
  };
  
  // Force component refresh
  const forceComponentRefresh = () => {
    console.log('🔄 Forcing component refresh...');
    
    // Force reload the page/app
    if (typeof window !== 'undefined') {
      window.location.reload();
      console.log('✅ Page reloaded');
    } else {
      console.log('⚠️  Cannot reload - not in browser environment');
    }
  };
  
  // Execute reset
  clearAsyncStorage().then(() => {
    emitResetEvents();
    setTimeout(() => {
      forceComponentRefresh();
    }, 1000);
  });
};

// Function to check current state
const checkCurrentState = () => {
  console.log('🔍 Checking current state...');
  
  const now = new Date();
  console.log(`   Current date: ${now.toDateString()}`);
  console.log(`   Current time: ${now.toLocaleTimeString()}`);
  console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Check if we're in React Native environment
  if (typeof global !== 'undefined' && global.AsyncStorage) {
    console.log('   Environment: React Native');
  } else if (typeof window !== 'undefined') {
    console.log('   Environment: Browser');
  } else {
    console.log('   Environment: Unknown');
  }
};

// Function to simulate date change
const simulateDateChange = () => {
  console.log('📅 Simulating date change...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log(`   Yesterday: ${yesterday.toDateString()}`);
  console.log(`   Today: ${new Date().toDateString()}`);
  console.log(`   Date changed: ${yesterday.toDateString() !== new Date().toDateString() ? 'YES' : 'NO'}`);
};

// Function to clear all app data
const clearAllAppData = () => {
  console.log('🧹 Clearing all app data...');
  
  if (typeof AsyncStorage !== 'undefined') {
    AsyncStorage.clear().then(() => {
      console.log('✅ All app data cleared');
    }).catch((error) => {
      console.error('❌ Error clearing app data:', error);
    });
  } else {
    console.log('⚠️  AsyncStorage not available');
  }
};

// Function to force meal data reset
const forceMealDataReset = () => {
  console.log('🍽️  Forcing meal data reset...');
  
  // Clear meal-specific cache
  const mealKeys = [
    'todayMealData',
    'mealHistory',
    'nutritionData',
    'recentMeals',
    'dailyNutrition',
    'selectedFoods',
    'quickFoods'
  ];
  
  mealKeys.forEach(key => {
    try {
      if (typeof AsyncStorage !== 'undefined') {
        AsyncStorage.removeItem(key);
        console.log(`   ✅ Cleared: ${key}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Failed to clear: ${key}`);
    }
  });
  
  console.log('✅ Meal data reset');
};

// Main execution function
const executeManualReset = () => {
  console.log('🎯 EXECUTING MANUAL APP RESET');
  console.log('=============================\n');
  
  checkCurrentState();
  simulateDateChange();
  forceMealDataReset();
  forceDailyReset();
  
  console.log('\n✅ MANUAL RESET COMPLETED');
  console.log('========================');
  console.log('📱 Next steps:');
  console.log('   1. Wait for app to reload');
  console.log('   2. Check Today\'s Summary - should show 0 calories');
  console.log('   3. Check Meal Logging screen - should be empty');
  console.log('   4. Verify no old data appears');
  console.log('   5. Test logging new data');
};

// Export functions for manual use
window.manualAppReset = {
  forceDailyReset,
  checkCurrentState,
  simulateDateChange,
  clearAllAppData,
  forceMealDataReset,
  executeManualReset
};

// Auto-execute if in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected');
  console.log('💡 Run manualAppReset.executeManualReset() to reset the app');
} else {
  console.log('📱 React Native environment detected');
  console.log('💡 Import and run executeManualReset() to reset the app');
}

// Execute if called directly
if (typeof require !== 'undefined' && require.main === module) {
  executeManualReset();
}
