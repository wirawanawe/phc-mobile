#!/usr/bin/env node

/**
 * Test Script: Graph Tab Data Mapping
 * 
 * This script tests the data mapping logic used in ActivityGraphScreen
 * to ensure it correctly processes API data for the Graph tab.
 */

// Simulate the API response data
const mockApiResponse = {
  success: true,
  data: {
    period: {
      start_date: "2025-08-13",
      end_date: "2025-08-19",
      days: 7
    },
    weekly_totals: {
      calories: 0,
      water_ml: 2400,
      steps: 5000,
      exercise_minutes: 30,
      distance_km: 5,
      sleep_hours: 0,
      meal_count: 2,
      days_with_activity: 4
    },
    weekly_averages: {
      calories_per_day: 0,
      water_ml_per_day: 600,
      steps_per_day: 1250,
      exercise_minutes_per_day: 8,
      distance_km_per_day: 5,
      sleep_hours_per_day: 0
    },
    wellness_score: 17,
    daily_breakdown: {
      nutrition: [
        {
          date: "2025-08-18T17:00:00.000Z",
          total_calories: "0.00",
          meal_count: 2
        }
      ],
      water: [
        {
          date: "2025-08-17T17:00:00.000Z",
          total_ml: "1700",
          entries: 4
        },
        {
          date: "2025-08-18T17:00:00.000Z",
          total_ml: "700",
          entries: 2
        }
      ],
      fitness: [
        {
          date: "2025-08-18T17:00:00.000Z",
          total_steps: "5000",
          total_exercise_minutes: "30",
          total_distance_km: "5.00"
        }
      ],
      sleep: [],
      mood: []
    }
  }
};

function testDataMapping() {
  console.log('🧪 Testing Graph Tab Data Mapping...\n');

  // Simulate the date generation logic
  const end = new Date();
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  console.log('📅 Generated dates:', dates);

  // Simulate the data mapping logic from ActivityGraphScreen
  const fitnessByDate = {};
  const waterByDate = {};
  const sleepByDate = {};
  const caloriesByDate = {};
  const moodByDate = {};

  if (mockApiResponse.success && mockApiResponse.data && mockApiResponse.data.daily_breakdown) {
    const breakdown = mockApiResponse.data.daily_breakdown;
    const fitness = breakdown.fitness || [];
    const water = breakdown.water || [];
    const sleep = breakdown.sleep || [];
    const nutrition = breakdown.nutrition || [];
    const mood = breakdown.mood || [];

    console.log('\n📊 Processing fitness data...');
    fitness.forEach((row) => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      fitnessByDate[dateKey] = {
        steps: Number(row.total_steps || 0),
        exercise_minutes: Number(row.total_exercise_minutes || 0),
      };
      console.log(`   ${dateKey}: ${fitnessByDate[dateKey].steps} steps, ${fitnessByDate[dateKey].exercise_minutes} min`);
    });

    console.log('\n💧 Processing water data...');
    water.forEach((row) => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      waterByDate[dateKey] = Number(row.total_ml || 0);
      console.log(`   ${dateKey}: ${waterByDate[dateKey]} ml`);
    });

    console.log('\n🍽️ Processing nutrition data...');
    nutrition.forEach((row) => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      caloriesByDate[dateKey] = Number(row.total_calories || 0);
      console.log(`   ${dateKey}: ${caloriesByDate[dateKey]} calories`);
    });

    console.log('\n😴 Processing sleep data...');
    sleep.forEach((row) => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      sleepByDate[dateKey] = Number(row.total_hours || 0);
      console.log(`   ${dateKey}: ${sleepByDate[dateKey]} hours`);
    });

    console.log('\n😊 Processing mood data...');
    mood.forEach((row) => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      moodByDate[dateKey] = Number(row.avg_mood_score || 0);
      console.log(`   ${dateKey}: ${moodByDate[dateKey]} score`);
    });
  }

  // Generate the final weekly data
  console.log('\n📈 Generating final weekly data...');
  const realData = dates.map((date) => {
    const fitness = fitnessByDate[date] || { steps: 0, exercise_minutes: 0 };
    const data = {
      date,
      steps: fitness.steps,
      waterIntake: waterByDate[date] ?? 0,
      sleepHours: sleepByDate[date] ?? 0,
      moodScore: moodByDate[date] ?? 0,
      exerciseMinutes: fitness.exercise_minutes,
      calories: caloriesByDate[date] ?? 0,
    };
    console.log(`   ${date}: ${data.steps} steps, ${data.waterIntake} ml, ${data.exerciseMinutes} min`);
    return data;
  });

  // Test specific chart types
  console.log('\n🎯 Testing chart data extraction...');
  
  const chartTypes = ['steps', 'water', 'sleep', 'mood', 'exercise', 'calories'];
  chartTypes.forEach(chartType => {
    const data = realData.map(item => {
      switch (chartType) {
        case 'steps': return item.steps;
        case 'water': return item.waterIntake;
        case 'sleep': return item.sleepHours;
        case 'mood': return item.moodScore;
        case 'exercise': return item.exerciseMinutes;
        case 'calories': return item.calories;
        default: return item.steps;
      }
    });
    
    const maxValue = Math.max(...data);
    const hasData = maxValue > 0;
    
    console.log(`   ${chartType}: ${hasData ? '✅' : '❌'} ${hasData ? `Max: ${maxValue}` : 'No data'}`);
  });

  console.log('\n🎉 Data mapping test completed!');
  console.log('📱 The Graph tab should now display the correct data from the database.');
}

// Run the test
testDataMapping();
