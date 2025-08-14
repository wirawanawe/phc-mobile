import { Platform } from 'react-native';

/**
 * Rate Limit Helper Utility
 * Helps handle rate limiting issues in development and production
 */

export const clearRateLimits = async (baseURL) => {
  if (!__DEV__) {
    console.log('⚠️ Rate limit clearing is only available in development mode');
    return false;
  }

  try {
    console.log('🧹 Attempting to clear rate limits...');
    
    const clearURL = `${baseURL.replace('/api/mobile', '')}/api/clear-rate-limit`;
    const response = await fetch(clearURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Rate limits cleared successfully:', result.message);
      return true;
    } else {
      console.log('❌ Failed to clear rate limits:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error.message);
    return false;
  }
};

export const getRateLimitInfo = (error) => {
  if (!error.message) return null;

  const rateLimitPatterns = [
    /Too many login attempts\. Please wait (\d+) minute/,
    /Too many requests.*?wait (\d+) minute/,
    /Terlalu banyak permintaan.*?tunggu (\d+) menit/,
    /Rate limit exceeded.*?retry after (\d+) seconds/,
  ];

  for (const pattern of rateLimitPatterns) {
    const match = error.message.match(pattern);
    if (match) {
      return {
        waitTime: parseInt(match[1]),
        unit: pattern.source.includes('minute') ? 'minutes' : 'seconds',
        message: error.message
      };
    }
  }

  return null;
};

export const formatRateLimitMessage = (rateLimitInfo) => {
  if (!rateLimitInfo) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  const { waitTime, unit } = rateLimitInfo;
  
  if (unit === 'minutes') {
    return `Too many login attempts. Please wait ${waitTime} minute${waitTime > 1 ? 's' : ''} and try again.`;
  } else {
    return `Too many requests. Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} and try again.`;
  }
};

export const shouldRetryAfterRateLimit = (error, attemptCount) => {
  // Don't retry if we've already tried too many times
  if (attemptCount >= 3) return false;

  // Check if it's a rate limit error
  const rateLimitInfo = getRateLimitInfo(error);
  if (!rateLimitInfo) return false;

  // In development, always retry (we can clear rate limits)
  if (__DEV__) return true;

  // In production, only retry if wait time is reasonable
  const { waitTime, unit } = rateLimitInfo;
  const waitTimeInSeconds = unit === 'minutes' ? waitTime * 60 : waitTime;
  
  // Only retry if wait time is less than 5 minutes
  return waitTimeInSeconds < 300;
};

export const getRetryDelay = (error, attemptCount) => {
  const rateLimitInfo = getRateLimitInfo(error);
  
  if (rateLimitInfo) {
    const { waitTime, unit } = rateLimitInfo;
    const waitTimeInSeconds = unit === 'minutes' ? waitTime * 60 : waitTime;
    
    // Use exponential backoff with the rate limit wait time as base
    return Math.min(waitTimeInSeconds * 1000 * Math.pow(2, attemptCount - 1), 30000);
  }
  
  // Default exponential backoff
  return Math.min(1000 * Math.pow(2, attemptCount - 1), 10000);
};
