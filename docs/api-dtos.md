# API Endpoints Documentation

This document outlines all endpoints in the Entix API, their request/response formats, and authentication requirements.

## Authentication

The API uses JWT tokens from AWS Cognito for authentication. Most endpoints require authentication.

### Obtaining a Token

To use authenticated endpoints, first obtain a token:

```
POST /api/v1/auth/signin
```

**Request Body:**

```json
{
  "username": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJjd...",
  "idToken": "eyJhb...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Incorrect username or password",
  "errorId": "8e3d9b3c-4a5f-44e2-a3bd-67fc43388a2a",
  "type": "unauthorized",
  "status": 401
}
```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbG...
```

## Endpoints

### Auth Endpoints

#### Sign Up

```
POST /api/v1/auth/signup
```

**Request Body:**

```json
{
  "username": "newuser@example.com",
  "password": "newpassword123",
  "email": "newuser@example.com"
}
```

**Response (201 Created):**

```json
{
  "userConfirmed": false,
  "userSub": "6c872a2a-35a7-43de-9bd7-c78e3d4e966b"
}
```

#### Confirm Sign Up

```
POST /api/v1/auth/confirm-signup
```

**Request Body:**

```json
{
  "username": "newuser@example.com",
  "confirmationCode": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Sign In

```
POST /api/v1/auth/signin
```

See "Obtaining a Token" section above for request/response.

#### Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Request Body:**

```json
{
  "username": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "codeDeliveryDetails": {
    "destination": "u***@e***.com",
    "deliveryMedium": "EMAIL",
    "attributeName": "email"
  }
}
```

#### Confirm Forgot Password

```
POST /api/v1/auth/confirm-forgot-password
```

**Request Body:**

```json
{
  "username": "user@example.com",
  "password": "newpassword123",
  "confirmationCode": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Change Password

```
POST /api/v1/auth/change-password
```

**Request Body:**

```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh-token
```

**Request Body:**

```json
{
  "refreshToken": "eyJjd..."
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJjd...",
  "idToken": "eyJhb...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

#### Sign Out

```
POST /api/v1/auth/signout
```

**Request Body:**

```json
{
  "refreshToken": "eyJjd..."
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Get Current User

```
GET /api/v1/auth/me
```

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "id": "user123",
  "username": "user@example.com",
  "email": "user@example.com",
  "isActive": true,
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z"
}
```

### User Endpoints

#### Get All Users

```
GET /api/v1/users
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:users' permission

**Response (200 OK):**

```json
[
  {
    "id": "user123",
    "username": "user@example.com",
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  }
]
```

#### Get User by ID

```
GET /api/v1/users/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role, 'read:users' permission, or own user ID

**Response (200 OK):**

```json
{
  "id": "user123",
  "username": "user@example.com",
  "email": "user@example.com",
  "isActive": true,
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z"
}
```

#### Create User

```
POST /api/v1/users
```

**Authentication Required**: Yes (admin only)  
**Authorization Required**: Admin role or 'write:users' permission

**Request Body:**

```json
{
  "username": "newuser@example.com",
  "password": "newpassword123",
  "email": "newuser@example.com"
}
```

**Response (201 Created):**

```json
{
  "id": "user124",
  "username": "newuser@example.com",
  "email": "newuser@example.com",
  "isActive": true,
  "createdAt": "2023-07-15T10:00:00Z",
  "updatedAt": "2023-07-15T10:00:00Z"
}
```

#### Update User

```
PUT /api/v1/users/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role, 'write:users' permission, or own user ID

**Request Body:**

```json
{
  "email": "updatedemail@example.com",
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "id": "user123",
  "username": "user@example.com",
  "email": "updatedemail@example.com",
  "isActive": true,
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-15T11:00:00Z"
}
```

#### Delete User

```
DELETE /api/v1/users/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'delete:users' permission

**Response (204 No Content)**

### Role Endpoints

#### Get All Roles

```
GET /api/v1/roles
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:roles' permission

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "admin",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  },
  {
    "id": 2,
    "name": "user",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  }
]
```

#### Get Role by ID

```
GET /api/v1/roles/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:roles' permission

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "admin",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z"
}
```

#### Create Role

```
POST /api/v1/roles
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:roles' permission

**Request Body:**

```json
{
  "name": "moderator"
}
```

**Response (201 Created):**

```json
{
  "id": 3,
  "name": "moderator",
  "createdAt": "2023-07-15T10:00:00Z",
  "updatedAt": "2023-07-15T10:00:00Z"
}
```

#### Update Role

```
PUT /api/v1/roles/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:roles' permission

**Request Body:**

```json
{
  "name": "supervisor"
}
```

**Response (200 OK):**

```json
{
  "id": 3,
  "name": "supervisor",
  "createdAt": "2023-07-15T10:00:00Z",
  "updatedAt": "2023-07-15T11:00:00Z"
}
```

#### Delete Role

```
DELETE /api/v1/roles/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'delete:roles' permission

**Response (204 No Content)**

### Permission Endpoints

#### Get All Permissions

```
GET /api/v1/permissions
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:permissions' permission

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "read:users",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  },
  {
    "id": 2,
    "name": "write:users",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  }
]
```

#### Get Permission by ID

```
GET /api/v1/permissions/:id
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:permissions' permission

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "read:users",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z"
}
```

#### Create Permission

```
POST /api/v1/permissions
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:permissions' permission

