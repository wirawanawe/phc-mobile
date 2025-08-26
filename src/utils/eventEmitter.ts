// Custom Event Emitter for React Native
class AppEventEmitter {
  private listeners: { [key: string]: Array<(data?: any) => void> } = {};

  // Singleton pattern
  private static instance: AppEventEmitter;

  private constructor() {}

  public static getInstance(): AppEventEmitter {
    if (!AppEventEmitter.instance) {
      AppEventEmitter.instance = new AppEventEmitter();
    }
    return AppEventEmitter.instance;
  }

  // Add event listener
  public on(event: string, callback: (data?: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  public off(event: string, callback: (data?: any) => void): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit event
  public emit(event: string, data?: any): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Remove all listeners for an event
  public removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  // Wellness Activity Events
  emitWellnessActivityCompleted(): void {
    this.emit('wellnessActivityCompleted');
  }

  emitWellnessActivityUpdated(): void {
    this.emit('wellnessActivityUpdated');
  }

  emitWellnessActivityDeleted(): void {
    this.emit('wellnessActivityDeleted');
  }

  emitWellnessActivityReset(): void {
    this.emit('wellnessActivityReset');
  }

  // Mission Events
  emitMissionCompleted(missionData?: any): void {
    this.emit('missionCompleted', missionData);
  }

  emitMissionUpdated(missionData?: any): void {
    this.emit('missionUpdated', missionData);
  }

  emitMissionDeleted(): void {
    this.emit('missionDeleted');
  }

  emitMissionRefresh(): void {
    this.emit('refreshMissions');
  }

  // Enhanced Mission Events for Tracking Integration
  emitForceRefreshMissions(): void {
    this.emit('forceRefreshMissions');
  }

  emitUpdateMissionStats(): void {
    this.emit('updateMissionStats');
  }

  emitUpdateUserMissions(): void {
    this.emit('updateUserMissions');
  }

  // User Profile Events
  emitUserProfileUpdated(): void {
    this.emit('userProfileUpdated');
  }

  // Health Data Events
  emitHealthDataUpdated(): void {
    this.emit('healthDataUpdated');
  }

  emitHealthDataDeleted(): void {
    this.emit('healthDataDeleted');
  }

  // General Data Refresh
  emitDataRefresh(): void {
    this.emit('dataRefresh');
  }

  // Tracking-related events
  emitWaterLogged() {
    this.emit('waterLogged');
  }

  emitFitnessLogged() {
    this.emit('fitnessLogged');
  }

  emitSleepLogged() {
    this.emit('sleepLogged');
  }

  emitMoodLogged() {
    this.emit('moodLogged');
  }

  emitNutritionLogged() {
    this.emit('nutritionLogged');
  }

  emitMealLogged() {
    this.emit('mealLogged');
  }

  emitAnthropometryLogged() {
    this.emit('anthropometryLogged');
  }

  // Dashboard refresh events
  emitDashboardRefresh() {
    this.emit('dashboardRefresh');
  }

  emitStatsUpdated() {
    this.emit('statsUpdated');
  }

  // User-related events
  emitUserLoggedIn() {
    this.emit('userLoggedIn');
  }

  emitUserLoggedOut() {
    this.emit('userLoggedOut');
  }

  // Network-related events
  emitNetworkStatusChanged(status: string) {
    this.emit('networkStatusChanged', status);
  }

  emitConnectionRestored() {
    this.emit('connectionRestored');
  }

  // Error events
  emitError(error: any) {
    this.emit('error', error);
  }

  // Authentication error events
  emitAuthError() {
    this.emit('authError');
  }

  // Network error events
  emitNetworkError() {
    this.emit('networkError');
  }

  // Get listener count for debugging
  getListenerCount(eventName: string): number {
    return this.listeners[eventName] ? this.listeners[eventName].length : 0;
  }

  // Log all active listeners (for debugging)
  logActiveListeners() {
    const events = Object.keys(this.listeners);
    console.log('📡 Active event listeners:', events);
    events.forEach(event => {
      const count = this.getListenerCount(event);
      console.log(`  - ${event}: ${count} listeners`);
    });
  }
}

// Export singleton instance
export const eventEmitter = AppEventEmitter.getInstance();

// Export the class for testing purposes
export { AppEventEmitter };

// Default export for backward compatibility
export default eventEmitter; 