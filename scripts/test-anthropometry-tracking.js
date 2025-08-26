const mysql = require('mysql2/promise');

async function testAnthropometryTracking() {
  console.log('🧪 Testing Anthropometry Tracking Integration...\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'dash.doctorphc.id',
      user: 'root',
      password: 'try.sql',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Test 1: Check if anthropometry_progress table exists and has data
    console.log('\n📋 Test 1: Checking anthropometry_progress table...');
    const [progressData] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as unique_users,
        MIN(measured_date) as earliest_date,
        MAX(measured_date) as latest_date
      FROM anthropometry_progress
    `);

    console.log('Anthropometry Progress Summary:');
    console.log(`  Total Records: ${progressData[0].total_records}`);
    console.log(`  Unique Users: ${progressData[0].unique_users}`);
    console.log(`  Date Range: ${progressData[0].earliest_date} to ${progressData[0].latest_date}`);

    // Test 2: Check sample data structure
    console.log('\n📊 Test 2: Checking sample data structure...');
    const [sampleData] = await connection.execute(`
      SELECT 
        id, user_id, weight, height, bmi, bmi_category, 
        measured_date, created_at, updated_at
      FROM anthropometry_progress 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    console.log('Sample Data Structure:');
    sampleData.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    ID: ${record.id}`);
      console.log(`    User ID: ${record.user_id}`);
      console.log(`    Weight: ${record.weight} kg`);
      console.log(`    Height: ${record.height} cm`);
      console.log(`    BMI: ${record.bmi}`);
      console.log(`    Category: ${record.bmi_category}`);
      console.log(`    Date: ${record.measured_date}`);
    });

    // Test 3: Check API endpoint simulation
    console.log('\n🔗 Test 3: Simulating API endpoint call...');
    const testUserId = 1;
    const testDate = '2025-01-20';
    
    const [apiData] = await connection.execute(`
      SELECT 
        ap.id,
        ap.user_id,
        ap.weight,
        ap.height,
        ap.bmi,
        ap.bmi_category,
        ap.notes,
        ap.measured_date,
        ap.created_at,
        ap.updated_at,
        aid.initial_weight,
        aid.initial_height,
        CASE 
          WHEN aid.initial_weight IS NOT NULL AND ap.weight IS NOT NULL 
          THEN ap.weight - aid.initial_weight 
          ELSE NULL 
        END as weight_change,
        CASE 
          WHEN aid.initial_weight IS NOT NULL AND ap.weight IS NOT NULL AND aid.initial_weight > 0
          THEN ((ap.weight - aid.initial_weight) / aid.initial_weight) * 100
          ELSE NULL 
        END as weight_change_percentage,
        CASE 
          WHEN aid.initial_weight IS NOT NULL AND aid.initial_height IS NOT NULL AND ap.bmi IS NOT NULL
          THEN ap.bmi - (aid.initial_weight / POWER(aid.initial_height / 100, 2))
          ELSE NULL 
        END as bmi_change
      FROM anthropometry_progress ap
      LEFT JOIN anthropometry_initial_data aid ON ap.user_id = aid.user_id
      WHERE ap.user_id = ? AND ap.measured_date = ?
      ORDER BY ap.measured_date DESC
    `, [testUserId, testDate]);

    console.log(`API Response for User ${testUserId} on ${testDate}:`);
    if (apiData.length > 0) {
      apiData.forEach((record, index) => {
        console.log(`  Entry ${index + 1}:`);
        console.log(`    Weight: ${record.weight} kg`);
        console.log(`    Height: ${record.height} cm`);
        console.log(`    BMI: ${record.bmi}`);
        console.log(`    Category: ${record.bmi_category}`);
        console.log(`    Weight Change: ${record.weight_change} kg`);
        console.log(`    Weight Change %: ${record.weight_change_percentage}%`);
        console.log(`    BMI Change: ${record.bmi_change}`);
      });
    } else {
      console.log('  No data found for the specified date');
    }

    // Test 4: Check tracking history integration
    console.log('\n📈 Test 4: Checking tracking history integration...');
    const [trackingData] = await connection.execute(`
      SELECT 
        'anthropometry' as tracking_type,
        COUNT(*) as entry_count,
        COUNT(DISTINCT user_id) as user_count,
        MIN(measured_date) as earliest_date,
        MAX(measured_date) as latest_date
      FROM anthropometry_progress
      UNION ALL
      SELECT 
        'mood' as tracking_type,
        COUNT(*) as entry_count,
        COUNT(DISTINCT user_id) as user_count,
        MIN(tracking_date) as earliest_date,
        MAX(tracking_date) as latest_date
      FROM mood_tracking
      UNION ALL
      SELECT 
        'water' as tracking_type,
        COUNT(*) as entry_count,
        COUNT(DISTINCT user_id) as user_count,
        MIN(tracking_date) as earliest_date,
        MAX(tracking_date) as latest_date
      FROM water_tracking
      UNION ALL
      SELECT 
        'fitness' as tracking_type,
        COUNT(*) as entry_count,
        COUNT(DISTINCT user_id) as user_count,
        MIN(tracking_date) as earliest_date,
        MAX(tracking_date) as latest_date
      FROM fitness_tracking
    `);

    console.log('Tracking History Integration Summary:');
    trackingData.forEach(record => {
      console.log(`  ${record.tracking_type}:`);
      console.log(`    Entries: ${record.entry_count}`);
      console.log(`    Users: ${record.user_count}`);
      console.log(`    Date Range: ${record.earliest_date} to ${record.latest_date}`);
    });

    await connection.end();
    console.log('\n✅ Anthropometry tracking integration test completed successfully!');

  } catch (error) {
    console.error('❌ Error during anthropometry tracking test:', error);
  }
}

// Run the test
testAnthropometryTracking();
