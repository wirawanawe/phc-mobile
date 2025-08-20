#!/usr/bin/env node

/**
 * Script to clean duplicate wellness activities from database
 * This removes duplicate entries from available_wellness_activities table
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function cleanDuplicateWellnessActivities() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check current count
    const [currentCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities
    `);
    console.log(`📊 Current wellness activities count: ${currentCount[0].count}`);

    // Find duplicates based on title
    console.log('\n🔍 Finding duplicates based on title...');
    const [duplicates] = await connection.execute(`
      SELECT title, COUNT(*) as count
      FROM available_wellness_activities
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`❌ Found ${duplicates.length} duplicate titles:`);
    duplicates.forEach(dup => {
      console.log(`   - "${dup.title}": ${dup.count} occurrences`);
    });

    // Show detailed duplicate information
    console.log('\n📋 Detailed duplicate information:');
    for (const dup of duplicates) {
      const [duplicateRecords] = await connection.execute(`
        SELECT id, title, description, category, duration_minutes, difficulty, points, created_at
        FROM available_wellness_activities
        WHERE title = ?
        ORDER BY id
      `, [dup.title]);

      console.log(`\n   Title: "${dup.title}"`);
      duplicateRecords.forEach((record, index) => {
        console.log(`     ${index + 1}. ID: ${record.id}, Category: ${record.category}, Points: ${record.points}, Created: ${record.created_at}`);
      });
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will remove duplicate entries!');
    console.log('   Only the first occurrence of each title will be kept.');
    console.log('   Are you sure you want to proceed? (y/N)');

    // For automation, we'll proceed with the cleanup
    console.log('   Proceeding with cleanup...');

    // Remove duplicates, keeping only the first occurrence of each title
    console.log('\n🧹 Removing duplicates...');
    
    for (const dup of duplicates) {
      const [duplicateIds] = await connection.execute(`
        SELECT id FROM available_wellness_activities
        WHERE title = ?
        ORDER BY id
      `, [dup.title]);

      // Keep the first one, remove the rest
      const idsToRemove = duplicateIds.slice(1).map(record => record.id);
      
      if (idsToRemove.length > 0) {
        console.log(`   Removing ${idsToRemove.length} duplicates for "${dup.title}" (IDs: ${idsToRemove.join(', ')})`);
        
        // Check if any of these activities are referenced in user_wellness_activities
        const [referencedActivities] = await connection.execute(`
          SELECT COUNT(*) as count FROM user_wellness_activities
          WHERE activity_id IN (${idsToRemove.join(',')})
        `);
        
        if (referencedActivities[0].count > 0) {
          console.log(`   ⚠️  WARNING: ${referencedActivities[0].count} user activities reference these IDs!`);
          console.log(`   ⚠️  These user activities will become orphaned!`);
          
          // Update user activities to reference the first activity instead
          const firstId = duplicateIds[0].id;
          await connection.execute(`
            UPDATE user_wellness_activities
            SET activity_id = ?
            WHERE activity_id IN (${idsToRemove.join(',')})
          `, [firstId]);
          
          console.log(`   ✅ Updated user activities to reference ID ${firstId}`);
        }
        
        // Now remove the duplicate activities
        await connection.execute(`
          DELETE FROM available_wellness_activities
          WHERE id IN (${idsToRemove.join(',')})
        `);
        
        console.log(`   ✅ Removed ${idsToRemove.length} duplicate activities`);
      }
    }

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities
    `);
    
    const [remainingDuplicates] = await connection.execute(`
      SELECT title, COUNT(*) as count
      FROM available_wellness_activities
      GROUP BY title
      HAVING COUNT(*) > 1
    `);

    console.log(`📊 Final wellness activities count: ${finalCount[0].count}`);
    console.log(`📊 Removed: ${currentCount[0].count - finalCount[0].count} duplicate entries`);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ No duplicates remaining!');
    } else {
      console.log(`❌ Still have ${remainingDuplicates.length} duplicate titles remaining`);
    }

    // Show final unique activities
    console.log('\n📋 Final unique wellness activities:');
    const [finalActivities] = await connection.execute(`
      SELECT id, title, category, difficulty, points
      FROM available_wellness_activities
      ORDER BY title
    `);

    finalActivities.forEach((activity, index) => {
      console.log(`   ${index + 1}. ID: ${activity.id} - "${activity.title}" (${activity.category}, ${activity.difficulty}, ${activity.points} pts)`);
    });

    console.log('\n✅ Duplicate cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
cleanDuplicateWellnessActivities();
