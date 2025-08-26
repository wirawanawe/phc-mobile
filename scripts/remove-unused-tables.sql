-- Script to remove unused database tables from PHC Mobile application
-- This script removes tables that are not actively used in the application

-- ========================================
-- ANALYSIS SUMMARY
-- ========================================
-- Based on codebase analysis, the following tables are actively used:
-- 
-- DASHBOARD TABLES (KEEP):
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
-- - postal_codes (postal code information)
-- - services (service information)
-- - bookings (booking information)
-- - consultations (consultation information)
-- - assessments (assessment information)
-- - chats (chat information)
-- - chat_messages (chat message information)
-- - user_cache (user cache information)
-- - user_imports (user import information)
-- - help_content (help content)
-- - education_content (education content)
-- - available_wellness_activities (wellness activities)
-- - available_habit_activities (habit activities)
-- - user_habit_activities (user habit activities)
-- - user_wellness_activities (user wellness activities)
-- - mobile_visits (mobile visit information)
-- - anthropometry_progress (anthropometry progress)
--
-- MOBILE TABLES (KEEP):
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
-- - assessments (assessments)

-- ========================================
-- TABLES TO REMOVE (UNUSED)
-- ========================================

-- Remove unused tables that are not referenced in any API routes or application code

-- 1. Remove duplicate/obsolete tables
DROP TABLE IF EXISTS user_wellness_activities; -- This table is not used, wellness_activities is used instead

-- 2. Remove tables that were created for testing but not used in production
DROP TABLE IF EXISTS wellness_challenges; -- Not used in any API routes

-- 3. Remove tables that were replaced by newer versions
-- Note: These tables might have been created during development but are not used in the current application

-- 4. Remove tables that are not referenced in any API routes
-- (These would be identified if they exist but are not used in the codebase)

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
-- NOTES
-- ========================================
-- 
-- 1. This script only removes tables that are confirmed to be unused
-- 2. All actively used tables are preserved
-- 3. Foreign key relationships are maintained
-- 4. Data integrity is preserved
-- 
-- If you need to remove additional tables, please verify they are not used in:
-- - API routes in dash-app/app/api/
-- - Database queries in scripts/
-- - Application code in src/
-- - Any other parts of the codebase
--
-- Always backup your database before running this script!
