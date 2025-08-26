const { query } = require('./lib/db.js');

async function clearTodayData() {
  try {
    console.log('🧹 Clearing today\'s data for user_id=1...');
    
    // Clear fitness data for today
    const fitnessResult = await query('DELETE FROM fitness_tracking WHERE user_id = 1 AND DATE(tracking_date) = CURDATE()');
    console.log('🏃‍♂️ Cleared fitness data:', fitnessResult.affectedRows, 'rows');
    
    // Clear mood data for today
    const moodResult = await query('DELETE FROM mood_tracking WHERE user_id = 1 AND DATE(tracking_date) = CURDATE()');
    console.log('😊 Cleared mood data:', moodResult.affectedRows, 'rows');
    
    // Clear meal data for today
    const mealResult = await query('DELETE FROM meal_logging WHERE user_id = 1 AND DATE(recorded_at) = CURDATE()');
    console.log('🍽️ Cleared meal data:', mealResult.affectedRows, 'rows');
    
    // Clear water data for today
    const waterResult = await query('DELETE FROM water_tracking WHERE user_id = 1 AND DATE(tracking_date) = CURDATE()');
    console.log('💧 Cleared water data:', waterResult.affectedRows, 'rows');
    
    // Clear sleep data for today
    const sleepResult = await query('DELETE FROM sleep_tracking WHERE user_id = 1 AND DATE(sleep_date) = CURDATE()');
    console.log('😴 Cleared sleep data:', sleepResult.affectedRows, 'rows');
    
    console.log('✅ Today\'s data cleared successfully!');
    console.log('📱 Now user_id=1 should show zero data like a new user.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

clearTodayData();
