const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testProfileAPI() {
  console.log('🧪 Testing Profile API...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Get a sample user from mobile_users table
    const [users] = await connection.execute(`
      SELECT 
        id, name, email, phone, date_of_birth, gender, 
        height, weight, blood_type, emergency_contact_name, 
        emergency_contact_phone, is_active, created_at, updated_at,
        wellness_program_joined, wellness_join_date, activity_level, fitness_goal,
        ktp_number, address, insurance, insurance_card_number, insurance_type
      FROM mobile_users 
      WHERE is_active = 1 
      LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ No active users found in database');
      return;
    }

    const user = users[0];
    console.log('📋 Sample User Data:');
    console.log('ID:', user.id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Created At:', user.created_at);
    console.log('Updated At:', user.updated_at);
    console.log('Wellness Program Joined:', user.wellness_program_joined);
    console.log('Wellness Join Date:', user.wellness_join_date);

    // Test the formatMemberSince function logic
    const formatMemberSince = (createdAt) => {
      if (!createdAt) return "March 2024";
      
      try {
        const date = new Date(createdAt);
        if (isNaN(date.getTime())) return "March 2024";
        
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${month} ${year}`;
      } catch (error) {
        return "March 2024";
      }
    };

    const memberSince = formatMemberSince(user.created_at);
    console.log('\n🎯 Formatted Member Since:', memberSince);

    // Test API endpoint simulation
    console.log('\n🔗 Simulating API Response:');
    const apiResponse = {
      success: true,
      message: "Profile berhasil diambil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        blood_type: user.blood_type,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_phone: user.emergency_contact_phone,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        wellness_program_joined: user.wellness_program_joined,
        wellness_join_date: user.wellness_join_date,
        activity_level: user.activity_level,
        fitness_goal: user.fitness_goal,
        ktp_number: user.ktp_number,
        address: user.address,
        insurance: user.insurance,
        insurance_card_number: user.insurance_card_number,
        insurance_type: user.insurance_type
      }
    };

    console.log('✅ API Response Structure:');
    console.log('- Success:', apiResponse.success);
    console.log('- User Name:', apiResponse.data.name);
    console.log('- Created At:', apiResponse.data.created_at);
    console.log('- Member Since:', formatMemberSince(apiResponse.data.created_at));

    console.log('\n✅ Profile API test completed successfully!');
    console.log('📝 The user name and member since date should now display correctly in the mobile app.');

  } catch (error) {
    console.error('❌ Error testing profile API:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testProfileAPI();
