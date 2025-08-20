-- Script untuk menghapus data duplikat pada tabel doctors
-- WARNING: Backup database sebelum menjalankan script ini!

USE phc_dashboard;

-- Tampilkan jumlah dokter sebelum pembersihan
SELECT '=== JUMLAH DOKTER SEBELUM PEMBERSIHAN ===' as info;
SELECT COUNT(*) as total_doctors FROM doctors;

-- 1. Identifikasi duplikat berdasarkan email
SELECT '=== DUPLIKAT BERDASARKAN EMAIL ===' as info;
SELECT 
    email, 
    COUNT(*) as count, 
    GROUP_CONCAT(id ORDER BY id) as ids,
    GROUP_CONCAT(name ORDER BY id) as names
FROM doctors 
WHERE email IS NOT NULL AND email != ''
GROUP BY email 
HAVING COUNT(*) > 1;

-- 2. Identifikasi duplikat berdasarkan license_number
SELECT '=== DUPLIKAT BERDASARKAN LICENSE NUMBER ===' as info;
SELECT 
    license_number, 
    COUNT(*) as count, 
    GROUP_CONCAT(id ORDER BY id) as ids,
    GROUP_CONCAT(name ORDER BY id) as names
FROM doctors 
WHERE license_number IS NOT NULL AND license_number != ''
GROUP BY license_number 
HAVING COUNT(*) > 1;

-- 3. Identifikasi duplikat berdasarkan name + phone
SELECT '=== DUPLIKAT BERDASARKAN NAME + PHONE ===' as info;
SELECT 
    name, 
    phone, 
    COUNT(*) as count, 
    GROUP_CONCAT(id ORDER BY id) as ids
FROM doctors 
WHERE name IS NOT NULL AND phone IS NOT NULL AND phone != ''
GROUP BY name, phone 
HAVING COUNT(*) > 1;

-- 4. Identifikasi duplikat berdasarkan name + specialist
SELECT '=== DUPLIKAT BERDASARKAN NAME + SPECIALIST ===' as info;
SELECT 
    name, 
    specialist, 
    COUNT(*) as count, 
    GROUP_CONCAT(id ORDER BY id) as ids
FROM doctors 
WHERE name IS NOT NULL AND specialist IS NOT NULL AND specialist != ''
GROUP BY name, specialist 
HAVING COUNT(*) > 1;

-- 5. Hapus duplikat berdasarkan email (simpan record dengan ID terkecil)
-- Buat temporary table untuk menyimpan ID yang akan dihapus
CREATE TEMPORARY TABLE IF NOT EXISTS temp_duplicate_ids (
    id INT PRIMARY KEY
);

-- Hapus duplikat email
INSERT INTO temp_duplicate_ids (id)
SELECT d1.id
FROM doctors d1
INNER JOIN (
    SELECT email, MIN(id) as min_id
    FROM doctors 
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email 
    HAVING COUNT(*) > 1
) d2 ON d1.email = d2.email AND d1.id > d2.min_id;

-- Update referensi di tabel visits sebelum menghapus
UPDATE visits v
INNER JOIN temp_duplicate_ids t ON v.doctor_id = t.id
INNER JOIN doctors d ON d.email = (
    SELECT email FROM doctors WHERE id = t.id
)
SET v.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE email = d.email
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

-- Update referensi di tabel consultations sebelum menghapus
UPDATE consultations c
INNER JOIN temp_duplicate_ids t ON c.doctor_id = t.id
INNER JOIN doctors d ON d.email = (
    SELECT email FROM doctors WHERE id = t.id
)
SET c.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE email = d.email
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

-- Hapus duplikat email
DELETE FROM doctors 
WHERE id IN (SELECT id FROM temp_duplicate_ids);

-- Bersihkan temporary table
TRUNCATE TABLE temp_duplicate_ids;

-- 6. Hapus duplikat berdasarkan license_number
INSERT INTO temp_duplicate_ids (id)
SELECT d1.id
FROM doctors d1
INNER JOIN (
    SELECT license_number, MIN(id) as min_id
    FROM doctors 
    WHERE license_number IS NOT NULL AND license_number != ''
    GROUP BY license_number 
    HAVING COUNT(*) > 1
) d2 ON d1.license_number = d2.license_number AND d1.id > d2.min_id;

-- Update referensi untuk license_number duplikat
UPDATE visits v
INNER JOIN temp_duplicate_ids t ON v.doctor_id = t.id
INNER JOIN doctors d ON d.license_number = (
    SELECT license_number FROM doctors WHERE id = t.id
)
SET v.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE license_number = d.license_number
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

UPDATE consultations c
INNER JOIN temp_duplicate_ids t ON c.doctor_id = t.id
INNER JOIN doctors d ON d.license_number = (
    SELECT license_number FROM doctors WHERE id = t.id
)
SET c.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE license_number = d.license_number
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

-- Hapus duplikat license_number
DELETE FROM doctors 
WHERE id IN (SELECT id FROM temp_duplicate_ids);

-- Bersihkan temporary table
TRUNCATE TABLE temp_duplicate_ids;

