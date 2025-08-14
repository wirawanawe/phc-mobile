import { Alert } from 'react-native';

// Debug utility to track modal calls
let modalCallCount = 0;

// Wrapper for Alert.alert to track calls
export const debugAlert = (title, message, buttons, options) => {
  modalCallCount++;
  console.log(`🔍 Modal Call #${modalCallCount}:`);
  console.log(`   Title: "${title}"`);
  console.log(`   Message: "${message}"`);
  console.log(`   Buttons:`, buttons);
  console.log(`   Options:`, options);
  
  // Call the original Alert.alert
  return Alert.alert(title, message, buttons, options);
};

// Get modal call count
export const getModalCallCount = () => {
  return modalCallCount;
};

// Reset modal call count
export const resetModalCallCount = () => {
  modalCallCount = 0;
  console.log('🔄 Modal call count reset');
};

// Test function to verify modal behavior
export const testModal = () => {
  console.log('🧪 Testing modal behavior...');
  
  // Test success modal
  debugAlert(
    "✅ Test Success",
    "This is a test success message",
    [{ text: "OK", style: "default" }]
  );
  
  // Test error modal
  setTimeout(() => {
    debugAlert(
      "❌ Test Error", 
      "This is a test error message",
      [{ text: "OK", style: "default" }]
    );
  }, 1000);
};

// Export default for easy access
export default {
  debugAlert,
  getModalCallCount,
  resetModalCallCount,
  testModal
};
