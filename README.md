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

## Environment Variables
- Root .env file for Docker configuration
- Backend .env for NestJS configuration
- Frontend .env for Vite configuration

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
