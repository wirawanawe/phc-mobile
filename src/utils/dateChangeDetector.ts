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
      console.log('Triggering daily reset for all tracking data...');

      // Emit events to reset all tracking data
      eventEmitter.emit('dailyReset', {
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
      });

      // Emit specific reset events for each tracking type
      eventEmitter.emit('waterReset');
      eventEmitter.emit('fitnessReset');
      eventEmitter.emit('sleepReset');
      eventEmitter.emit('moodReset');
      eventEmitter.emit('mealReset');

      // Clear any cached data
      await this.clearCachedData();

      console.log('Daily reset completed');
    } catch (error) {
      console.error('Error triggering daily reset:', error);
    }
  }

  /**
   * Clear cached data when date changes
   */
  private async clearCachedData(): Promise<void> {
    try {
      const keysToRemove = [
        'todayWaterIntake',
        'todayFitnessData',
        'todaySleepData',
        'todayMoodData',
        'todayMealData',
        'todaySummaryData'
      ];

      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
      }

      console.log('Cached data cleared');
    } catch (error) {
      console.error('Error clearing cached data:', error);
    }
  }

  /**
   * Force a manual date change check
   */
  async forceDateCheck(): Promise<void> {
    await this.checkForDateChange();
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
