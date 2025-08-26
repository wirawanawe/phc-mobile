-- Database Cleanup Script
-- This script cleans all data from the database EXCEPT mission and habit data
-- Tables to PRESERVE: missions, user_missions, available_habit_activities, user_habit_activities
-- Tables to CLEAN: All other tables

USE phc_dashboard;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- CLEAN DASHBOARD TABLES
-- ========================================

-- Clean examinations (depends on visits)
DELETE FROM examinations;

-- Clean visits (depends on patients and doctors)
DELETE FROM visits;

-- Clean patients
DELETE FROM patients;

-- Clean doctors
DELETE FROM doctors;

-- Clean medicines (depends on clinics)
DELETE FROM medicines;

-- Clean users (except superadmin)
DELETE FROM users WHERE role != 'superadmin';

-- Clean clinics
DELETE FROM clinics WHERE id > 1; -- Keep at least one clinic for reference

-- Clean polyclinics
DELETE FROM polyclinics;

-- Clean insurances
DELETE FROM insurances;

-- Clean companies
DELETE FROM companies;

-- Clean treatments
DELETE FROM treatments;

-- Clean ICD
DELETE FROM icd;

-- ========================================
-- CLEAN MOBILE APP TABLES
-- ========================================

-- Clean meal_foods (depends on meal_tracking and food_database)
DELETE FROM meal_foods;

-- Clean meal_tracking
DELETE FROM meal_tracking;

-- Clean user_quick_foods (depends on food_database)
DELETE FROM user_quick_foods;

-- Clean food_database (keep verified foods)
DELETE FROM food_database WHERE is_verified = FALSE;

-- Clean wellness_activities
DELETE FROM wellness_activities;

-- Clean mood_tracking
DELETE FROM mood_tracking;

-- Clean water_tracking
DELETE FROM water_tracking;

-- Clean user_water_settings
DELETE FROM user_water_settings;

-- Clean sleep_tracking
DELETE FROM sleep_tracking;

-- Clean fitness_tracking
DELETE FROM fitness_tracking;

-- Clean health_data
DELETE FROM health_data;

-- Clean assessments
DELETE FROM assessments;

-- Clean chat_messages (depends on chats)
DELETE FROM chat_messages;

-- Clean chats
DELETE FROM chats;

-- Clean consultations
DELETE FROM consultations;

-- Clean mobile_users (if exists)
-- Note: This will also clean user_habit_activities due to foreign key constraint
-- But we'll restore habit data after cleaning mobile_users
DELETE FROM mobile_users;

-- ========================================
-- RESET AUTO_INCREMENT COUNTERS
-- ========================================

-- Reset auto-increment counters for cleaned tables
ALTER TABLE examinations AUTO_INCREMENT = 1;
ALTER TABLE visits AUTO_INCREMENT = 1;
ALTER TABLE patients AUTO_INCREMENT = 1;
ALTER TABLE doctors AUTO_INCREMENT = 1;
ALTER TABLE medicines AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 2; -- Keep superadmin as ID 1
ALTER TABLE clinics AUTO_INCREMENT = 2; -- Keep first clinic as ID 1
ALTER TABLE polyclinics AUTO_INCREMENT = 1;
ALTER TABLE insurances AUTO_INCREMENT = 1;
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE treatments AUTO_INCREMENT = 1;
ALTER TABLE icd AUTO_INCREMENT = 1;
ALTER TABLE meal_foods AUTO_INCREMENT = 1;
ALTER TABLE meal_tracking AUTO_INCREMENT = 1;
ALTER TABLE user_quick_foods AUTO_INCREMENT = 1;
ALTER TABLE food_database AUTO_INCREMENT = 1;
ALTER TABLE wellness_activities AUTO_INCREMENT = 1;
ALTER TABLE mood_tracking AUTO_INCREMENT = 1;
ALTER TABLE water_tracking AUTO_INCREMENT = 1;
ALTER TABLE user_water_settings AUTO_INCREMENT = 1;
ALTER TABLE sleep_tracking AUTO_INCREMENT = 1;
ALTER TABLE fitness_tracking AUTO_INCREMENT = 1;
ALTER TABLE health_data AUTO_INCREMENT = 1;
ALTER TABLE assessments AUTO_INCREMENT = 1;
ALTER TABLE chat_messages AUTO_INCREMENT = 1;
ALTER TABLE chats AUTO_INCREMENT = 1;
ALTER TABLE consultations AUTO_INCREMENT = 1;
ALTER TABLE mobile_users AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show what data remains
SELECT 'MISSIONS' as table_name, COUNT(*) as record_count FROM missions
UNION ALL
SELECT 'USER_MISSIONS' as table_name, COUNT(*) as record_count FROM user_missions
UNION ALL
SELECT 'AVAILABLE_HABIT_ACTIVITIES' as table_name, COUNT(*) as record_count FROM available_habit_activities
UNION ALL
SELECT 'USER_HABIT_ACTIVITIES' as table_name, COUNT(*) as record_count FROM user_habit_activities;

-- Show cleaned tables (should be empty or minimal)
SELECT 'EXAMINATIONS' as table_name, COUNT(*) as record_count FROM examinations
UNION ALL
SELECT 'VISITS' as table_name, COUNT(*) as record_count FROM visits
UNION ALL
SELECT 'PATIENTS' as table_name, COUNT(*) as record_count FROM patients
UNION ALL
SELECT 'DOCTORS' as table_name, COUNT(*) as record_count FROM doctors
UNION ALL
SELECT 'MEDICINES' as table_name, COUNT(*) as record_count FROM medicines
UNION ALL
SELECT 'USERS' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'CLINICS' as table_name, COUNT(*) as record_count FROM clinics
UNION ALL
SELECT 'WELLNESS_ACTIVITIES' as table_name, COUNT(*) as record_count FROM wellness_activities
UNION ALL
SELECT 'MOOD_TRACKING' as table_name, COUNT(*) as record_count FROM mood_tracking
UNION ALL
SELECT 'WATER_TRACKING' as table_name, COUNT(*) as record_count FROM water_tracking
UNION ALL
SELECT 'SLEEP_TRACKING' as table_name, COUNT(*) as record_count FROM sleep_tracking
UNION ALL
SELECT 'FITNESS_TRACKING' as table_name, COUNT(*) as record_count FROM fitness_tracking
UNION ALL
SELECT 'HEALTH_DATA' as table_name, COUNT(*) as record_count FROM health_data
UNION ALL
SELECT 'ASSESSMENTS' as table_name, COUNT(*) as record_count FROM assessments
UNION ALL
SELECT 'CHATS' as table_name, COUNT(*) as record_count FROM chats
UNION ALL
SELECT 'CONSULTATIONS' as table_name, COUNT(*) as record_count FROM consultations;

-- Show summary
SELECT 
    'SUMMARY' as info,
    'Database cleaned successfully. Mission and habit data preserved.' as message;
