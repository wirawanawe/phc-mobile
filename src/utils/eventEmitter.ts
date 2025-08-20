// Custom Event Emitter for React Native
class AppEventEmitter {
  private listeners: { [key: string]: Array<() => void> } = {};

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
  public on(event: string, callback: () => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  public off(event: string, callback: () => void): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit event
  public emit(event: string): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => {
      try {
        callback();
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

  // Emit meal logged event
  public emitMealLogged(): void {
    this.emit('mealLogged');
  }

  // Emit water logged event
  public emitWaterLogged(): void {
    this.emit('waterLogged');
  }

  // Emit fitness logged event
  public emitFitnessLogged(): void {
    this.emit('fitnessLogged');
  }

  // Emit sleep logged event
  public emitSleepLogged(): void {
    this.emit('sleepLogged');
  }

  // Emit mood logged event
  public emitMoodLogged(): void {
    this.emit('moodLogged');
  }

  // Emit general data refresh event
  public emitDataRefresh(): void {
    this.emit('dataRefresh');
  }

  // Emit wellness activity completed event
  public emitWellnessActivityCompleted(): void {
    this.emit('wellnessActivityCompleted');
  }

  // Emit wellness activity updated event
  public emitWellnessActivityUpdated(): void {
    this.emit('wellnessActivityUpdated');
  }

  // Emit wellness activity deleted event
  public emitWellnessActivityDeleted(): void {
    this.emit('wellnessActivityDeleted');
  }

  // Emit wellness activity reset event
  public emitWellnessActivityReset(): void {
    this.emit('wellnessActivityReset');
  }

  // Emit mission completed event
  public emitMissionCompleted(): void {
    this.emit('missionCompleted');
  }

  // Emit mission updated event
  public emitMissionUpdated(): void {
    this.emit('missionUpdated');
  }

  // Emit mission deleted event
  public emitMissionDeleted(): void {
    this.emit('missionDeleted');
  }

  // Emit user profile updated event
  public emitUserProfileUpdated(): void {
    this.emit('userProfileUpdated');
  }

  // Emit health data updated event
  public emitHealthDataUpdated(): void {
    this.emit('healthDataUpdated');
  }

  // Emit health data deleted event
  public emitHealthDataDeleted(): void {
    this.emit('healthDataDeleted');
  }
}

export default AppEventEmitter.getInstance(); 