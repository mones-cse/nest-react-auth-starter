# Nest React Boilerplate

A simple authentication boilerplate with NestJS backend and React frontend.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL (Docker)

## Project Structure
- .env
- docker-compose.yml
- README.md
- .gitignore

## Setup Progress
- [x] Step 1: Project root structure created
- [x] Step 2: Backend initialized with environment configuration
- [x] Step 3: User entity created
- [x] Step 4: Users module created with service methods
- [x] Step 5: Authentication module with JWT implemented
- [x] Step 6: Frontend initialized with Vite, React, and Tailwind CSS
- [x] Step 7: Authentication context and API service created
- [x] Step 8: Register and Login pages created
- [x] Step 9: Dashboard page created with user profile display
- [x] Step 10: Routing configured with protected routes

## Environment Variables
- Root .env file for Docker configuration
- Backend .env for NestJS configuration
- Frontend .env for Vite configuration

## Frontend Environment Variables
VITE_API_URL=http://localhost:3000

## Frontend Features
- JWT token storage in localStorage
- Automatic token attachment to API requests
- Protected route handling
- Auth context for global state management
- Private route component for /dashboard protection
- Automatic redirects for unauthenticated users
- Loading states during authentication checks

## Backend Environment Variables
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, PORT, FRONTEND_URL

## Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| email | VARCHAR | Unique, Not Null |
| full_name | VARCHAR | Not Null |
| password | VARCHAR | Not Null (Hashed) |
| created_at | TIMESTAMP | Default: now() |
| updated_at | TIMESTAMP | Auto-update |

## API Endpoints

### Authentication
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login user | No |
| GET | /auth/profile | Get current user | Yes |

### Request/Response Examples

#### Register
```json
// POST /auth/register
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123"
}
```

#### Login
```json
// POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Profile
```json
// GET /auth/profile
// Header: Authorization: Bearer <token>
{
  "id": "uuid",
  "email": "user@example.com"
}
```