-- 7. Hapus duplikat berdasarkan name + phone
INSERT INTO temp_duplicate_ids (id)
SELECT d1.id
FROM doctors d1
INNER JOIN (
    SELECT name, phone, MIN(id) as min_id
    FROM doctors 
    WHERE name IS NOT NULL AND phone IS NOT NULL AND phone != ''
    GROUP BY name, phone 
    HAVING COUNT(*) > 1
) d2 ON d1.name = d2.name AND d1.phone = d2.phone AND d1.id > d2.min_id;

-- Update referensi untuk name+phone duplikat
UPDATE visits v
INNER JOIN temp_duplicate_ids t ON v.doctor_id = t.id
INNER JOIN doctors d ON d.name = (
    SELECT name FROM doctors WHERE id = t.id
) AND d.phone = (
    SELECT phone FROM doctors WHERE id = t.id
)
SET v.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE name = d.name AND phone = d.phone
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

UPDATE consultations c
INNER JOIN temp_duplicate_ids t ON c.doctor_id = t.id
INNER JOIN doctors d ON d.name = (
    SELECT name FROM doctors WHERE id = t.id
) AND d.phone = (
    SELECT phone FROM doctors WHERE id = t.id
)
SET c.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE name = d.name AND phone = d.phone
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

-- Hapus duplikat name+phone
DELETE FROM doctors 
WHERE id IN (SELECT id FROM temp_duplicate_ids);

-- Bersihkan temporary table
TRUNCATE TABLE temp_duplicate_ids;

-- 8. Hapus duplikat berdasarkan name + specialist
INSERT INTO temp_duplicate_ids (id)
SELECT d1.id
FROM doctors d1
INNER JOIN (
    SELECT name, specialist, MIN(id) as min_id
    FROM doctors 
    WHERE name IS NOT NULL AND specialist IS NOT NULL AND specialist != ''
    GROUP BY name, specialist 
    HAVING COUNT(*) > 1
) d2 ON d1.name = d2.name AND d1.specialist = d2.specialist AND d1.id > d2.min_id;

-- Update referensi untuk name+specialist duplikat
UPDATE visits v
INNER JOIN temp_duplicate_ids t ON v.doctor_id = t.id
INNER JOIN doctors d ON d.name = (
    SELECT name FROM doctors WHERE id = t.id
) AND d.specialist = (
    SELECT specialist FROM doctors WHERE id = t.id
)
SET v.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE name = d.name AND specialist = d.specialist
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

UPDATE consultations c
INNER JOIN temp_duplicate_ids t ON c.doctor_id = t.id
INNER JOIN doctors d ON d.name = (
    SELECT name FROM doctors WHERE id = t.id
) AND d.specialist = (
    SELECT specialist FROM doctors WHERE id = t.id
)
SET c.doctor_id = (
    SELECT MIN(id) FROM doctors 
    WHERE name = d.name AND specialist = d.specialist
)
WHERE t.id IN (SELECT id FROM temp_duplicate_ids);

-- Hapus duplikat name+specialist
DELETE FROM doctors 
WHERE id IN (SELECT id FROM temp_duplicate_ids);

-- Hapus temporary table
DROP TEMPORARY TABLE IF EXISTS temp_duplicate_ids;

-- 9. Tampilkan hasil akhir
SELECT '=== HASIL AKHIR ===' as info;
SELECT COUNT(*) as total_doctors_after_cleanup FROM doctors;

-- Tampilkan daftar dokter yang tersisa
SELECT '=== DAFTAR DOKTER YANG TERSISA ===' as info;
SELECT 
    id,
    name,
    specialist,
    email,
    license_number,
    phone,
    created_at
FROM doctors 
ORDER BY id;

-- Verifikasi tidak ada duplikat lagi
SELECT '=== VERIFIKASI TIDAK ADA DUPLIKAT ===' as info;

-- Cek duplikat email
SELECT 'Duplikat email:' as check_type, COUNT(*) as count
FROM (
    SELECT email, COUNT(*) as cnt
    FROM doctors 
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email 
    HAVING COUNT(*) > 1
) as email_dups;

-- Cek duplikat license_number
SELECT 'Duplikat license:' as check_type, COUNT(*) as count
FROM (
    SELECT license_number, COUNT(*) as cnt
    FROM doctors 
    WHERE license_number IS NOT NULL AND license_number != ''
    GROUP BY license_number 
    HAVING COUNT(*) > 1
) as license_dups;

-- Cek duplikat name+phone
SELECT 'Duplikat name+phone:' as check_type, COUNT(*) as count
FROM (
    SELECT name, phone, COUNT(*) as cnt
    FROM doctors 
    WHERE name IS NOT NULL AND phone IS NOT NULL AND phone != ''
    GROUP BY name, phone 
    HAVING COUNT(*) > 1
) as namephone_dups;

-- Cek duplikat name+specialist
SELECT 'Duplikat name+specialist:' as check_type, COUNT(*) as count
FROM (
    SELECT name, specialist, COUNT(*) as cnt
    FROM doctors 
    WHERE name IS NOT NULL AND specialist IS NOT NULL AND specialist != ''
    GROUP BY name, specialist 
    HAVING COUNT(*) > 1
) as namespecialist_dups;

SELECT '=== PEMBERSIHAN SELESAI ===' as info;
