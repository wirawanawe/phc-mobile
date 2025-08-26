-- Database Collation Fix Script
-- This script changes the database collation from utf8mb4_0900_ai_ci to utf8mb4_general_ci

-- Set the database collation
ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Set session variables to use the compatible collation
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;

-- Show current database collation settings
SELECT 
    @@character_set_database as database_charset,
    @@collation_database as database_collation,
    @@character_set_connection as connection_charset,
    @@collation_connection as connection_collation;

-- Fix collation for all existing tables
-- This will update the collation for all text columns in existing tables

-- Users table
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Clinics table
ALTER TABLE clinics CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Doctors table
ALTER TABLE doctors CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Polyclinics table
ALTER TABLE polyclinics CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ICD table
ALTER TABLE icd CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Patients table
ALTER TABLE patients CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Visits table
ALTER TABLE visits CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Examinations table
ALTER TABLE examinations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Food database table
ALTER TABLE food_database CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Missions table
ALTER TABLE missions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- User missions table
ALTER TABLE user_missions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Activities table
ALTER TABLE activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- User activities table
ALTER TABLE user_activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Sleep tracking table
ALTER TABLE sleep_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Mood tracking table
ALTER TABLE mood_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Health data table
ALTER TABLE health_data CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Mobile users table
ALTER TABLE mobile_users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Chats table
ALTER TABLE chats CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Chat messages table
ALTER TABLE chat_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Consultations table
ALTER TABLE consultations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Assessments table
ALTER TABLE assessments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Wellness progress table
ALTER TABLE wellness_progress CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Medicine table
ALTER TABLE medicine CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Orders table
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Order items table
ALTER TABLE order_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Companies table
ALTER TABLE companies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Insurance table
ALTER TABLE insurance CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Treatments table
ALTER TABLE treatments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Postal codes table
ALTER TABLE postal_codes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Regions table
ALTER TABLE regions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Laboratory results table
ALTER TABLE laboratory_results CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Habit activities table (if exists)
ALTER TABLE habit_activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Meal tracking table (if exists)
ALTER TABLE meal_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Fitness tracking table (if exists)
ALTER TABLE fitness_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Water tracking table (if exists)
ALTER TABLE water_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- User water settings table (if exists)
ALTER TABLE user_water_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Anthropometry progress table (if exists)
ALTER TABLE anthropometry_progress CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Mobile visits table (if exists)
ALTER TABLE mobile_visits CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- PHC office admin table (if exists)
ALTER TABLE phc_office_admin CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Clinic rooms table (if exists)
ALTER TABLE clinic_rooms CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Show final collation settings
SELECT 
    'Database collation fixed successfully' as status,
    @@character_set_database as database_charset,
    @@collation_database as database_collation;
