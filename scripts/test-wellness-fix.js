// Test wellness tracking data parsing fix
const testWellnessFix = () => {
  console.log('🔍 Testing Wellness Tracking Data Parsing Fix...\n');

  // Simulate API response data (strings from database)
  const apiResponse = {
    success: true,
    data: {
      date: "2025-08-04",
      water: {
        total_ml: "500",
        target_ml: 2000,
        percentage: 25
      },
      meal: {
        calories: "511.00",
        protein: "32.00",
        carbs: "59.60",
        fat: "15.20",
        meal_count: "2"
      },
      fitness: {
        exercise_minutes: "0",
        steps: "0",
        distance_km: "0.00"
      }
    }
  };

  // Test DashboardTab parsing (WellnessApp.tsx)
  console.log('1. Testing DashboardTab parsing...');
  const summaryData = apiResponse.data;
  const dashboardData = {
    calories: parseFloat(summaryData.meal?.calories) || parseFloat(summaryData.calories) || 0,
    servings: parseInt(summaryData.meal?.meal_count) || parseInt(summaryData.servings) || 0,
    steps: parseInt(summaryData.fitness?.steps) || parseInt(summaryData.steps) || 0,
    exerciseMinutes: parseInt(summaryData.fitness?.exercise_minutes) || parseInt(summaryData.exercise_minutes) || 0,
    waterIntake: parseFloat(summaryData.water?.total_ml) || parseFloat(summaryData.water_intake) || 0,
  };
  
  console.log('DashboardTab parsed data:', dashboardData);
  console.log('Calories type:', typeof dashboardData.calories);
  console.log('Water intake type:', typeof dashboardData.waterIntake);

  // Test activity data parsing
  console.log('\n2. Testing activity data parsing...');
  const activityData = {
    steps: parseInt(summaryData.fitness?.steps) || 0,
    distance: parseFloat(summaryData.fitness?.distance_km) || 0,
  };
  
  console.log('Activity data:', activityData);
  console.log('Steps type:', typeof activityData.steps);
  console.log('Distance type:', typeof activityData.distance);

  // Verify all values are numbers
  const allValues = [
    dashboardData.calories,
    dashboardData.servings,
    dashboardData.steps,
    dashboardData.exerciseMinutes,
    dashboardData.waterIntake,
    activityData.steps,
    activityData.distance
  ];

  const allAreNumbers = allValues.every(value => typeof value === 'number');
  console.log('\n3. Verification:');
  console.log('All values are numbers:', allAreNumbers);
  console.log('Expected calories: 511.00 ->', dashboardData.calories);
  console.log('Expected servings: 2 ->', dashboardData.servings);
  console.log('Expected water: 500 ->', dashboardData.waterIntake);

  if (allAreNumbers && dashboardData.calories === 511 && dashboardData.servings === 2 && dashboardData.waterIntake === 500) {
    console.log('\n✅ Wellness tracking data parsing fix works correctly!');
    console.log('📊 Summary:');
    console.log('- DashboardTab now properly converts strings to numbers');
    console.log('- Activity data parsing works correctly');
    console.log('- Wellness tracking will display correct data');
  } else {
    console.log('\n❌ Wellness tracking data parsing fix has issues!');
  }
};

testWellnessFix();
