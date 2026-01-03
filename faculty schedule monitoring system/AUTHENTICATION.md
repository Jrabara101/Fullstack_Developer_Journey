# Authentication Setup Guide

## Overview
The Faculty Schedule Monitoring System now includes complete authentication with login and registration pages styled after the Frest design.

## Admin Account

An admin account has been created with the following credentials:

- **Email**: `admin@frest.com`
- **Password**: `password`
- **Role**: `admin`

To create the admin account again, run:
```bash
cd backend
php artisan db:seed --class=AdminSeeder
```

## API Endpoints

### Authentication Endpoints

- `POST /api/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```

- `POST /api/login` - Login user
  ```json
  {
    "email": "admin@frest.com",
    "password": "password"
  }
  ```

- `POST /api/logout` - Logout user (requires authentication)
- `GET /api/user` - Get authenticated user (requires authentication)

## Frontend Routes

- `/login` - Login page
- `/register` - Registration page
- `/` - Dashboard (protected)
- `/schedule` - Schedule page (protected)

## Features

✅ Login with email/username and password
✅ Registration with name, email, and password
✅ Password visibility toggle
✅ Remember me checkbox
✅ Protected routes requiring authentication
✅ Automatic redirect to login if not authenticated
✅ User role display (Admin badge)
✅ Logout functionality
✅ Beautiful Frest-inspired design

## User Roles

- **admin** - Full access to the system
- **user** - Standard user access

## Testing

1. Start the backend server:
   ```bash
   cd backend
   php artisan serve
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Login with admin credentials or create a new account

## Security Notes

- Passwords are hashed using bcrypt
- Authentication tokens are stored in localStorage
- API uses Bearer token authentication
- All protected routes require valid authentication token
- CSRF protection is disabled for API routes (as expected for API)

