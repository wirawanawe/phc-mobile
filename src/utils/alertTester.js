// Test utility for custom alerts
export const testCustomAlerts = () => {
  console.log('🧪 Testing custom alerts...');
  
  // This function can be called from the React Native debugger
  // to test different alert types
  
  return {
    success: {
      title: "Test Success",
      message: "This is a test success message",
      type: "success"
    },
    error: {
      title: "Test Error", 
      message: "This is a test error message",
      type: "error"
    },
    warning: {
      title: "Test Warning",
      message: "This is a test warning message", 
      type: "warning"
    },
    info: {
      title: "Test Info",
      message: "This is a test info message",
      type: "info"
    }
  };
};

// Helper to log alert calls
export const logAlertCall = (title, message, type) => {
  console.log(`🔍 Alert Call:`, {
    title,
    message,
    type,
    timestamp: new Date().toISOString()
  });
};

export default {
  testCustomAlerts,
  logAlertCall
};
