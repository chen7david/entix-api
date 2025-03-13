# Environment Configuration

Entix API uses a robust environment configuration system based on Zod for validation and TypeScript for type safety.

## Environment Variables

The application requires the following environment variables:

| Variable          | Description                                      | Default                  | Required |
| ----------------- | ------------------------------------------------ | ------------------------ | -------- |
| NODE_ENV          | Environment mode (development, production, test) | development              | Yes      |
| PORT              | HTTP server port                                 | 3000                     | No       |
| POSTGRES_HOST     | PostgreSQL host                                  | localhost                | Yes      |
| POSTGRES_PORT     | PostgreSQL port                                  | 5432                     | Yes      |
| POSTGRES_USER     | PostgreSQL username                              |                          | Yes      |
| POSTGRES_PASSWORD | PostgreSQL password                              |                          | Yes      |
| POSTGRES_DB       | PostgreSQL database name                         |                          | Yes      |
| LOG_LEVEL         | Minimum log level                                | info (prod), debug (dev) | No       |

## Configuration Loading

Environment variables are loaded and validated using Zod:
