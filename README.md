# Nest React Boilerplate

A simple authentication boilerplate with NestJS backend and React frontend.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL (Docker)

## Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Installation & Setup

### 1. Clone and Install
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup
Copy .env files and configure:

**Root .env** (for Docker):
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=nest-react-boilerplate-db
POSTGRES_PORT=5432
```

**backend/.env** (for NestJS):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=nest-react-boilerplate-db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
FRONTEND_URL=http://localhost:5173
SWAGGER_ENABLED=true
```

**frontend/.env** (for Vite):
```
VITE_API_URL=http://localhost:3000
```

### 3. Start Database
```bash
docker-compose up -d
```

### 4. Start Backend
```bash
cd backend
npm run start:dev
```

### 5. Start Frontend
```bash
cd frontend
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Database**: localhost:5432

## Usage Flow
1. Register a new account at `/register`
2. Login with credentials at `/login`
3. View profile at `/dashboard`
4. Logout to return to login

## Development Notes
- Backend runs on port 3000
- Frontend runs on port 5173 (Vite default)
- PostgreSQL runs on port 5432
- JWT tokens expire in 24 hours
- Passwords are hashed with bcrypt (10 rounds)
- Swagger documentation available at /api/docs
- Use "Authorize" button in Swagger UI to test protected endpoints

## Project Structure
```
nest-react-boilerplate/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── entities/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
├── docker-compose.yml
├── .env
└── README.md
```

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

## Frontend Environment Variables
VITE_API_URL=http://localhost:3000

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

## API Documentation
- **Swagger UI**: http://localhost:3000/api/docs
- Interactive API testing with authentication support
- Automatic request/response examples
- JWT Bearer token authentication integrated
- See interactive documentation at /api/docs for detailed request/response schemas

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
- [x] Step 11: Final configuration and documentation complete
- [x] Milestone 2 - Step 1: Swagger documentation added
