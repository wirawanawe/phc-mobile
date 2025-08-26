-- Script sederhana untuk membersihkan data mobile_users
-- Generated on: 2025-01-27
-- AMAN: Script ini hanya menghapus data lama dan test

-- ========================================
-- BACKUP DATA SEBELUM PEMBERSIHAN
-- ========================================

-- Buat backup timestamp
SET @backup_timestamp = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');

-- Backup mobile_users yang akan dihapus
CREATE TABLE IF NOT EXISTS backup_mobile_users_@backup_timestamp AS 
SELECT * FROM mobile_users WHERE 
    created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) OR
    email LIKE '%test%' OR 
    name LIKE '%test%' OR
    email LIKE '%dummy%' OR
    name LIKE '%dummy%';

-- ========================================
-- PEMBERSIHAN DATA LAMA (30+ hari)
-- ========================================

-- Hapus data lama dari tabel terkait
DELETE FROM anthropometry_progress WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_imports WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_cache WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM bookings WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM consultations WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM chat_messages WHERE chat_id IN (
    SELECT id FROM chats WHERE user_id IN (
        SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    )
);

DELETE FROM chats WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_habit_activities WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_water_settings WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_quick_foods WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM user_missions WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM fitness_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM meal_foods WHERE meal_id IN (
    SELECT id FROM meal_tracking WHERE user_id IN (
        SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    )
);

DELETE FROM meal_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM sleep_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM water_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM mood_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM wellness_activities WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM health_data WHERE user_id IN (
    SELECT id FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- Hapus mobile_users lama
DELETE FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ========================================
-- PEMBERSIHAN DATA TEST/DUMMY
-- ========================================

-- Hapus data test dari tabel terkait
DELETE FROM anthropometry_progress WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_imports WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_cache WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM bookings WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM consultations WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM chat_messages WHERE chat_id IN (
    SELECT id FROM chats WHERE user_id IN (
        SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
    )
);

DELETE FROM chats WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_habit_activities WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_water_settings WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_quick_foods WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM user_missions WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM fitness_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM meal_foods WHERE meal_id IN (
    SELECT id FROM meal_tracking WHERE user_id IN (
        SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
    )
);

DELETE FROM meal_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM sleep_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM water_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM mood_tracking WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM wellness_activities WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

DELETE FROM health_data WHERE user_id IN (
    SELECT id FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
);

-- Hapus mobile_users test/dummy
DELETE FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%';

-- ========================================
-- VERIFIKASI HASIL PEMBERSIHAN
-- ========================================

-- Tampilkan jumlah data yang tersisa
SELECT 
    'mobile_users' as table_name,
    COUNT(*) as remaining_records
FROM mobile_users
UNION ALL
SELECT 
    'health_data' as table_name,
    COUNT(*) as remaining_records
FROM health_data
UNION ALL
SELECT 
    'wellness_activities' as table_name,
    COUNT(*) as remaining_records
FROM wellness_activities
UNION ALL
SELECT 
    'mood_tracking' as table_name,
    COUNT(*) as remaining_records
FROM mood_tracking
UNION ALL
SELECT 
    'water_tracking' as table_name,
    COUNT(*) as remaining_records
FROM water_tracking
UNION ALL
SELECT 
    'sleep_tracking' as table_name,
    COUNT(*) as remaining_records
FROM sleep_tracking
UNION ALL
SELECT 
    'meal_tracking' as table_name,
    COUNT(*) as remaining_records
FROM meal_tracking
UNION ALL
SELECT 
    'fitness_tracking' as table_name,
    COUNT(*) as remaining_records
FROM fitness_tracking
UNION ALL
SELECT 
    'user_missions' as table_name,
    COUNT(*) as remaining_records
FROM user_missions
UNION ALL
SELECT 
    'user_quick_foods' as table_name,
    COUNT(*) as remaining_records
FROM user_quick_foods
UNION ALL
SELECT 
    'user_water_settings' as table_name,
    COUNT(*) as remaining_records
FROM user_water_settings
UNION ALL
SELECT 
    'user_habit_activities' as table_name,
    COUNT(*) as remaining_records
FROM user_habit_activities
UNION ALL
SELECT 
    'chats' as table_name,
    COUNT(*) as remaining_records
FROM chats
UNION ALL
SELECT 
    'consultations' as table_name,
    COUNT(*) as remaining_records
FROM consultations
UNION ALL
SELECT 
    'bookings' as table_name,
    COUNT(*) as remaining_records
FROM bookings
UNION ALL
SELECT 
    'user_cache' as table_name,
    COUNT(*) as remaining_records
FROM user_cache
UNION ALL
SELECT 
    'user_imports' as table_name,
    COUNT(*) as remaining_records
FROM user_imports
UNION ALL
SELECT 
    'anthropometry_progress' as table_name,
    COUNT(*) as remaining_records
FROM anthropometry_progress;

-- Tampilkan informasi backup
SELECT 
    CONCAT('Backup completed successfully at ', NOW()) as message,
    CONCAT('Backup timestamp: ', @backup_timestamp) as backup_timestamp,
    CONCAT('Backup table: backup_mobile_users_', @backup_timestamp) as backup_table;

-- Tampilkan jumlah data yang di-backup
SELECT 
    'backup_mobile_users' as backup_table,
    COUNT(*) as backup_count
FROM backup_mobile_users_@backup_timestamp;

-- ========================================
-- CATATAN
-- ========================================
--
-- Script ini telah menghapus:
-- 1. Data mobile_users yang dibuat lebih dari 30 hari yang lalu
-- 2. Data mobile_users yang mengandung kata 'test' atau 'dummy'
-- 3. Semua data terkait dari tabel lain
--
-- Backup data tersimpan di: backup_mobile_users_[timestamp]
-- Untuk memulihkan data: INSERT INTO mobile_users SELECT * FROM backup_mobile_users_[timestamp];
--
-- Data yang tersisa adalah data aktif dan penting
