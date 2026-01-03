# Faculty Schedule Monitoring System

A fullstack web application built with Laravel (backend) and React (frontend) for monitoring and managing faculty schedules.

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React 19.x with Vite
- **Database**: SQLite (default, can be changed to MySQL/PostgreSQL)
- **Authentication**: Laravel Sanctum
- **API**: RESTful API

## Project Structure

```
faculty schedule monitoring system/
├── backend/          # Laravel API backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   └── services/
    └── vite.config.js
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** (PHP dependency manager)
- **Node.js** >= 18.x and npm
- **SQLite** (or MySQL/PostgreSQL if preferred)

## Installation & Setup

### Backend Setup (Laravel)

1. Navigate to the backend directory:
   ```bash
   cd "faculty schedule monitoring system/backend"
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy the environment file:
   ```bash
   copy .env.example .env
   ```
   (On Linux/Mac: `cp .env.example .env`)

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure your database in `.env` file:
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```
   
   Or for MySQL/PostgreSQL:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=faculty_schedule
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd "faculty schedule monitoring system/frontend"
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (optional):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Faculty Endpoints
- `GET /api/faculties` - Get all faculties
- `POST /api/faculties` - Create a new faculty
- `GET /api/faculties/{id}` - Get a specific faculty
- `PUT /api/faculties/{id}` - Update a faculty
- `DELETE /api/faculties/{id}` - Delete a faculty

### Schedule Endpoints
- `GET /api/schedules` - Get all schedules (supports `?faculty_id=` and `?day_of_week=` filters)
- `POST /api/schedules` - Create a new schedule
- `GET /api/schedules/{id}` - Get a specific schedule
- `PUT /api/schedules/{id}` - Update a schedule
- `DELETE /api/schedules/{id}` - Delete a schedule

## Database Schema

### Faculties Table
- `id` - Primary key
- `name` - Faculty name
- `email` - Unique email address
- `department` - Department name
- `phone` - Phone number (nullable)
- `office_location` - Office location (nullable)
- `created_at`, `updated_at` - Timestamps

### Schedules Table
- `id` - Primary key
- `faculty_id` - Foreign key to faculties table
- `course_name` - Name of the course
- `course_code` - Course code
- `day_of_week` - Day of the week (Monday-Sunday)
- `start_time` - Class start time
- `end_time` - Class end time
- `room` - Room number/location
- `semester` - Semester (nullable)
- `notes` - Additional notes (nullable)
- `created_at`, `updated_at` - Timestamps

## Features

- ✅ Faculty management (CRUD operations)
- ✅ Schedule management (CRUD operations)
- ✅ View schedules by faculty
- ✅ Filter schedules by day of week
- ✅ RESTful API with proper validation
- ✅ React frontend with routing
- ✅ Responsive design

## Development

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd "faculty schedule monitoring system/backend"
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd "faculty schedule monitoring system/frontend"
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

**Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure that:
1. The frontend is running on `http://localhost:3000`
2. The backend `.env` file has `SANCTUM_STATEFUL_DOMAINS` configured correctly
3. The `bootstrap/app.php` has CORS middleware configured

### Database Issues
- Ensure SQLite database file exists: `database/database.sqlite`
- Run migrations: `php artisan migrate`
- Check `.env` file for correct database configuration

### Port Conflicts
- Backend default port: 8000 (change with `php artisan serve --port=8001`)
- Frontend default port: 3000 (configured in `vite.config.js`)

## License

This project is open-sourced software licensed under the MIT license.

