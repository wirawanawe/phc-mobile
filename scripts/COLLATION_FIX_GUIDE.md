# MySQL Collation Fix Guide

## Problem
You're encountering the error: `ERROR 1273 (HY000) at line 25: Unknown collation: 'utf8mb4_0900_ai_ci'`

## Solutions

### Solution 1: Use utf8mb4_general_ci (Recommended for compatibility)

1. **Run the fix script:**
   ```bash
   mysql -u root -p < scripts/mysql-collation-fix.sql
   ```

2. **Or manually set the collation:**
   ```sql
   ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
   ```

### Solution 2: Use utf8mb4_unicode_ci (Recommended for international text)

```sql
ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Solution 3: Remove explicit collation declarations

If you have a SQL file with explicit collation declarations, remove them and let MySQL use the default:

**Before:**
```sql
CREATE TABLE example (
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
);
```

**After:**
```sql
CREATE TABLE example (
    name VARCHAR(100)
);
```

### Solution 4: Fix specific SQL files

If you know which SQL file is causing the issue, replace the collation:

```bash
# Replace utf8mb4_0900_ai_ci with utf8mb4_general_ci
sed -i '' 's/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g' your_file.sql

# Or replace with utf8mb4_unicode_ci
sed -i '' 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' your_file.sql
```

## Collation Comparison

| Collation | Speed | Accuracy | International Support | Recommendation |
|-----------|-------|----------|---------------------|----------------|
| utf8mb4_general_ci | Fast | Low | Basic | Good for compatibility |
| utf8mb4_unicode_ci | Medium | High | Excellent | Best for international text |
| utf8mb4_0900_ai_ci | Fast | High | Good | MySQL 8.0+ default |

## Testing Your Fix

1. **Test the database connection:**
   ```bash
   mysql -u root -p -e "USE phc_dashboard; SHOW VARIABLES LIKE 'collation%';"
   ```

2. **Test your SQL file:**
   ```bash
   mysql -u root -p < your_problematic_file.sql
   ```

## Common Commands

### Check current collation settings:
```sql
SELECT 
    @@character_set_database as database_charset,
    @@collation_database as database_collation,
    @@character_set_connection as connection_charset,
    @@collation_connection as connection_collation;
```

### List available collations:
```sql
SHOW COLLATION WHERE Charset = 'utf8mb4';
```

### Set session collation:
```sql
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
```

## If the problem persists:

1. Check if you're running a specific SQL command that contains the problematic collation
2. Look for any application code that might be setting the collation explicitly
3. Check your MySQL configuration files for default collation settings
4. Ensure you're using the correct MySQL client version

## Quick Fix Commands

```bash
# Option 1: Use general_ci
mysql -u root -p -e "ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# Option 2: Use unicode_ci
mysql -u root -p -e "ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Option 3: Set session variables
mysql -u root -p -e "SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;"
``` 