# Error Handling

## Standard Error Format

All API errors follow this format:

```json
{
  "status": 400,
  "message": "Error description",
  "timestamp": "2024-02-20T12:00:00Z",
  "path": "/api/resource"
}
```

## Error Types

| Status Code | Description    | Usage                    |
| ----------- | -------------- | ------------------------ |
| 400         | Bad Request    | Invalid input data       |
| 401         | Unauthorized   | Missing authentication   |
| 403         | Forbidden      | Insufficient permissions |
| 404         | Not Found      | Resource doesn't exist   |
| 500         | Internal Error | Server-side issues       |

## Error Handling Best Practices

1. Always use appropriate status codes
2. Provide clear error messages
3. Include relevant error details
4. Log errors appropriately
