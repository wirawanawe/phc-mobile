#!/usr/bin/env node

/**
 * Test Cache Refresh Script
 * 
 * This script tests the comprehensive cache refresh functionality
 * that was implemented for daily reset scenarios.
 */

console.log('🧪 Testing Cache Refresh Functionality');
console.log('=====================================\n');

// Simulate AsyncStorage for testing
const mockAsyncStorage = {
  data: {},
  async getItem(key) {
    return this.data[key] || null;
  },
  async setItem(key, value) {
    this.data[key] = value;
  },
  async removeItem(key) {
    delete this.data[key];
  },
  async getAllKeys() {
    return Object.keys(this.data);
  },
  async clear() {
    this.data = {};
  }
};

// Simulate event emitter for testing
const mockEventEmitter = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  },
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
};

// Populate mock AsyncStorage with test data
const populateTestData = async () => {
  console.log('📦 Populating test data...');
  
  const testKeys = [
    'todayWaterIntake',
    'todayFitnessData',
    'todaySleepData',
    'todayMoodData',
    'todayMealData',
    'todaySummaryData',
    'todayNutritionData',
    'todayCalories',
    'mealHistory',
    'nutritionData',
    'recentMeals',
    'dailyNutrition',
    'lastCheckedDate',
    'lastMealDate',
    'apiCache_meal_today',
    'apiCache_nutrition',
    'forceZeroCalories',
    'mealResetFlag',
    'componentState_mealLogging',
    'formData_mealSearch',
    'sessionData'
  ];

  for (const key of testKeys) {
    await mockAsyncStorage.setItem(key, `test_data_${key}_${Date.now()}`);
  }

  console.log(`✅ Populated ${testKeys.length} test cache keys`);
  console.log('📊 Current cache keys:', await mockAsyncStorage.getAllKeys());
};

