# PHC Mobile

A comprehensive health and wellness mobile application built with React Native and Node.js.

## Features

- Health Assessment & Tracking
- Fitness Gamification
- Wellness Activities
- Expert Consultation Booking
- Health Education Content
- News Portal
- Admin Dashboard

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```

3. Set up the database:
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database credentials
   npm run db:sync
   npm run db:seed
   ```

4. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

5. Start the mobile app:
   ```bash
   npm start
   ```

## Admin Dashboard Access

### Creating Admin User

1. Start the backend server
2. Create an admin user by calling the API:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin
   ```
   This creates an admin user with:
   - Email: `admin@phc.com`
   - Password: `password`
   - Role: `admin`

### Accessing Admin Dashboard

1. Login to the mobile app with admin credentials
2. Go to Profile screen
3. Tap on "Admin Dashboard" menu item
4. The admin dashboard will show:
   - User statistics
   - Clinic and doctor counts
   - Recent bookings
   - System overview

### Admin Dashboard Features

- **Statistics Overview**: View total users, clinics, doctors, bookings, and assessments
- **Recent Users**: See the latest registered users
- **Recent Bookings**: Monitor recent clinic bookings
- **Data Management**: Access to user, clinic, and doctor management (via API)

## API Endpoints

### Admin Endpoints

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/clinics` - Get all clinics
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/bookings` - Get all bookings

### Authentication

All admin endpoints require authentication with a valid JWT token and admin role.

## Troubleshooting

### Dashboard Not Loading

1. Ensure backend server is running on port 3000
2. Verify admin user exists and has correct role
3. Check database connection
4. Verify JWT token is valid

### Login Issues

1. Make sure admin user is created properly
2. Check if password is correct
3. Verify database tables exist
4. Check server logs for errors

## License

This project is licensed under the MIT License.
