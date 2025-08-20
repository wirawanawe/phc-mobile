const mysql = require('mysql2/promise');

async function testAnthropometryAPI() {
  console.log('🧪 Testing Anthropometry API...\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'try.sql',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Test 1: Check if health_data table supports new anthropometry types
    console.log('\n📋 Test 1: Checking health_data table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
        AND TABLE_NAME = 'health_data' 
        AND COLUMN_NAME = 'data_type'
    `);

    console.log('Health Data Table Structure:');
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.IS_NULLABLE})`);
    });

    // Test 2: Check current data types in use
    console.log('\n📊 Test 2: Checking current data types...');
    const [dataTypes] = await connection.execute(`
      SELECT data_type, COUNT(*) as count
      FROM health_data 
      GROUP BY data_type 
      ORDER BY count DESC
    `);

    console.log('Current Data Types:');
    dataTypes.forEach(dt => {
      console.log(`  ${dt.data_type}: ${dt.count} records`);
    });

    // Test 3: Add sample anthropometry data
    console.log('\n➕ Test 3: Adding sample anthropometry data...');
    
    const sampleData = [
      { user_id: 1, data_type: 'weight', value: 70.5, unit: 'kg', notes: 'Pengukuran berat badan pagi' },
      { user_id: 1, data_type: 'height', value: 170.0, unit: 'cm', notes: 'Pengukuran tinggi badan' }
    ];

    for (const data of sampleData) {
      try {
        await connection.execute(`
          INSERT INTO health_data (user_id, data_type, value, unit, notes, measured_at, source, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), 'manual', NOW(), NOW())
        `, [data.user_id, data.data_type, data.value, data.unit, data.notes]);
        
        console.log(`  ✅ Added ${data.data_type}: ${data.value} ${data.unit}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠️  ${data.data_type} already exists for user ${data.user_id}`);
        } else {
          console.log(`  ❌ Error adding ${data.data_type}: ${error.message}`);
        }
      }
    }

    // Test 4: Calculate and verify BMI
    console.log('\n🧮 Test 4: Calculating BMI...');
    const [bmiData] = await connection.execute(`
      SELECT 
        w.value as weight,
        h.value as height,
        ROUND(w.value / POWER(h.value / 100, 2), 2) as calculated_bmi
      FROM health_data w
      JOIN health_data h ON w.user_id = h.user_id 
        AND w.data_type = 'weight' 
        AND h.data_type = 'height'
      WHERE w.user_id = 1
      ORDER BY w.measured_at DESC, h.measured_at DESC
      LIMIT 1
    `);

    if (bmiData.length > 0) {
      const bmi = bmiData[0];
      console.log(`  Weight: ${bmi.weight} kg`);
      console.log(`  Height: ${bmi.height} cm`);
      console.log(`  Calculated BMI: ${bmi.calculated_bmi} kg/m²`);
      
      // Add BMI to database
      try {
        await connection.execute(`
          INSERT INTO health_data (user_id, data_type, value, unit, notes, measured_at, source, created_at, updated_at)
          VALUES (?, 'bmi', ?, 'kg/m²', 'Dihitung otomatis dari berat dan tinggi badan', NOW(), 'manual', NOW(), NOW())
        `, [1, bmi.calculated_bmi]);
        console.log(`  ✅ BMI saved to database`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠️  BMI already exists for today`);
        } else {
          console.log(`  ❌ Error saving BMI: ${error.message}`);
        }
      }
    }

    // Test 5: Verify all anthropometry data
    console.log('\n📈 Test 5: Verifying anthropometry data...');
    const [anthropometryData] = await connection.execute(`
      SELECT 
        data_type,
        value,
        unit,
        notes,
        measured_at
      FROM health_data 
      WHERE user_id = 1 
        AND data_type IN ('weight', 'height', 'bmi')
      ORDER BY data_type, measured_at DESC
    `);

    console.log('Anthropometry Data Summary:');
    const groupedData = {};
    anthropometryData.forEach(record => {
      if (!groupedData[record.data_type]) {
        groupedData[record.data_type] = [];
      }
      groupedData[record.data_type].push(record);
    });

    Object.keys(groupedData).forEach(dataType => {
      const records = groupedData[dataType];
      const latest = records[0];
      console.log(`  ${dataType}: ${latest.value} ${latest.unit} (${records.length} records)`);
    });

    // Test 6: Test API endpoint simulation
    console.log('\n🌐 Test 6: Simulating API endpoint...');
    
    // Simulate GET request
    const [apiData] = await connection.execute(`
      SELECT 
        id, user_id, data_type, value, unit, measured_at, notes, created_at, updated_at
      FROM health_data
      WHERE user_id = 1
        AND data_type IN ('weight', 'height', 'bmi')
      ORDER BY measured_at DESC
      LIMIT 50
    `);

    console.log(`API Response Simulation:`);
    console.log(`  Total records: ${apiData.length}`);
    console.log(`  Data types: ${[...new Set(apiData.map(d => d.data_type))].join(', ')}`);

    // Calculate summary statistics
    const summary = {
      total_entries: apiData.length,
      data_types: {},
      latest_entries: {}
    };

    // Group by data type
    const dataTypeGroups = {};
    apiData.forEach(entry => {
      if (!dataTypeGroups[entry.data_type]) {
        dataTypeGroups[entry.data_type] = [];
      }
      dataTypeGroups[entry.data_type].push(entry);
    });

    // Calculate statistics for each data type
    Object.keys(dataTypeGroups).forEach(dataType => {
      const entries = dataTypeGroups[dataType];
      const values = entries.map(e => parseFloat(e.value)).filter(v => !isNaN(v));
      
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        summary.data_types[dataType] = {
          count: entries.length,
          average: avg,
          min: min,
          max: max,
          unit: entries[0]?.unit || null,
        };

        // Get latest entry for this data type
        const latestEntry = entries[0];
        summary.latest_entries[dataType] = {
          value: latestEntry.value,
          unit: latestEntry.unit,
          measured_at: latestEntry.measured_at,
        };
      }
    });

    console.log('\nSummary Statistics:');
    Object.keys(summary.latest_entries).forEach(dataType => {
      const entry = summary.latest_entries[dataType];
      const stats = summary.data_types[dataType];
      console.log(`  ${dataType}: ${entry.value} ${entry.unit} (avg: ${stats.average.toFixed(2)}, min: ${stats.min}, max: ${stats.max})`);
    });

    await connection.end();
    console.log('\n✅ Anthropometry API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAnthropometryAPI();
