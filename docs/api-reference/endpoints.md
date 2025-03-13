---
title: API Endpoints
---

# API Endpoints

This document provides details on all available API endpoints in Entix API.

## Health Check

### GET /health

Check the health of the API.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Users

### GET /users

Get a list of all users.

#### Query Parameters

| Parameter | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| limit     | number | Maximum number of users to return |
| offset    | number | Number of users to skip           |

#### Response

```json
{
  "users": [
    {
      "id": "123",
      "username": "john_doe",
      "email": "john@example.com"
    }
  ],
  "total": 1
}
```

### GET /users/:id

Get a single user by ID.

#### Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| id        | string | User ID     |

#### Response

```json
{
  "id": "123",
  "username": "john_doe",
  "email": "john@example.com"
}
```

### POST /users

Create a new user.

#### Request Body

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Response

```json
{
  "id": "123",
  "username": "john_doe",
  "email": "john@example.com"
}
```

## Authentication

### POST /auth/login

Authenticate a user and get an access token.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### POST /auth/refresh

Refresh an expired access token.

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
