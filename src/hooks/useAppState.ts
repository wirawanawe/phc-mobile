import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePin } from '../contexts/PinContext';

export const useAppState = () => {
  const appState = useRef(AppState.currentState);
  const { isPinEnabled, showPinScreen } = usePin();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isPinEnabled
      ) {
        // App has come to the foreground and PIN is enabled
        console.log('App has come to the foreground, showing PIN screen');
        showPinScreen();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isPinEnabled, showPinScreen]);
};
