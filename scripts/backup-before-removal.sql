-- Backup script for tables that will be removed
-- Run this script BEFORE running remove-unused-tables-final.sql
-- Generated on: 2025-01-27

-- ========================================
-- BACKUP TABLES BEFORE REMOVAL
-- ========================================

-- Create backup tables with timestamp
SET @backup_timestamp = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');

-- 1. Backup meal_logging table (if it has data)
CREATE TABLE IF NOT EXISTS backup_meal_logging_@backup_timestamp AS 
SELECT * FROM meal_logging;

-- 2. Backup anthropometry_initial_data table (if it has data)
CREATE TABLE IF NOT EXISTS backup_anthropometry_initial_data_@backup_timestamp AS 
SELECT * FROM anthropometry_initial_data;

-- 3. Backup anthropometry_progress_summary table (if it has data)
CREATE TABLE IF NOT EXISTS backup_anthropometry_progress_summary_@backup_timestamp AS 
SELECT * FROM anthropometry_progress_summary;

-- 4. Backup wellness_program_history table (if it has data)
CREATE TABLE IF NOT EXISTS backup_wellness_program_history_@backup_timestamp AS 
SELECT * FROM wellness_program_history;

-- 5. Backup doctor_specializations table (if it has data)
CREATE TABLE IF NOT EXISTS backup_doctor_specializations_@backup_timestamp AS 
SELECT * FROM doctor_specializations;

-- ========================================
-- VERIFY BACKUP CREATION
-- ========================================

-- Show backup tables created
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
    AND TABLE_NAME LIKE 'backup_%'
ORDER BY TABLE_NAME;

-- Show data count in backup tables
SELECT 
    'backup_meal_logging' as backup_table,
    COUNT(*) as record_count
FROM backup_meal_logging_@backup_timestamp
UNION ALL
SELECT 
    'backup_anthropometry_initial_data' as backup_table,
    COUNT(*) as record_count
FROM backup_anthropometry_initial_data_@backup_timestamp
UNION ALL
SELECT 
    'backup_anthropometry_progress_summary' as backup_table,
    COUNT(*) as record_count
FROM backup_anthropometry_progress_summary_@backup_timestamp
UNION ALL
SELECT 
    'backup_wellness_program_history' as backup_table,
    COUNT(*) as record_count
FROM backup_wellness_program_history_@backup_timestamp
UNION ALL
SELECT 
    'backup_doctor_specializations' as backup_table,
    COUNT(*) as record_count
FROM backup_doctor_specializations_@backup_timestamp;

-- ========================================
-- BACKUP COMPLETION MESSAGE
-- ========================================

SELECT 
    CONCAT('Backup completed successfully at ', NOW()) as message,
    CONCAT('Backup timestamp: ', @backup_timestamp) as backup_timestamp;

-- ========================================
-- NOTES
-- ========================================
--
-- Backup tables created:
-- - backup_meal_logging_[timestamp]
-- - backup_anthropometry_initial_data_[timestamp]
-- - backup_anthropometry_progress_summary_[timestamp]
-- - backup_wellness_program_history_[timestamp]
-- - backup_doctor_specializations_[timestamp]
--
-- These backup tables will remain in the database after removing the original tables.
-- You can safely remove these backup tables later if you confirm the data is not needed.
--
-- To restore data later (if needed):
-- INSERT INTO meal_logging SELECT * FROM backup_meal_logging_[timestamp];
-- (and similar for other tables)