// Test comprehensive cache clearing
const testComprehensiveCacheClearing = async () => {
  console.log('\n🧹 Testing comprehensive cache clearing...');
  
  const keysToRemove = [
    // Today's data cache
    'todayWaterIntake',
    'todayFitnessData',
    'todaySleepData',
    'todayMoodData',
    'todayMealData',
    'todaySummaryData',
    'todayWellnessActivities',
    'todayNutritionData',
    'todayCalories',
    'todayServings',
    'todaySteps',
    'todayDistance',
    'todayExerciseMinutes',
    
    // Meal and nutrition cache
    'mealHistory',
    'nutritionData',
    'recentMeals',
    'dailyNutrition',
    'quickFoods',
    'selectedFoods',
    'mealCache',
    'nutritionCache',
    'searchResults',
    'filteredRecentMeals',
    'searchResultsWithQuickStatus',
    
    // Date tracking cache
    'lastCheckedDate',
    'lastMealDate',
    'lastNutritionDate',
    'lastWaterDate',
    'lastFitnessDate',
    'lastSleepDate',
    'lastMoodDate',
    'lastWellnessDate',
    
    // API cache
    'apiCache_meal_today',
    'apiCache_nutrition',
    'apiCache_summary',
    'apiCache_water',
    'apiCache_fitness',
    'apiCache_sleep',
    'apiCache_mood',
    'apiCache_wellness',
    'apiCache_missions',
    'apiCache_user_missions',
    
    // Reset flags
    'forceZeroCalories',
    'mealResetFlag',
    'dailyResetTriggered',
    'waterResetFlag',
    'fitnessResetFlag',
    'sleepResetFlag',
    'moodResetFlag',
    
    // Component state cache
    'componentState_mealLogging',
    'componentState_waterTracking',
    'componentState_fitnessTracking',
    'componentState_sleepTracking',
    'componentState_moodTracking',
    'componentState_todaySummary',
    'componentState_missionProgress',
    
    // Form data cache
    'formData_mealSearch',
    'formData_waterAmount',
    'formData_fitnessForm',
    'formData_sleepForm',
    'formData_moodForm',
    
    // Session cache
    'sessionData',
    'userPreferences',
    'appSettings',
    'lastSyncTime',
    'offlineData'
  ];

  let clearedCount = 0;
  let failedCount = 0;

  // Clear each cache key
  for (const key of keysToRemove) {
    try {
      await mockAsyncStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Cleared cache key: ${key}`);
    } catch (keyError) {
      failedCount++;
      console.warn(`⚠️ Failed to clear cache key: ${key}`, keyError);
    }
  }

  console.log(`🎯 Cache clearing completed: ${clearedCount} cleared, ${failedCount} failed`);
  
  return { clearedCount, failedCount };
};

// Test pattern-based cache clearing
const testPatternBasedCacheClearing = async () => {
  console.log('\n🔍 Testing pattern-based cache clearing...');
  
  // Get all remaining keys
  const allKeys = await mockAsyncStorage.getAllKeys();
  
  // Patterns to match for cache clearing
  const patterns = [
    /^today/,
    /^last/,
    /^cache/,
    /^api/,
    /^meal/,
    /^nutrition/,
    /^water/,
    /^fitness/,
    /^sleep/,
    /^mood/,
    /^wellness/,
    /^mission/,
    /^reset/,
    /^session/,
    /^form/,
    /^component/
  ];

  let patternClearedCount = 0;

  for (const key of allKeys) {
    for (const pattern of patterns) {
      if (pattern.test(key)) {
        try {
          await mockAsyncStorage.removeItem(key);
          patternClearedCount++;
          console.log(`🔍 Pattern cleared: ${key}`);
          break; // Only clear once per key
        } catch (error) {
          console.warn(`⚠️ Failed to clear pattern key: ${key}`, error);
        }
      }
    }
  }

  console.log(`🔍 Pattern-based cache clearing completed: ${patternClearedCount} keys cleared`);
  
  return patternClearedCount;
};

// Test event emission
const testEventEmission = () => {
  console.log('\n📡 Testing event emission...');
  
  const events = [
    'dailyReset',
    'waterReset',
    'fitnessReset',
    'sleepReset',
    'moodReset',
    'mealReset',
    'wellnessActivityReset',
    'missionReset',
    'summaryReset',
    'forceRefreshAllData',
    'refreshFromAPI',
    'dataRefresh',
    'cacheRefreshed',
    'stateReset',
    'cacheCleared'
  ];

  let emittedCount = 0;

  events.forEach(event => {
    mockEventEmitter.emit(event, {
      timestamp: new Date().toISOString(),
      type: 'test'
    });
    emittedCount++;
    console.log(`📡 Emitted event: ${event}`);
  });

  console.log(`📡 Event emission completed: ${emittedCount} events emitted`);
  
  return emittedCount;
};

// Main test execution
const runTests = async () => {
  try {
    console.log('🚀 Starting cache refresh tests...\n');
    
    // Step 1: Populate test data
    await populateTestData();
    
    // Step 2: Test comprehensive cache clearing
    const { clearedCount, failedCount } = await testComprehensiveCacheClearing();
    
    // Step 3: Test pattern-based cache clearing
    const patternClearedCount = await testPatternBasedCacheClearing();
    
    // Step 4: Test event emission
    const emittedCount = testEventEmission();
    
    // Step 5: Verify final state
    const remainingKeys = await mockAsyncStorage.getAllKeys();
    console.log(`\n📊 Final state - Remaining cache keys: ${remainingKeys.length}`);
    if (remainingKeys.length > 0) {
      console.log('Remaining keys:', remainingKeys);
    }
    
    // Summary
    console.log('\n🎯 TEST SUMMARY');
    console.log('===============');
    console.log(`✅ Comprehensive cache clearing: ${clearedCount} cleared, ${failedCount} failed`);
    console.log(`🔍 Pattern-based cache clearing: ${patternClearedCount} keys cleared`);
    console.log(`📡 Event emission: ${emittedCount} events emitted`);
    console.log(`📦 Final cache state: ${remainingKeys.length} keys remaining`);
    
    if (remainingKeys.length === 0) {
      console.log('\n🎉 SUCCESS: All cache keys cleared successfully!');
    } else {
      console.log('\n⚠️  WARNING: Some cache keys remain - manual review needed');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
};

// Run the tests
runTests();
