import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

interface PinContextType {
  isPinEnabled: boolean;
  pinCode: string;
  isPinScreenVisible: boolean;
  enablePin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  setPinCode: (pin: string) => Promise<void>;
  validatePin: (pin: string) => Promise<boolean>;
  showPinScreen: () => void;
  hidePinScreen: () => void;
  resetPinAttempts: () => void;
  incrementPinAttempts: () => void;
  pinAttempts: number;
  isPinLocked: boolean;
  isLoading: boolean;
  loadPinSettings: () => Promise<void>;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const usePin = () => {
  const context = useContext(PinContext);
  if (!context) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
};

interface PinProviderProps {
  children: React.ReactNode;
}

export const PinProvider: React.FC<PinProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [pinCode, setPinCodeState] = useState('');
  const [isPinScreenVisible, setIsPinScreenVisible] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load PIN settings from database when user changes
  useEffect(() => {
    if (user?.id) {
      loadPinSettings();
    }
  }, [user?.id]);

  const loadPinSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await apiService.getPinStatus(user.id);
      
      if (response.success) {
        const { pin_enabled, pin_attempts, is_locked } = response.data;
        setIsPinEnabled(pin_enabled);
        setPinAttempts(pin_attempts || 0);
        setIsPinLocked(is_locked);
        
        // Store PIN status in AsyncStorage for offline access
        await AsyncStorage.setItem('pin_enabled', pin_enabled.toString());
        await AsyncStorage.setItem('pin_attempts', (pin_attempts || 0).toString());
      }
    } catch (error) {
      console.error('Error loading PIN settings from database:', error);
      
      // Handle specific error types
      if (error.message?.includes('Resource not found') || error.message?.includes('404')) {
        console.log('🔍 PIN API endpoint not found, using fallback to local storage');
        // This might happen if the API endpoint is not available
        // Fallback to local storage
      } else if (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')) {
        console.log('🌐 Network error, using fallback to local storage');
        // Network connectivity issues
      }
      
      // Fallback to local storage if database is unavailable
      try {
        const [enabled, attempts] = await Promise.all([
          AsyncStorage.getItem('pin_enabled'),
          AsyncStorage.getItem('pin_attempts'),
        ]);

        setIsPinEnabled(enabled === 'true');
        setPinAttempts(parseInt(attempts || '0', 10));
        
        if (parseInt(attempts || '0', 10) >= 5) {
          setIsPinLocked(true);
        }
        
        console.log('✅ Fallback to local storage successful');
      } catch (localError) {
        console.error('Error loading PIN settings from local storage:', localError);
        // Set default values if both database and local storage fail
        setIsPinEnabled(false);
        setPinAttempts(0);
        setIsPinLocked(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const enablePin = async (pin: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setIsLoading(true);
      const response = await apiService.enablePin(user.id, pin);
      
      if (response.success) {
        setIsPinEnabled(true);
        setPinCodeState(pin);
        setPinAttempts(0);
        setIsPinLocked(false);
        
        // Store in local storage for offline access
        await AsyncStorage.setItem('pin_enabled', 'true');
        await AsyncStorage.setItem('pin_attempts', '0');
      } else {
        throw new Error(response.message || 'Failed to enable PIN');
      }
    } catch (error) {
      console.error('Error enabling PIN:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disablePin = async () => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setIsLoading(true);
      const response = await apiService.disablePin(user.id);
      
      if (response.success) {
        setIsPinEnabled(false);
        setPinCodeState('');
        setPinAttempts(0);
        setIsPinLocked(false);
        
        // Clear local storage
        await AsyncStorage.multiRemove(['pin_enabled', 'pin_code', 'pin_attempts']);
      } else {
        throw new Error(response.message || 'Failed to disable PIN');
      }
    } catch (error) {
      console.error('Error disabling PIN:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setPinCode = async (pin: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setIsLoading(true);
      const response = await apiService.updatePin(user.id, pinCode, pin);
      
      if (response.success) {
        setPinCodeState(pin);
        setPinAttempts(0);
        setIsPinLocked(false);
        
        // Update local storage
        await AsyncStorage.setItem('pin_code', pin);
        await AsyncStorage.setItem('pin_attempts', '0');
      } else {
        throw new Error(response.message || 'Failed to update PIN');
      }
    } catch (error) {
      console.error('Error setting PIN code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePin = async (pin: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await apiService.validatePin(user.id, pin);
      
      if (response.success) {
        // PIN is valid - reset attempts
        setPinAttempts(0);
        setIsPinLocked(false);
        await AsyncStorage.setItem('pin_attempts', '0');
        return true;
      } else {
        // PIN is invalid - increment attempts
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsPinLocked(true);
        }
        
        await AsyncStorage.setItem('pin_attempts', newAttempts.toString());
        return false;
      }
    } catch (error) {
      console.error('Error validating PIN:', error);
      
      // Handle specific error types
      if (error.message?.includes('Resource not found') || error.message?.includes('404')) {
        console.log('🔍 PIN validation API not available, using local validation');
      } else if (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')) {
        console.log('🌐 Network error during PIN validation, using local validation');
      } else if (error.message?.includes('PIN is not enabled')) {
        console.log('🔓 PIN not enabled for user, allowing access');
        return true; // Allow access if PIN is not enabled
      }
      
      // Fallback to local validation if API fails
      console.log('🔄 Falling back to local PIN validation');
      return pin === pinCode;
    }
  };

  const showPinScreen = () => {
    if (isPinEnabled && !isPinLocked) {
      setIsPinScreenVisible(true);
    }
  };

  const hidePinScreen = () => {
    setIsPinScreenVisible(false);
  };

  const resetPinAttempts = async () => {
    if (!user?.id) return;

    try {
      // Reset attempts in database by making a successful PIN validation
      // or by calling a reset endpoint if available
      setPinAttempts(0);
      setIsPinLocked(false);
      await AsyncStorage.setItem('pin_attempts', '0');
    } catch (error) {
      console.error('Error resetting PIN attempts:', error);
    }
  };

  const incrementPinAttempts = async () => {
    const newAttempts = pinAttempts + 1;
    try {
      setPinAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsPinLocked(true);
      }
      
      await AsyncStorage.setItem('pin_attempts', newAttempts.toString());
    } catch (error) {
      console.error('Error incrementing PIN attempts:', error);
    }
  };

  const value: PinContextType = {
    isPinEnabled,
    pinCode,
    isPinScreenVisible,
    enablePin,
    disablePin,
    setPinCode,
    validatePin,
    showPinScreen,
    hidePinScreen,
    resetPinAttempts,
    incrementPinAttempts,
    pinAttempts,
    isPinLocked,
    isLoading,
    loadPinSettings,
  };

  return (
    <PinContext.Provider value={value}>
      {children}
    </PinContext.Provider>
  );
};
