# Admin API Documentation

## Overview

The Admin API provides endpoints for managing users and groups in the Cognito user pool. These administrative operations require elevated permissions and authentication.

## Authentication

All admin endpoints (except `/api/v1/admin/auth/login`) require authentication with a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Users

#### List Users

```
GET /api/v1/admin/users
```

Query Parameters:

- `limit` (optional): Maximum number of users to return (integer)
- `paginationToken` (optional): Token for pagination (string)
- `filter` (optional): Filter string for searching users (string)

Response:

```json
{
  "users": [
    {
      "username": "user1",
      "userStatus": "CONFIRMED",
      "enabled": true,
      "userCreateDate": "2023-01-01T00:00:00.000Z",
      "userLastModifiedDate": "2023-01-01T00:00:00.000Z",
      "attributes": {
        "email": "user1@example.com",
        "sub": "123456"
      }
    }
  ],
  "paginationToken": "next-token"
}
```

#### Create User

```
POST /api/v1/admin/users
```

Request Body:

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "temporaryPassword": "TempPass123!",
  "attributes": {
    "given_name": "John",
    "family_name": "Doe"
  },
  "messageAction": "SUPPRESS"
}
```

Response:

```json
{
  "user": {
    "username": "newuser",
    "userStatus": "FORCE_CHANGE_PASSWORD",
    "enabled": true,
    "userCreateDate": "2023-01-01T00:00:00.000Z",
    "userLastModifiedDate": "2023-01-01T00:00:00.000Z",
    "attributes": {
      "email": "newuser@example.com",
      "given_name": "John",
      "family_name": "Doe"
    }
  }
}
```

#### Get User Details

```
GET /api/v1/admin/users/:username
```

Response:

```json
{
  "username": "existinguser",
  "userStatus": "CONFIRMED",
  "enabled": true,
  "userCreateDate": "2023-01-01T00:00:00.000Z",
  "userLastModifiedDate": "2023-01-01T00:00:00.000Z",
  "attributes": {
    "email": "existinguser@example.com",
    "given_name": "Jane",
    "family_name": "Doe"
  }
}
```

#### Update User Attributes

```
PATCH /api/v1/admin/users/:username
```

Request Body:

```json
{
  "attributes": {
    "given_name": "Jane",
    "family_name": "Smith",
    "custom:role": "admin"
  }
}
```

Response:

```json
{
  "success": true
}
```

#### Delete User

```
DELETE /api/v1/admin/users/:username
```

Response:

```json
{
  "success": true
}
```

#### Disable User

```
POST /api/v1/admin/users/:username/disable
```

Response:

```json
{
  "success": true
}
```

#### Enable User

```
POST /api/v1/admin/users/:username/enable
```

Response:

```json
{
  "success": true
}
```

#### Reset User Password

```
POST /api/v1/admin/users/:username/reset-password
```

Response:

```json
{
  "success": true
}
```

#### Set User Password

```
POST /api/v1/admin/users/:username/set-password
```

Request Body:

```json
{
  "password": "NewPassword123!",
  "permanent": true
}
```

Response:

```json
{
  "success": true
}
```

#### Confirm User Email (Admin)

```
POST /api/v1/admin/users/:username/confirm
```

Response:

```json
{
  "success": true
}
```

### Groups

#### List Groups

```
GET /api/v1/admin/groups
```

Query Parameters:

- `limit` (optional): Maximum number of groups to return (integer)
- `nextToken` (optional): Token for pagination (string)

Response:

```json
{
  "groups": [
    {
      "groupName": "admins",
      "description": "Admin group",
      "precedence": 0,
      "roleArn": "arn:aws:iam::123456789012:role/AdminRole",
      "creationDate": "2023-01-01T00:00:00.000Z",
      "lastModifiedDate": "2023-01-01T00:00:00.000Z"
    }
  ],
  "nextToken": "next-token"
}
```

#### Create Group

```
POST /api/v1/admin/groups
```

Request Body:

```json
{
  "groupName": "editors",
  "description": "Editor group",
  "precedence": 1,
  "roleArn": "arn:aws:iam::123456789012:role/EditorRole"
}
```

Response:

```json
{
  "group": {
    "groupName": "editors",
    "description": "Editor group",
    "precedence": 1,
    "roleArn": "arn:aws:iam::123456789012:role/EditorRole",
    "creationDate": "2023-01-01T00:00:00.000Z",
    "lastModifiedDate": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Group

```
PATCH /api/v1/admin/groups/:groupName
```

Request Body:

```json
{
  "description": "Updated editor group",
  "precedence": 2,
  "roleArn": "arn:aws:iam::123456789012:role/NewEditorRole"
}
```

Response:

```json
{
  "group": {
    "groupName": "editors",
    "description": "Updated editor group",
    "precedence": 2,
    "roleArn": "arn:aws:iam::123456789012:role/NewEditorRole",
    "creationDate": "2023-01-01T00:00:00.000Z",
    "lastModifiedDate": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Delete Group

```
DELETE /api/v1/admin/groups/:groupName
```

Response:

```json
{
  "success": true
}
```

### User Groups

#### Add User to Group

```
POST /api/v1/admin/groups/:groupName/users/:username
```

Response:

```json
{
  "success": true
}
```

#### Remove User from Group

```
DELETE /api/v1/admin/groups/:groupName/users/:username
```

Response:

```json
{
  "success": true
}
```

### Authentication

#### Admin Login

```
POST /api/v1/admin/auth/login
```

Request Body:

```json
{
  "username": "admin",
  "password": "AdminPassword123!"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Internal server error

Error response format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```
