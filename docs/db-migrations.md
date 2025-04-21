# Database Migration & Schema Management Guide

## Overview

This guide explains how to:

- Safely create and update database tables and fields using Drizzle ORM migrations.
- Use the provided scripts to manage migrations for development, testing, and production.
- Follow best practices for database schema evolution, including testing and production rollout.

---

## 1. Project Structure & Scripts

Your project is set up with Drizzle ORM and the following scripts in `package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
"db:seed": "ts-node src/database/seed.ts"
```

- **Migrations and generated SQL** are stored in `src/database/drizzle/`.
- **Schemas** are defined in each domain, e.g., `src/domains/user/user.schema.ts`.

---

## 2. How to Add or Update Tables/Fields

### Step 1: Update or Create Schema Files

- To add a new table or field, edit or create a schema file in the appropriate domain folder.
  - Example: `src/domains/user/user.schema.ts`
- Use Drizzle's schema DSL to define your table/columns.

**Example:**

```ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Step 2: Generate Migration

Run:

```sh
npm run db:generate
```

- This will scan your schema files and generate a new migration in `src/database/drizzle/`.

### Step 3: Review the Migration

- Open the generated SQL file in `src/database/drizzle/`.
- **Review it carefully** to ensure it matches your intended schema changes.
- Make manual adjustments if needed (for complex changes).

---

## 3. Applying Migrations

### Development Database

To apply migrations to your local development database:

```sh
npm run db:migrate
```

- This will apply all pending migrations using the `DATABASE_URL` in your `.env`.

### Testing Database

**Best Practice:**

- Use a separate `.env.test` file with a different `DATABASE_URL` for your test database.
- Before running tests, apply migrations to the test DB:

```sh
DATABASE_URL=postgres://user:pass@localhost:5432/your_test_db npm run db:migrate
```

Or set up your test runner to do this automatically.

### Production Database

**Best Practice:**

- Always backup your production database before applying migrations.
- Apply migrations during a maintenance window or with zero-downtime strategies.
- Use the production `DATABASE_URL`:

```sh
DATABASE_URL=postgres://user:pass@prod-host:5432/prod_db npm run db:migrate
```

- Monitor the migration process and check logs for errors.

---

## 4. Seeding the Database

To seed your database (e.g., with initial users or roles):

```sh
npm run db:seed
```

- The script at `src/database/seed.ts` will run and insert your seed data.

---

## 5. Drizzle Studio

To visually inspect and manage your schema, run:

```sh
npm run db:studio
```

- This opens Drizzle Studio at [https://local.drizzle.studio](https://local.drizzle.studio).

---

## 6. Best Practices & Recommendations

- **Always review generated migrations** before applying, especially in production.
- **Test migrations** on a staging or test database before running in production.
- **Keep schema files and migrations in version control** for traceability.
- **Never edit production databases manually**; always use migrations.
- **Backup your database** before applying migrations in production.
- **Automate migration application** in CI/CD for test and staging environments.
- **Document all schema changes** in your project's changelog or documentation.

---

## 7. Common Migration Workflow

1. **Develop:**

   - Update schema files.
   - Run `npm run db:generate`.
   - Review and commit the migration.

2. **Test:**

   - Apply migrations to your test DB:  
     `DATABASE_URL=... npm run db:migrate`
   - Run your test suite.

3. **Staging/Pre-Prod:**

   - Apply migrations to a staging DB.
   - Run integration tests.

4. **Production:**
   - Backup DB.
   - Apply migrations:  
     `DATABASE_URL=... npm run db:migrate`
   - Monitor for issues.

---

## 8. Further Reading & Resources

- [Drizzle ORM Migrations Docs](https://orm.drizzle.team/docs/migrations)
- [Drizzle Kit CLI Docs](https://orm.drizzle.team/kit-docs/overview)
- [Zero-Downtime Migration Strategies](https://www.prisma.io/blog/zero-downtime-migrations-prisma)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup-dump.html)

---

## 9. Troubleshooting

- **Migration fails:**
  - Check the generated SQL for errors.
  - Ensure your `DATABASE_URL` is correct and the DB is accessible.
- **Schema not updating:**
  - Make sure you updated the correct schema file and re-generated the migration.
- **Conflicts:**
  - If multiple developers are working on migrations, coordinate to avoid conflicts and always rebase/merge migrations carefully.

---

## 10. Summary Table

| Task                | Command               | Notes                           |
| ------------------- | --------------------- | ------------------------------- |
| Generate migration  | `npm run db:generate` | After editing schema files      |
| Apply migration     | `npm run db:migrate`  | Applies to DB in `DATABASE_URL` |
| Push schema         | `npm run db:push`     | Syncs schema, use with caution  |
| Seed database       | `npm run db:seed`     | Runs `src/database/seed.ts`     |
| Open Drizzle Studio | `npm run db:studio`   | Visual schema management        |

---

**By following this workflow, you ensure safe, reliable, and auditable database schema changes across all environments.**
