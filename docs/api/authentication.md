# Authentication

## Overview

The API uses JWT (JSON Web Tokens) for authentication.

## Usage

### Login

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Routes

Add the JWT token to the Authorization header:

```typescript
GET /api/protected-route
Authorization: Bearer <your-jwt-token>
```

## Error Handling

Authentication errors return standard 401/403 responses:

```json
{
  "status": 401,
  "message": "Unauthorized",
  "timestamp": "2024-02-20T12:00:00Z"
}
```
