---
title: Production Setup
---

# Production Setup

This guide explains how to set up the Entix API for production deployment.

## Prerequisites

Before deploying to production, ensure you have:

- Node.js 18.19.0 or later installed
- PostgreSQL 14 or later installed and configured
- A server or hosting platform (e.g., AWS, DigitalOcean, Heroku)
- Domain name (optional, but recommended)
- SSL certificate (recommended for HTTPS)

## Environment Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/chen7david/entix-api.git
   cd entix-api
   ```

2. **Install Dependencies**

   ```bash
   npm ci
   ```

   Note: Use `npm ci` instead of `npm install` for production deployments to ensure exact versions from package-lock.json are installed.

3. **Set Environment Variables**

   Create a `.env` file with production settings:

   ```
   NODE_ENV=production
   PORT=3000

   # Database
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password

   # Logging
   LOG_LEVEL=info

   # Add other environment-specific variables
   ```

   Alternatively, set these environment variables through your hosting platform's dashboard or configuration.

4. **Build the Application**

   ```bash
   npm run build
   ```

   This will compile TypeScript to JavaScript in the `dist` directory.

## Database Setup

1. **Create Database**

   Create a PostgreSQL database for the API:

   ```sql
   CREATE DATABASE your_database_name;
   CREATE USER your_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_user;
   ```

2. **Run Migrations**

   If you're using database migrations, run them to set up your schema:

   ```bash
   # Example if using a migration tool
   npm run migrate
   ```

## Running in Production

### Using Node.js Directly

1. **Start the Server**

   ```bash
   npm start
   ```

   This runs the command defined in the `start` script in package.json, which should be configured to run the compiled JavaScript from the `dist` directory.

### Using Process Manager (Recommended)

Using a process manager like PM2 is recommended for production deployments:

1. **Install PM2**

   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**

   ```bash
   pm2 start dist/server.js --name entix-api
   ```

3. **Configure PM2 to Start on Boot**

   ```bash
   pm2 startup
   pm2 save
   ```

## Web Server Configuration

For production deployments, it's recommended to use a web server like Nginx as a reverse proxy.

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name api.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

1. **Use HTTPS**

   Always use HTTPS in production to encrypt data in transit.

2. **Secure Headers**

   Implement security headers:

   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Content-Security-Policy: default-src 'self'
   ```

3. **Rate Limiting**

   Implement rate limiting to prevent abuse.

4. **Secure Database**

   - Use strong passwords
   - Limit database access to necessary IPs
   - Regularly backup the database

5. **Environment Variables**

   Never commit `.env` files to version control. Use environment variables provided by your hosting platform.

## Monitoring

Set up monitoring to keep track of your API's health and performance:

1. **Application Monitoring**

   Consider using services like:

   - New Relic
   - Datadog
   - PM2 Monitoring
   - Prometheus + Grafana

2. **Log Management**

   Set up log aggregation and monitoring with:

   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Graylog
   - Papertrail
   - Loggly

3. **Uptime Monitoring**

   Use services like:

   - UptimeRobot
   - Pingdom
   - StatusCake

## CI/CD Integration

For information on setting up continuous integration and deployment, see the [CI/CD guide](/deployment/ci-cd.md).
