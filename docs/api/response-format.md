# Response Format

## Standard Response Structure

All API responses follow this format:

```json
{
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-02-20T12:00:00Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
}
```

## Response Types

### Success Response

```json
{
  "data": { ... },
  "meta": { ... }
}
```

### List Response

```json
{
  "data": [ ... ],
  "meta": {
    "pagination": { ... }
  }
}
```
