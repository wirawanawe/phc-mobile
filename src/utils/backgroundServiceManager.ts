import ActivityDetectionService from "../services/ActivityDetectionService";
import FitnessIntegrationService from "../services/FitnessIntegrationService";
import { connectionMonitor } from "./connectionMonitor";
import dateChangeDetector from "./dateChangeDetector";

/**
 * Background Service Manager
 * Handles stopping all background services when user logs out
 */
export class BackgroundServiceManager {
  /**
   * Stop all background services
   */
  static async stopAllServices(): Promise<void> {
    console.log("🛑 BackgroundServiceManager: Stopping all background services...");
    
    try {
      // Stop activity detection service
      if (typeof ActivityDetectionService !== 'undefined') {
        ActivityDetectionService.stopDetection();
        console.log("✅ BackgroundServiceManager: Activity detection service stopped");
      }
      
      // Stop fitness integration service
      if (typeof FitnessIntegrationService !== 'undefined') {
        try {
          // Stop any active fitness session
          await FitnessIntegrationService.stopFitnessSession();
          console.log("✅ BackgroundServiceManager: Fitness integration service stopped");
        } catch (fitnessError) {
          console.log("⚠️ BackgroundServiceManager: Error stopping fitness service:", fitnessError);
          // Continue even if fitness service fails to stop
        }
      }
      
      // Stop connection monitor
      if (typeof connectionMonitor !== 'undefined') {
        connectionMonitor.stop();
        console.log("✅ BackgroundServiceManager: Connection monitor stopped");
      }
      
      // Stop date change detector
      if (typeof dateChangeDetector !== 'undefined') {
        dateChangeDetector.cleanup();
        console.log("✅ BackgroundServiceManager: Date change detector stopped");
      }
      
      console.log("✅ BackgroundServiceManager: All background services stopped successfully");
    } catch (error) {
      console.error("❌ BackgroundServiceManager: Error stopping background services:", error);
      // Don't throw error, just log it
    }
  }
  
  /**
   * Check if any background services are running
   */
  static getServiceStatus(): {
    activityDetection: boolean;
    fitnessIntegration: boolean;
    connectionMonitor: boolean;
    dateChangeDetector: boolean;
  } {
    return {
      activityDetection: ActivityDetectionService?.isDetectingActivity?.() || false,
      fitnessIntegration: FitnessIntegrationService?.getSessionStatus?.()?.isTracking || false,
      connectionMonitor: connectionMonitor?.getStatus?.()?.isMonitoring || false,
      dateChangeDetector: dateChangeDetector?.isDetectorInitialized?.() || false,
    };
  }
}

export default BackgroundServiceManager;
