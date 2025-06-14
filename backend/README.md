# WebMed Backend

Backend server for the WebMed medical platform.

## Database Management

The application uses MySQL for data storage with Sequelize ORM. By default, the database tables are preserved between server restarts to maintain all your data.

### Database Initialization

On server startup, the application:
1. Connects to the MySQL database
2. Verifies all required tables exist, creating them if needed
3. Preserves all existing data

### Reset Database (Optional)

If you need to reset the database and start fresh:

```bash
# Reset all tables and data
npm run reset-db
```

This will drop all tables and recreate them with the initial schema. Use with caution as **all data will be permanently lost**.

### Environment Variables

You can control database reset behavior with environment variables:

- `RESET_DB=true` - Will reset the database on next server startup

Example:
```bash
# On Windows
set RESET_DB=true
npm start

# On Linux/Mac
RESET_DB=true npm start
```

## User Roles Setup

### Admin Setup

#### Option 1: All-in-one Setup Script (Recommended)

To set up the admin role and create the first admin user in one step:

```bash
# Complete admin setup
node scripts/setup_admin_role.js
```

This script will:
1. Add the admin role to the users table
2. Create a default admin user if one doesn't already exist

#### Option 2: Step-by-step Setup

If you prefer to run each step individually:

```bash
# Step 1: Add admin role to the users table
node migrations/add_admin_role.js

# Step 2: Create default admin user
node scripts/create_admin_user.js
```

The default admin credentials are:
- Email: admin@example.com
- Password: Admin123!

### Dispatcher Setup

To add the dispatcher role and create a dispatcher user:

```bash
# Step 1: Add dispatcher role to the users table
node migrations/add_dispecer_role.js

# Step 2: Create default dispatcher user
node scripts/create_dispecer_user.js
```

The default dispatcher credentials are:
- Email: dispecer@example.com
- Password: Dispecer123!

**Important:** Change all default passwords after first login for security reasons.

## API Routes

The application provides the following main API routes:

- `/api/login` - User authentication
- `/api/register` - New user registration
- `/api/users` - User management
- `/api/medical-records` - Patient medical records
- `/api/appointments` - Appointment booking and management
- `/api/availability` - Doctor availability management
- `/api/medical-tests` - Medical tests management

## Development

```bash
# Install dependencies
npm install

# Start development server with nodemon
npm start
``` 