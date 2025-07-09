# BIO Backend API

<!-- Badges Section 
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)
-->

<!-- ![Test Coverage](https://img.shields.io/codecov/c/github/Barklim/bio/BIO_backend) -->
![Issues](https://img.shields.io/github/issues/Barklim/bio/BIO_backend)
![Pull Requests](https://img.shields.io/github/issues-pr/Barklim/bio/BIO_backend)
![Last Commit](https://img.shields.io/github/last-commit/Barklim/bio)

Modern NestJS Backend API with PostgreSQL, JWT Authentication, and comprehensive testing

## Features

- **JWT Authentication** - Secure user registration and login
- **User Management** - Complete CRUD operations with soft delete
- **PostgreSQL Database** - Robust data storage with TypeORM
- **Docker Support** - Easy deployment and development
- **Swagger Documentation** - Interactive API documentation
- **Comprehensive Testing** - Unit, Integration, and E2E tests
- **Input Validation** - Strong data validation with class-validator
- **Logging** - Structured logging for debugging and monitoring
- **CORS Support** - Cross-origin resource sharing configured
- **Hot Reload** - Fast development with automatic reloading

## Installation and launch

### Cloning and installing dependencies

```bash
npm install
```

### Setting environment variables

Copy the `env.template` file to `.env` and set up the variables:

```bash
cp env.template .env
```

### Run with Docker (recommended)

#### Production mode
```bash
# Start all services (API + PostgreSQL + pgAdmin)
docker compose up -d

# Просмотр логов
docker compose logs -f
```

#### Development mode
```bash
# Run in development mode with hot reload
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f api
```

### Local Run (without Docker)

```bash
# Make sure PostgreSQL is running locally
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Run in production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, the Swagger documentation will be available at:
- **Local**: http://localhost:3000/api/docs
- **Docker**: http://localhost:3000/api/docs

All API endpoints are prefixed with `/api/v1` for versioning (following REST API best practices).

## Available commands

```bash
# Development
npm run start:dev          # Startup with hot reboot
npm run start:debug        # Run with debugger

# Production
npm run build              # Build project
npm run start:prod         # Run production version

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Tests with coverage

# Linting and formatting
npm run lint               # Code check
npm run format             # Code formatting
```

## Project structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Entry point to the application
├── app.controller.ts       # Main controller
├── app.service.ts          # Main service
├── database/               # Database configuration
│   └── database.module.ts
└── users/                  # User module
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── entities/
    │   └── user.entity.ts
    └── dto/
        ├── create-user.dto.ts
        └── update-user.dto.ts
```

## Environment variables

| Variable | Description | Default |
|------------|-----------|--------------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | DB user | `postgres` |
| `DB_PASSWORD` | DB password | `postgres` |
| `DB_NAME` | Database name | `bio_db` |
| `CORS_ORIGIN` | CORS settings | `*` |
| `JWT_SECRET` | JWT secret key | `super-secret-jwt-key-change-in-production` |
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` |

## Troubleshooting

### Problems connecting to the database
1. Make sure PostgreSQL is running
2. Check environment variables in `.env`
3. Check port 5432 is available

### Docker issues
1. Make sure Docker is running
2. Check free ports (3000, 5432, 5050)
3. Clear Docker cache: `docker system prune`

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, SuperTest
- **Containerization**: Docker & Docker Compose