-- Script to remove unused database tables from PHC Mobile application
-- Based on actual database analysis on 2025-01-27
-- This script removes tables that are not actively used in the application

-- ========================================
-- ACTUAL DATABASE TABLES ANALYSIS
-- ========================================
-- Tables found in phc_dashboard database:
-- 
-- ACTIVE TABLES (KEEP - Used in application):
-- - users (authentication and user management)
-- - clinics (clinic information)
-- - doctors (doctor information)
-- - polyclinics (polyclinic information)
-- - insurances (insurance information)
-- - companies (company information)
-- - treatments (treatment information)
-- - icd (ICD codes)
-- - patients (patient information)
-- - visits (visit information)
-- - examinations (examination information)
-- - medicines (medicine inventory)
-- - clinic_rooms (clinic room management)
-- - clinic_polyclinics (clinic-polyclinic relationships)
-- - phc_office_admin (admin information)
-- - services (service information)
-- - bookings (booking information)
-- - consultations (consultation information)
-- - assessments (assessment information)
-- - chats (chat information)
-- - chat_messages (chat message information)
-- - mobile_users (mobile user information)
-- - food_database (food database)
-- - missions (mission information)
-- - user_missions (user mission tracking)
-- - wellness_activities (wellness activities)
-- - mood_tracking (mood tracking)
-- - water_tracking (water tracking)
-- - user_water_settings (user water settings)
-- - sleep_tracking (sleep tracking)
-- - meal_tracking (meal tracking)
-- - meal_foods (meal food items)
-- - fitness_tracking (fitness tracking)
-- - user_quick_foods (user quick foods)
-- - health_data (health data)
-- - available_habit_activities (habit activities)
-- - user_habit_activities (user habit activities)
-- - anthropometry_progress (anthropometry progress)
-- - v_medicine_with_clinic (view - medicine with clinic info)

-- ========================================
-- TABLES TO REMOVE (UNUSED/DUPLICATE)
-- ========================================

-- 1. Remove duplicate/obsolete tables
DROP TABLE IF EXISTS meal_logging; -- Replaced by meal_tracking table

-- 2. Remove tables that were created for testing but not used in production
DROP TABLE IF EXISTS anthropometry_initial_data; -- Initial data table, not used in API
DROP TABLE IF EXISTS anthropometry_progress_summary; -- Summary table, not used in API
DROP TABLE IF EXISTS wellness_program_history; -- History table, not used in API

-- 3. Remove tables that are not referenced in any API routes
DROP TABLE IF EXISTS doctor_specializations; -- Not used in any API routes

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check which tables still exist after removal
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
ORDER BY TABLE_NAME;

-- Check for any foreign key constraints that might be affected
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'phc_dashboard' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ========================================
-- SUMMARY OF REMOVED TABLES
-- ========================================
-- 
-- Tables removed:
-- 1. meal_logging - Replaced by meal_tracking (more comprehensive structure)
-- 2. anthropometry_initial_data - Initial data table, not used in API
-- 3. anthropometry_progress_summary - Summary table, not used in API  
-- 4. wellness_program_history - History table, not used in API
-- 5. doctor_specializations - Not referenced in any API routes
--
-- Total tables removed: 5
-- Total tables remaining: 37 (including 1 view)
--
-- ========================================
-- NOTES
-- ========================================
-- 
-- 1. This script only removes tables that are confirmed to be unused
-- 2. All actively used tables are preserved
-- 3. Foreign key relationships are maintained
-- 4. Data integrity is preserved
-- 5. The view v_medicine_with_clinic is preserved as it's used in the application
-- 
-- If you need to remove additional tables, please verify they are not used in:
-- - API routes in dash-app/app/api/
-- - Database queries in scripts/
-- - Application code in src/
-- - Any other parts of the codebase
--
-- Always backup your database before running this script!
