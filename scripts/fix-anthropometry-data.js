const mysql = require('mysql2/promise');

async function fixAnthropometryData() {
  console.log('🔧 Fixing Anthropometry Data Issues...\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'try.sql',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Check current data
    console.log('\n📊 Checking current anthropometry data...');
    const [currentData] = await connection.execute(`
      SELECT 
        id, user_id, weight, height, bmi, bmi_category, 
        measured_date, notes,
        typeof(weight) as weight_type,
        typeof(height) as height_type,
        typeof(bmi) as bmi_type
      FROM anthropometry_progress 
      ORDER BY measured_date DESC
      LIMIT 5
    `);

    console.log('Current Data Analysis:');
    currentData.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    ID: ${record.id}`);
      console.log(`    Weight: ${record.weight} (${record.weight_type})`);
      console.log(`    Height: ${record.height} (${record.height_type})`);
      console.log(`    BMI: ${record.bmi} (${record.bmi_type})`);
      console.log(`    Category: ${record.bmi_category}`);
      console.log(`    Date: ${record.measured_date}`);
    });

    // Fix data types if needed
    console.log('\n🔧 Fixing data types...');
    
    // Update weight to numeric if it's string
    await connection.execute(`
      UPDATE anthropometry_progress 
      SET weight = CAST(weight AS DECIMAL(5,2))
      WHERE weight IS NOT NULL AND weight != '' AND weight REGEXP '^[0-9]+\.?[0-9]*$'
    `);
    console.log('✅ Weight data types fixed');

    // Update height to numeric if it's string
    await connection.execute(`
      UPDATE anthropometry_progress 
      SET height = CAST(height AS DECIMAL(5,2))
      WHERE height IS NOT NULL AND height != '' AND height REGEXP '^[0-9]+\.?[0-9]*$'
    `);
    console.log('✅ Height data types fixed');

    // Update BMI to numeric if it's string
    await connection.execute(`
      UPDATE anthropometry_progress 
      SET bmi = CAST(bmi AS DECIMAL(4,2))
      WHERE bmi IS NOT NULL AND bmi != '' AND bmi REGEXP '^[0-9]+\.?[0-9]*$'
    `);
    console.log('✅ BMI data types fixed');

    // Add sample data if table is empty
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as count FROM anthropometry_progress
    `);

    if (countResult[0].count === 0) {
      console.log('\n➕ Adding sample data...');
      
      const sampleData = [
        {
          user_id: 1,
          weight: 75.5,
          height: 170.0,
          bmi: 26.1,
          bmi_category: 'Gemuk',
          notes: 'Pengukuran awal',
          measured_date: '2025-08-20'
        },
        {
          user_id: 1,
          weight: 74.8,
          height: 170.0,
          bmi: 25.9,
          bmi_category: 'Gemuk',
          notes: 'Setelah olahraga',
          measured_date: '2025-08-21'
        },
        {
          user_id: 1,
          weight: 73.2,
          height: 170.0,
          bmi: 25.3,
          bmi_category: 'Gemuk',
          notes: 'Progress penurunan berat',
          measured_date: '2025-08-22'
        }
      ];

      for (const data of sampleData) {
        await connection.execute(`
          INSERT INTO anthropometry_progress 
          (user_id, weight, height, bmi, bmi_category, notes, measured_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          weight = VALUES(weight),
          height = VALUES(height),
          bmi = VALUES(bmi),
          bmi_category = VALUES(bmi_category),
          notes = VALUES(notes),
          updated_at = CURRENT_TIMESTAMP
        `, [
          data.user_id,
          data.weight,
          data.height,
          data.bmi,
          data.bmi_category,
          data.notes,
          data.measured_date
        ]);
      }
      console.log('✅ Sample data added');
    }

    // Verify fixed data
    console.log('\n📊 Verifying fixed data...');
    const [fixedData] = await connection.execute(`
      SELECT 
        id, user_id, weight, height, bmi, bmi_category, 
        measured_date, notes,
        typeof(weight) as weight_type,
        typeof(height) as height_type,
        typeof(bmi) as bmi_type
      FROM anthropometry_progress 
      ORDER BY measured_date DESC
      LIMIT 5
    `);

    console.log('Fixed Data Analysis:');
    fixedData.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    ID: ${record.id}`);
      console.log(`    Weight: ${record.weight} (${record.weight_type})`);
      console.log(`    Height: ${record.height} (${record.height_type})`);
      console.log(`    BMI: ${record.bmi} (${record.bmi_type})`);
      console.log(`    Category: ${record.bmi_category}`);
      console.log(`    Date: ${record.measured_date}`);
    });

    // Test API response simulation
    console.log('\n🔗 Testing API response simulation...');
    const [apiTest] = await connection.execute(`
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
      WHERE ap.user_id = 1 AND ap.measured_date = '2025-08-21'
      ORDER BY ap.measured_date DESC
    `);

    console.log('API Response Test for 2025-08-21:');
    if (apiTest.length > 0) {
      const record = apiTest[0];
      console.log('  {');
      console.log(`    id: ${record.id}`);
      console.log(`    user_id: ${record.user_id}`);
      console.log(`    weight: ${record.weight} (${typeof record.weight})`);
      console.log(`    height: ${record.height} (${typeof record.height})`);
      console.log(`    bmi: ${record.bmi} (${typeof record.bmi})`);
      console.log(`    bmi_category: ${record.bmi_category}`);
      console.log(`    measured_date: ${record.measured_date}`);
      console.log(`    weight_change: ${record.weight_change}`);
      console.log(`    weight_change_percentage: ${record.weight_change_percentage}`);
      console.log(`    bmi_change: ${record.bmi_change}`);
      console.log('  }');
    } else {
      console.log('  No data found for 2025-08-21');
    }

    await connection.end();
    console.log('\n✅ Anthropometry data fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing anthropometry data:', error);
  }
}

// Run the fix
fixAnthropometryData();
