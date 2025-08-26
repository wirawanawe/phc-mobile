-- Script untuk preview data mobile_users yang akan dibersihkan
-- Generated on: 2025-01-27
-- AMAN: Script ini hanya menampilkan data, tidak menghapus apapun

-- ========================================
-- PREVIEW DATA YANG AKAN DIBERSIHKAN
-- ========================================

-- 1. Data mobile_users lama (lebih dari 30 hari)
SELECT 
    'OLD_DATA' as category,
    COUNT(*) as count,
    'Mobile users created more than 30 days ago' as description
FROM mobile_users 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

-- 2. Data mobile_users test/dummy
SELECT 
    'TEST_DATA' as category,
    COUNT(*) as count,
    'Mobile users with test/dummy in email or name' as description
FROM mobile_users 
WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'

UNION ALL

-- 3. Data mobile_users inaktif
SELECT 
    'INACTIVE_DATA' as category,
    COUNT(*) as count,
    'Mobile users with is_active = 0' as description
FROM mobile_users 
WHERE is_active = 0;

-- ========================================
-- DETAIL DATA LAMA
-- ========================================

SELECT 
    'DETAIL_OLD_DATA' as section,
    id,
    name,
    email,
    created_at,
    DATEDIFF(NOW(), created_at) as days_old
FROM mobile_users 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at ASC;

-- ========================================
-- DETAIL DATA TEST/DUMMY
-- ========================================

SELECT 
    'DETAIL_TEST_DATA' as section,
    id,
    name,
    email,
    created_at,
    CASE 
        WHEN email LIKE '%test%' THEN 'test in email'
        WHEN name LIKE '%test%' THEN 'test in name'
        WHEN email LIKE '%dummy%' THEN 'dummy in email'
        WHEN name LIKE '%dummy%' THEN 'dummy in name'
    END as reason
FROM mobile_users 
WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'
ORDER BY created_at ASC;

-- ========================================
-- DETAIL DATA INAKTIF
-- ========================================

SELECT 
    'DETAIL_INACTIVE_DATA' as section,
    id,
    name,
    email,
    created_at,
    is_active
FROM mobile_users 
WHERE is_active = 0
ORDER BY created_at ASC;

-- ========================================
-- ANALISIS DATA TERKAIT
-- ========================================

-- Data terkait untuk user lama
SELECT 
    'RELATED_OLD_DATA' as section,
    'health_data' as table_name,
    COUNT(*) as count
FROM health_data hd
INNER JOIN mobile_users mu ON hd.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'wellness_activities' as table_name,
    COUNT(*) as count
FROM wellness_activities wa
INNER JOIN mobile_users mu ON wa.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'mood_tracking' as table_name,
    COUNT(*) as count
FROM mood_tracking mt
INNER JOIN mobile_users mu ON mt.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'water_tracking' as table_name,
    COUNT(*) as count
FROM water_tracking wt
INNER JOIN mobile_users mu ON wt.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'sleep_tracking' as table_name,
    COUNT(*) as count
FROM sleep_tracking st
INNER JOIN mobile_users mu ON st.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'meal_tracking' as table_name,
    COUNT(*) as count
FROM meal_tracking mt
INNER JOIN mobile_users mu ON mt.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'fitness_tracking' as table_name,
    COUNT(*) as count
FROM fitness_tracking ft
INNER JOIN mobile_users mu ON ft.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'RELATED_OLD_DATA' as section,
    'user_missions' as table_name,
    COUNT(*) as count
FROM user_missions um
INNER JOIN mobile_users mu ON um.user_id = mu.id
WHERE mu.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Data terkait untuk user test/dummy
SELECT 
    'RELATED_TEST_DATA' as section,
    'health_data' as table_name,
    COUNT(*) as count
FROM health_data hd
INNER JOIN mobile_users mu ON hd.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'wellness_activities' as table_name,
    COUNT(*) as count
FROM wellness_activities wa
INNER JOIN mobile_users mu ON wa.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'mood_tracking' as table_name,
    COUNT(*) as count
FROM mood_tracking mt
INNER JOIN mobile_users mu ON mt.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'water_tracking' as table_name,
    COUNT(*) as count
FROM water_tracking wt
INNER JOIN mobile_users mu ON wt.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'sleep_tracking' as table_name,
    COUNT(*) as count
FROM sleep_tracking st
INNER JOIN mobile_users mu ON st.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'meal_tracking' as table_name,
    COUNT(*) as count
FROM meal_tracking mt
INNER JOIN mobile_users mu ON mt.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'fitness_tracking' as table_name,
    COUNT(*) as count
FROM fitness_tracking ft
INNER JOIN mobile_users mu ON ft.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%'

UNION ALL

SELECT 
    'RELATED_TEST_DATA' as section,
    'user_missions' as table_name,
    COUNT(*) as count
FROM user_missions um
INNER JOIN mobile_users mu ON um.user_id = mu.id
WHERE mu.email LIKE '%test%' OR mu.name LIKE '%test%' OR mu.email LIKE '%dummy%' OR mu.name LIKE '%dummy%';

-- ========================================
-- RINGKASAN TOTAL
-- ========================================

SELECT 
    'SUMMARY' as section,
    'Total mobile_users' as metric,
    COUNT(*) as value
FROM mobile_users

UNION ALL

SELECT 
    'SUMMARY' as section,
    'Active mobile_users' as metric,
    COUNT(*) as value
FROM mobile_users
WHERE is_active = 1

UNION ALL

SELECT 
    'SUMMARY' as section,
    'Old mobile_users (30+ days)' as metric,
    COUNT(*) as value
FROM mobile_users
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'SUMMARY' as section,
    'Test/Dummy mobile_users' as metric,
    COUNT(*) as value
FROM mobile_users
WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%'

UNION ALL

SELECT 
    'SUMMARY' as section,
    'Inactive mobile_users' as metric,
    COUNT(*) as value
FROM mobile_users
WHERE is_active = 0;

-- ========================================
-- CATATAN
-- ========================================
--
-- Script ini hanya menampilkan data yang akan dibersihkan
-- Tidak ada data yang dihapus atau diubah
-- 
-- Untuk menjalankan pembersihan, gunakan:
-- - scripts/cleanup-mobile-users-simple.sql (aman)
-- - scripts/cleanup-mobile-users.sh (otomatis)
--
-- Pastikan untuk review data ini sebelum menjalankan pembersihan!
