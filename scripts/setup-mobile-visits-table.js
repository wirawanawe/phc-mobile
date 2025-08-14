const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupMobileVisitsTable() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'phc_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Connected to database');

    // Create mobile_visits table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS mobile_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        visit_date DATE NOT NULL,
        visit_time TIME NULL,
        visit_type VARCHAR(100) DEFAULT 'Konsultasi Umum',
        clinic_name VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        diagnosis TEXT NULL,
        treatment TEXT NULL,
        prescription JSON NULL,
        notes TEXT NULL,
        status ENUM('completed', 'scheduled', 'cancelled') DEFAULT 'completed',
        cost DECIMAL(10,2) DEFAULT 0.00,
        payment_status ENUM('paid', 'pending', 'unpaid') DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_visit_date (visit_date),
        INDEX idx_status (status),
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ mobile_visits table created successfully');

    // Check if sample data already exists
    const [existingData] = await connection.execute(
      'SELECT COUNT(*) as count FROM mobile_visits'
    );

    if (existingData[0].count === 0) {
      // Insert sample data
      const sampleData = [
        {
          user_id: 1,
          visit_date: '2024-03-15',
          visit_time: '09:00:00',
          visit_type: 'Konsultasi Umum',
          clinic_name: 'Klinik Sehat Jaya',
          doctor_name: 'Dr. Sarah Johnson',
          diagnosis: 'Hipertensi ringan',
          treatment: 'Pemantauan tekanan darah dan perubahan gaya hidup',
          prescription: JSON.stringify(['Amlodipine 5mg', 'Lifestyle modification']),
          notes: 'Pasien disarankan untuk mengurangi konsumsi garam dan olahraga teratur',
          status: 'completed',
          cost: 150000.00,
          payment_status: 'paid'
        },
        {
          user_id: 1,
          visit_date: '2024-02-28',
          visit_time: '14:30:00',
          visit_type: 'Pemeriksaan Rutin',
          clinic_name: 'Puskesmas Kota',
          doctor_name: 'Dr. Ahmad Rahman',
          diagnosis: 'Kolesterol tinggi',
          treatment: 'Diet rendah lemak dan olahraga',
          prescription: JSON.stringify(['Simvastatin 20mg', 'Omega-3 supplement']),
          notes: 'Kontrol dalam 3 bulan untuk evaluasi',
          status: 'completed',
          cost: 120000.00,
          payment_status: 'paid'
        },
        {
          user_id: 1,
          visit_date: '2024-04-10',
          visit_time: '10:15:00',
          visit_type: 'Pemeriksaan Gigi',
          clinic_name: 'Klinik Gigi Sejahtera',
          doctor_name: 'Dr. Maria Santos',
          diagnosis: 'Karies gigi',
          treatment: 'Penambalan gigi dan pembersihan karang',
          prescription: JSON.stringify(['Antibiotik (jika diperlukan)', 'Pasta gigi khusus']),
          notes: 'Kontrol 6 bulan untuk pembersihan rutin',
          status: 'scheduled',
          cost: 200000.00,
          payment_status: 'pending'
        },
        {
          user_id: 1,
          visit_date: '2024-01-20',
          visit_time: '08:45:00',
          visit_type: 'Pemeriksaan Darah',
          clinic_name: 'Rumah Sakit Umum',
          doctor_name: 'Dr. Budi Santoso',
          diagnosis: 'Anemia ringan',
          treatment: 'Suplemen zat besi',
          prescription: JSON.stringify(['Ferrous sulfate 200mg', 'Vitamin C']),
          notes: 'Kontrol dalam 1 bulan untuk evaluasi Hb',
          status: 'completed',
          cost: 180000.00,
          payment_status: 'paid'
        }
      ];

      for (const data of sampleData) {
        await connection.execute(`
          INSERT INTO mobile_visits (
            user_id, visit_date, visit_time, visit_type, clinic_name, doctor_name,
            diagnosis, treatment, prescription, notes, status, cost, payment_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.user_id, data.visit_date, data.visit_time, data.visit_type,
          data.clinic_name, data.doctor_name, data.diagnosis, data.treatment,
          data.prescription, data.notes, data.status, data.cost, data.payment_status
        ]);
      }

      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('ℹ️  Sample data already exists, skipping insertion');
    }

    // Verify the table structure
    const [columns] = await connection.execute('DESCRIBE mobile_visits');
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // Show sample data count
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM mobile_visits');
    console.log(`\n📊 Total records in mobile_visits: ${countResult[0].count}`);

    console.log('\n🎉 Mobile visits table setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up mobile_visits table:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupMobileVisitsTable()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupMobileVisitsTable;
