import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from './eventEmitter';

class DateChangeDetector {
  private static instance: DateChangeDetector;
  private lastCheckedDate: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DateChangeDetector {
    if (!DateChangeDetector.instance) {
      DateChangeDetector.instance = new DateChangeDetector();
    }
    return DateChangeDetector.instance;
  }

  /**
   * Initialize the date change detector
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load the last checked date from storage
      const storedDate = await AsyncStorage.getItem('lastCheckedDate');
      this.lastCheckedDate = storedDate || new Date().toDateString();

      // Check for date change immediately
      await this.checkForDateChange();

      // Set up periodic checking (every minute)
      this.checkInterval = setInterval(() => {
        this.checkForDateChange();
      }, 60000); // Check every minute

      this.isInitialized = true;
      console.log('DateChangeDetector initialized');
    } catch (error) {
      console.error('Error initializing DateChangeDetector:', error);
    }
  }

  /**
   * Check if the date has changed and trigger reset if necessary
   */
  private async checkForDateChange(): Promise<void> {
    try {
      const currentDate = new Date().toDateString();
      
      if (this.lastCheckedDate && this.lastCheckedDate !== currentDate) {
        console.log('Date change detected:', this.lastCheckedDate, '->', currentDate);
        
        // Update the last checked date
        this.lastCheckedDate = currentDate;
        await AsyncStorage.setItem('lastCheckedDate', currentDate);

        // Trigger daily reset events
        await this.triggerDailyReset();
      }
    } catch (error) {
      console.error('Error checking for date change:', error);
    }
  }

  /**
   * Trigger daily reset for all tracking data
   */
  private async triggerDailyReset(): Promise<void> {
    try {
      console.log('🔄 Triggering comprehensive daily reset for all tracking data...');

      // Step 1: Clear all cached data first
      console.log('📦 Step 1: Clearing all cached data...');
      await this.clearCachedData();

      // Step 2: Emit comprehensive reset events
      console.log('📡 Step 2: Emitting reset events...');
      
      // Main daily reset event
      eventEmitter.emit('dailyReset', {
        timestamp: new Date().toISOString(),
        date: new Date().toDateString(),
        type: 'comprehensive'
      });

      // Specific reset events for each tracking type
      eventEmitter.emit('waterReset');
      eventEmitter.emit('fitnessReset');
      eventEmitter.emit('sleepReset');
      eventEmitter.emit('moodReset');
      eventEmitter.emit('mealReset');
      eventEmitter.emit('wellnessActivityReset');
      eventEmitter.emit('missionReset');
      eventEmitter.emit('summaryReset');

      // Step 3: Force refresh all data
      console.log('🔄 Step 3: Forcing data refresh...');
      eventEmitter.emit('forceRefreshAllData');
      eventEmitter.emit('refreshFromAPI');
      eventEmitter.emit('dataRefresh');

      // Step 4: Emit cache refresh events
      console.log('🧹 Step 4: Emitting cache refresh events...');
      eventEmitter.emit('cacheRefreshed');
      eventEmitter.emit('stateReset');

      console.log('✅ Comprehensive daily reset completed successfully');
      
      // Step 5: Log reset completion
      console.log('📊 Daily reset summary:');
      console.log('   - All cached data cleared');
      console.log('   - All reset events emitted');
      console.log('   - All components notified');
      console.log('   - Fresh data loading triggered');
      
    } catch (error) {
      console.error('❌ Error during comprehensive daily reset:', error);
    }
  }

  /**
   * Clear cached data when date changes
   */
  private async clearCachedData(): Promise<void> {
    try {
      console.log('🔄 Starting comprehensive cache clearing process...');
      
      // Comprehensive list of all possible cache keys
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

      // Clear each cache key with detailed logging
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          clearedCount++;
          console.log(`✅ Cleared cache key: ${key}`);
        } catch (keyError) {
          failedCount++;
          console.warn(`⚠️ Failed to clear cache key: ${key}`, keyError);
        }
      }

      // Clear all AsyncStorage keys that match patterns
      await this.clearPatternBasedCache();

      console.log(`🎯 Cache clearing completed: ${clearedCount} cleared, ${failedCount} failed`);
      console.log('✅ Comprehensive cache clearing process finished');
      
      // Emit cache cleared event
      eventEmitter.emit('cacheCleared', {
        timestamp: new Date().toISOString(),
        clearedCount,
        failedCount
      });
      
    } catch (error) {
      console.error('❌ Error during comprehensive cache clearing:', error);
    }
  }

  /**
   * Clear cache keys that match specific patterns
   */
  private async clearPatternBasedCache(): Promise<void> {
    try {
      console.log('🔍 Clearing pattern-based cache...');
      
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      
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
              await AsyncStorage.removeItem(key);
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
      
    } catch (error) {
      console.error('❌ Error during pattern-based cache clearing:', error);
    }
  }

  /**
   * Force a manual date change check
   */
  async forceDateCheck(): Promise<void> {
    await this.checkForDateChange();
  }

  /**
   * Force cache refresh manually
   */
  async forceCacheRefresh(): Promise<void> {
    try {
      console.log('🔄 Force cache refresh triggered manually...');
      await this.clearCachedData();
      
      // Emit cache refresh events
      eventEmitter.emit('cacheRefreshed');
      eventEmitter.emit('forceRefreshAllData');
      eventEmitter.emit('dataRefresh');
      
      console.log('✅ Manual cache refresh completed');
    } catch (error) {
      console.error('❌ Error during manual cache refresh:', error);
    }
  }

  /**
   * Force comprehensive reset (for debugging/testing)
   */
  async forceComprehensiveReset(): Promise<void> {
    try {
      console.log('🎯 Force comprehensive reset triggered...');
      await this.triggerDailyReset();
      console.log('✅ Force comprehensive reset completed');
    } catch (error) {
      console.error('❌ Error during force comprehensive reset:', error);
    }
  }

  /**
   * Get the last checked date
   */
  getLastCheckedDate(): string | null {
    return this.lastCheckedDate;
  }

  /**
   * Clean up the detector
   */
  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isInitialized = false;
  }

  /**
   * Check if the detector is initialized
   */
  isDetectorInitialized(): boolean {
    return this.isInitialized;
  }
}

export default DateChangeDetector.getInstance();
