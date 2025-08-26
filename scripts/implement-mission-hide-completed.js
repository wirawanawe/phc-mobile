#!/usr/bin/env node

/**
 * Mission Hide Completed Implementation Script
 * 
 * This script implements the feature to hide completed missions by default
 * and show active missions at the top with smart sorting.
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

class MissionHideCompletedImplementation {
  constructor() {
    this.connection = null;
    this.results = {
      steps: [],
      errors: [],
      summary: {}
    };
  }

  async connect() {
    try {
      console.log('🔌 Connecting to database...');
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }

  async createUserMissionPreferencesTable() {
    try {
      console.log('\n📋 Step 1: Creating user_mission_preferences table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_mission_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          show_completed_missions BOOLEAN DEFAULT FALSE COMMENT 'Whether to show completed missions by default',
          sort_by ENUM('progress', 'difficulty', 'points', 'category') DEFAULT 'progress' COMMENT 'How to sort missions',
          sort_order ENUM('asc', 'desc') DEFAULT 'desc' COMMENT 'Sort order (ascending or descending)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_user (user_id),
          FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_show_completed (show_completed_missions)
        )
      `;

      await this.connection.execute(createTableSQL);
      console.log('✅ user_mission_preferences table created successfully');

      this.results.steps.push({
        step: 'Create user_mission_preferences table',
        success: true,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error creating user_mission_preferences table:', error.message);
      this.results.errors.push({
        step: 'Create user_mission_preferences table',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async insertDefaultPreferences() {
    try {
      console.log('\n📋 Step 2: Inserting default preferences for existing users...');
      
      const insertSQL = `
        INSERT IGNORE INTO user_mission_preferences (user_id, show_completed_missions, sort_by, sort_order)
        SELECT 
          id as user_id,
          FALSE as show_completed_missions,
          'progress' as sort_by,
          'desc' as sort_order
        FROM mobile_users
        WHERE is_active = TRUE
      `;

      const [result] = await this.connection.execute(insertSQL);
      console.log(`✅ Inserted default preferences for ${result.affectedRows} users`);

      this.results.steps.push({
        step: 'Insert default preferences',
        success: true,
        affectedRows: result.affectedRows,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error inserting default preferences:', error.message);
      this.results.errors.push({
        step: 'Insert default preferences',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('\n📋 Step 3: Creating indexes for better performance...');
      
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_user_preferences_composite ON user_mission_preferences(user_id, show_completed_missions)',
        'CREATE INDEX IF NOT EXISTS idx_user_preferences_sort ON user_mission_preferences(user_id, sort_by, sort_order)'
      ];

      for (const indexSQL of indexes) {
        await this.connection.execute(indexSQL);
        console.log(`✅ Created index: ${indexSQL.split(' ')[2]}`);
      }

      this.results.steps.push({
        step: 'Create indexes',
        success: true,
        indexesCreated: indexes.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      this.results.errors.push({
        step: 'Create indexes',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async generateReport() {
    try {
      console.log('\n📋 Step 4: Generating implementation report...');
      
      // Get summary statistics
      const [summaryResult] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_preferences,
          COUNT(CASE WHEN show_completed_missions = TRUE THEN 1 END) as show_completed_count,
          COUNT(CASE WHEN show_completed_missions = FALSE THEN 1 END) as hide_completed_count,
          COUNT(CASE WHEN sort_by = 'progress' THEN 1 END) as sort_by_progress_count,
          COUNT(CASE WHEN sort_by = 'difficulty' THEN 1 END) as sort_by_difficulty_count,
          COUNT(CASE WHEN sort_by = 'points' THEN 1 END) as sort_by_points_count,
          COUNT(CASE WHEN sort_by = 'category' THEN 1 END) as sort_by_category_count
        FROM user_mission_preferences
      `);

      const [userCountResult] = await this.connection.execute(`
        SELECT COUNT(*) as total_users
        FROM mobile_users
        WHERE is_active = TRUE
      `);

      this.results.summary = {
        total_preferences: summaryResult[0].total_preferences,
        show_completed_count: summaryResult[0].show_completed_count,
        hide_completed_count: summaryResult[0].hide_completed_count,
        sort_by_progress_count: summaryResult[0].sort_by_progress_count,
        sort_by_difficulty_count: summaryResult[0].sort_by_difficulty_count,
        sort_by_points_count: summaryResult[0].sort_by_points_count,
        sort_by_category_count: summaryResult[0].sort_by_category_count,
        total_users: userCountResult[0].total_users,
        coverage_percentage: (summaryResult[0].total_preferences / userCountResult[0].total_users) * 100
      };

      // Print summary
      console.log('\n📊 IMPLEMENTATION SUMMARY:');
      console.log('========================');
      console.log(`Total Preferences Created: ${this.results.summary.total_preferences}`);
      console.log(`Total Active Users: ${this.results.summary.total_users}`);
      console.log(`Coverage Percentage: ${this.results.summary.coverage_percentage.toFixed(2)}%`);
      console.log(`Show Completed: ${this.results.summary.show_completed_count}`);
      console.log(`Hide Completed: ${this.results.summary.hide_completed_count}`);
      console.log(`Sort by Progress: ${this.results.summary.sort_by_progress_count}`);

    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }

  async saveReport() {
    try {
      const reportPath = path.join(__dirname, '../MD File/MISSION_HIDE_COMPLETED_IMPLEMENTATION_REPORT.md');
      
      const reportContent = `# Mission Hide Completed Implementation Report

## 📊 Implementation Summary

**Date:** ${new Date().toISOString()}
**Status:** ✅ Completed

### Statistics
- **Total Preferences Created:** ${this.results.summary.total_preferences}
- **Total Active Users:** ${this.results.summary.total_users}
- **Coverage Percentage:** ${this.results.summary.coverage_percentage.toFixed(2)}%
- **Show Completed:** ${this.results.summary.show_completed_count}
- **Hide Completed:** ${this.results.summary.hide_completed_count}
- **Sort by Progress:** ${this.results.summary.sort_by_progress_count}

### Steps Executed
${this.results.steps.map((step, index) => 
  `${index + 1}. ${step.step} - ✅ Success${step.affectedRows ? ` (${step.affectedRows} rows affected)` : ''}`
).join('\n')}

### Errors (if any)
${this.results.errors.length > 0 ? 
  this.results.errors.map((error, index) => 
    `${index + 1}. ${error.step} - ❌ ${error.error}`
  ).join('\n') : 
  'No errors encountered'
}

## 🎯 Benefits Achieved

1. **Better User Experience**: Users focus on missions that still need to be completed
2. **Reduced Clutter**: Interface is cleaner without completed missions
3. **Smart Sorting**: Missions with highest progress are shown at the top
4. **User Control**: Users can choose to show completed missions if desired
5. **Performance**: More efficient queries with filtering

## 🚀 Next Steps

1. Update backend API to use new preferences system
2. Update frontend to display missions with smart filtering
3. Test mission display and sorting functionality
4. Monitor user engagement with the new system
`;

      await fs.writeFile(reportPath, reportContent);
      console.log(`📄 Report saved to: ${reportPath}`);

    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Mission Hide Completed Implementation...\n');
      
      await this.connect();
      
      // Execute implementation steps
      await this.createUserMissionPreferencesTable();
      await this.insertDefaultPreferences();
      await this.createIndexes();
      await this.generateReport();
      await this.saveReport();
      
      console.log('\n🎉 Mission Hide Completed Implementation completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Implementation failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the implementation
if (require.main === module) {
  const implementation = new MissionHideCompletedImplementation();
  implementation.run();
}

module.exports = MissionHideCompletedImplementation;
