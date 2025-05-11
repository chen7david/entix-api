# API Endpoints Documentation

## Authentication Endpoints

### Endpoint: `POST /api/v1/auth/signup`

#### Description

Registers a new user.

#### Request

- **Body**:

```json
{
  "username": "validuser",
  "email": "valid@example.com",
  "password": "password12345"
}
```

#### Response

- **Status Code**: `201 Created`
- **Body**:

```json
{
  "userConfirmed": false,
  "sub": "sub-123"
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

### Endpoint: `POST /api/v1/auth/confirm-signup`

#### Description

Confirms user signup with confirmation code.

#### Request

- **Body**:

```json
{
  "username": "validuser",
  "code": "123456"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "success": true
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

### Endpoint: `POST /api/v1/auth/forgot-password`

#### Description

Initiates forgot password flow.

#### Request

- **Body**:

```json
{
  "username": "validuser"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "codeDeliveryDetails": {
    "destination": "test@example.com",
    "deliveryMedium": "EMAIL",
    "attributeName": "email"
  }
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

### Endpoint: `POST /api/v1/auth/confirm-forgot-password`

#### Description

Confirms a new password using a confirmation code.

#### Request

- **Body**:

```json
{
  "username": "validuser",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "success": true
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

### Endpoint: `POST /api/v1/auth/resend-confirmation-code`

#### Description

Resends the confirmation code for user sign-up.

#### Request

- **Body**:

```json
{
  "username": "validuser"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "codeDeliveryDetails": {
    "destination": "test@example.com",
    "deliveryMedium": "EMAIL",
    "attributeName": "email"
  }
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

### Endpoint: `POST /api/v1/auth/change-password`

#### Description

Changes the password for the currently authenticated user.

#### Request

- **Body**:

```json
{
  "accessToken": "validaccesstoken12345",
  "previousPassword": "previouspassword12345",
  "proposedPassword": "newpassword12345"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "success": true
}
```

#### Error Responses

- **Status Code**: `400 Bad Request`
  - **Body**:

```json
{
  "error": "Validation error"
}
```

## Health Endpoint

### Endpoint: `GET /health`

#### Description

Checks the health status of the API.

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2023-10-01T12:00:00Z"
}
```

## Role Management Endpoints

### Endpoint: `GET /api/v1/roles`

#### Description

Retrieves a list of all roles.

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
[
  {
    "id": 1,
    "name": "Administrator",
    "createdAt": "2023-10-01T12:00:00Z",
    "updatedAt": "2023-10-01T12:00:00Z"
  }
]
```

### Endpoint: `POST /api/v1/roles`

#### Description

Creates a new role.

#### Request

- **Body**:

```json
{
  "name": "NewRole"
}
```

#### Response

- **Status Code**: `201 Created`
- **Body**:

```json
{
  "id": 2,
  "name": "NewRole",
  "createdAt": "2023-10-01T12:00:00Z",
  "updatedAt": "2023-10-01T12:00:00Z"
}
```

#### Error Responses

- **Status Code**: `409 Conflict`
  - **Body**:

```json
{
  "error": "Role with this name already exists"
}
```

### Endpoint: `PUT /api/v1/roles/:id`

#### Description

Updates an existing role by its ID.

#### Request

- **Body**:

```json
{
  "name": "UpdatedRoleName"
}
```

#### Response

- **Status Code**: `200 OK`
- **Body**:

```json
{
  "id": 1,
  "name": "UpdatedRoleName",
  "createdAt": "2023-10-01T12:00:00Z",
  "updatedAt": "2023-10-01T12:00:00Z"
}
```

#### Error Responses

- **Status Code**: `404 Not Found`
  - **Body**:

```json
{
  "error": "Role not found"
}
```

### Endpoint: `DELETE /api/v1/roles/:id`

#### Description

Deletes a role by its ID.

#### Response

- **Status Code**: `204 No Content`
