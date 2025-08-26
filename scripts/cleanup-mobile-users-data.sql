-- Script untuk membersihkan data mobile_users
-- Generated on: 2025-01-27
-- WARNING: Jalankan script ini dengan hati-hati!

-- ========================================
-- ANALISIS RELASI TABEL
-- ========================================
-- Tabel mobile_users memiliki relasi dengan tabel berikut:
-- - health_data (user_id)
-- - wellness_activities (user_id)
-- - mood_tracking (user_id)
-- - water_tracking (user_id)
-- - sleep_tracking (user_id)
-- - meal_tracking (user_id)
-- - fitness_tracking (user_id)
-- - user_missions (user_id)
-- - user_quick_foods (user_id)
-- - user_water_settings (user_id)
-- - user_habit_activities (user_id)
-- - chats (user_id)
-- - consultations (user_id)
-- - bookings (user_id)
-- - user_cache (user_id)
-- - user_imports (user_id)
-- - anthropometry_progress (user_id)

-- ========================================
-- BACKUP DATA SEBELUM PEMBERSIHAN
-- ========================================

-- Buat backup timestamp
SET @backup_timestamp = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');

-- Backup mobile_users yang akan dihapus
CREATE TABLE IF NOT EXISTS backup_mobile_users_@backup_timestamp AS 
SELECT * FROM mobile_users;

-- Backup data terkait
CREATE TABLE IF NOT EXISTS backup_health_data_@backup_timestamp AS 
SELECT * FROM health_data;

CREATE TABLE IF NOT EXISTS backup_wellness_activities_@backup_timestamp AS 
SELECT * FROM wellness_activities;

CREATE TABLE IF NOT EXISTS backup_mood_tracking_@backup_timestamp AS 
SELECT * FROM mood_tracking;

CREATE TABLE IF NOT EXISTS backup_water_tracking_@backup_timestamp AS 
SELECT * FROM water_tracking;

CREATE TABLE IF NOT EXISTS backup_sleep_tracking_@backup_timestamp AS 
SELECT * FROM sleep_tracking;

CREATE TABLE IF NOT EXISTS backup_meal_tracking_@backup_timestamp AS 
SELECT * FROM meal_tracking;

CREATE TABLE IF NOT EXISTS backup_fitness_tracking_@backup_timestamp AS 
SELECT * FROM fitness_tracking;

CREATE TABLE IF NOT EXISTS backup_user_missions_@backup_timestamp AS 
SELECT * FROM user_missions;

CREATE TABLE IF NOT EXISTS backup_user_quick_foods_@backup_timestamp AS 
SELECT * FROM user_quick_foods;

CREATE TABLE IF NOT EXISTS backup_user_water_settings_@backup_timestamp AS 
SELECT * FROM user_water_settings;

CREATE TABLE IF NOT EXISTS backup_user_habit_activities_@backup_timestamp AS 
SELECT * FROM user_habit_activities;

CREATE TABLE IF NOT EXISTS backup_chats_@backup_timestamp AS 
SELECT * FROM chats;

CREATE TABLE IF NOT EXISTS backup_consultations_@backup_timestamp AS 
SELECT * FROM consultations;

CREATE TABLE IF NOT EXISTS backup_bookings_@backup_timestamp AS 
SELECT * FROM bookings;

CREATE TABLE IF NOT EXISTS backup_user_cache_@backup_timestamp AS 
SELECT * FROM user_cache;

CREATE TABLE IF NOT EXISTS backup_user_imports_@backup_timestamp AS 
SELECT * FROM user_imports;

CREATE TABLE IF NOT EXISTS backup_anthropometry_progress_@backup_timestamp AS 
SELECT * FROM anthropometry_progress;

-- ========================================
-- PILIHAN PEMBERSIHAN DATA
-- ========================================

-- OPSI 1: Hapus semua data mobile_users dan data terkait
-- UNCOMMENT baris di bawah jika ingin menghapus semua data

-- Disable foreign key checks
-- SET FOREIGN_KEY_CHECKS = 0;

-- Hapus data terkait terlebih dahulu (dalam urutan yang benar)
-- DELETE FROM anthropometry_progress;
-- DELETE FROM user_imports;
-- DELETE FROM user_cache;
-- DELETE FROM bookings;
-- DELETE FROM consultations;
-- DELETE FROM chat_messages WHERE chat_id IN (SELECT id FROM chats);
-- DELETE FROM chats;
-- DELETE FROM user_habit_activities;
-- DELETE FROM user_water_settings;
-- DELETE FROM user_quick_foods;
-- DELETE FROM user_missions;
-- DELETE FROM fitness_tracking;
-- DELETE FROM meal_foods WHERE meal_id IN (SELECT id FROM meal_tracking);
-- DELETE FROM meal_tracking;
-- DELETE FROM sleep_tracking;
-- DELETE FROM water_tracking;
-- DELETE FROM mood_tracking;
-- DELETE FROM wellness_activities;
-- DELETE FROM health_data;
-- DELETE FROM mobile_users;

-- Re-enable foreign key checks
-- SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- OPSI 2: Hapus data lama (lebih dari X hari)
-- UNCOMMENT dan sesuaikan baris di bawah

