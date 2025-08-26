import React, { useEffect } from 'react';
import { Modal } from 'react-native';
import { usePin } from '../contexts/PinContext';
import { useAppState } from '../hooks/useAppState';
import PinScreen from '../screens/PinScreen';

interface PinOverlayProps {
  children: React.ReactNode;
}

const PinOverlay: React.FC<PinOverlayProps> = ({ children }) => {
  const { isPinEnabled, isPinScreenVisible, showPinScreen, hidePinScreen } = usePin();
  
  // Use app state hook to detect when app comes to foreground
  useAppState();

  useEffect(() => {
    // Show PIN screen when app becomes active if PIN is enabled
    if (isPinEnabled) {
      showPinScreen();
    }
  }, [isPinEnabled]);

  const handlePinSuccess = () => {
    hidePinScreen();
  };

  return (
    <>
      {children}
      <Modal
        visible={isPinScreenVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        transparent={false}
      >
        <PinScreen onSuccess={handlePinSuccess} />
      </Modal>
    </>
  );
};

export default PinOverlay;
