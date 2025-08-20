-- Force delete all meal tracking data
-- This script will aggressively delete all meal-related data

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data from meal-related tables
DELETE FROM meal_foods;
DELETE FROM meal_tracking;
DELETE FROM food_database;

-- Try to delete from old table if it exists

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify deletion
SELECT 'Verification - All meal tracking data should be 0:' as info;
SELECT 'meal_tracking' as table_name, COUNT(*) as record_count FROM meal_tracking;
SELECT 'meal_foods' as table_name, COUNT(*) as record_count FROM meal_foods;
SELECT 'food_database' as table_name, COUNT(*) as record_count FROM food_database;

SELECT 'All meal tracking data has been force deleted!' as result; 