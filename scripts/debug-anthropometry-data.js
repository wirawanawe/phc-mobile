const mysql = require('mysql2/promise');

async function debugAnthropometryData() {
  console.log('🔍 Debugging Anthropometry Data Structure...\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'try.sql',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Test 1: Check anthropometry_progress table structure
    console.log('\n📋 Test 1: Checking anthropometry_progress table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE anthropometry_progress
    `);

    console.log('Table Structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} (${col.Null})`);
    });

    // Test 2: Check sample data
    console.log('\n📊 Test 2: Checking sample data...');
    const [sampleData] = await connection.execute(`
      SELECT * FROM anthropometry_progress LIMIT 3
    `);

    console.log('Sample Data:');
    sampleData.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    ID: ${record.id}`);
      console.log(`    User ID: ${record.user_id}`);
      console.log(`    Weight: ${record.weight} (type: ${typeof record.weight})`);
      console.log(`    Height: ${record.height} (type: ${typeof record.height})`);
      console.log(`    BMI: ${record.bmi} (type: ${typeof record.bmi})`);
      console.log(`    BMI Category: ${record.bmi_category} (type: ${typeof record.bmi_category})`);
      console.log(`    Measured Date: ${record.measured_date} (type: ${typeof record.measured_date})`);
      console.log(`    Notes: ${record.notes}`);
    });

    // Test 3: Check for null values
    console.log('\n⚠️ Test 3: Checking for null values...');
    const [nullCheck] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN weight IS NULL THEN 1 ELSE 0 END) as null_weight,
        SUM(CASE WHEN height IS NULL THEN 1 ELSE 0 END) as null_height,
        SUM(CASE WHEN bmi IS NULL THEN 1 ELSE 0 END) as null_bmi,
        SUM(CASE WHEN bmi_category IS NULL THEN 1 ELSE 0 END) as null_category
      FROM anthropometry_progress
    `);

    console.log('Null Value Check:');
    console.log(`  Total Records: ${nullCheck[0].total_records}`);
    console.log(`  Null Weight: ${nullCheck[0].null_weight}`);
    console.log(`  Null Height: ${nullCheck[0].null_height}`);
    console.log(`  Null BMI: ${nullCheck[0].null_bmi}`);
    console.log(`  Null Category: ${nullCheck[0].null_category}`);

    // Test 4: Check data types
    console.log('\n🔧 Test 4: Checking data types...');
    const [typeCheck] = await connection.execute(`
      SELECT 
        weight,
        height,
        bmi,
        bmi_category,
        measured_date,
        CASE 
          WHEN weight IS NOT NULL THEN 
            CASE 
              WHEN weight REGEXP '^[0-9]+\.?[0-9]*$' THEN 'numeric'
              ELSE 'non-numeric'
            END
          ELSE 'null'
        END as weight_type,
        CASE 
          WHEN height IS NOT NULL THEN 
            CASE 
              WHEN height REGEXP '^[0-9]+\.?[0-9]*$' THEN 'numeric'
              ELSE 'non-numeric'
            END
          ELSE 'null'
        END as height_type,
        CASE 
          WHEN bmi IS NOT NULL THEN 
            CASE 
              WHEN bmi REGEXP '^[0-9]+\.?[0-9]*$' THEN 'numeric'
              ELSE 'non-numeric'
            END
          ELSE 'null'
        END as bmi_type
      FROM anthropometry_progress 
      LIMIT 5
    `);

    console.log('Data Type Check:');
    typeCheck.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    Weight: ${record.weight} (${record.weight_type})`);
      console.log(`    Height: ${record.height} (${record.height_type})`);
      console.log(`    BMI: ${record.bmi} (${record.bmi_type})`);
    });

    // Test 5: Simulate API response
    console.log('\n🔗 Test 5: Simulating API response...');
    const [apiResponse] = await connection.execute(`
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
      WHERE ap.user_id = 1
      ORDER BY ap.measured_date DESC
      LIMIT 1
    `);

    console.log('API Response Structure:');
    if (apiResponse.length > 0) {
      const record = apiResponse[0];
      console.log('  {');
      console.log(`    id: ${record.id} (${typeof record.id})`);
      console.log(`    user_id: ${record.user_id} (${typeof record.user_id})`);
      console.log(`    weight: ${record.weight} (${typeof record.weight})`);
      console.log(`    height: ${record.height} (${typeof record.height})`);
      console.log(`    bmi: ${record.bmi} (${typeof record.bmi})`);
      console.log(`    bmi_category: ${record.bmi_category} (${typeof record.bmi_category})`);
      console.log(`    measured_date: ${record.measured_date} (${typeof record.measured_date})`);
      console.log(`    weight_change: ${record.weight_change} (${typeof record.weight_change})`);
      console.log(`    weight_change_percentage: ${record.weight_change_percentage} (${typeof record.weight_change_percentage})`);
      console.log(`    bmi_change: ${record.bmi_change} (${typeof record.bmi_change})`);
      console.log('  }');
    } else {
      console.log('  No data found');
    }

    await connection.end();
    console.log('\n✅ Anthropometry data debugging completed!');

  } catch (error) {
    console.error('❌ Error during anthropometry data debugging:', error);
  }
}

// Run the debug
debugAnthropometryData();
