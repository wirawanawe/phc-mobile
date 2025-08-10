-- Update missions dengan colors dan icons yang sesuai
-- Jalankan file ini di database MySQL

USE phc_mobile;

-- Update missions dengan colors dan icons berdasarkan kategori
UPDATE missions SET color = '#10B981', icon = 'check-circle' WHERE id = 1; -- Minum Air 8 Gelas (daily_habit)
UPDATE missions SET color = '#F59E0B', icon = 'dumbbell' WHERE id = 2; -- Olahraga 30 Menit (fitness)
UPDATE missions SET color = '#8B5CF6', icon = 'brain' WHERE id = 3; -- Catat Mood Harian (mental_health)
UPDATE missions SET color = '#EF4444', icon = 'food-apple' WHERE id = 4; -- Konsumsi 5 Porsi Sayur/Buah (nutrition)
UPDATE missions SET color = '#10B981', icon = 'check-circle' WHERE id = 5; -- Tidur 8 Jam (daily_habit)
UPDATE missions SET color = '#8B5CF6', icon = 'brain' WHERE id = 6; -- Meditasi 10 Menit (mental_health)
UPDATE missions SET color = '#F59E0B', icon = 'dumbbell' WHERE id = 7; -- Jalan Kaki 10.000 Langkah (fitness)

-- Verifikasi update
SELECT id, title, category, color, icon FROM missions ORDER BY id; 