import * as Location from 'expo-location';
import { Platform } from 'react-native';
import FitnessIntegrationService from './FitnessIntegrationService';
import api from './api';

// Type definitions for expo-location
interface LocationSubscription {
  remove: () => void;
}

export interface ActivityData {
  type: 'walking' | 'running' | 'cycling' | 'stationary' | 'unknown';
  confidence: number; // 0-100
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  distance: number; // in meters
  steps: number;
  calories: number;
  coordinates: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
  }>;
  speed: number; // meters per second
  pace: number; // minutes per kilometer
}

export interface ActivityDetectionConfig {
  minDuration: number; // minimum duration to consider as activity (seconds)
  minDistance: number; // minimum distance to consider as activity (meters)
  minSteps: number; // minimum steps to consider as activity
  confidenceThreshold: number; // minimum confidence to auto-start tracking
  autoStartEnabled: boolean; // whether to auto-start tracking
  autoStopEnabled: boolean; // whether to auto-stop tracking
  stationaryTimeout: number; // timeout to consider user stationary (seconds)
}

class ActivityDetectionService {
  private isDetecting = false;
  private currentActivity: ActivityData | null = null;
  private locationSubscription: LocationSubscription | null = null;
  private detectionInterval: NodeJS.Timeout | null = null;
  private lastLocation: any | null = null;
  private locationHistory: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
  }> = [];
  private stepCount = 0;
  private lastStepTime = 0;
  private config: ActivityDetectionConfig = {
    minDuration: 30, // 30 seconds
    minDistance: 50, // 50 meters
    minSteps: 20, // 20 steps
    confidenceThreshold: 70, // 70% confidence
    autoStartEnabled: true,
    autoStopEnabled: true,
    stationaryTimeout: 300, // 5 minutes
  };

  // Activity detection patterns
  private readonly activityPatterns = {
    walking: {
      minSpeed: 0.5, // 0.5 m/s (1.8 km/h)
      maxSpeed: 2.0, // 2.0 m/s (7.2 km/h)
      stepPattern: 'regular',
      accelerationPattern: 'moderate',
    },
    running: {
      minSpeed: 2.0, // 2.0 m/s (7.2 km/h)
      maxSpeed: 6.0, // 6.0 m/s (21.6 km/h)
      stepPattern: 'fast',
      accelerationPattern: 'high',
    },
    cycling: {
      minSpeed: 2.5, // 2.5 m/s (9 km/h)
      maxSpeed: 15.0, // 15.0 m/s (54 km/h)
      stepPattern: 'minimal',
      accelerationPattern: 'smooth',
    },
  };

  /**
   * Start automatic activity detection
   */
  async startDetection(): Promise<boolean> {
    if (this.isDetecting) {
      return false;
    }

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      // Start location tracking with background mode
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // Use balanced for battery efficiency
          timeInterval: 3000, // Update every 3 seconds for background efficiency
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Start activity detection loop with longer interval for background
      this.detectionInterval = setInterval(() => {
        this.detectActivity();
      }, 10000); // Check every 10 seconds for background efficiency

      this.isDetecting = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop automatic activity detection
   */
  stopDetection(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    this.isDetecting = false;
    this.locationHistory = [];
    this.stepCount = 0;
  }

  /**
   * Handle location updates and detect movement patterns
   */
  private handleLocationUpdate(location: any): void {
    const { latitude, longitude, timestamp, accuracy } = location.coords;

    // Add to location history
    this.locationHistory.push({
      latitude,
      longitude,
      timestamp,
      accuracy: accuracy || 10,
    });

    // Keep only last 60 seconds of location data
    const cutoffTime = timestamp - 60000;
    this.locationHistory = this.locationHistory.filter(
      (loc) => loc.timestamp > cutoffTime
    );

    // Detect steps based on movement patterns
    this.detectSteps(location);

    // Update last location
    this.lastLocation = location;
  }

  /**
   * Detect steps based on movement patterns
   */
  private detectSteps(location: any): void {
    if (this.locationHistory.length < 2) return;

    const current = this.locationHistory[this.locationHistory.length - 1];
    const previous = this.locationHistory[this.locationHistory.length - 2];

    // Calculate distance moved
    const distance = this.calculateDistance(
      previous.latitude,
      previous.longitude,
      current.latitude,
      current.longitude
    );

    // Calculate time difference
    const timeDiff = (current.timestamp - previous.timestamp) / 1000; // seconds

    // Detect step based on movement pattern
    if (distance > 0.5 && distance < 2.0 && timeDiff > 0.5 && timeDiff < 2.0) {
      // This looks like a step - movement of 0.5-2 meters in 0.5-2 seconds
      const timeSinceLastStep = (current.timestamp - this.lastStepTime) / 1000;
      
      if (timeSinceLastStep > 0.3) { // Minimum 0.3 seconds between steps
        this.stepCount++;
        this.lastStepTime = current.timestamp;
      }
    }
  }

  /**
   * Main activity detection logic
   */
  private detectActivity(): void {
    if (this.locationHistory.length < 3) return;

    const currentTime = Date.now();
    const recentLocations = this.locationHistory.filter(
      (loc) => currentTime - loc.timestamp < 30000 // Last 30 seconds
    );

    if (recentLocations.length < 3) return;

    // Calculate current speed
    const speed = this.calculateAverageSpeed(recentLocations);
    
    // Calculate movement pattern
    const movementPattern = this.analyzeMovementPattern(recentLocations);
    
    // Determine activity type and confidence
    const activityResult = this.classifyActivity(speed, movementPattern);

    // Handle activity detection
    this.handleActivityDetection(activityResult, currentTime);
  }

  /**
   * Calculate average speed from recent locations
   */
  private calculateAverageSpeed(locations: Array<{ latitude: number; longitude: number; timestamp: number }>): number {
    if (locations.length < 2) return 0;

    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      
      const time = (curr.timestamp - prev.timestamp) / 1000; // seconds
      
      totalDistance += distance;
      totalTime += time;
    }

    return totalTime > 0 ? totalDistance / totalTime : 0; // meters per second
  }

  /**
   * Analyze movement pattern for activity classification
   */
  private analyzeMovementPattern(locations: Array<{ latitude: number; longitude: number; timestamp: number }>): any {
    if (locations.length < 3) return { pattern: 'unknown', regularity: 0 };

    const speeds = [];
    const accelerations = [];

    // Calculate speeds between consecutive points
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      
      const time = (curr.timestamp - prev.timestamp) / 1000;
      const speed = time > 0 ? distance / time : 0;
      speeds.push(speed);
    }

    // Calculate accelerations
    for (let i = 1; i < speeds.length; i++) {
      const time = (locations[i + 1].timestamp - locations[i].timestamp) / 1000;
      const acceleration = time > 0 ? (speeds[i] - speeds[i - 1]) / time : 0;
      accelerations.push(Math.abs(acceleration));
    }

    // Analyze pattern regularity
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const speedVariance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
    const regularity = 1 / (1 + speedVariance); // Higher regularity = lower variance

    // Determine pattern type
    let pattern = 'unknown';
    const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;

    if (regularity > 0.7 && avgAcceleration < 0.5) {
      pattern = 'smooth';
    } else if (regularity > 0.5 && avgAcceleration < 1.0) {
      pattern = 'moderate';
    } else if (avgAcceleration > 1.0) {
      pattern = 'irregular';
    }

    return { pattern, regularity, avgAcceleration };
  }

  /**
   * Classify activity based on speed and movement pattern
   */
  private classifyActivity(speed: number, movementPattern: any): { type: string; confidence: number } {
    const { pattern, regularity } = movementPattern;

    // Check for stationary
    if (speed < 0.1) {
      return { type: 'stationary', confidence: 95 };
    }

    // Classify based on speed ranges and patterns
    if (speed >= this.activityPatterns.walking.minSpeed && speed <= this.activityPatterns.walking.maxSpeed) {
      let confidence = 60;
      
      if (pattern === 'moderate' || pattern === 'smooth') confidence += 20;
      if (regularity > 0.5) confidence += 10;
      if (this.stepCount > this.config.minSteps) confidence += 10;
      
      return { type: 'walking', confidence: Math.min(confidence, 100) };
    }

    if (speed >= this.activityPatterns.running.minSpeed && speed <= this.activityPatterns.running.maxSpeed) {
      let confidence = 60;
      
      if (pattern === 'irregular' || pattern === 'moderate') confidence += 20;
      if (regularity > 0.3) confidence += 10;
      if (this.stepCount > this.config.minSteps * 2) confidence += 10;
      
      return { type: 'running', confidence: Math.min(confidence, 100) };
    }

    if (speed >= this.activityPatterns.cycling.minSpeed && speed <= this.activityPatterns.cycling.maxSpeed) {
      let confidence = 60;
      
      if (pattern === 'smooth') confidence += 30;
      if (regularity > 0.7) confidence += 10;
      if (this.stepCount < this.config.minSteps) confidence += 10; // Fewer steps for cycling
      
      return { type: 'cycling', confidence: Math.min(confidence, 100) };
    }

    return { type: 'unknown', confidence: 30 };
  }

  /**
   * Handle activity detection results
   */
  private handleActivityDetection(activityResult: { type: string; confidence: number }, currentTime: number): void {
    const { type, confidence } = activityResult;

    // If we have a current activity, check if it should continue or stop
    if (this.currentActivity) {
      if (type === 'stationary' && this.config.autoStopEnabled) {
        // Check if user has been stationary for too long
        const stationaryDuration = (currentTime - this.currentActivity.startTime) / 1000;
        if (stationaryDuration > this.config.stationaryTimeout) {
          this.stopCurrentActivity();
        }
      } else if (type === this.currentActivity.type) {
        // Continue current activity
        this.updateCurrentActivity(currentTime);
      } else if (confidence > this.config.confidenceThreshold) {
        // New activity detected, stop current and start new
        this.stopCurrentActivity();
        this.startNewActivity(type, currentTime);
      }
    } else {
      // No current activity, check if we should start one
      if (confidence > this.config.confidenceThreshold && this.config.autoStartEnabled) {
        this.startNewActivity(type, currentTime);
      }
    }
  }

  /**
   * Start a new activity
   */
  private startNewActivity(type: string, startTime: number): void {
    this.currentActivity = {
      type: type as any,
      confidence: 0,
      startTime,
      duration: 0,
      distance: 0,
      steps: this.stepCount,
      calories: 0,
      coordinates: [],
      speed: 0,
      pace: 0,
    };

    // Auto-start fitness tracking if enabled
    if (this.config.autoStartEnabled) {
      FitnessIntegrationService.startFitnessSession(type as any);
    }

    // Emit event for UI updates
    this.emitActivityEvent('activity_started', this.currentActivity);
  }

  /**
   * Update current activity
   */
  private async updateCurrentActivity(currentTime: number): Promise<void> {
    if (!this.currentActivity) return;

    this.currentActivity.duration = (currentTime - this.currentActivity.startTime) / 1000;
    this.currentActivity.steps = this.stepCount;
    
    // Update coordinates
    if (this.locationHistory.length > 0) {
      this.currentActivity.coordinates = [...this.locationHistory];
    }

    // Calculate distance
    this.currentActivity.distance = this.calculateTotalDistance(this.locationHistory);
    
    // Calculate speed and pace
    if (this.currentActivity.duration > 0) {
      this.currentActivity.speed = this.currentActivity.distance / this.currentActivity.duration;
      this.currentActivity.pace = this.currentActivity.distance > 0 ? 
        (this.currentActivity.duration / 60) / (this.currentActivity.distance / 1000) : 0;
    }

    // Estimate calories
    this.currentActivity.calories = await this.estimateCalories(
      this.currentActivity.type,
      this.currentActivity.duration,
      this.currentActivity.distance,
      this.currentActivity.speed
    );

    // Emit event for UI updates
    this.emitActivityEvent('activity_updated', this.currentActivity);
  }

  /**
   * Stop current activity
   */
  private stopCurrentActivity(): void {
    if (!this.currentActivity) return;

    const endTime = Date.now();
    this.currentActivity.endTime = endTime;
    this.currentActivity.duration = (endTime - this.currentActivity.startTime) / 1000;

    // Auto-stop fitness tracking
    FitnessIntegrationService.stopFitnessSession();

    // Save activity data
    this.saveActivityData(this.currentActivity);

    // Emit event for UI updates
    this.emitActivityEvent('activity_stopped', this.currentActivity);

    this.currentActivity = null;
    this.stepCount = 0;
  }

  /**
   * Save activity data to backend
   */
  private async saveActivityData(activity: ActivityData): Promise<void> {
    try {
      await api.createFitnessEntry({
        steps: activity.steps,
        exercise_minutes: Math.round(activity.duration / 60),
        calories_burned: activity.calories,
        distance_km: activity.distance / 1000,
        workout_type: activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
        notes: `Auto-detected: ${activity.type} - Confidence: ${activity.confidence}% - GPS points: ${activity.coordinates.length}`,
      });
    } catch (error) {
      // Failed to save activity data
    }
  }

  /**
   * Calculate total distance from coordinates
   */
  private calculateTotalDistance(coordinates: Array<{ latitude: number; longitude: number }>): number {
    if (coordinates.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      
      totalDistance += this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    return totalDistance;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Estimate calories burned using MET (Metabolic Equivalent of Task) formula
   * Formula: Calories = MET × Weight (kg) × Duration (hours)
   * 
   * MET values based on Compendium of Physical Activities:
   * - Walking (3.5-4.5 mph): 3.5-4.5 MET
   * - Running (5.2 mph/8.4 km/h): 8.0 MET
   * - Running (6.7 mph/10.8 km/h): 10.0 MET
   * - Cycling (12-13.9 mph): 8.0 MET
   * - Cycling (14-15.9 mph): 10.0 MET
   */
  private async estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): Promise<number> {
    const durationHours = durationSeconds / 3600;
    const distanceKm = distanceMeters / 1000;
    
    // Get user weight from storage or use default
    const weightKg = await this.getUserWeight();
    
    // Calculate MET based on activity type and speed
    let met = this.calculateMET(activityType, speedMps, distanceKm, durationHours);
    
    // Apply formula: Calories = MET × Weight (kg) × Duration (hours)
    const calories = met * weightKg * durationHours;
    
    return Math.round(calories);
  }

  /**
   * Calculate MET value based on activity type and speed
   */
  private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number {
    if (!speedMps && distanceKm && durationHours) {
      speedMps = (distanceKm * 1000) / (durationHours * 3600);
    }

    const speedMph = speedMps ? speedMps * 2.237 : 0; // Convert m/s to mph
    const speedKmh = speedMps ? speedMps * 3.6 : 0; // Convert m/s to km/h

    switch (activityType) {
      case 'walking':
        // Walking MET values based on speed
        if (speedMph < 2.0) return 2.0; // Very slow walking
        if (speedMph < 2.5) return 2.5; // Slow walking
        if (speedMph < 3.0) return 3.0; // Normal walking
        if (speedMph < 3.5) return 3.5; // Brisk walking
        if (speedMph < 4.0) return 4.0; // Fast walking
        if (speedMph < 4.5) return 4.5; // Very fast walking
        return 5.0; // Power walking

      case 'running':
        // Running MET values based on speed
        if (speedMph < 4.5) return 6.0; // Jogging
        if (speedMph < 5.2) return 8.0; // Running 5.2 mph (8.4 km/h)
        if (speedMph < 6.0) return 9.0; // Running 6.0 mph (9.7 km/h)
        if (speedMph < 6.7) return 10.0; // Running 6.7 mph (10.8 km/h)
        if (speedMph < 7.5) return 11.0; // Running 7.5 mph (12.1 km/h)
        if (speedMph < 8.3) return 12.0; // Running 8.3 mph (13.4 km/h)
        if (speedMph < 9.0) return 13.0; // Running 9.0 mph (14.5 km/h)
        return 14.0; // Fast running

      case 'cycling':
        // Cycling MET values based on speed
        if (speedKmh < 10) return 4.0; // Very slow cycling
        if (speedKmh < 12) return 5.0; // Slow cycling
        if (speedKmh < 14) return 6.0; // Moderate cycling
        if (speedKmh < 16) return 8.0; // Cycling 12-13.9 mph
        if (speedKmh < 18) return 10.0; // Cycling 14-15.9 mph
        if (speedKmh < 20) return 12.0; // Cycling 16-17.9 mph
        if (speedKmh < 22) return 14.0; // Cycling 18-19.9 mph
        return 16.0; // Fast cycling

      default:
        return 3.5; // Default MET for unknown activities
    }
  }

  /**
   * Get user weight from storage or return default
   */
  private async getUserWeight(): Promise<number> {
    try {
      const UserProfileService = (await import('./UserProfileService')).default;
      return await UserProfileService.getUserWeight();
    } catch (error) {
      return 70; // Default weight
    }
  }

  /**
   * Event emitter for activity updates
   */
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {};

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emitActivityEvent(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get current activity status
   */
  getCurrentActivity(): ActivityData | null {
    return this.currentActivity;
  }

  /**
   * Get detection status
   */
  isDetectingActivity(): boolean {
    return this.isDetecting;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ActivityDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ActivityDetectionConfig {
    return { ...this.config };
  }

  /**
   * Get today's total activity data
   */
  getTodayActivityData(): { steps: number; distance: number } {
    // Return accumulated data for today
    return {
      steps: this.stepCount,
      distance: this.currentActivity ? this.currentActivity.distance : 0,
    };
  }

  /**
   * Reset daily counters (call this at midnight)
   */
  resetDailyCounters(): void {
    this.stepCount = 0;
    if (this.currentActivity) {
      this.currentActivity.steps = 0;
      this.currentActivity.distance = 0;
    }
  }
}

export default new ActivityDetectionService(); 