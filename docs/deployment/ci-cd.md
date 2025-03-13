---
title: CI/CD Setup
---

# CI/CD Setup

This guide explains how to set up Continuous Integration and Continuous Deployment (CI/CD) for the Entix API.

## Overview

CI/CD automates the building, testing, and deployment of your application, ensuring consistent quality and faster delivery. This guide covers setting up CI/CD using GitHub Actions, but the concepts can be applied to other CI/CD platforms as well.

## GitHub Actions Setup

### Directory Structure

Create a `.github/workflows` directory in your repository to store your GitHub Actions workflow files:

```
.github/
  workflows/
    ci.yml
    cd.yml
```

### Continuous Integration Workflow

Create a `ci.yml` file for running tests on every pull request and push to the main branch:

```yaml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: entix_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Create .env.test file
        run: |
          cat > .env.test << EOL
          NODE_ENV=test
          PORT=3000

          # Database
          DB_HOST=localhost
          DB_PORT=5432
          DB_NAME=entix_test
          DB_USER=postgres
          DB_PASSWORD=postgres

          # Logging
          LOG_LEVEL=error
          EOL

      - name: Initialize test database
        run: npm run test:init

      - name: Run tests
        run: npm test

      - name: Check code formatting
        run: npm run format -- --check
```

### Continuous Deployment Workflow

Create a `cd.yml` file for deploying to production when a release is created:

```yaml
name: Continuous Deployment

on:
  release:
    types: [created]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USERNAME }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /path/to/entix-api
            git pull
            npm ci
            npm run build
            pm2 restart entix-api
```

## GitHub Repository Secrets

You need to set up the following secrets in your GitHub repository:

- `PRODUCTION_HOST`: The hostname or IP address of your production server
- `PRODUCTION_USERNAME`: The username for SSH access to your production server
- `PRODUCTION_SSH_KEY`: The private SSH key for accessing your production server

To add these secrets:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its name and value

## Deployment Options

### Option 1: Direct Server Deployment

The example above shows deploying directly to a server using SSH. This approach is simple but requires manual server setup.

### Option 2: Docker Deployment

For Docker-based deployments, modify the CD workflow:

```yaml
# In cd.yml
- name: Deploy to production server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.PRODUCTION_HOST }}
    username: ${{ secrets.PRODUCTION_USERNAME }}
    key: ${{ secrets.PRODUCTION_SSH_KEY }}
    script: |
      cd /path/to/entix-api
      git pull
      docker-compose -f docker-compose.prod.yml up -d --build
```

### Option 3: Cloud Platform Deployment

For deploying to cloud platforms like Heroku, AWS, or Azure, use platform-specific actions:

#### Heroku Example

```yaml
- name: Deploy to Heroku
  uses: akhileshns/heroku-deploy@v3.12.13
  with:
    heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
    heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
    heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

#### AWS Elastic Beanstalk Example

```yaml
- name: Deploy to AWS Elastic Beanstalk
  uses: einaregilsson/beanstalk-deploy@v21
  with:
    aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    application_name: entix-api
    environment_name: production
    region: us-west-2
    version_label: ${{ github.sha }}
    deployment_package: deploy.zip
```

## Additional CI/CD Configuration

### Automated Versioning

Automate versioning using a workflow that creates releases:

```yaml
name: Create Release

on:
  push:
    branches: [main]

jobs:
  version:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Bump version and create tag
        id: version
        uses: phips28/gh-action-bump-version@master
        with:
          tag-prefix: 'v'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          name: Release ${{ steps.version.outputs.newTag }}
          tag_name: ${{ steps.version.outputs.newTag }}
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Environment-specific Deployments

For deploying to multiple environments (staging, production), use GitHub environments:

```yaml
name: Deployment

on:
  push:
    branches:
      - develop
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      # ... deployment steps
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/entix-api
            git pull
            git checkout ${{ github.ref == 'refs/heads/main' && 'main' || 'develop' }}
            npm ci
            npm run build
            pm2 restart ${{ github.ref == 'refs/heads/main' && 'entix-api-prod' || 'entix-api-staging' }}
```

## Best Practices

1. **Run Tests First**: Always run tests before deploying to any environment.

2. **Environment Variables**: Use environment variables or secrets for sensitive information.

3. **Deployment Approval**: For production deployments, consider adding manual approval steps.

4. **Rollback Plan**: Have a strategy for rolling back failed deployments.

5. **Notifications**: Set up notifications for successful and failed deployments.

6. **Artifact Storage**: Store build artifacts for easier debugging and rollbacks.

7. **Cache Dependencies**: Cache dependencies to speed up builds.

8. **Parallel Jobs**: Run independent steps in parallel to reduce build time.

## Example Resources

- GitHub Actions documentation: https://docs.github.com/en/actions
- Docker deployment examples: https://docs.docker.com/ci-cd/
- PM2 deployment guide: https://pm2.keymetrics.io/docs/usage/deployment/
