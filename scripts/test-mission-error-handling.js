#!/usr/bin/env node

/**
 * Test script to verify mission error handling
 * This script simulates the 409 conflict error that occurs when trying to accept a mission that's already active
 */

const testMissionErrorHandling = () => {
  console.log('🧪 Testing Mission Error Handling...\n');

  // Simulate the error message from the backend
  const errorMessage = '{"success":false,"message":"Mission sudah diterima dan sedang dalam progress"}';
  
  console.log('📋 Original error message:', errorMessage);
  
  // Simulate the API service error handling
  const handle409Error = (errorText) => {
    console.log('⚠️ 409 Conflict detected:', errorText);
    
    if (errorText.includes("Mission sudah diterima") || errorText.includes("sudah dalam progress")) {
      return "Mission sudah diterima dan sedang dalam progress. Silakan cek misi aktif Anda.";
    } else if (errorText.includes("sudah diselesaikan")) {
      return "Mission sudah diselesaikan. Tidak dapat diperbarui lagi.";
    } else if (errorText.includes("sudah dibatalkan")) {
      return "Mission sudah dibatalkan. Tidak dapat diperbarui lagi.";
    } else if (errorText.includes("tidak dapat ditinggalkan")) {
      return "Mission yang sudah diselesaikan tidak dapat ditinggalkan.";
    }
    
    return `Konflik data: ${errorText}`;
  };

  // Test the error handling
  const result = handle409Error(errorMessage);
  console.log('✅ Processed error message:', result);
  
  // Test error handler parsing
  const parseError = (error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('mission sudah diterima') || 
        message.includes('sudah dalam progress') ||
        message.includes('sudah diselesaikan') ||
        message.includes('sudah dibatalkan') ||
        message.includes('tidak dapat ditinggalkan') ||
        message.includes('konflik data') ||
        message.includes('409')) {
      return {
        type: 'CONFLICT',
        message: error.message,
        userMessage: error.message,
        shouldRetry: false,
        shouldLogout: false,
        shouldShowAlert: true
      };
    }
    
    return {
      type: 'UNKNOWN',
      message: error.message,
      userMessage: 'Terjadi kesalahan. Silakan coba lagi.',
      shouldRetry: false,
      shouldLogout: false,
      shouldShowAlert: true
    };
  };

  const error = new Error(result);
  const parsedError = parseError(error);
  
  console.log('\n📊 Error parsing result:');
  console.log('- Type:', parsedError.type);
  console.log('- Message:', parsedError.message);
  console.log('- User Message:', parsedError.userMessage);
  console.log('- Should Retry:', parsedError.shouldRetry);
  console.log('- Should Show Alert:', parsedError.shouldShowAlert);
  
  // Test different error scenarios
  console.log('\n🧪 Testing different error scenarios:');
  
  const testCases = [
    'Mission sudah diterima dan sedang dalam progress',
    'Mission sudah diselesaikan',
    'Mission sudah dibatalkan',
    'Mission yang sudah diselesaikan tidak dapat ditinggalkan',
    'Some other error'
  ];
  
  testCases.forEach((testCase, index) => {
    const testError = new Error(testCase);
    const testResult = parseError(testError);
    console.log(`${index + 1}. "${testCase}" -> Type: ${testResult.type}`);
  });
  
  console.log('\n✅ Mission error handling test completed!');
};

// Run the test
testMissionErrorHandling(); 