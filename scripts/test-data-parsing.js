// Test data parsing fixes for today summary
const testDataParsing = () => {
  console.log('🔍 Testing Data Parsing Fixes...\n');

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

  // Test MainScreen parsing
  console.log('1. Testing MainScreen parsing...');
  const summaryData = apiResponse.data;
  const mainScreenData = {
    calories: parseFloat(summaryData.meal?.calories) || parseFloat(summaryData.calories) || 0,
    servings: parseInt(summaryData.meal?.meal_count) || parseInt(summaryData.servings) || 0,
    steps: parseInt(summaryData.fitness?.steps) || parseInt(summaryData.steps) || 0,
    exerciseMinutes: parseInt(summaryData.fitness?.exercise_minutes) || parseInt(summaryData.exercise_minutes) || 0,
    distance: parseFloat(summaryData.fitness?.distance_km) || 0,
  };
  
  console.log('MainScreen parsed data:', mainScreenData);
  console.log('Calories type:', typeof mainScreenData.calories);
  console.log('Steps type:', typeof mainScreenData.steps);

  // Test TodaySummaryCard parsing
  console.log('\n2. Testing TodaySummaryCard parsing...');
  const mealData = summaryData.meal;
  const waterData = summaryData.water;
  const fitnessData = summaryData.fitness;
  
  const todaySummaryData = {
    calories: parseFloat(mealData?.calories) || parseFloat(mealData?.total_calories) || 0,
    waterIntake: parseFloat(waterData?.total_ml) || parseFloat(waterData?.total_water_ml) || parseFloat(waterData?.total_intake) || 0,
    exerciseMinutes: parseInt(fitnessData?.exercise_minutes) || parseInt(fitnessData?.duration_minutes) || 0,
    distance: parseFloat(fitnessData?.distance_km) || 0,
    steps: parseInt(fitnessData?.steps) || 0,
  };
  
  console.log('TodaySummaryCard parsed data:', todaySummaryData);
  console.log('Water intake type:', typeof todaySummaryData.waterIntake);
  console.log('Exercise minutes type:', typeof todaySummaryData.exerciseMinutes);

  // Verify all values are numbers
  const allValues = [
    mainScreenData.calories,
    mainScreenData.servings,
    mainScreenData.steps,
    mainScreenData.exerciseMinutes,
    mainScreenData.distance,
    todaySummaryData.calories,
    todaySummaryData.waterIntake,
    todaySummaryData.exerciseMinutes,
    todaySummaryData.distance,
    todaySummaryData.steps
  ];

  const allAreNumbers = allValues.every(value => typeof value === 'number');
  console.log('\n3. Verification:');
  console.log('All values are numbers:', allAreNumbers);
  console.log('Expected calories: 511.00 ->', mainScreenData.calories);
  console.log('Expected servings: 2 ->', mainScreenData.servings);
  console.log('Expected water: 500 ->', todaySummaryData.waterIntake);

  if (allAreNumbers && mainScreenData.calories === 511 && mainScreenData.servings === 2 && todaySummaryData.waterIntake === 500) {
    console.log('\n✅ Data parsing fixes work correctly!');
  } else {
    console.log('\n❌ Data parsing fixes have issues!');
  }
};

testDataParsing();
