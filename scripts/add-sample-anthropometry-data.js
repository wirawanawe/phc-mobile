const mysql = require('mysql2/promise');

async function addSampleAnthropometryData() {
  console.log('➕ Adding Sample Anthropometry Data...\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'dash.doctorphc.id',
      user: 'root',
      password: 'try.sql',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Check if anthropometry_progress table exists
    console.log('\n📋 Checking anthropometry_progress table...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'anthropometry_progress'
    `);

    if (tables.length === 0) {
      console.log('❌ anthropometry_progress table does not exist');
      console.log('Creating table...');
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS anthropometry_progress (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          weight DECIMAL(5,2) NULL COMMENT 'Berat badan dalam kg',
          height DECIMAL(5,2) NULL COMMENT 'Tinggi badan dalam cm',
          bmi DECIMAL(4,2) NULL COMMENT 'BMI yang dihitung otomatis',
          bmi_category ENUM('Kurus', 'Normal', 'Gemuk', 'Obesitas') NULL COMMENT 'Kategori BMI',
          notes TEXT NULL COMMENT 'Catatan tambahan',
          measured_date DATE NOT NULL COMMENT 'Tanggal pengukuran',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_user_date (user_id, measured_date),
          INDEX idx_user_id (user_id),
          INDEX idx_measured_date (measured_date),
          
          FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE,
          
          UNIQUE KEY unique_user_date (user_id, measured_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ anthropometry_progress table created');
    } else {
      console.log('✅ anthropometry_progress table exists');
    }

    // Check if views exist
    console.log('\n📊 Checking database views...');
    try {
      await connection.execute(`
        CREATE OR REPLACE VIEW anthropometry_initial_data AS
        SELECT 
          hd.user_id,
          MAX(CASE WHEN hd.data_type = 'weight' THEN hd.value END) as initial_weight,
          MAX(CASE WHEN hd.data_type = 'height' THEN hd.value END) as initial_height,
          MAX(CASE WHEN hd.data_type = 'weight' THEN hd.measured_at END) as weight_date,
          MAX(CASE WHEN hd.data_type = 'height' THEN hd.measured_at END) as height_date
        FROM health_data hd
        WHERE hd.data_type IN ('weight', 'height')
        GROUP BY hd.user_id
      `);
      console.log('✅ anthropometry_initial_data view created/updated');
    } catch (error) {
      console.log('⚠️ Could not create view:', error.message);
    }

    // Check existing data
    console.log('\n📈 Checking existing data...');
    const [existingData] = await connection.execute(`
      SELECT COUNT(*) as count FROM anthropometry_progress
    `);
    console.log(`Existing records: ${existingData[0].count}`);

    if (existingData[0].count === 0) {
      console.log('\n➕ Adding sample anthropometry data...');
      
      // Add sample data for user 1
      const sampleData = [
        {
          user_id: 1,
          weight: 75.5,
          height: 170.0,
          bmi: 26.1,
          bmi_category: 'Gemuk',
          notes: 'Pengukuran awal',
          measured_date: '2025-01-20'
        },
        {
          user_id: 1,
          weight: 74.8,
          height: 170.0,
          bmi: 25.9,
          bmi_category: 'Gemuk',
          notes: 'Setelah olahraga',
          measured_date: '2025-01-21'
        },
        {
          user_id: 1,
          weight: 73.2,
          height: 170.0,
          bmi: 25.3,
          bmi_category: 'Gemuk',
          notes: 'Progress penurunan berat',
          measured_date: '2025-01-22'
        },
        {
          user_id: 1,
          weight: 72.0,
          height: 170.0,
          bmi: 24.9,
          bmi_category: 'Normal',
          notes: 'Target tercapai',
          measured_date: '2025-08-20'
        },
        {
          user_id: 1,
          weight: 71.5,
          height: 170.0,
          bmi: 24.7,
          bmi_category: 'Normal',
          notes: 'Pengukuran harian',
          measured_date: '2025-08-21'
        }
      ];

      for (const data of sampleData) {
        try {
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
          console.log(`✅ Added data for ${data.measured_date}: ${data.weight}kg, ${data.height}cm, BMI ${data.bmi}`);
        } catch (error) {
          console.log(`⚠️ Could not add data for ${data.measured_date}:`, error.message);
        }
      }
    } else {
      console.log('✅ Sample data already exists');
    }

    // Verify the data
    console.log('\n📊 Verifying data...');
    const [verificationData] = await connection.execute(`
      SELECT 
        id, user_id, weight, height, bmi, bmi_category, 
        measured_date, notes
      FROM anthropometry_progress 
      ORDER BY measured_date DESC
    `);

    console.log('Verification Results:');
    verificationData.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`);
      console.log(`    Date: ${record.measured_date}`);
      console.log(`    Weight: ${record.weight} kg`);
      console.log(`    Height: ${record.height} cm`);
      console.log(`    BMI: ${record.bmi}`);
      console.log(`    Category: ${record.bmi_category}`);
      console.log(`    Notes: ${record.notes}`);
    });

    await connection.end();
    console.log('\n✅ Sample anthropometry data added successfully!');

  } catch (error) {
    console.error('❌ Error adding sample anthropometry data:', error);
  }
}

// Run the script
addSampleAnthropometryData();
