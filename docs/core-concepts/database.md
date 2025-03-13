---
title: Database Access
---

# Database Access

This guide explains how database connections and queries are managed in Entix API.

## Overview

Entix API uses PostgreSQL as its database and the `pg` library for database connections and queries.

## Database Configuration

Database connection settings are configured in `src/config/db.config.ts`:

```typescript
import { Pool } from 'pg';
import { getEnv } from '../utils/config.util';

const pool = new Pool({
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT')),
  database: getEnv('DB_NAME'),
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
});

export default pool;
```

## Basic Query Execution

```typescript
import pool from '../config/db.config';

async function getUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    client.release();
  }
}
```

## Using Transactions

```typescript
import pool from '../config/db.config';

async function createUserWithProfile(userData, profileData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'INSERT INTO users(username, email) VALUES($1, $2) RETURNING id',
      [userData.username, userData.email],
    );

    const userId = userResult.rows[0].id;

    await client.query('INSERT INTO profiles(user_id, display_name) VALUES($1, $2)', [
      userId,
      profileData.displayName,
    ]);

    await client.query('COMMIT');
    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Repository Pattern

Entix API recommends organizing database access using the repository pattern:

```typescript
// src/features/users/user.repository.ts
import { Service } from 'typedi';
import pool from '../../config/db.config';

@Service()
export class UserRepository {
  async findAll() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async create(userData: any) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users(username, email) VALUES($1, $2) RETURNING *',
        [userData.username, userData.email],
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
```

## Best Practices

1. Always use parameterized queries to prevent SQL injection
2. Use the repository pattern to encapsulate database access
3. Release client connections in a finally block
4. Use transactions for operations that involve multiple queries
5. Consider adding database migrations for schema changes
