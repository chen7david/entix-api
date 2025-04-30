# CI/CD Guide

This document describes the Continuous Integration and Continuous Deployment (CI/CD) process for the Entix API project, including all required steps and best practices.

## Overview

Our CI/CD pipeline ensures that every code change is:

- Linted for code quality and style
- Built and type-checked
- Tested (unit and integration)
- Deployed (if on main or staging branches)

This process runs automatically for all pull requests and pushes to the main and staging branches.

---

## Workflow Structure

We use GitHub Actions for CI/CD, with separate workflows for:

- **Pull Request CI** (for `main` and `staging` branches)
- **Production Deployment** (`prod-deploy.yaml`)
- **Staging Deployment** (`staging-deploy.yaml`)

Each workflow consists of two main jobs:

- **CI**: Lint, build, and test the code
- **CD**: Build and push Docker images, trigger deployment jobs

---

## CI Steps (applies to all workflows)

1. **Checkout repository**
   - Uses the latest code from the branch or PR.
2. **Setup Node.js**
   - Installs Node.js (v20) and sets up npm caching.
3. **Install dependencies**
   - Runs `npm ci` for a clean, reproducible install.
4. **Lint code**
   - Runs `npm run lint` to check code style and catch errors early.
5. **Check Prettier formatting**
   - Runs `npx prettier --check .` to ensure code is formatted consistently.
6. **Sync test database schema**
   - Runs `npm run db:push-test` to ensure the test database is up to date.
7. **Build project**
   - Runs `npm run build` to type-check and transpile the codebase.
8. **Run tests**
   - Runs `npm test` to execute all unit and integration tests.

If any of these steps fail, the workflow stops and the code is not merged or deployed.

---

## CD Steps (deploy jobs)

1. **Build and Push Docker Image**
   - Builds the Docker image for the app and pushes it to GitHub Container Registry.
2. **Trigger Jenkins Job Webhook**
   - Notifies Jenkins to deploy the new image to the appropriate environment (staging or production).

---

## Example Workflow (CI Job)

```yaml
- name: Checkout repository
  uses: actions/checkout@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: package-lock.json

- name: Install dependencies
  run: npm ci || (cat /home/runner/.npm/_logs/* && exit 1)

- name: Lint code
  run: npm run lint

- name: Check Prettier formatting
  run: npx prettier --check .

- name: Sync test database schema
  env:
    DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
  run: npm run db:push-test

- name: Build project
  run: npm run build

- name: Run tests
  env:
    NODE_ENV: test
    DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
    PORT: 3000
    LOG_LEVEL: error
    COGNITO_REGION: us-east-1
    COGNITO_USER_POOL_ID: us-east-1_1234567890
    COGNITO_CLIENT_ID: 1234567890
  run: npm test
```

---

## Best Practices

- **Fail fast:** Lint, Prettier, build, and test steps all fail the pipeline if errors are found.
- **Consistent environments:** Use Docker and GitHub Actions to ensure reproducibility.
- **Clear separation:** CI and CD jobs are separated for clarity and reliability.
- **Test coverage:** Both unit and integration tests are required; E2E tests are optional for advanced scenarios.

---

For details on test types, naming conventions, and Jest configuration, see [`docs/testing.md`](./testing.md).

For any changes to the CI/CD process, update this document and the relevant workflow YAML files to keep the team aligned.
