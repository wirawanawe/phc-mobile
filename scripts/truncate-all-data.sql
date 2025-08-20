-- Script untuk menghapus semua data di database dan memulai baru
-- Jalankan script ini dengan hati-hati karena akan menghapus SEMUA data
-- Cara menjalankan: mysql -u root -p phc_dashboard < scripts/truncate-all-data.sql

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate semua tabel yang berisi data user dan tracking (hanya yang ada)
TRUNCATE TABLE fitness_tracking;
TRUNCATE TABLE mood_tracking;
TRUNCATE TABLE water_tracking;
TRUNCATE TABLE sleep_tracking;
TRUNCATE TABLE meal_tracking;
TRUNCATE TABLE meal_foods;
TRUNCATE TABLE wellness_activities;
TRUNCATE TABLE user_wellness_activities;
TRUNCATE TABLE user_missions;
TRUNCATE TABLE user_quick_foods;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chats;
TRUNCATE TABLE consultations;
TRUNCATE TABLE bookings;
TRUNCATE TABLE health_data;
TRUNCATE TABLE mobile_users;

-- Truncate tabel master data (opsional - hapus komentar jika ingin reset juga)
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE doctors;
-- TRUNCATE TABLE clinics;
-- TRUNCATE TABLE services;
-- TRUNCATE TABLE polyclinics;
-- TRUNCATE TABLE companies;
-- TRUNCATE TABLE insurances;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment counters
ALTER TABLE fitness_tracking AUTO_INCREMENT = 1;
ALTER TABLE mood_tracking AUTO_INCREMENT = 1;
ALTER TABLE water_tracking AUTO_INCREMENT = 1;
ALTER TABLE sleep_tracking AUTO_INCREMENT = 1;
ALTER TABLE meal_tracking AUTO_INCREMENT = 1;
ALTER TABLE meal_tracking AUTO_INCREMENT = 1;
ALTER TABLE meal_foods AUTO_INCREMENT = 1;
ALTER TABLE wellness_activities AUTO_INCREMENT = 1;
ALTER TABLE user_wellness_activities AUTO_INCREMENT = 1;
ALTER TABLE user_missions AUTO_INCREMENT = 1;
ALTER TABLE user_quick_foods AUTO_INCREMENT = 1;
ALTER TABLE chat_messages AUTO_INCREMENT = 1;
ALTER TABLE chats AUTO_INCREMENT = 1;
ALTER TABLE consultations AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE health_data AUTO_INCREMENT = 1;
ALTER TABLE mobile_users AUTO_INCREMENT = 1;

-- Tampilkan pesan konfirmasi
SELECT 'Database berhasil di-reset! Semua data tracking telah dihapus.' as message;
