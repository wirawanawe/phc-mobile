const fs = require('fs');
const path = require('path');

// Update the meal tracking API route
function updateMealTrackingAPI() {
  console.log('🔧 Updating meal tracking API for single table...\n');
  
  const apiFile = 'dash-app/app/api/mobile/tracking/meal/route.js';
  
  if (!fs.existsSync(apiFile)) {
    console.log('⚠️  API file not found:', apiFile);
    return;
  }
  
  const newAPICode = `import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get meal tracking data
export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const user_id = searchParams.get("user_id");
    const date = searchParams.get("date");
    const meal_type = searchParams.get("meal_type"); // breakfast, lunch, dinner, snack
    const limit = searchParams.get("limit");
    const hours_ago = searchParams.get("hours_ago"); // Filter meals from last N hours

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    let sql = \`
      SELECT 
        id, user_id, meal_type, recorded_at, food_id, food_name, food_name_indonesian,
        quantity, unit, calories, protein, carbs, fat, notes, created_at
      FROM meal_logging
      WHERE user_id = ?
    \`;
    let params = [user_id];

    if (date) {
      sql += " AND DATE(recorded_at) = ?";
      params.push(date);
    }

    if (hours_ago) {
      const hours = parseInt(hours_ago);
      sql += " AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)";
      params.push(hours);
    }

    if (meal_type) {
      sql += " AND meal_type = ?";
      params.push(meal_type);
    }

    sql += " ORDER BY recorded_at DESC";

    // Add LIMIT if specified
    if (limit) {
      sql += \` LIMIT \${parseInt(limit)}\`;
    }

    const mealData = await query(sql, params);

    // Group by meal (same user_id, meal_type, recorded_at, notes)
    const groupedMeals = {};
    
    mealData.forEach(record => {
      const mealKey = \`\${record.user_id}_\${record.meal_type}_\${record.recorded_at}_\${record.notes || ''}\`;
      
      if (!groupedMeals[mealKey]) {
        groupedMeals[mealKey] = {
          id: record.id,
          user_id: record.user_id,
          meal_type: record.meal_type,
          recorded_at: record.recorded_at,
          notes: record.notes,
          created_at: record.created_at,
          foods: []
        };
      }
      
      // Add food item if it exists
      if (record.food_id) {
        groupedMeals[mealKey].foods.push({
          food_id: record.food_id,
          food_name: record.food_name,
          food_name_indonesian: record.food_name_indonesian,
          quantity: record.quantity,
          unit: record.unit,
          calories: record.calories,
          protein: record.protein,
          carbs: record.carbs,
          fat: record.fat
        });
      }
    });

    const result = Object.values(groupedMeals);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching meal tracking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data meal tracking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create meal tracking entry
export async function POST(request) {
  try {
    const {
      user_id,
      meal_type,
      foods,
      notes,
      recorded_at
    } = await request.json();

    // Debug logging
    console.log('🍽️ Received meal data:', {
      user_id,
      meal_type,
      foods_count: foods?.length,
      foods: foods,
      notes,
      recorded_at
    });

    if (!user_id || !meal_type || !foods || !Array.isArray(foods)) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID, meal type, dan foods array wajib diisi",
        },
        { status: 400 }
      );
    }

    try {
      // Format datetime for MySQL
      const formattedDate = recorded_at ? 
        new Date(recorded_at).toISOString().slice(0, 19).replace('T', ' ') : 
        new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Insert each food as a separate record in meal_logging
      const insertedIds = [];
      
      for (const food of foods) {
        // Validate and convert nutrition values
        const quantity = parseFloat(food.quantity) || 1;
        const calories = parseFloat(food.calories) || 0;
        const protein = parseFloat(food.protein) || 0;
        const carbs = parseFloat(food.carbs) || 0;
        const fat = parseFloat(food.fat) || 0;
        
        // Ensure values are not negative
        const validatedCalories = Math.max(0, calories);
        const validatedProtein = Math.max(0, protein);
        const validatedCarbs = Math.max(0, carbs);
        const validatedFat = Math.max(0, fat);
        
        // Get food name from food_database if food_id is provided
        let foodName = null;
        let foodNameIndonesian = null;
        
        if (food.food_id) {
          const [foodData] = await query(
            'SELECT name, name_indonesian FROM food_database WHERE id = ?',
            [food.food_id]
          );
          
          if (foodData.length > 0) {
            foodName = foodData[0].name;
            foodNameIndonesian = foodData[0].name_indonesian;
          }
        }
        
        const insertSQL = \`
          INSERT INTO meal_logging (
            user_id, meal_type, recorded_at, food_id, food_name, food_name_indonesian,
            quantity, unit, calories, protein, carbs, fat, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        \`;

        const result = await query(insertSQL, [
          user_id,
          meal_type,
          formattedDate,
          food.food_id || null,
          foodName,
          foodNameIndonesian,
          quantity,
          food.unit || 'serving',
          validatedCalories,
          validatedProtein,
          validatedCarbs,
          validatedFat,
          notes || null
        ]);

        insertedIds.push(result.insertId);

        // Debug logging for each food
        console.log('🍎 Saved food:', {
          id: result.insertId,
          user_id,
          meal_type,
          food_id: food.food_id,
          food_name: foodName,
          quantity,
          unit: food.unit || 'serving',
          calories: validatedCalories,
          protein: validatedProtein,
          carbs: validatedCarbs,
          fat: validatedFat
        });
      }

      return NextResponse.json({
        success: true,
        message: "Meal tracking entry created successfully",
        data: { ids: insertedIds },
      });
    } catch (error) {
      console.error("Error inserting meal data:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error creating meal tracking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat meal tracking entry",
        error: error.message,
      },
      { status: 500 }
    );
  }
}`;

  try {
    fs.writeFileSync(apiFile, newAPICode, 'utf8');
    console.log('✅ Updated meal tracking API route');
    return true;
  } catch (error) {
    console.error('❌ Error updating API file:', error);
    return false;
  }
}

