// Debug utility for sleep tracking
export const debugSleepResponse = (response, operation) => {
  console.log(`🔍 Sleep Debug - ${operation}:`, {
    response,
    hasResponse: !!response,
    hasMessage: !!response?.message,
    hasSleepData: !!response?.sleepData,
    hasSuccess: !!response?.success,
    messageContent: response?.message,
    isSuccessMessage: response?.message?.includes('successfully'),
    operation
  });
  
  return {
    isSuccess: response && (response.success || response.message?.includes('successfully') || response.sleepData),
    message: response?.message || 'No message',
    hasData: !!response?.sleepData
  };
};

// Test sleep data structure
export const testSleepData = () => {
  return {
    validSleepData: {
      sleep_date: new Date().toISOString().split('T')[0],
      sleep_hours: 8,
      sleep_minutes: 30,
      sleep_quality: 'good',
      bedtime: '22:30',
      wake_time: '07:00',
      notes: 'Test sleep data'
    },
    expectedResponse: {
      success: true,
      message: 'Sleep tracking data created successfully',
      sleepData: {
        id: 1,
        user_id: 1,
        sleep_date: new Date().toISOString().split('T')[0],
        sleep_duration_minutes: 510,
        sleep_quality: 'good',
        bedtime: '22:30:00',
        wake_time: '07:00:00',
        notes: 'Test sleep data'
      }
    }
  };
};

// Validate sleep data before sending
export const validateSleepData = (sleepData) => {
  const errors = [];
  
  if (!sleepData.sleep_date) errors.push('Sleep date is required');
  if (sleepData.sleep_hours === undefined || sleepData.sleep_hours === null) errors.push('Sleep hours is required');
  if (sleepData.sleep_minutes === undefined || sleepData.sleep_minutes === null) errors.push('Sleep minutes is required');
  if (!sleepData.sleep_quality) errors.push('Sleep quality is required');
  
  const validQualities = ['excellent', 'good', 'fair', 'poor', 'very_poor'];
  if (!validQualities.includes(sleepData.sleep_quality)) {
    errors.push(`Sleep quality must be one of: ${validQualities.join(', ')}`);
  }
  
  if (sleepData.sleep_hours < 0 || sleepData.sleep_hours > 24) {
    errors.push('Sleep hours must be between 0 and 24');
  }
  
  if (sleepData.sleep_minutes < 0 || sleepData.sleep_minutes > 59) {
    errors.push('Sleep minutes must be between 0 and 59');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  debugSleepResponse,
  testSleepData,
  validateSleepData
};
