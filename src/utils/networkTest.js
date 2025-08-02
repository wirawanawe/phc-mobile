import { Platform } from 'react-native';

const ENDPOINTS = [
  'http://192.168.1.100:3000',
  'http://192.168.1.101:3000',
  'http://192.168.1.102:3000',
  'http://localhost:3000',
  'http://10.0.2.2:3000', // Android emulator
  'http://127.0.0.1:3000'
];

const testEndpoint = async (endpoint) => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        endpoint,
        responseTime,
        status: response.status,
        working: true
      };
    } else {
      return {
        endpoint,
        responseTime,
        status: response.status,
        working: false
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      responseTime,
      status: 0,
      working: false,
      error: error.message
    };
  }
};

const findBestEndpoint = async () => {
  const results = await Promise.all(
    ENDPOINTS.map(endpoint => testEndpoint(endpoint))
  );
  
  const workingEndpoints = results.filter(result => result.working);
  
  if (workingEndpoints.length === 0) {
    return null;
  }
  
  // Sort by response time and return the fastest
  workingEndpoints.sort((a, b) => a.responseTime - b.responseTime);
  return workingEndpoints[0];
};

const runMobileNetworkDiagnostic = async () => {
  const results = await Promise.all(
    ENDPOINTS.map(endpoint => testEndpoint(endpoint))
  );
  
  const workingCount = results.filter(r => r.working).length;
  const totalCount = results.length;
  
  const fastest = results
    .filter(r => r.working)
    .sort((a, b) => a.responseTime - b.responseTime)[0];
  
  return {
    results,
    workingCount,
    totalCount,
    bestEndpoint: fastest ? fastest.endpoint : null,
    bestResponseTime: fastest ? fastest.responseTime : null
  };
};

export {
  testEndpoint,
  findBestEndpoint,
  runMobileNetworkDiagnostic
}; 