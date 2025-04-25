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

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for Dev Container / PostgreSQL)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started (Local Development)

This project uses **Dev Containers** to provide a consistent and isolated development environment, including a PostgreSQL database service.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/chen7david/entix-api.git
    cd entix-api
    ```

2.  **Open in Dev Container:**

    - Open the cloned folder in VS Code.
    - VS Code should automatically detect the `.devcontainer/devcontainer.json` file and prompt you to **"Reopen in Container"**. Click it.
    - If not prompted, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run **"Dev Containers: Reopen in Container"**.
    - This will build the Docker image (if not cached) and start the container, which includes Node.js, necessary tools, and a PostgreSQL service.

3.  **Set up Environment Variables:**

    - Inside the Dev Container, create your local environment files by copying the example:
      ```bash
      cp .env.example .env
      cp .env.example .env.test
      ```
    - **Review and edit `.env`:** Update `DATABASE_URL` if your Dev Container's PostgreSQL service uses different credentials or port than the default (`postgres://postgres:postgres@localhost:5432/dev-entix-api`). Adjust `PORT` and `LOG_LEVEL` if needed.
    - **Review and edit `.env.test`:** Ensure `TEST_DATABASE_URL` points to a **separate database** intended _only_ for testing (e.g., `postgres://postgres:postgres@localhost:5432/test-entix-api`). **Do not use the same database as your development `DATABASE_URL`**, as test setup might alter or clear data.

4.  **Install Dependencies:**

    - The Dev Container should run `npm install` automatically upon startup. If not, or if you add new dependencies, run:
      ```bash
      npm install
      ```

5.  **Initialize Databases:**

    - **Development Database:** Sync your schema to the development database specified in `.env`:
      ```bash
      npm run db:push
      ```
      _(Alternatively, if you prefer versioned migrations for dev: `npm run db:migrate`)_
    - **Test Database:** Sync your schema to the _separate_ test database specified in `.env.test`:
      ```bash
      npm run db:push-test
      ```

6.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    - This uses `ts-node-dev` for fast hot-reloading.
    - The API should now be running, typically on `http://localhost:3000` (or the `PORT` specified in `.env`).

7.  **Verify Setup:** \* Access the health check endpoint in your browser or using `curl`: `http://localhost:3000/health` (replace `3000` if needed).
    You should get a JSON response indicating the API is running.

## Development Workflow

### Branching

1.  Create a new branch for your feature or bugfix, preferably linked to a Jira ticket.
2.  Use the following format (copyable from Jira ticket if configured):
    ```
    <type>/<jira-ticket>-<short-description>
    ```
    - **Example:** `feat/ENTIX-123-add-user-profile-endpoint`
    - **Example:** `fix/ENTIX-456-resolve-login-bug`

### Coding

1.  Implement your feature or fix within the appropriate domain (`src/domains/...`).
2.  Follow existing patterns for controllers, services, repositories, DTOs, and schemas.
3.  Write unit and integration tests for your changes.
4.  Ensure code is well-formatted (`npm run format`) and passes lint checks (`npm run lint`).

### Testing

Run all tests using Jest:

```bash
npm test
```

### Documentation

- **API Documentation:** If you add or modify API endpoints, update the OpenAPI documentation using `@OpenAPI` decorators in your controller. See `docs/api-documentation.md` for details.
- **Code Comments:** Use TSDoc for functions, classes, and complex logic.
- **Project Documentation:** If you add significant features, new core libraries, or change workflows, update the relevant files in the `docs/` directory.

## Database Management

Drizzle ORM is used for schema definition, migrations, and type-safe database access.

- **Schema Files:** Define tables in `*.schema.ts` files within relevant domains (e.g., `src/domains/user/user.schema.ts`).
- **Migrations:** Use `npm run db:generate` and `npm run db:migrate` for managing database schema changes.
- **Test DB Sync:** Use `npm run db:push-test` to quickly update your test database schema.

For a detailed guide, see [Database Migration & Schema Management Guide](./docs/db-migrations.md).

## API Documentation

The API uses OpenAPI 3.0 for documentation, automatically generated from controller annotations.

- **View Spec:** Access the raw OpenAPI JSON spec at `/api/openapi.json` when the server is running.
- **Documentation Guide:** Learn how to add documentation to your endpoints in [API Documentation Guide](./docs/api-documentation.md).

## Project Structure

The codebase is organized into domains and shared modules. For a detailed explanation of the structure and core services like `AppService`, `ServerService`, and `ConfigService`, see the [Express API Setup Guide](./docs/express-typedi-setup.md).

## Further Documentation

Explore the `docs/` directory for more in-depth guides:

- [API Documentation](./docs/api-documentation.md): How to document endpoints using OpenAPI.
- [Database Migrations](./docs/db-migrations.md): Managing database schema with Drizzle.
- [Error Handling](./docs/error-handling.md): Overview of the custom error classes and middleware.
- [ESLint & Prettier Setup](./docs/eslint-prettier-setup.md): Code linting and formatting configuration.
- [Express & TypeDI Setup](./docs/express-typedi-setup.md): Core application architecture.
- [Logger Usage](./docs/logger-usage.md): How to use the Pino-based logger.
- [Path Aliasing Setup](./docs/path-aliasing-setup.md): Configuration for module path aliases.
- [Request Validation](./docs/request-validation.md): Using Zod for request validation.
- [Test Setup](./docs/test-setup.md): Explanation of the Jest, ts-node, and ts-jest setup.
- [Testing Guide](./docs/testing.md): Best practices for writing tests.
- [Writing Tests](./docs/writing-tests.md): Specific examples of testing with TypeDI.

## Technology Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **DI Container:** [TypeDI](https://github.com/typestack/typedi)
- **Validation:** [Zod](https://zod.dev/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (PostgreSQL)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (v14+ recommended)
- **Logging:** [Pino](https://getpino.io/)
- **Testing:** [Jest](https://jestjs.io/)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)
- **Development Environment:** [Docker](https://www.docker.com/) / [Dev Containers](https://containers.dev/)
