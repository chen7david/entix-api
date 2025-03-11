# Database Configuration

## PostgreSQL Setup

The project uses PostgreSQL as its primary database.

### Dev Container Configuration

Database is automatically configured when using dev containers:

- Database name from `.env`
- Persistent storage in Docker volume
- Automatic test database creation

### Manual Configuration

1. Install PostgreSQL 13+
2. Create database user
3. Create main and test databases
4. Update `.env` configuration