// Update the meal summary API route
function updateMealSummaryAPI() {
  console.log('🔧 Updating meal summary API for single table...\n');
  
  const summaryFile = 'dash-app/app/api/mobile/tracking/meal/summary/route.js';
  
  if (!fs.existsSync(summaryFile)) {
    console.log('⚠️  Summary API file not found:', summaryFile);
    return;
  }
  
  const newSummaryCode = `import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const user_id = searchParams.get("user_id");
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Get nutrition summary for the specified date
    const summarySQL = \`
      SELECT 
        meal_type,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        COUNT(*) as food_count
      FROM meal_logging
      WHERE user_id = ? AND DATE(recorded_at) = ?
      GROUP BY meal_type
    \`;

    const summaryData = await query(summarySQL, [user_id, date]);

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meal_count: 0,
      food_count: 0
    };

    const mealsByType = {};

    summaryData.forEach(meal => {
      totals.calories += parseFloat(meal.total_calories) || 0;
      totals.protein += parseFloat(meal.total_protein) || 0;
      totals.carbs += parseFloat(meal.total_carbs) || 0;
      totals.fat += parseFloat(meal.total_fat) || 0;
      totals.food_count += parseInt(meal.food_count) || 0;
      totals.meal_count++;

      mealsByType[meal.meal_type] = {
        calories: parseFloat(meal.total_calories) || 0,
        protein: parseFloat(meal.total_protein) || 0,
        carbs: parseFloat(meal.total_carbs) || 0,
        fat: parseFloat(meal.total_fat) || 0,
        food_count: parseInt(meal.food_count) || 0
      };
    });

    // Recommended daily values (can be customized based on user profile)
    const recommended = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65
    };

    // Calculate percentages
    const percentages = {
      calories: Math.round((totals.calories / recommended.calories) * 100),
      protein: Math.round((totals.protein / recommended.protein) * 100),
      carbs: Math.round((totals.carbs / recommended.carbs) * 100),
      fat: Math.round((totals.fat / recommended.fat) * 100)
    };

    return NextResponse.json({
      success: true,
      data: {
        date,
        totals,
        meals_by_type: mealsByType,
        recommended,
        percentages,
        meal_types: Object.keys(mealsByType)
      }
    });
  } catch (error) {
    console.error("Error fetching meal summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil summary meal tracking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}`;

  try {
    fs.writeFileSync(summaryFile, newSummaryCode, 'utf8');
    console.log('✅ Updated meal summary API route');
    return true;
  } catch (error) {
    console.error('❌ Error updating summary API file:', error);
    return false;
  }
}

