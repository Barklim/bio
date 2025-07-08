## API Requests

### Authentication

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "StrongPassword123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }'
```

Response will include JWT token:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Users (Protected Endpoints)

### Create a user (Admin only - manual creation)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get all users (Requires Authentication)
```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting user by ID
```bash
curl http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints Summary

### Public Endpoints
- `GET /api/v1` - Health check
- `GET /api/v1/version` - Application version
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication

### Protected Endpoints (Require JWT Token)
- `GET /api/v1/users` - List of users
- `POST /api/v1/users` - Create user (admin)
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

**Note**: All protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.