-- Hapus data mobile_users yang dibuat lebih dari 30 hari yang lalu
-- DELETE FROM anthropometry_progress WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_imports WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_cache WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM bookings WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM consultations WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM chat_messages WHERE chat_id IN (
--     SELECT id FROM chats WHERE user_id IN (
--         SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
--     )
-- );
-- DELETE FROM chats WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_habit_activities WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_water_settings WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_quick_foods WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM user_missions WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM fitness_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM meal_foods WHERE meal_id IN (
--     SELECT id FROM meal_tracking WHERE user_id IN (
--         SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
--     )
-- );
-- DELETE FROM meal_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM sleep_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM water_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM mood_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM wellness_activities WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM health_data WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );
-- DELETE FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ========================================
-- OPSI 3: Hapus data test/dummy
-- UNCOMMENT baris di bawah jika ingin menghapus data test

-- Hapus user test dan data terkait
-- DELETE FROM anthropometry_progress WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_imports WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_cache WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM bookings WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM consultations WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM chat_messages WHERE chat_id IN (
--     SELECT id FROM chats WHERE user_id IN (
--         SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
--     )
-- );
-- DELETE FROM chats WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_habit_activities WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_water_settings WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_quick_foods WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM user_missions WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM fitness_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM meal_foods WHERE meal_id IN (
--     SELECT id FROM meal_tracking WHERE user_id IN (
--         SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
--     )
-- );
-- DELETE FROM meal_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM sleep_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM water_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM mood_tracking WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM wellness_activities WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM health_data WHERE user_id IN (
--     SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%'
-- );
-- DELETE FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%';

-- ========================================
-- VERIFIKASI BACKUP
-- ========================================

-- Tampilkan informasi backup
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
    AND TABLE_NAME LIKE 'backup_%'
ORDER BY TABLE_NAME;

-- Tampilkan jumlah data di backup
SELECT 
    'backup_mobile_users' as backup_table,
    COUNT(*) as record_count
FROM backup_mobile_users_@backup_timestamp
UNION ALL
SELECT 
    'backup_health_data' as backup_table,
    COUNT(*) as record_count
FROM backup_health_data_@backup_timestamp
UNION ALL
SELECT 
    'backup_wellness_activities' as backup_table,
    COUNT(*) as record_count
FROM backup_wellness_activities_@backup_timestamp
UNION ALL
SELECT 
    'backup_mood_tracking' as backup_table,
    COUNT(*) as record_count
FROM backup_mood_tracking_@backup_timestamp
UNION ALL
SELECT 
    'backup_water_tracking' as backup_table,
    COUNT(*) as record_count
FROM backup_water_tracking_@backup_timestamp
UNION ALL
SELECT 
    'backup_sleep_tracking' as backup_table,
    COUNT(*) as record_count
FROM backup_sleep_tracking_@backup_timestamp
UNION ALL
SELECT 
    'backup_meal_tracking' as backup_table,
    COUNT(*) as record_count
FROM backup_meal_tracking_@backup_timestamp
UNION ALL
SELECT 
    'backup_fitness_tracking' as backup_table,
    COUNT(*) as record_count
FROM backup_fitness_tracking_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_missions' as backup_table,
    COUNT(*) as record_count
FROM backup_user_missions_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_quick_foods' as backup_table,
    COUNT(*) as record_count
FROM backup_user_quick_foods_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_water_settings' as backup_table,
    COUNT(*) as record_count
FROM backup_user_water_settings_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_habit_activities' as backup_table,
    COUNT(*) as record_count
FROM backup_user_habit_activities_@backup_timestamp
UNION ALL
SELECT 
    'backup_chats' as backup_table,
    COUNT(*) as record_count
FROM backup_chats_@backup_timestamp
UNION ALL
SELECT 
    'backup_consultations' as backup_table,
    COUNT(*) as record_count
FROM backup_consultations_@backup_timestamp
UNION ALL
SELECT 
    'backup_bookings' as backup_table,
    COUNT(*) as record_count
FROM backup_bookings_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_cache' as backup_table,
    COUNT(*) as record_count
FROM backup_user_cache_@backup_timestamp
UNION ALL
SELECT 
    'backup_user_imports' as backup_table,
    COUNT(*) as record_count
FROM backup_user_imports_@backup_timestamp
UNION ALL
SELECT 
    'backup_anthropometry_progress' as backup_table,
    COUNT(*) as record_count
FROM backup_anthropometry_progress_@backup_timestamp;

-- ========================================
-- INFORMASI BACKUP
-- ========================================

SELECT 
    CONCAT('Backup completed successfully at ', NOW()) as message,
    CONCAT('Backup timestamp: ', @backup_timestamp) as backup_timestamp;

-- ========================================
-- CATATAN PENTING
-- ========================================
--
-- 1. Script ini membuat backup otomatis sebelum pembersihan
-- 2. Pilih salah satu opsi pembersihan (hapus comment pada opsi yang diinginkan)
-- 3. Backup tables akan tetap ada di database
-- 4. Untuk memulihkan data: INSERT INTO mobile_users SELECT * FROM backup_mobile_users_[timestamp];
-- 5. Backup tables dapat dihapus setelah memastikan tidak ada masalah
--
-- OPSI PEMBERSIHAN:
-- - OPSI 1: Hapus semua data (HATI-HATI!)
-- - OPSI 2: Hapus data lama (lebih dari 30 hari)
-- - OPSI 3: Hapus data test/dummy
--
-- Pastikan untuk menguji di environment development terlebih dahulu!
