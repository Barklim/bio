# BIO Backend API

Rest API backend on NestJS with TypeScript, PostgreSQL and Docker configuration.

## Requirements

- Node.js 18+
- Docker и Docker Compose
- PostgreSQL (if running locally)

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

## 📁 Project structure

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