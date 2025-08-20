-- Script to delete all meal tracking data from database
-- WARNING: This will permanently delete all meal tracking data!

-- Check current data counts before deletion
SELECT 'Current data counts before deletion:' as info;
SELECT 'meal_tracking' as table_name, COUNT(*) as record_count FROM meal_tracking;
SELECT 'meal_foods' as table_name, COUNT(*) as record_count FROM meal_foods;
SELECT 'food_database' as table_name, COUNT(*) as record_count FROM food_database;

-- Delete data in correct order to respect foreign key constraints
-- 1. Delete meal_foods first (references meal_tracking)
DELETE FROM meal_foods;

-- 2. Delete meal_tracking records
DELETE FROM meal_tracking;

-- 3. Delete food_database records
DELETE FROM food_database;


-- Verify deletion
SELECT 'Data counts after deletion:' as info;
SELECT 'meal_tracking' as table_name, COUNT(*) as record_count FROM meal_tracking;
SELECT 'meal_foods' as table_name, COUNT(*) as record_count FROM meal_foods;
SELECT 'food_database' as table_name, COUNT(*) as record_count FROM food_database;

SELECT 'All meal tracking data has been successfully deleted!' as result; 