# Clinic-Based Access Control Implementation

## Overview

This document describes the implementation of clinic-based data filtering and role-based access control for the PHC Dashboard system. The system now ensures that users can only access data related to their assigned clinic, and admin users are restricted from accessing mobile app management features.

## Key Features Implemented

### 1. Clinic-Based Data Filtering

When users login with a specific `clinic_id`, the system automatically filters all data to show only records related to that clinic:

- **Patients**: Only patients from the assigned clinic
- **Visits**: Only visits from the assigned clinic  
- **Doctors**: Only doctors working at the assigned clinic
- **Medicine**: Only medicine inventory from the assigned clinic

### 2. Role-Based Access Control

- **SUPERADMIN**: Full access to all data and features across all clinics
- **ADMIN**: Access limited to their assigned clinic's data, cannot access mobile app management
- **DOCTOR**: Access to patient data and medical records within their clinic
- **STAFF**: Basic access to patient information within their clinic

### 3. Mobile App Access Restriction

Admin users are now restricted from accessing the mobile app management tab and all its sub-features. Only SUPERADMIN users can access:

- Mobile Dashboard
- Mobile Users Management
- Food Database
- Mission System
- Wellness Activities
- Health Data Tracking
- Sleep & Mood Tracking
- And other mobile app features

## Implementation Details

### API Endpoints Updated

#### 1. Patients API (`/api/patients`)
```javascript
// Added clinic-based filtering
if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  apiUrl += `&clinic_id=${encodeURIComponent(userPayload.clinic_id)}`;
}

// Client-side filtering as fallback
if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  patients = patients.filter(patient => 
    patient.clinic_id == userPayload.clinic_id
  );
}
```

#### 2. Visits API (`/api/visits`)
```javascript
// Added clinic-based filtering
if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  apiUrl += `&clinic_id=${encodeURIComponent(userPayload.clinic_id)}`;
}

// Client-side filtering as fallback
if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  visits = visits.filter(visit => 
    visit.clinicId == userPayload.clinic_id
  );
}
```

#### 3. Doctors API (`/api/doctors`)
```javascript
// Added clinic-based filtering
if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  conditions.push("d.clinic_id = ?");
  params.push(userPayload.clinic_id);
}
```

#### 4. Medicine API (`/api/medicine`)
```javascript
// Added clinic-based filtering
let effectiveClinicId = clinicId;

if (userPayload && userPayload.role !== "SUPERADMIN" && userPayload.clinic_id) {
  effectiveClinicId = userPayload.clinic_id;
}

if (effectiveClinicId && effectiveClinicId !== '') {
  medicinesQuery += ` AND m.clinic_id = ${parseInt(effectiveClinicId)}`;
  countQuery += ` AND m.clinic_id = ${parseInt(effectiveClinicId)}`;
}
```

### Navigation Components Updated

#### 1. MobileNavigation Component
```javascript
// Mobile App section now restricted to SUPERADMIN only
{
  title: "Mobile App",
  icon: <Mobile className="h-5 w-5" />,
  path: "/mobile",
  submenu: [
    {
      title: "Dashboard Mobile",
      path: "/mobile",
      description: "Overview dan statistik utama",
      roles: ["SUPERADMIN"], // Changed from ["SUPERADMIN", "ADMIN"]
    },
    // ... all other mobile submenu items now restricted to SUPERADMIN
  ],
  roles: ["SUPERADMIN"], // Changed from ["SUPERADMIN", "ADMIN"]
}
```

#### 2. Sidebar Component
```javascript
// Same restrictions applied to desktop sidebar
{
  title: "Mobile App",
  icon: <FaMobile />,
  path: "/mobile",
  submenu: [
    // All submenu items restricted to SUPERADMIN only
  ],
  roles: ["SUPERADMIN"], // Changed from ["SUPERADMIN", "ADMIN"]
}
```

### Middleware Protection

#### Role-Based Route Protection
```javascript
// Added middleware protection for mobile app routes
if (pathname.startsWith('/mobile') && !pathname.startsWith('/api/mobile/')) {
  const token = request.cookies.get('token');
  if (token) {
    const userPayload = await verifyJwtToken(token.value);
    
    // Only allow SUPERADMIN to access mobile app management
    if (userPayload && userPayload.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
}
```

### Utility Functions Added