**Request Body:**

```json
{
  "name": "read:reports"
}
```

**Response (201 Created):**

```json
{
  "id": 3,
  "name": "read:reports",
  "createdAt": "2023-07-15T10:00:00Z",
  "updatedAt": "2023-07-15T10:00:00Z"
}
```

### Role-Permission Management

#### Get Permissions for Role

```
GET /api/v1/roles/:id/permissions
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'read:roles' permission

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "read:users",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  },
  {
    "id": 2,
    "name": "write:users",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  }
]
```

#### Assign Permission to Role

```
POST /api/v1/roles/:id/permissions
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:roles' permission

**Request Body:**

```json
{
  "permissionId": 3
}
```

**Response (204 No Content)**

#### Remove Permission from Role

```
DELETE /api/v1/roles/:id/permissions/:permissionId
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:roles' permission

**Response (204 No Content)**

### User-Role Management

#### Get Roles for User

```
GET /api/v1/users/:id/roles
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role, 'read:users' permission, or own user ID

**Response (200 OK):**

```json
[
  {
    "id": 2,
    "name": "user",
    "createdAt": "2023-07-14T12:00:00Z",
    "updatedAt": "2023-07-14T12:00:00Z"
  }
]
```

#### Assign Role to User

```
POST /api/v1/users/:id/roles
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:users' permission

**Request Body:**

```json
{
  "roleId": 3
}
```

**Response (204 No Content)**

#### Remove Role from User

```
DELETE /api/v1/users/:id/roles/:roleId
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role or 'write:users' permission

**Response (204 No Content)**

### Health Endpoint

```
GET /health
```

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2023-07-15T12:00:00Z"
}
```

### Demo Endpoints

The demo endpoints showcase various authentication and authorization patterns:

#### Public Endpoint

```
GET /api/v1/demo/public
```

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "message": "This is a public endpoint",
  "timestamp": "2023-07-15T12:00:00Z"
}
```

#### Authenticated Endpoint

```
GET /api/v1/demo/authenticated
```

**Authentication Required**: Yes (any authenticated user)

**Response (200 OK):**

```json
{
  "message": "You are authenticated!",
  "user": {
    "id": "user123",
    "username": "user@example.com",
    "email": "user@example.com"
  },
  "timestamp": "2023-07-15T12:00:00Z"
}
```

#### Admin-Only Endpoint

```
GET /api/v1/demo/admin
```

**Authentication Required**: Yes  
**Authorization Required**: Admin role

**Response (200 OK):**

```json
{
  "message": "You are an admin!",
  "roles": ["admin", "user"],
  "timestamp": "2023-07-15T12:00:00Z"
}
```

#### Permission-Based Endpoint

```
GET /api/v1/demo/users
```

**Authentication Required**: Yes  
**Authorization Required**: 'users:read' permission

**Response (200 OK):**

```json
{
  "message": "You have permission to read users!",
  "permissions": ["users:read", "users:write"],
  "timestamp": "2023-07-15T12:00:00Z"
}
```

## Error Handling

All endpoints follow a consistent error format:

**Error Response:**

```json
{
  "message": "Error message describing what went wrong",
  "errorId": "unique-error-id",
  "type": "error_type",
  "status": 400
}
```

Common error types include:

- `validation` (422): Invalid request data
- `notfound` (404): Resource not found
- `conflict` (409): Resource already exists
- `unauthorized` (401): Missing or invalid authentication
- `forbidden` (403): Insufficient permissions
- `internal` (500): Server error

## Improvements

Potential future improvements include:

- Implementing rate limiting per endpoint
- Adding comprehensive API versioning
- Implementing a refresh token rotation strategy
- Supporting multiple authentication methods
- Enhancing permission granularity with resource-based permissions
- Adding support for multi-factor authentication
