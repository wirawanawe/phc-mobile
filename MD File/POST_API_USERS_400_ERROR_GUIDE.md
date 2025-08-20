# POST /api/users 400 Error Debugging Guide

## Overview

The `POST /api/users` endpoint returns a 400 Bad Request error when validation fails. This guide explains the causes and how to debug them.

## Error Causes

### 1. Missing Required Fields (400 Bad Request)
**Triggered when:** Any of these required fields are missing or empty:
- `name` (required)
- `email` (required)
- `password` (required)

**Error Response:**
```json
{
  "success": false,
  "message": "Nama, email, dan password wajib diisi"
}
```

### 2. Duplicate User (400 Bad Request)
**Triggered when:** A user with the same `name` or `email` already exists in the database.

**Error Response:**
```json
{
  "success": false,
  "message": "Nama atau email sudah terdaftar"
}
```

## Debugging Steps

### 1. Check Server Logs
The API endpoint now includes detailed logging. Look for these log messages:

```
🔍 POST /api/users - Request body: {...}
❌ Validation failed - Missing required fields: {...}
❌ Validation failed - User already exists: {...}
✅ Validation passed - Creating new user
✅ User created successfully with ID: 25
```

### 2. Use the Debug Script
Run the provided debug script to test all scenarios:

```bash
node scripts/debug-api-users.js
```

This script will:
- Test valid user creation
- Test missing required fields
- Test duplicate user scenarios
- Provide detailed output for each test

### 3. Check Browser Network Tab
When the error occurs in the frontend:
1. Open browser Developer Tools
2. Go to Network tab
3. Reproduce the error
4. Look for the POST request to `/api/users`
5. Check the Request payload and Response

### 4. Test with curl
Test the endpoint directly:

```bash
# Test valid user creation
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test missing fields
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"","password":""}'

# Test duplicate user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Common Frontend Sources

The 400 error can come from these frontend components:

1. **Dashboard User Management** (`/dash-app/app/users/`)
   - User creation form
   - User editing form

2. **Settings User Management** (`/dash-app/app/settings/users/`)
   - Settings user creation form

3. **Role Management** (`/dash-app/app/role-management/`)
   - Role management user creation

4. **Mobile User Management** (`/dash-app/app/mobile/users/`)
   - Mobile user creation form

## API Endpoint Details

### Request Format
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "staff",           // optional, defaults to "staff"
  "is_active": true          // optional, defaults to true
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Pengguna berhasil ditambahkan",
  "data": {
    "id": 25
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Nama, email, dan password wajib diisi"
}
```

## Security Improvements Made

1. **SQL Injection Prevention**: Updated to use parameterized queries
2. **Detailed Logging**: Added comprehensive request/response logging
3. **Input Validation**: Proper validation of required fields
4. **Duplicate Prevention**: Checks for existing users before creation

## Troubleshooting Checklist

- [ ] Check if server is running (`npm run dev`)
- [ ] Verify database connection
- [ ] Check server logs for detailed error messages
- [ ] Test with debug script
- [ ] Verify request payload in browser Network tab
- [ ] Check for duplicate users in database
- [ ] Ensure all required fields are provided

## Database Schema

The `users` table structure:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'doctor', 'staff') NOT NULL DEFAULT 'staff',
  clinic_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Quick Fix Commands

```bash
# Check server status
ps aux | grep "server.js"

# View recent logs
tail -20 backend.log

# Test API endpoint
node scripts/debug-api-users.js

# Restart server if needed
cd dash-app && npm run dev
```

## Support

If you continue to experience issues:
1. Check the server logs for detailed error messages
2. Run the debug script to identify the specific issue
3. Verify the request payload being sent from the frontend
4. Check database connectivity and user table structure
