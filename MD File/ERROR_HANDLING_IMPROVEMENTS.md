# Error Handling Improvements

## Overview
Perbaikan sistem error handling untuk mengatasi masalah "Too many requests (429)" dan meningkatkan user experience.

## Changes Made

### 1. Enhanced Error Types (`src/utils/errorHandler.ts`)

#### Added New Error Type
```typescript
export enum ErrorType {
  // ... existing types
  RATE_LIMIT = 'RATE_LIMIT',
  // ... other types
}
```

#### Added Rate Limit Error Messages
```typescript
[ErrorType.RATE_LIMIT]: {
  message: 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
  userMessage: 'Terlalu banyak permintaan. Silakan tunggu beberapa menit dan coba lagi.',
  shouldRetry: true,
  shouldLogout: false,
  shouldShowAlert: true
}
```

#### Enhanced Error Parsing
- Added detection for "too many requests", "429", and "rate limit" errors
- Improved error message handling for rate limiting scenarios

### 2. Improved Retry Mechanism (`src/utils/errorHandler.ts`)

#### Enhanced withRetry Function
```typescript
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  // ... existing logic
  
  // Special handling for rate limiting
  if (errorInfo.type === ErrorType.RATE_LIMIT) {
    const rateLimitDelay = Math.min(delay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
    console.log(`⏳ Rate limited. Waiting ${rateLimitDelay}ms before retry ${attempt}/${maxRetries}`);
    await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
  } else {
    console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }
}
```

**Features:**
- Exponential backoff for rate limiting (max 30 seconds)
- Different retry strategies for different error types
- Better logging for debugging

### 3. API Service Improvements (`src/services/api.js`)

#### Enhanced Request Method
```javascript
// Handle rate limiting specifically
if (response.status === 429) {
  throw new Error("Too many requests from this IP, please try again later.");
}
```

**Features:**
- Specific handling for 429 status codes
- Clear error messages for rate limiting
- Better error context for debugging

### 4. MainScreen Integration (`src/screens/MainScreen.tsx`)

#### Enhanced Data Loading
```typescript
const loadMissionData = async () => {
  // ... existing logic
  
  // Use withRetry for better error handling
  const [statsResponse, userMissionsResponse, todaySummaryResponse] = await Promise.all([
    withRetry(() => api.getMissionStats(), 3, 2000),
    withRetry(() => api.getMyMissions(), 3, 2000),
    withRetry(() => api.getTodaySummary(), 3, 2000),
  ]);
  
  // ... rest of the logic
};
```

**Features:**
- Automatic retry with exponential backoff
- Better error handling for background data loading
- Reduced user-facing error alerts for background operations

## Benefits

### 1. Better User Experience
- ✅ Reduced error alerts for temporary issues
- ✅ Automatic retry for transient failures
- ✅ Clear error messages for rate limiting
- ✅ Graceful degradation when services are unavailable

### 2. Improved Reliability
- ✅ Exponential backoff prevents overwhelming the server
- ✅ Smart retry logic based on error type
- ✅ Better handling of network issues
- ✅ Reduced false error reports

### 3. Enhanced Debugging
- ✅ Detailed logging for retry attempts
- ✅ Clear error categorization
- ✅ Better error context for developers
- ✅ Rate limiting specific handling

## Usage Examples

### Basic Retry Usage
```typescript
import { withRetry } from "../utils/errorHandler";

// Simple retry
const data = await withRetry(() => api.getData());

// Custom retry configuration
const data = await withRetry(() => api.getData(), 5, 3000);
```

### Error Handling
```typescript
import { handleApiError } from "../utils/errorHandler";

try {
  const data = await api.getData();
} catch (error) {
  handleApiError(error, "Data Loading");
}
```

## Configuration

### Retry Settings
- **Default max retries**: 3
- **Default delay**: 1000ms (1 second)
- **Rate limit max delay**: 30000ms (30 seconds)
- **Exponential backoff**: 2x multiplier

### Error Types
- **RATE_LIMIT**: Automatic retry with exponential backoff
- **NETWORK**: Automatic retry with standard backoff
- **SERVER**: Automatic retry with standard backoff
- **AUTHENTICATION**: No retry, logout user
- **VALIDATION**: No retry, show error to user

## Testing

### Rate Limiting Test
1. Make multiple rapid API calls
2. Verify 429 errors are handled gracefully
3. Check retry attempts with exponential backoff
4. Confirm user experience remains smooth

### Network Error Test
1. Disconnect network temporarily
2. Verify automatic retry behavior
3. Check error messages are user-friendly
4. Confirm app doesn't crash

## Future Improvements

### Potential Enhancements
- [ ] Circuit breaker pattern for failing services
- [ ] Request queuing for rate-limited endpoints
- [ ] Offline mode with request caching
- [ ] User-configurable retry settings
- [ ] Analytics for error patterns

### Monitoring
- [ ] Error rate tracking
- [ ] Retry success rate monitoring
- [ ] User experience metrics
- [ ] Performance impact analysis 