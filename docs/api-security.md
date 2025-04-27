# API Security: Rate Limiting & Best Practices

This API uses [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) and [helmet](https://helmetjs.github.io/) to protect against brute-force attacks, abusive clients, and common web vulnerabilities.

## How Rate Limiting Works

- Each client (by IP) is limited to a maximum number of requests per time window.
- If the limit is exceeded, the API responds with HTTP 429 Too Many Requests.
- The rate limit is applied globally to all endpoints.

## How to Set the Rate Limit Window

The rate limit window and maximum requests are controlled by environment variables:

- `RATE_LIMIT_WINDOW_MS`: The time window for rate limiting, in milliseconds. For example, `900000` is 15 minutes.
- `RATE_LIMIT_MAX`: The maximum number of requests allowed per window per client. For example, `100` means each client can make 100 requests per window.

### Example: Setting a 10-minute window with 50 requests

```env
RATE_LIMIT_WINDOW_MS=600000 # 10 minutes
RATE_LIMIT_MAX=50           # 50 requests per window
```

## How Helmet Works

[Helmet](https://helmetjs.github.io/) is used to set various HTTP headers for security, including:

- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- And more

Helmet is applied globally in the Express app before any other middleware, including rate limiting.

## Rate Limiting with a Proxy (e.g., Cloudflare)

If your API is behind a proxy or CDN (like Cloudflare), Express will see the proxy's IP by default, not the real client IP. This can cause all users to share the same rate limit.

**To fix this:**

- The Express app sets `trust proxy` to `1`:

  ```js
  app.set('trust proxy', 1);
  ```

  This tells Express to use the `X-Forwarded-For` header (set by Cloudflare) to determine the real client IP.

- This ensures that rate limiting is applied per real client, not per proxy.

**Example scenario:**

- Without `trust proxy`, all users appear to come from Cloudflare's IP, so all share the same rate limit.
- With `trust proxy`, each user's real IP is used, so each gets their own rate limit window.

## Configuration Summary

- Set `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` in your `.env`, `.env.test`, or `.env.example` files.
- If you change these, restart the API server.
- If you change them in tests, create a new `ConfigService` instance after setting the variables.

## Implementation Details

- Rate limiting is implemented using a utility (`createRateLimitMiddleware`) for modularity and testability.
- The middleware is configured in `AppService` using values from `ConfigService`.
- `ConfigService` loads environment variables at instantiation. If you change environment variables in tests, create a new `ConfigService` instance to pick up the changes.
- All dependencies are managed via TypeDI and registered in the container for test isolation and flexibility.

## Testing & Troubleshooting

- When testing rate limiting, set environment variables (e.g., `process.env.RATE_LIMIT_MAX`) **before** creating a new `ConfigService`.
- Register the new `ConfigService` and `AppService` with the container after changing environment variables.
- Use `Container.get(AppService)` in tests for consistency with production DI patterns.
- If you see unexpected rate limit behavior in tests, ensure you are not reusing a stale `ConfigService` instance.

## More API Security Best Practices

- Always use HTTPS in production.
- Use strong authentication and authorization for sensitive endpoints.
- Validate and sanitize all user input (see validation middleware).
- Log and monitor for suspicious activity.
- Keep dependencies up to date and monitor for vulnerabilities.
- Use CORS to restrict which domains can access your API.
- Document all security-related configuration and changes.

For more, see the [OWASP API Security Top 10](https://owasp.org/www-project-api-security/).
