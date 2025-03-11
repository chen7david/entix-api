# Environment Variables

## Configuration Files

- `.env` - Development environment
- `.env.test` - Test environment
- `.env.example` - Template with defaults

## Required Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=entix
DB_USER=postgres
DB_PASSWORD=postgres
```

## Adding New Variables

1. Add to environment schema
2. Update `.env.example`
3. Update documentation
4. Add validation rules if needed