#### 1. Clinic Access Utilities (`/lib/auth.js`)
```javascript
// Check if user has access to specific clinic
export function hasClinicAccess(userPayload, clinicId) {
  if (userPayload.role === "SUPERADMIN") return true;
  if (userPayload.role === "ADMIN" && userPayload.clinic_id) {
    return userPayload.clinic_id == clinicId;
  }
  return false;
}

// Build SQL filter conditions for clinic-based queries
export function buildClinicFilter(userPayload, tableAlias = "") {
  const conditions = [];
  const params = [];
  
  if (userPayload.role === "SUPERADMIN") {
    return { conditions, params };
  }
  
  if (userPayload.role === "ADMIN" && userPayload.clinic_id) {
    const clinicColumn = tableAlias ? `${tableAlias}.clinic_id` : "clinic_id";
    conditions.push(`${clinicColumn} = ?`);
    params.push(userPayload.clinic_id);
  }
  
  return { conditions, params };
}

// Filter data arrays by clinic
export function filterDataByClinic(data, userPayload, clinicIdField = "clinic_id") {
  if (userPayload.role === "SUPERADMIN") return data;
  if (userPayload.role === "ADMIN" && userPayload.clinic_id) {
    return data.filter(item => item[clinicIdField] == userPayload.clinic_id);
  }
  return [];
}
```

## Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'doctor', 'staff') NOT NULL DEFAULT 'staff',
  clinic_id INT NULL,  -- This field is crucial for clinic-based filtering
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_clinic_id (clinic_id)  -- Important index for performance
);
```

### Related Tables
All tables that contain clinic-specific data should have a `clinic_id` column:
- `patients.clinic_id`
- `visits.clinic_id`
- `doctors.clinic_id`
- `medicines.clinic_id`

## Security Considerations

### 1. Token Verification
- All API endpoints verify JWT tokens to ensure user authentication
- User role and clinic_id are extracted from the token payload
- Invalid or expired tokens are rejected

### 2. SQL Injection Prevention
- All clinic filtering uses parameterized queries
- User input is properly sanitized and validated

### 3. Access Control Layers
- **Frontend**: Navigation components filter menu items based on user role
- **Middleware**: Route-level protection for mobile app access
- **Backend**: API-level filtering ensures data isolation

## Testing Scenarios

### 1. Superadmin Access
- ✅ Can access all clinics and their data
- ✅ Can access mobile app management features
- ✅ Can see all patients, visits, doctors, and medicine across clinics

### 2. Admin Access (with clinic_id)
- ✅ Can only access data from their assigned clinic
- ✅ Cannot access mobile app management features
- ✅ Cannot see data from other clinics
- ✅ Redirected to dashboard when trying to access mobile app routes

### 3. Doctor/Staff Access
- ✅ Can access patient data within their clinic
- ✅ Cannot access mobile app management features
- ✅ Cannot access administrative features

### 4. Unauthorized Access
- ✅ Users without proper role are redirected appropriately
- ✅ Invalid tokens result in login redirect
- ✅ Missing clinic_id for admin users shows no data

## Migration Guide

### For Existing Users
1. **Superadmin users**: No changes needed, full access maintained
2. **Admin users**: Must be assigned a `clinic_id` to access clinic-specific data
3. **Admin users**: Will lose access to mobile app management features

### Database Updates
```sql
-- Update existing admin users to have clinic_id
UPDATE users 
SET clinic_id = 1 
WHERE role = 'admin' AND clinic_id IS NULL;

-- Ensure all admin users have a clinic_id
ALTER TABLE users 
MODIFY COLUMN clinic_id INT NOT NULL 
WHERE role = 'admin';
```

## Troubleshooting

### Common Issues

1. **Admin users see no data**
   - Check if `clinic_id` is properly set in the users table
   - Verify the clinic_id exists in the clinics table

2. **Mobile app access denied for admin users**
   - This is expected behavior - only SUPERADMIN can access mobile app features
   - Admin users should use the main dashboard features

3. **Performance issues with large datasets**
   - Ensure proper indexing on `clinic_id` columns
   - Consider implementing pagination for large result sets

### Debug Information
- Check browser console for authentication errors
- Verify JWT token payload contains correct role and clinic_id
- Monitor API response times for clinic-filtered queries

## Future Enhancements

1. **Multi-clinic Admin Support**: Allow admin users to manage multiple clinics
2. **Granular Permissions**: Implement more detailed permission system
3. **Audit Logging**: Track data access for compliance purposes
4. **Caching**: Implement caching for clinic-filtered queries
5. **Real-time Updates**: Add real-time data synchronization across clinics

## Conclusion

The clinic-based access control system ensures data security and proper role-based access while maintaining system performance. Admin users are now properly restricted from mobile app management, and all data is filtered based on user clinic assignments.
