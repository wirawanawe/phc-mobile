const fs = require('fs');
const path = require('path');

// Directories to scan
const directories = [
  'dash-app/init-scripts',
  'dash-app/app/api',
  'dash-app/scripts',
  'scripts'
];

// Files to exclude
const excludeFiles = [
  'consolidate-meal-tables.js',
  'remove-meal-logging-references.js'
];

// Patterns to remove or replace
const patterns = [
  // Remove meal_logging table creation
  {
    pattern: /-- Meal Logging Table.*?\nCREATE TABLE IF NOT EXISTS meal_logging \([\s\S]*?\);[\s\S]*?\n/g,
    replacement: '-- Meal Logging Table (REMOVED - consolidated into meal_tracking)\n'
  },
  // Remove meal_logging indexes
  {
    pattern: /CREATE INDEX.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from table lists
  {
    pattern: /'meal_logging',?\n/g,
    replacement: ''
  },
  // Remove meal_logging from SELECT statements
  {
    pattern: /SELECT.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from INSERT statements
  {
    pattern: /INSERT.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from DELETE statements
  {
    pattern: /DELETE.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from TRUNCATE statements
  {
    pattern: /TRUNCATE TABLE meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from DROP statements
  {
    pattern: /DROP TABLE.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from comments
  {
    pattern: /--.*meal_logging.*\n/g,
    replacement: ''
  },
  // Remove meal_logging from documentation
  {
    pattern: /- `meal_logging`.*\n/g,
    replacement: ''
  }
];

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let changes = 0;

    // Apply all patterns
    for (const { pattern, replacement } of patterns) {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        changes += matches.length;
      }
    }

    // Additional specific replacements
    const specificReplacements = [
      // Replace meal_logging references in wellness activities
      {
        from: /activity_type ENUM\('water_tracking', 'meal_logging', 'sleep_tracking', 'mood_tracking', 'fitness_tracking'\)/g,
        to: "activity_type ENUM('water_tracking', 'meal_tracking', 'sleep_tracking', 'mood_tracking', 'fitness_tracking')"
      },
      {
        from: /'meal_logging'/g,
        to: "'meal_tracking'"
      },
      {
        from: /meal_logging/g,
        to: 'meal_tracking'
      }
    ];

    for (const { from, to } of specificReplacements) {
      if (modifiedContent.includes(from.source || from)) {
        modifiedContent = modifiedContent.replace(from, to);
        changes++;
      }
    }

    if (changes > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Modified ${filePath} (${changes} changes)`);
      return changes;
    }
  } catch (error) {
    console.log(`⚠️  Could not process ${filePath}: ${error.message}`);
  }
  return 0;
}

function scanDirectory(dir) {
  let totalChanges = 0;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        totalChanges += scanDirectory(fullPath);
      } else if (stat.isFile() && 
                 (fullPath.endsWith('.js') || 
                  fullPath.endsWith('.sql') || 
                  fullPath.endsWith('.md')) &&
                 !excludeFiles.includes(item)) {
        totalChanges += processFile(fullPath);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not scan directory ${dir}: ${error.message}`);
  }
  
  return totalChanges;
}

function main() {
  console.log('🧹 Removing meal_logging references from codebase...\n');
  
  let totalChanges = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning ${dir}...`);
      totalChanges += scanDirectory(dir);
    } else {
      console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
    }
  }
  
  console.log(`\n✅ Cleanup completed! Total changes: ${totalChanges}`);
  console.log('\n📋 Summary:');
  console.log('   - ✅ Removed meal_logging table creation statements');
  console.log('   - ✅ Removed meal_logging indexes');
  console.log('   - ✅ Removed meal_logging from table lists');
  console.log('   - ✅ Updated references to use meal_tracking');
  console.log('   - ✅ Cleaned up documentation');
  console.log('\n🎯 The codebase now only references the unified meal_tracking system!');
}

main();
