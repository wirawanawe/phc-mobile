#!/usr/bin/env node

/**
 * Mission Sub-Category Implementation Script
 * 
 * This script implements the enhanced mission system with sub-categories
 * and proper tracking mapping for more accurate mission progress calculation.
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

class MissionSubCategoryImplementation {
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

  async executeSQLFile(filePath) {
    try {
      console.log(`📄 Executing SQL file: ${path.basename(filePath)}`);
      const sqlContent = await fs.readFile(filePath, 'utf8');
      
      // Split SQL by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const [result] = await this.connection.execute(statement);
            this.results.steps.push({
              statement: statement.substring(0, 100) + '...',
              success: true,
              result: result
            });
          } catch (error) {
            this.results.errors.push({
              statement: statement.substring(0, 100) + '...',
              error: error.message
            });
            console.error(`❌ Error executing statement: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ SQL file executed: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`❌ Error reading/executing SQL file: ${error.message}`);
      throw error;
    }
  }

  async addSubCategories() {
    try {
      console.log('\n📋 Step 1: Adding sub-categories to existing missions...');
      
      // Add sub_category column if it doesn't exist
      await this.connection.execute(`
        ALTER TABLE missions 
        ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50) 
        COMMENT 'Sub-kategori misi untuk mapping data tracking yang lebih spesifik'
      `);

      // Add tracking_mapping column if it doesn't exist
      await this.connection.execute(`
        ALTER TABLE missions 
        ADD COLUMN IF NOT EXISTS tracking_mapping JSON 
        COMMENT 'Mapping konfigurasi untuk data tracking yang digunakan'
      `);

      // Update existing missions with sub-categories
      const updateQueries = [
        // FITNESS missions
        "UPDATE missions SET sub_category = 'STEPS' WHERE category = 'fitness' AND unit IN ('steps', 'langkah')",
        "UPDATE missions SET sub_category = 'DURATION' WHERE category = 'fitness' AND unit IN ('minutes', 'menit')",
        "UPDATE missions SET sub_category = 'DISTANCE' WHERE category = 'fitness' AND unit IN ('km', 'kilometer')",
        "UPDATE missions SET sub_category = 'CALORIES' WHERE category = 'fitness' AND unit IN ('calories', 'kalori')",
        
        // HEALTH_TRACKING missions
        "UPDATE missions SET sub_category = 'WATER_INTAKE' WHERE category = 'health_tracking' AND unit IN ('ml', 'liter')",
        "UPDATE missions SET sub_category = 'SLEEP_DURATION' WHERE category = 'health_tracking' AND unit IN ('hours', 'jam', 'minutes', 'menit')",
        "UPDATE missions SET sub_category = 'SLEEP_QUALITY' WHERE category = 'health_tracking' AND unit IN ('quality_score')",
        
        // NUTRITION missions
        "UPDATE missions SET sub_category = 'CALORIES_INTAKE' WHERE category = 'nutrition' AND unit IN ('calories', 'kalori')",
        "UPDATE missions SET sub_category = 'MEAL_COUNT' WHERE category = 'nutrition' AND unit IN ('meals', 'makanan')",
        "UPDATE missions SET sub_category = 'PROTEIN_INTAKE' WHERE category = 'nutrition' AND unit IN ('grams', 'gram')",
        
        // MENTAL_HEALTH missions
        "UPDATE missions SET sub_category = 'MOOD_SCORE' WHERE category = 'mental_health' AND unit IN ('mood_score')",
        "UPDATE missions SET sub_category = 'STRESS_LEVEL' WHERE category = 'mental_health' AND unit IN ('stress_level')",
        "UPDATE missions SET sub_category = 'ENERGY_LEVEL' WHERE category = 'mental_health' AND unit IN ('energy_level')"
      ];

      for (const query of updateQueries) {
        const [result] = await this.connection.execute(query);
        console.log(`✅ Updated ${result.affectedRows} missions with sub-category`);
      }

    } catch (error) {
      console.error('❌ Error adding sub-categories:', error.message);
      throw error;
    }
  }

  async addTrackingMapping() {
    try {
      console.log('\n📋 Step 2: Adding tracking mapping configuration...');
      
      const mappingQueries = [
        // FITNESS: STEPS
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'fitness_tracking',
          'column', 'steps',
          'aggregation', 'SUM',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'STEPS'`,

        // FITNESS: DURATION
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'fitness_tracking',
          'column', 'exercise_minutes',
          'aggregation', 'SUM',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'DURATION'`,

        // FITNESS: DISTANCE
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'fitness_tracking',
          'column', 'distance_km',
          'aggregation', 'SUM',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'DISTANCE'`,

        // FITNESS: CALORIES
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'fitness_tracking',
          'column', 'calories_burned',
          'aggregation', 'SUM',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'CALORIES'`,

        // HEALTH_TRACKING: WATER_INTAKE
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'water_tracking',
          'column', 'amount_ml',
          'aggregation', 'SUM',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'WATER_INTAKE'`,

        // HEALTH_TRACKING: SLEEP_DURATION
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'sleep_tracking',
          'column', 'sleep_duration_hours',
          'aggregation', 'AVG',
          'date_column', 'sleep_date'
        ) WHERE sub_category = 'SLEEP_DURATION'`,

        // HEALTH_TRACKING: SLEEP_QUALITY
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'sleep_tracking',
          'column', 'sleep_quality',
          'aggregation', 'AVG',
          'date_column', 'sleep_date'
        ) WHERE sub_category = 'SLEEP_QUALITY'`,

        // NUTRITION: CALORIES_INTAKE
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'meal_logging',
          'column', 'calories',
          'aggregation', 'SUM',
          'date_column', 'recorded_at'
        ) WHERE sub_category = 'CALORIES_INTAKE'`,

        // NUTRITION: MEAL_COUNT
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'meal_logging',
          'column', 'meal_type',
          'aggregation', 'COUNT_DISTINCT',
          'date_column', 'recorded_at'
        ) WHERE sub_category = 'MEAL_COUNT'`,

        // NUTRITION: PROTEIN_INTAKE
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'meal_logging',
          'column', 'protein',
          'aggregation', 'SUM',
          'date_column', 'recorded_at'
        ) WHERE sub_category = 'PROTEIN_INTAKE'`,

        // MENTAL_HEALTH: MOOD_SCORE
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'mood_tracking',
          'column', 'mood_score',
          'aggregation', 'AVG',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'MOOD_SCORE'`,

        // MENTAL_HEALTH: STRESS_LEVEL
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'mood_tracking',
          'column', 'stress_level',
          'aggregation', 'AVG',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'STRESS_LEVEL'`,

        // MENTAL_HEALTH: ENERGY_LEVEL
        `UPDATE missions SET tracking_mapping = JSON_OBJECT(
          'table', 'mood_tracking',
          'column', 'energy_level',
          'aggregation', 'AVG',
          'date_column', 'tracking_date'
        ) WHERE sub_category = 'ENERGY_LEVEL'`
      ];

      for (const query of mappingQueries) {
        const [result] = await this.connection.execute(query);
        console.log(`✅ Updated ${result.affectedRows} missions with tracking mapping`);
      }

    } catch (error) {
      console.error('❌ Error adding tracking mapping:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('\n📋 Step 3: Creating indexes for better performance...');
      
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_missions_sub_category ON missions(sub_category)',
        'CREATE INDEX IF NOT EXISTS idx_missions_tracking_mapping ON missions((CAST(tracking_mapping AS CHAR(100))))'
      ];

      for (const query of indexQueries) {
        await this.connection.execute(query);
        console.log(`✅ Created index: ${query.split(' ')[2]}`);
      }

    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  }

  async generateReport() {
    try {
      console.log('\n📋 Step 4: Generating implementation report...');
      
      // Get summary statistics
      const [summaryResult] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_missions,
          COUNT(CASE WHEN sub_category IS NOT NULL THEN 1 END) as missions_with_sub_category,
          COUNT(CASE WHEN tracking_mapping IS NOT NULL THEN 1 END) as missions_with_tracking_mapping,
          COUNT(CASE WHEN sub_category IS NULL THEN 1 END) as missions_without_sub_category
        FROM missions
      `);

      const [categoryResult] = await this.connection.execute(`
        SELECT 
          category,
          sub_category,
          COUNT(*) as mission_count,
          SUM(points) as total_points
        FROM missions 
        WHERE sub_category IS NOT NULL
        GROUP BY category, sub_category
        ORDER BY category, sub_category
      `);

      this.results.summary = {
        total_missions: summaryResult[0].total_missions,
        missions_with_sub_category: summaryResult[0].missions_with_sub_category,
        missions_with_tracking_mapping: summaryResult[0].missions_with_tracking_mapping,
        missions_without_sub_category: summaryResult[0].missions_without_sub_category,
        categories: categoryResult
      };

      // Print summary
      console.log('\n📊 IMPLEMENTATION SUMMARY:');
      console.log('========================');
      console.log(`Total Missions: ${this.results.summary.total_missions}`);
      console.log(`Missions with Sub-Category: ${this.results.summary.missions_with_sub_category}`);
      console.log(`Missions with Tracking Mapping: ${this.results.summary.missions_with_tracking_mapping}`);
      console.log(`Missions without Sub-Category: ${this.results.summary.missions_without_sub_category}`);

      console.log('\n📋 Category Distribution:');
      console.log('========================');
      for (const category of this.results.summary.categories) {
        console.log(`${category.category} - ${category.sub_category}: ${category.mission_count} missions (${category.total_points} points)`);
      }

    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }

  async saveReport() {
    try {
      const reportPath = path.join(__dirname, '../MD File/MISSION_SUB_CATEGORY_IMPLEMENTATION_REPORT.md');
      
      const reportContent = `# Mission Sub-Category Implementation Report

## 📊 Implementation Summary

**Date:** ${new Date().toISOString()}
**Status:** ✅ Completed

### Statistics
- **Total Missions:** ${this.results.summary.total_missions}
- **Missions with Sub-Category:** ${this.results.summary.missions_with_sub_category}
- **Missions with Tracking Mapping:** ${this.results.summary.missions_with_tracking_mapping}
- **Missions without Sub-Category:** ${this.results.summary.missions_without_sub_category}

### Category Distribution

${this.results.summary.categories.map(cat => 
  `- **${cat.category} - ${cat.sub_category}:** ${cat.mission_count} missions (${cat.total_points} points)`
).join('\n')}

### Steps Executed
${this.results.steps.map((step, index) => 
  `${index + 1}. ${step.statement} - ✅ Success`
).join('\n')}

### Errors (if any)
${this.results.errors.length > 0 ? 
  this.results.errors.map((error, index) => 
    `${index + 1}. ${error.statement} - ❌ ${error.error}`
  ).join('\n') : 
  'No errors encountered'
}

## 🎯 Benefits Achieved

1. **Accuracy:** Each mission now takes data from the correct tracking source
2. **Scalability:** Easy to add new sub-categories and tracking mappings
3. **Maintainability:** Centralized configuration for tracking data mapping
4. **Performance:** Optimized indexes for faster queries

## 🚀 Next Steps

1. Update backend API to use new tracking mapping
2. Update frontend to display sub-categories
3. Test mission progress calculation
4. Monitor system performance
`;

      await fs.writeFile(reportPath, reportContent);
      console.log(`📄 Report saved to: ${reportPath}`);

    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Mission Sub-Category Implementation...\n');
      
      await this.connect();
      
      // Execute implementation steps
      await this.addSubCategories();
      await this.addTrackingMapping();
      await this.createIndexes();
      await this.generateReport();
      await this.saveReport();
      
      console.log('\n🎉 Mission Sub-Category Implementation completed successfully!');
      
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
  const implementation = new MissionSubCategoryImplementation();
  implementation.run();
}

module.exports = MissionSubCategoryImplementation;