// Update the today's meals API route
function updateTodayMealsAPI() {
  console.log('🔧 Updating today meals API for single table...\n');
  
  const todayFile = 'dash-app/app/api/mobile/tracking/meal/today/route.js';
  
  if (!fs.existsSync(todayFile)) {
    console.log('⚠️  Today meals API file not found:', todayFile);
    return;
  }
  
  const newTodayCode = `import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's meals
    const mealsSQL = \`
      SELECT 
        id, user_id, meal_type, recorded_at, food_id, food_name, food_name_indonesian,
        quantity, unit, calories, protein, carbs, fat, notes, created_at
      FROM meal_logging
      WHERE user_id = ? AND DATE(recorded_at) = ?
      ORDER BY recorded_at DESC
    \`;

    const mealData = await query(mealsSQL, [user_id, today]);

    // Group by meal (same user_id, meal_type, recorded_at, notes)
    const groupedMeals = {};
    
    mealData.forEach(record => {
      const mealKey = \`\${record.user_id}_\${record.meal_type}_\${record.recorded_at}_\${record.notes || ''}\`;
      
      if (!groupedMeals[mealKey]) {
        groupedMeals[mealKey] = {
          id: record.id,
          user_id: record.user_id,
          meal_type: record.meal_type,
          recorded_at: record.recorded_at,
          notes: record.notes,
          created_at: record.created_at,
          foods: []
        };
      }
      
      // Add food item if it exists
      if (record.food_id) {
        groupedMeals[mealKey].foods.push({
          food_id: record.food_id,
          food_name: record.food_name,
          food_name_indonesian: record.food_name_indonesian,
          quantity: record.quantity,
          unit: record.unit,
          calories: record.calories,
          protein: record.protein,
          carbs: record.carbs,
          fat: record.fat
        });
      }
    });

    const result = Object.values(groupedMeals);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching today's meals:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data meal hari ini",
        error: error.message,
      },
      { status: 500 }
    );
  }
}`;

  try {
    fs.writeFileSync(todayFile, newTodayCode, 'utf8');
    console.log('✅ Updated today meals API route');
    return true;
  } catch (error) {
    console.error('❌ Error updating today meals API file:', error);
    return false;
  }
}

function main() {
  console.log('🔧 Updating API routes for single meal_logging table...\n');
  
  let successCount = 0;
  
  // Update main meal tracking API
  if (updateMealTrackingAPI()) successCount++;
  
  // Update meal summary API
  if (updateMealSummaryAPI()) successCount++;
  
  // Update today meals API
  if (updateTodayMealsAPI()) successCount++;
  
  console.log(`\n✅ API update completed! ${successCount}/3 files updated`);
  console.log('\n📋 Updated API endpoints:');
  console.log('   - GET /api/mobile/tracking/meal - Get meal data');
  console.log('   - POST /api/mobile/tracking/meal - Create meal entry');
  console.log('   - GET /api/mobile/tracking/meal/summary - Get nutrition summary');
  console.log('   - GET /api/mobile/tracking/meal/today - Get today\'s meals');
  console.log('\n🎯 All APIs now use the single meal_logging table!');
}

main();
