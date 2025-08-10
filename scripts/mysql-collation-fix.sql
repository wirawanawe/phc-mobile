-- MySQL Collation Fix Script
-- This script helps resolve utf8mb4_0900_ai_ci collation issues

-- Set the database to use utf8mb4_general_ci collation
ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- If you're creating a new database, use this instead:
-- CREATE DATABASE IF NOT EXISTS phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Set session variables to use the compatible collation
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;

-- Check current collation settings
SELECT 
    @@character_set_database as database_charset,
    @@collation_database as database_collation,
    @@character_set_connection as connection_charset,
    @@collation_connection as connection_collation;

-- Alternative: Use utf8mb4_unicode_ci (recommended for international text)
-- ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; 