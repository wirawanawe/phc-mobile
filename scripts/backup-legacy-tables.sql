-- Script backup legacy tables sebelum drop
-- Generated on: 2025-08-20T03:32:32.608Z
-- Jalankan script ini sebelum drop legacy tables

-- Create backup tables

-- Backup legacy table: assessments
CREATE TABLE IF NOT EXISTS `backup_legacy_assessments_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `assessments`;

-- Show backup info
SELECT 'assessments' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_assessments_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: clinic_polyclinics
CREATE TABLE IF NOT EXISTS `backup_legacy_clinic_polyclinics_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `clinic_polyclinics`;

-- Show backup info
SELECT 'clinic_polyclinics' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_clinic_polyclinics_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: clinic_rooms
CREATE TABLE IF NOT EXISTS `backup_legacy_clinic_rooms_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `clinic_rooms`;

-- Show backup info
SELECT 'clinic_rooms' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_clinic_rooms_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: doctor_specializations
CREATE TABLE IF NOT EXISTS `backup_legacy_doctor_specializations_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `doctor_specializations`;

-- Show backup info
SELECT 'doctor_specializations' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_doctor_specializations_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: examinations
CREATE TABLE IF NOT EXISTS `backup_legacy_examinations_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `examinations`;

-- Show backup info
SELECT 'examinations' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_examinations_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: phc_office_admin
CREATE TABLE IF NOT EXISTS `backup_legacy_phc_office_admin_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `phc_office_admin`;

-- Show backup info
SELECT 'phc_office_admin' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_phc_office_admin_2025-08-20T03-32-32-608Z`;


-- Backup legacy table: visits
CREATE TABLE IF NOT EXISTS `backup_legacy_visits_2025-08-20T03-32-32-608Z` AS 
SELECT * FROM `visits`;

-- Show backup info
SELECT 'visits' as table_name, COUNT(*) as backup_count 
FROM `backup_legacy_visits_2025-08-20T03-32-32-608Z`;


SELECT 'Legacy tables backup completed successfully!' as message;
