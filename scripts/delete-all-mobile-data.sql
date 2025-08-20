-- Script to delete all mobile_users data and related data
-- This script will safely delete all mobile app data

USE phc_dashboard;

-- Start transaction for safety
START TRANSACTION;

-- Show current data count before deletion
SELECT 'BEFORE DELETION - Current data count:' as info;

SELECT 'mobile_users' as table_name, COUNT(*) as record_count FROM mobile_users
UNION ALL
SELECT 'user_missions' as table_name, COUNT(*) as record_count FROM user_missions
UNION ALL
SELECT 'health_data' as table_name, COUNT(*) as record_count FROM health_data
UNION ALL
SELECT 'user_wellness_activities' as table_name, COUNT(*) as record_count FROM user_wellness_activities
UNION ALL
SELECT 'sleep_tracking' as table_name, COUNT(*) as record_count FROM sleep_tracking
UNION ALL
SELECT 'mood_tracking' as table_name, COUNT(*) as record_count FROM mood_tracking
UNION ALL
SELECT 'water_tracking' as table_name, COUNT(*) as record_count FROM water_tracking
UNION ALL
SELECT 'user_water_settings' as table_name, COUNT(*) as record_count FROM user_water_settings
UNION ALL
UNION ALL
SELECT 'fitness_tracking' as table_name, COUNT(*) as record_count FROM fitness_tracking
UNION ALL
SELECT 'user_quick_foods' as table_name, COUNT(*) as record_count FROM user_quick_foods
UNION ALL
SELECT 'mobile_visits' as table_name, COUNT(*) as record_count FROM mobile_visits
UNION ALL
SELECT 'chats' as table_name, COUNT(*) as record_count FROM chats
UNION ALL
SELECT 'chat_messages' as table_name, COUNT(*) as record_count FROM chat_messages;

-- Delete all data from mobile_users table
-- Due to foreign key constraints with ON DELETE CASCADE, 
-- all related data will be automatically deleted
DELETE FROM mobile_users;

-- Show data count after deletion
SELECT 'AFTER DELETION - Data count:' as info;

SELECT 'mobile_users' as table_name, COUNT(*) as record_count FROM mobile_users
UNION ALL
SELECT 'user_missions' as table_name, COUNT(*) as record_count FROM user_missions
UNION ALL
SELECT 'health_data' as table_name, COUNT(*) as record_count FROM health_data
UNION ALL
SELECT 'user_wellness_activities' as table_name, COUNT(*) as record_count FROM user_wellness_activities
UNION ALL
SELECT 'sleep_tracking' as table_name, COUNT(*) as record_count FROM sleep_tracking
UNION ALL
SELECT 'mood_tracking' as table_name, COUNT(*) as record_count FROM mood_tracking
UNION ALL
SELECT 'water_tracking' as table_name, COUNT(*) as record_count FROM water_tracking
UNION ALL
SELECT 'user_water_settings' as table_name, COUNT(*) as record_count FROM user_water_settings
UNION ALL
UNION ALL
SELECT 'fitness_tracking' as table_name, COUNT(*) as record_count FROM fitness_tracking
UNION ALL
SELECT 'user_quick_foods' as table_name, COUNT(*) as record_count FROM user_quick_foods
UNION ALL
SELECT 'mobile_visits' as table_name, COUNT(*) as record_count FROM mobile_visits
UNION ALL
SELECT 'chats' as table_name, COUNT(*) as record_count FROM chats
UNION ALL
SELECT 'chat_messages' as table_name, COUNT(*) as record_count FROM chat_messages;

-- Commit the transaction
COMMIT;

SELECT 'SUCCESS: All mobile data has been deleted!' as status;
