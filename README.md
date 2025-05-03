# Entix API

[![Node.js](https://img.shields.io/badge/Node.js-18+-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeDI](https://img.shields.io/badge/TypeDI-0.10+-F16B75?logo=typedi&logoColor=white)](https://github.com/typestack/typedi)
[![Zod](https://img.shields.io/badge/Zod-3.x-3068b2?logo=zod&logoColor=white)](https://zod.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.29+-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pino](https://img.shields.io/badge/Pino-8.x-20A39E?logo=pino&logoColor=white)](https://getpino.io/)
[![Jest](https://img.shields.io/badge/Jest-29.x-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)

Modern, type-safe, and feature-rich REST API boilerplate built with Node.js, Express, TypeScript, TypeDI, Zod, and Drizzle ORM.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for Dev Container / PostgreSQL)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Getting Started (Local Development)

This project uses **Dev Containers** for a consistent, isolated development environment, including a PostgreSQL database.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chen7david/entix-api.git
   cd entix-api
   ```

2. **Open in Dev Container:**

   - Open the folder in VS Code.
   - Reopen in Container when prompted (or use the Command Palette).
   - The container includes Node.js, PostgreSQL, and all required tools.

3. **Set up Environment Variables:**

   ```bash
   cp .env.example .env
   cp .env.example .env.test
   ```

   - Edit `.env` and `.env.test` as needed for your local setup.

4. **Install Dependencies:**

   ```bash
   npm install
   ```

5. **Initialize Databases:**

   ```bash
   npm run db:push
   npm run db:push-test
   ```

6. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   - The API runs on `http://localhost:3000` by default.

7. **Verify Setup:**
   - Health check: [http://localhost:3000/health](http://localhost:3000/health)

---

## API Documentation & Postman

- **OpenAPI Spec:**  
  The API exposes a live OpenAPI 3.0 spec at [`/openapi.json`](http://localhost:3000/openapi.json).
- **Importing to Postman:**
  1. Open Postman.
  2. Click "Import" > "Link" and paste your running server's `/openapi.json` URL.
  3. Postman will generate a collection with all current endpoints, request/response schemas, and examples.
- **API Docs:**  
  See [API Documentation Guide](./docs/api-documentation.md) for details on annotating endpoints.

---

## Database Management

- **Drizzle ORM** is used for schema, migrations, and type-safe queries.
- **Visualize & Edit Data:**  
  Run `npm run db:studio` to open Drizzle Studio, a web UI for browsing and editing your database.
- **Schema Files:**  
  Located in each domain (e.g., `src/domains/user/user.schema.ts`).
- **Migrations:**  
  Use `npm run db:generate` and `npm run db:migrate`.
- **Seeding:**  
  Use `npm run db:seed` to populate the database with sample data.

---

## Security Features

- **Rate Limiting:**

  - Powered by [express-rate-limit](https://www.npmjs.com/package/express-rate-limit).
  - Configurable via `.env`:
    ```env
    RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
    RATE_LIMIT_MAX=100           # 100 requests per window
    ```
  - Works correctly behind proxies (e.g., Cloudflare) via `app.set('trust proxy', 1)`.
  - See [API Security Guide](./docs/api-security.md) for details and best practices.

- **Helmet:**

  - Sets secure HTTP headers by default.

- **Validation:**

  - All input is validated using [Zod](https://zod.dev/).

- **Error Handling:**

  - Centralized error middleware for consistent API error responses.

- **CORS:**
  - Configurable and enabled by default.

---

## Project Structure

- `src/domains/` — Business domains (e.g., user, openapi, health)
- `src/shared/services/` — Core services (AppService, ServerService, ConfigService, DatabaseService, LoggerService)
- `src/shared/middleware/` — Error handling, validation, and other middleware
- `src/shared/utils/` — Utilities (rate limiting, env, DI, etc.)
- `src/database/` — Schema, seed, and migration scripts

---

## Testing

- **Run all tests:**
  ```bash
  npm test
  ```
- **Watch mode:**
  ```bash
  npm run test:watch
  ```
- **Test setup:**
  - Uses Jest, Supertest, and TypeDI for isolated, fast, and reliable tests.
  - See [Testing Guide](./docs/testing.md) and [Writing Tests](./docs/writing-tests.md).

---

## Development & Contribution Workflow

- **Branching:**  
  Use `<type>/<jira-ticket>-<short-description>` (e.g., `feat/ENTIX-123-add-user-profile-endpoint`).
- **Lint & Format:**
  ```bash
  npm run lint
  npm run format
  ```
- **Documentation:**
  - Use TSDoc for code.
  - Update `docs/` for new features or changes.

---

## Useful Scripts

- `npm run db:studio` — Launch Drizzle Studio to view and edit your database in a browser.
- `npm run db:push` — Sync schema to dev DB.
- `npm run db:push-test` — Sync schema to test DB.
- `npm run db:generate` — Generate migration files.
- `npm run db:migrate` — Run migrations.
- `npm run db:seed` — Seed the database with sample data.

---

## CI/CD Pipeline

- **GitHub Actions** for PR checks, builds, and deployments.
- **Docker** for containerized builds and deployments.
- **Jenkins** integration for production/staging deploys.
- See the end of this file for a detailed workflow overview.

> **Note:** In all CI/CD environments, Husky is automatically disabled by setting the environment variable `HUSKY=0` before running `npm ci` or `npm install`. This prevents issues with Git hooks in CI and follows [Husky best practices](https://typicode.github.io/husky/#/?id=ci-server-and-docker). For details, see [CI/CD Guide](./docs/ci-cd.md).

---

## Technology Stack

- **Node.js** (v18+)
- **TypeScript**
- **Express.js**
- **TypeDI** (Dependency Injection)
- **Zod** (Validation)
- **Drizzle ORM** (PostgreSQL)
- **Pino** (Logging)
- **Jest** (Testing)
- **ESLint & Prettier** (Linting & Formatting)
- **Docker / Dev Containers**

---

## Additional Tips

- **API Exploration:**  
  Use Postman or any OpenAPI-compatible tool to explore and test endpoints. Import `/openapi.json` for up-to-date routes and schemas.
- **Database Browsing:**  
  Use `npm run db:studio` for a GUI to inspect and edit your data.
- **Security:**  
  Review [API Security Guide](./docs/api-security.md) for best practices and configuration.
- **Health Check:**  
  The `/health` endpoint is always available for monitoring.

---

## 📚 Additional Documentation

- [CI/CD Guide](./docs/ci-cd.md)
- [Logger Usage](./docs/logger-usage.md)
- [Request Validation](./docs/request-validation.md)
- [Test Setup](./docs/test-setup.md)
- [Path Aliasing Setup](./docs/path-aliasing-setup.md)
- [ESLint & Prettier Setup](./docs/eslint-prettier-setup.md)
- [Express + TypeDI Setup](./docs/express-typedi-setup.md)
- [Error Handling](./docs/error-handling.md)
- [Database Migrations](./docs/db-migrations.md)
- [Project Rules](./docs/rules.mdc)

---

## Schema Changes

### User Schema Updates (May 2025)

The user schema has been updated with the following changes:

- Changed user IDs from numeric to UUIDs for better security and scalability
- Added `username` as a unique identifier
- Added `cognitoSub` for AWS Cognito integration
- Replaced `isActive` with `isDisabled` (reversed logic, default false)
- Added `isAdmin` flag for global admins (default false, settable only via direct DB access)
- Added `updatedAt` timestamp field

#### Implementing Database Changes

Database schema changes need to be applied by running:

```bash
npm run db:push
```

This will update the database schema to match the new model.

For test environments:

```bash
NODE_ENV=test npm run db:push
```

#### Migration Path

For existing installations, a database migration is required. A SQL migration script is available at:

```
drizzle/migrations/0001_update_users_schema.sql
```

This script adds the new columns, handles renaming existing columns, and sets default values to maintain compatibility with existing data.

---

If you have questions, suggestions, or want to contribute, please open an issue or pull request!

---
