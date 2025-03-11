# Development Environment Setup

## Using Dev Containers (Recommended)

Prerequisites:

- Docker Desktop
- VS Code with Dev Containers extension
- Git

Setup Steps:

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Open in VS Code
4. Click "Reopen in Container"

## Manual Setup

1. Install Node.js (version in package.json)
2. Install PostgreSQL 13+
3. Configure environment variables
4. Run setup commands:

```bash
npm install
npm run test:init
npm run dev
```

## Development Scripts

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build production
npm run build
```

## Environment Configuration

Make sure to configure your environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
```

## Additional Tools

- ESLint for linting
- Prettier for code formatting
- Jest for testing
