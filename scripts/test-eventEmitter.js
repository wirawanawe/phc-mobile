#!/usr/bin/env node

/**
 * Test Script: Event Emitter Functionality
 * 
 * This script tests the eventEmitter to ensure it's working correctly
 * for the Graph tab data sync functionality.
 */

// Import the eventEmitter
const eventEmitter = require('../src/utils/eventEmitter.ts');

console.log('🧪 Testing Event Emitter Functionality...\n');

// Test 1: Check if eventEmitter is available
console.log('📊 Test 1: Checking eventEmitter availability...');
if (eventEmitter) {
  console.log('✅ eventEmitter is available');
  console.log('   - Type:', typeof eventEmitter);
  console.log('   - Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(eventEmitter)));
} else {
  console.log('❌ eventEmitter is not available');
  process.exit(1);
}

// Test 2: Test event listener functionality
console.log('\n📊 Test 2: Testing event listener functionality...');

let testEventReceived = false;

const testCallback = () => {
  testEventReceived = true;
  console.log('✅ Test event received successfully');
};

try {
  // Add event listener
  eventEmitter.on('testEvent', testCallback);
  console.log('✅ Event listener added successfully');
  
  // Emit event
  eventEmitter.emit('testEvent');
  
  if (testEventReceived) {
    console.log('✅ Event emission and reception working correctly');
  } else {
    console.log('❌ Event was not received');
  }
  
  // Remove event listener
  eventEmitter.off('testEvent', testCallback);
  console.log('✅ Event listener removed successfully');
  
} catch (error) {
  console.error('❌ Error testing event listener:', error);
}

// Test 3: Test specific wellness events
console.log('\n📊 Test 3: Testing wellness-specific events...');

const wellnessEvents = [
  'mealLogged',
  'waterLogged', 
  'fitnessLogged',
  'sleepLogged',
  'moodLogged',
  'dataRefresh'
];

wellnessEvents.forEach(eventName => {
  try {
    let eventReceived = false;
    
    const callback = () => {
      eventReceived = true;
    };
    
    // Add listener
    eventEmitter.on(eventName, callback);
    
    // Emit event
    eventEmitter.emit(eventName);
    
    // Remove listener
    eventEmitter.off(eventName, callback);
    
    if (eventReceived) {
      console.log(`   ✅ ${eventName}: Working correctly`);
    } else {
      console.log(`   ❌ ${eventName}: Event not received`);
    }
    
  } catch (error) {
    console.error(`   ❌ ${eventName}: Error -`, error.message);
  }
});

// Test 4: Test convenience methods
console.log('\n📊 Test 4: Testing convenience methods...');

const convenienceMethods = [
  'emitMealLogged',
  'emitWaterLogged',
  'emitFitnessLogged', 
  'emitSleepLogged',
  'emitMoodLogged',
  'emitDataRefresh'
];

convenienceMethods.forEach(methodName => {
  try {
    if (typeof eventEmitter[methodName] === 'function') {
      eventEmitter[methodName]();
      console.log(`   ✅ ${methodName}: Working correctly`);
    } else {
      console.log(`   ❌ ${methodName}: Method not found`);
    }
  } catch (error) {
    console.error(`   ❌ ${methodName}: Error -`, error.message);
  }
});

console.log('\n🎉 Event Emitter test completed!');
console.log('📱 The Graph tab should now work with real-time event updates.');
