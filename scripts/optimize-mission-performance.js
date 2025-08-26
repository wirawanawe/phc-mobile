#!/usr/bin/env node

/**
 * Mission Performance Optimization Script
 * 
 * This script optimizes mission data loading performance by:
 * 1. Adding database indexes for faster queries
 * 2. Analyzing query performance
 * 3. Optimizing table structures
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function optimizeMissionPerformance() {
  let connection;
  
  try {
    console.log('🚀 Starting Mission Performance Optimization...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Check existing indexes
    console.log('🔍 Step 1: Checking existing indexes...');
    await checkExistingIndexes(connection);
    
    // Step 2: Add performance indexes
    console.log('\n🔍 Step 2: Adding performance indexes...');
    await addPerformanceIndexes(connection);
    
    // Step 3: Analyze table performance
    console.log('\n🔍 Step 3: Analyzing table performance...');
    await analyzeTablePerformance(connection);
    
    // Step 4: Test query performance
    console.log('\n🔍 Step 4: Testing query performance...');
    await testQueryPerformance(connection);
    
    // Step 5: Optimize table structures
    console.log('\n🔍 Step 5: Optimizing table structures...');
    await optimizeTableStructures(connection);
    
    console.log('\n🎉 Mission performance optimization completed!');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkExistingIndexes(connection) {
  const tables = ['user_missions', 'missions', 'mood_tracking', 'water_tracking', 'sleep_tracking', 'fitness_tracking'];
  
  for (const table of tables) {
    try {
      const [indexes] = await connection.execute(`SHOW INDEX FROM ${table}`);
      console.log(`   📋 ${table}: ${indexes.length} indexes`);
      
      // Show key indexes
      const keyIndexes = indexes.filter(idx => idx.Key_name !== 'PRIMARY');
      keyIndexes.forEach(idx => {
        console.log(`      - ${idx.Key_name} (${idx.Column_name})`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking indexes for ${table}:`, error.message);
    }
  }
}

async function addPerformanceIndexes(connection) {
  const indexes = [
    // User missions indexes
    {
      table: 'user_missions',
      name: 'idx_user_missions_user_id',
      columns: 'user_id',
      description: 'Fast user mission lookup'
    },
    {
      table: 'user_missions',
      name: 'idx_user_missions_user_status',
      columns: 'user_id, status',
      description: 'Fast status-based filtering'
    },
    {
      table: 'user_missions',
      name: 'idx_user_missions_created_at',
      columns: 'created_at',
      description: 'Fast date-based queries'
    },
    {
      table: 'user_missions',
      name: 'idx_user_missions_mission_date',
      columns: 'mission_date',
      description: 'Fast mission date filtering'
    },
    
    // Missions indexes
    {
      table: 'missions',
      name: 'idx_missions_category',
      columns: 'category',
      description: 'Fast category filtering'
    },
    {
      table: 'missions',
      name: 'idx_missions_active',
      columns: 'is_active',
      description: 'Fast active mission filtering'
    },
    {
      table: 'missions',
      name: 'idx_missions_category_active',
      columns: 'category, is_active',
      description: 'Fast category + active filtering'
    },
    
    // Tracking tables indexes
    {
      table: 'mood_tracking',
      name: 'idx_mood_tracking_user_date',
      columns: 'user_id, tracking_date',
      description: 'Fast mood tracking queries'
    },
    {
      table: 'water_tracking',
      name: 'idx_water_tracking_user_date',
      columns: 'user_id, tracking_date',
      description: 'Fast water tracking queries'
    },
    {
      table: 'sleep_tracking',
      name: 'idx_sleep_tracking_user_date',
      columns: 'user_id, tracking_date',
      description: 'Fast sleep tracking queries'
    },
    {
      table: 'fitness_tracking',
      name: 'idx_fitness_tracking_user_date',
      columns: 'user_id, tracking_date',
      description: 'Fast fitness tracking queries'
    }
  ];
  
  for (const index of indexes) {
    try {
      // Check if index already exists
      const [existingIndexes] = await connection.execute(
        `SHOW INDEX FROM ${index.table} WHERE Key_name = ?`,
        [index.name]
      );
      
      if (existingIndexes.length === 0) {
        await connection.execute(
          `CREATE INDEX ${index.name} ON ${index.table} (${index.columns})`
        );
        console.log(`   ✅ Added index: ${index.name} on ${index.table}`);
      } else {
        console.log(`   ⏭️ Index already exists: ${index.name} on ${index.table}`);
      }
    } catch (error) {
      console.log(`   ❌ Error adding index ${index.name}:`, error.message);
    }
  }
}

async function analyzeTablePerformance(connection) {
  const tables = ['user_missions', 'missions', 'mood_tracking', 'water_tracking', 'sleep_tracking', 'fitness_tracking'];
  
  for (const table of tables) {
    try {
      // Get table size
      const [tableInfo] = await connection.execute(`
        SELECT 
          TABLE_ROWS as row_count,
          ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS size_mb
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [dbConfig.database, table]);
      
      if (tableInfo.length > 0) {
        console.log(`   📊 ${table}: ${tableInfo[0].row_count} rows, ${tableInfo[0].size_mb} MB`);
      }
      
      // Analyze table
      await connection.execute(`ANALYZE TABLE ${table}`);
      console.log(`   🔍 Analyzed table: ${table}`);
      
    } catch (error) {
      console.log(`   ❌ Error analyzing ${table}:`, error.message);
    }
  }
}

async function testQueryPerformance(connection) {
  console.log('   🧪 Testing query performance...');
  
  // Test user missions query
  try {
    const startTime = Date.now();
    const [userMissions] = await connection.execute(`
      SELECT 
        um.id as user_mission_id,
        um.status,
        um.progress,
        um.current_value,
        um.completed_at,
        um.created_at,
        um.updated_at,
        um.notes,
        m.id as mission_id,
        m.title,
        m.description,
        m.category,
        m.points,
        m.target_value,
        m.is_active,
        m.icon,
        m.color,
        m.difficulty,
        COUNT(*) OVER() as total_missions,
        SUM(CASE WHEN um.status = 'active' THEN 1 ELSE 0 END) OVER() as active_missions,
        SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) OVER() as completed_missions,
        SUM(CASE WHEN um.status = 'expired' THEN 1 ELSE 0 END) OVER() as expired_missions,
        SUM(CASE WHEN um.status = 'cancelled' THEN 1 ELSE 0 END) OVER() as cancelled_missions,
        SUM(CASE WHEN um.status = 'completed' THEN m.points ELSE 0 END) OVER() as total_points_earned
      FROM user_missions um
      INNER JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = 1
      ORDER BY um.created_at DESC
      LIMIT 20
    `);
    const endTime = Date.now();
    console.log(`   ✅ User missions query: ${userMissions.length} results in ${endTime - startTime}ms`);
  } catch (error) {
    console.log(`   ❌ User missions query failed:`, error.message);
  }
  
  // Test mission stats query
  try {
    const startTime = Date.now();
    const [missionStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_missions,
        SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) as completed_missions,
        SUM(CASE WHEN um.status = 'active' THEN 1 ELSE 0 END) as active_missions,
        SUM(CASE WHEN um.status = 'expired' THEN 1 ELSE 0 END) as expired_missions,
        SUM(CASE WHEN um.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_missions,
        SUM(CASE WHEN um.status = 'completed' THEN m.points ELSE 0 END) as total_points_earned
      FROM user_missions um
      INNER JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = 1
        AND um.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);
    const endTime = Date.now();
    console.log(`   ✅ Mission stats query: ${endTime - startTime}ms`);
  } catch (error) {
    console.log(`   ❌ Mission stats query failed:`, error.message);
  }
  
  // Test tracking data queries
  const trackingTables = ['mood_tracking', 'water_tracking', 'sleep_tracking', 'fitness_tracking'];
  for (const table of trackingTables) {
    try {
      const startTime = Date.now();
      const [trackingData] = await connection.execute(`
        SELECT COUNT(*) as count FROM ${table} WHERE user_id = 1
      `);
      const endTime = Date.now();
      console.log(`   ✅ ${table} query: ${trackingData[0].count} results in ${endTime - startTime}ms`);
    } catch (error) {
      console.log(`   ❌ ${table} query failed:`, error.message);
    }
  }
}

async function optimizeTableStructures(connection) {
  console.log('   🔧 Optimizing table structures...');
  
  const tables = ['user_missions', 'missions', 'mood_tracking', 'water_tracking', 'sleep_tracking', 'fitness_tracking'];
  
  for (const table of tables) {
    try {
      // Optimize table
      await connection.execute(`OPTIMIZE TABLE ${table}`);
      console.log(`   ✅ Optimized table: ${table}`);
    } catch (error) {
      console.log(`   ❌ Error optimizing ${table}:`, error.message);
    }
  }
}

// Run the optimization
if (require.main === module) {
  optimizeMissionPerformance().then(() => {
    console.log('\n🏁 Mission performance optimization finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Mission performance optimization failed:', error);
    process.exit(1);
  });
}

module.exports = { optimizeMissionPerformance };
