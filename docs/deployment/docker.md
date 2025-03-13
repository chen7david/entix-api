---
title: Docker Deployment
---

# Docker Deployment

This guide explains how to deploy the Entix API using Docker and Docker Compose.

## Prerequisites

- Docker installed on your server
- Docker Compose installed on your server
- Basic understanding of Docker concepts
- Domain name (for production deployments)
- SSL certificate (for production deployments)

## Docker Files

The Entix API includes Docker configuration files to simplify deployment:

### Dockerfile

The `Dockerfile` defines how to build the API container:

```dockerfile
# Use a specific Node.js version
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### docker-compose.yml

The `docker-compose.yml` file defines the services needed for running the API:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=entix
      - DB_USER=entix
      - DB_PASSWORD=your_secure_password
      - LOG_LEVEL=info
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=entix
      - POSTGRES_USER=entix
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

## Development Deployment

For development or testing purposes:

1. **Build and Start Services**

   ```bash
   docker-compose up -d
   ```

   This builds the API image and starts both the API and PostgreSQL containers.

2. **View Logs**

   ```bash
   docker-compose logs -f
   ```

3. **Stop Services**

   ```bash
   docker-compose down
   ```

## Production Deployment

For production deployments, additional configuration is recommended:

### Production docker-compose.yml

Create a `docker-compose.prod.yml` file with production-specific settings:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=entix
      - DB_USER=entix
      - DB_PASSWORD=${DB_PASSWORD}
      - LOG_LEVEL=info
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - entix-network

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=entix
      - POSTGRES_USER=entix
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - entix-network

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - entix-network

networks:
  entix-network:

volumes:
  postgres-data:
```

### Nginx Configuration

Create a Nginx configuration file at `nginx/conf.d/default.conf`:

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

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    location / {
        proxy_pass http://api:3000;
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

### Deployment Steps

1. **Create a .env file**

   Create a `.env` file with your production secrets:

   ```
   DB_PASSWORD=your_secure_password
   ```

2. **SSL Certificates**

   Place your SSL certificates in the `nginx/ssl` directory:

   - `certificate.crt`: Your SSL certificate
   - `private.key`: Your private key

3. **Start the Services**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **View Logs**

   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Container Management

### Updating the API

To update the API to a new version:

1. **Pull the latest code**

   ```bash
   git pull
   ```

2. **Rebuild and restart containers**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build api
   ```

### Database Backups

To backup the PostgreSQL database:

```bash
docker-compose exec postgres pg_dump -U entix entix > backup.sql
```

To restore from a backup:

```bash
cat backup.sql | docker-compose exec -T postgres psql -U entix entix
```

## Docker Swarm Deployment

For larger production environments, consider using Docker Swarm for orchestration:

1. **Initialize Swarm**

   ```bash
   docker swarm init
   ```

2. **Deploy Stack**

   ```bash
   docker stack deploy -c docker-compose.prod.yml entix
   ```

3. **View Services**

   ```bash
   docker service ls
   ```

4. **Scale API Service**

   ```bash
   docker service scale entix_api=3
   ```

## Multi-Environment Deployment

For deploying to multiple environments, use environment-specific compose files:

- `docker-compose.yml`: Base configuration
- `docker-compose.dev.yml`: Development overrides
- `docker-compose.prod.yml`: Production overrides

Example deployment:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Best Practices

1. **Use Specific Versions**

   Always specify exact versions for base images to ensure reproducible builds.

2. **Optimize Image Size**

   Use multi-stage builds and Alpine-based images to reduce image size.

3. **Handle Secrets Properly**

   Use Docker secrets or environment variables for sensitive information.

4. **Configure Health Checks**

   Add health checks to ensure containers are functioning properly.

5. **Set Container Limits**

   Define memory and CPU limits for containers to prevent resource exhaustion.

6. **Use Docker Networks**

   Isolate services using Docker networks for better security.

7. **Implement Logging**

   Configure proper logging drivers for container logs.
