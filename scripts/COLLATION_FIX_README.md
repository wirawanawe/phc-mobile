# Database Collation Fix Guide

## Problem Description

You're encountering the error: `ERROR 1273 (HY000): Unknown collation: 'utf8mb4_0900_ai_ci'`

This error occurs because:
- `utf8mb4_0900_ai_ci` is the default collation in MySQL 8.0+
- Older MySQL versions (5.7 and below) don't support this collation
- Some hosting providers or Docker images use older MySQL versions

## Quick Fix

### Option 1: Automated Fix (Recommended)

1. **Check current collation status:**
   ```bash
   ./scripts/check-collation.sh
   ```

2. **Run the automated fix:**
   ```bash
   ./scripts/fix-collation.sh
   ```

### Option 2: Manual Fix

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Change database collation:**
   ```sql
   ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```

3. **Set session collation:**
   ```sql
   SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
   ```

4. **Convert all tables:**
   ```sql
   -- Run this for each table
   ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```

## Collation Comparison

| Collation | Speed | Accuracy | International Support | MySQL Version Support | Recommendation |
|-----------|-------|----------|---------------------|---------------------|----------------|
| utf8mb4_general_ci | Fast | Low | Basic | All versions | ✅ Best for compatibility |
| utf8mb4_unicode_ci | Medium | High | Excellent | All versions | ✅ Best for international text |
| utf8mb4_0900_ai_ci | Fast | High | Good | MySQL 8.0+ only | ❌ Causes compatibility issues |

## Files Created/Modified

### New Files:
- `scripts/fix-database-collation.sql` - SQL script to fix collation
- `scripts/fix-collation.sh` - Automated fix script
- `scripts/check-collation.sh` - Collation status checker
- `scripts/COLLATION_FIX_README.md` - This guide

### Modified Files:
- `dash-app/lib/db.js` - Added charset and collation configuration

## Environment Variables

You can set these environment variables to customize the database connection:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=phc_dashboard
```

## Testing the Fix

1. **Check collation status:**
   ```bash
   ./scripts/check-collation.sh
   ```

2. **Test database connection:**
   ```bash
   mysql -u root -p -e "USE phc_dashboard; SHOW VARIABLES LIKE 'collation%';"
   ```

3. **Test your application:**
   ```bash
   # Restart your application
   npm run dev
   ```

## Troubleshooting

### Error: "Access denied"
- Check your MySQL credentials
- Ensure the user has sufficient privileges
- Try using root user temporarily

### Error: "Table doesn't exist"
- The script will skip non-existent tables
- This is normal if some tables haven't been created yet

### Error: "Connection timeout"
- Check if MySQL is running
- Verify the host and port settings
- Check firewall settings

### Still getting collation errors
1. Check if your application is setting collation explicitly
2. Look for any SQL files that specify collation
3. Check your MySQL configuration files
4. Restart your application after the fix

## Prevention

To prevent this issue in the future:

1. **Always specify collation in database configuration:**
   ```javascript
   const config = {
     charset: 'utf8mb4',
     collation: 'utf8mb4_general_ci',
     // ... other config
   };
   ```

2. **Use compatible collations in SQL files:**
   ```sql
   CREATE TABLE example (
     name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
   );
   ```

3. **Test with different MySQL versions:**
   - MySQL 5.7
   - MySQL 8.0
   - MariaDB 10.x

## Alternative Solutions

### Option 1: Use utf8mb4_unicode_ci
```sql
ALTER DATABASE phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Option 2: Remove explicit collation
```sql
-- Instead of specifying collation, let MySQL use default
CREATE TABLE example (
  name VARCHAR(100)
);
```

### Option 3: Update MySQL version
- Upgrade to MySQL 8.0+ if possible
- This will support utf8mb4_0900_ai_ci

## Support

If you continue to have issues:

1. Check the application logs for specific error messages
2. Verify your MySQL version: `mysql --version`
3. Check available collations: `SHOW COLLATION WHERE Charset = 'utf8mb4';`
4. Test with a simple connection first

## Commands Summary

```bash
# Check current status
./scripts/check-collation.sh

# Fix collation automatically
./scripts/fix-collation.sh

# Manual fix (if needed)
mysql -u root -p < scripts/fix-database-collation.sql

# Test connection
mysql -u root -p -e "USE phc_dashboard; SELECT @@collation_database;"
```
