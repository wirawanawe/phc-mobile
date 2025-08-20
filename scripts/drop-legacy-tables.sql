-- Script untuk drop legacy tables
-- Generated on: 2025-08-20T03:32:32.607Z
-- WARNING: Jalankan script ini dengan hati-hati!
-- Pastikan backup sudah dibuat terlebih dahulu

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop legacy tables
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `clinic_polyclinics`;
DROP TABLE IF EXISTS `clinic_rooms`;
DROP TABLE IF EXISTS `doctor_specializations`;
DROP TABLE IF EXISTS `examinations`;
DROP TABLE IF EXISTS `phc_office_admin`;
DROP TABLE IF EXISTS `visits`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'Legacy tables yang berhasil di-drop:' as message;
SELECT 'assessments' as dropped_table;
SELECT 'clinic_polyclinics' as dropped_table;
SELECT 'clinic_rooms' as dropped_table;
SELECT 'doctor_specializations' as dropped_table;
SELECT 'examinations' as dropped_table;
SELECT 'phc_office_admin' as dropped_table;
SELECT 'visits' as dropped_table;

SELECT 'Drop legacy tables completed successfully!' as message;
