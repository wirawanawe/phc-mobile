const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function fixWellnessDuplicates() {
  console.log('🔧 Fixing wellness activity duplicates...\n');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // 1. Check for duplicates in user_wellness_activities table
    console.log('\n1️⃣ Checking for duplicates in user_wellness_activities table...');
    
    const duplicateCheckQuery = `
      SELECT 
        user_id, 
        activity_id, 
        DATE(completed_at) as completion_date,
        COUNT(*) as duplicate_count
      FROM user_wellness_activities 
      GROUP BY user_id, activity_id, DATE(completed_at)
      HAVING COUNT(*) > 1
      ORDER BY user_id, activity_id, completion_date
    `;
    
    const [duplicates] = await connection.execute(duplicateCheckQuery);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found in user_wellness_activities table');
    } else {
      console.log(`❌ Found ${duplicates.length} duplicate groups in user_wellness_activities table`);
      
      // Remove duplicates, keeping only the first entry for each user/activity/date combination
      for (const duplicate of duplicates) {
        console.log(`\n   Cleaning duplicates for user ${duplicate.user_id}, activity ${duplicate.activity_id}, date ${duplicate.completion_date}`);
        
        const deleteDuplicatesQuery = `
          DELETE uwa1 FROM user_wellness_activities uwa1
          INNER JOIN user_wellness_activities uwa2 
          WHERE uwa1.id > uwa2.id 
            AND uwa1.user_id = uwa2.user_id 
            AND uwa1.activity_id = uwa2.activity_id 
            AND DATE(uwa1.completed_at) = DATE(uwa2.completed_at)
            AND uwa1.user_id = ? 
            AND uwa1.activity_id = ? 
            AND DATE(uwa1.completed_at) = ?
        `;
        
        await connection.execute(deleteDuplicatesQuery, [
          duplicate.user_id, 
          duplicate.activity_id, 
          duplicate.completion_date
        ]);
        
        console.log(`   ✅ Removed ${duplicate.duplicate_count - 1} duplicate entries`);
      }
    }

    // 2. Check for orphaned entries in wellness_activities table that don't have corresponding user_wellness_activities
    console.log('\n2️⃣ Checking for orphaned entries in wellness_activities table...');
    
    const orphanedCheckQuery = `
      SELECT COUNT(*) as orphaned_count
      FROM wellness_activities wa
      LEFT JOIN user_wellness_activities uwa 
        ON wa.user_id = uwa.user_id 
        AND wa.activity_id = uwa.activity_id
        AND DATE(wa.completed_at) = DATE(uwa.completed_at)
      WHERE uwa.id IS NULL
    `;
    
    const [orphanedResult] = await connection.execute(orphanedCheckQuery);
    const orphanedCount = orphanedResult[0].orphaned_count;
    
    if (orphanedCount === 0) {
      console.log('✅ No orphaned entries found in wellness_activities table');
    } else {
      console.log(`❌ Found ${orphanedCount} orphaned entries in wellness_activities table`);
      
      // Remove orphaned entries
      const deleteOrphanedQuery = `
        DELETE wa FROM wellness_activities wa
        LEFT JOIN user_wellness_activities uwa 
          ON wa.user_id = uwa.user_id 
          AND wa.activity_id = uwa.activity_id
          AND DATE(wa.completed_at) = DATE(uwa.completed_at)
        WHERE uwa.id IS NULL
      `;
      
      await connection.execute(deleteOrphanedQuery);
      console.log(`✅ Removed ${orphanedCount} orphaned entries`);
    }

    // 3. Add unique constraint to prevent future duplicates
    console.log('\n3️⃣ Adding unique constraint to prevent future duplicates...');
    
    try {
      const addUniqueConstraintQuery = `
        ALTER TABLE user_wellness_activities 
        ADD UNIQUE KEY unique_user_activity_date (user_id, activity_id, completed_at)
      `;
      
      await connection.execute(addUniqueConstraintQuery);
      console.log('✅ Added unique constraint to user_wellness_activities table');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Unique constraint already exists');
      } else {
        console.log('⚠️ Could not add unique constraint:', error.message);
      }
    }

    // 4. Show final statistics
    console.log('\n4️⃣ Final statistics:');
    
    const [userWellnessCount] = await connection.execute('SELECT COUNT(*) as count FROM user_wellness_activities');
    const [wellnessCount] = await connection.execute('SELECT COUNT(*) as count FROM wellness_activities');
    
    console.log(`   📊 user_wellness_activities: ${userWellnessCount[0].count} entries`);
    console.log(`   📊 wellness_activities: ${wellnessCount[0].count} entries`);

    console.log('\n✅ Wellness activity duplicates fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing wellness duplicates:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  fixWellnessDuplicates()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixWellnessDuplicates };
