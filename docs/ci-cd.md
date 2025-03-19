# CI/CD Pipeline Documentation

This document explains how the Continuous Integration and Continuous Deployment (CI/CD) pipeline works for the Entix API project.

## Overview

We use GitHub Actions to automate the build and deployment process. When code is merged into the `main` branch, a workflow automatically builds a Docker image and publishes it to the GitHub Container Registry (GHCR).

## Workflow Details

The workflow is defined in `.github/workflows/build-and-publish.yml` and consists of the following steps:

1. **Trigger Conditions**: The workflow runs when:

   - Code is pushed to the `main` branch
   - Manually triggered via the GitHub UI (workflow_dispatch)

2. **Build and Push Process**:
   - Checkout the code
   - Set up Docker Buildx for multi-platform builds
   - Log in to the GitHub Container Registry
   - Extract metadata for Docker image tagging
   - Build and push the Docker image

## Docker Image

The Docker image is built using a multi-stage approach defined in the `Dockerfile`:

### Stage 1: Builder

- Uses Node.js 22 Alpine as the base image
- Installs all dependencies including development dependencies
- Compiles TypeScript to JavaScript
- Runs the build process defined in package.json

### Stage 2: Production

- Uses Node.js 22 Alpine as the base image
- Installs only production dependencies
- Copies only the compiled code from the builder stage
- Runs as a non-root user (node) for better security
- Exposes port 3000 for the application
- Uses the `npm start` command which runs the production script

## Image Tagging Strategy

Each image is tagged with:

- `latest`: Always points to the most recent successful build
- Short SHA of the commit (e.g., `sha-a1b2c3d`): Provides a unique identifier for each build
- Semantic version (if tagged): When a Git tag like `v1.2.3` is pushed, the image is also tagged with `1.2.3`

## Implementation Decisions

### Multi-Stage Build

We use a multi-stage build to reduce the final image size. The first stage compiles the TypeScript code, and the second stage includes only the compiled code and production dependencies. This results in a significantly smaller container.

### Alpine Base Image

The Alpine Linux base image is much smaller than standard Linux distributions, reducing the overall image size.

### Security Considerations

- Running as a non-root user (`node`) to prevent potential security vulnerabilities
- Only installing production dependencies in the final image
- Using specific version tags for base images to ensure reproducibility

### Caching Strategy

The workflow uses GitHub's cache for Docker layers to speed up subsequent builds.

## Modifying the Workflow

When updating the workflow, consider the following:

### Dependency Updates

- When upgrading Node.js, update the version in the Dockerfile
- Review the GitHub Actions versions periodically to take advantage of new features and security fixes

### Adding Build Arguments

If your application requires build-time arguments (e.g., API endpoints that change between environments), add them to the `docker/build-push-action` step:

```yaml
build-and-push:
  # ...
  with:
    # ...
    build-args: |
      API_URL=https://api.example.com
      OTHER_ARG=value
```

### Environment Variables

Currently, the workflow expects all environment variables to be embedded in the image at build time. If you need to inject environment variables at runtime:

1. Modify the Dockerfile to accept environment variables
2. Create GitHub Secrets for sensitive values
3. Pass these as build arguments or use a runtime configuration system

### Image Size Optimization

If you need to further reduce the image size:

- Consider using a more aggressive `.dockerignore` file
- Explore multi-architecture builds if needed
- Consider using Docker's `--squash` flag (requires experimental features)

## Troubleshooting

Common issues and solutions:

### Permission Issues

If you encounter permission issues when pushing to GHCR, ensure that:

- The repository has the correct permissions set for GitHub Actions
- The `GITHUB_TOKEN` has `packages: write` permission (already configured in the workflow)

### Build Failures

If the build fails:

1. Check the GitHub Actions logs for specific error messages
2. Ensure the Dockerfile is compatible with your application structure
3. Verify that all required files are included in the Docker build context (not excluded by `.dockerignore`)

### Image Not Updated

If the image doesn't update as expected:

1. Check if the workflow ran successfully
2. Verify that the image was pushed to GHCR
3. Ensure your deployment is pulling the correct tag

## Jenkins Webhook Setup

To set up a webhook for Jenkins jobs, follow these steps:

### GitHub Webhook

1. **Navigate to Your GitHub Repository**:

   - Go to your repository on GitHub.

2. **Access Settings**:

   - Click on the "Settings" tab.

3. **Webhooks**:

   - In the left sidebar, click on "Webhooks".

4. **Add Webhook**:

   - Click on the "Add webhook" button.

5. **Configure Webhook**:

   - **Payload URL**: Enter the following URL:
     ```
     https://jenkins.entix.org/jenkins/github-webhook/
     ```
   - **Content type**: Select `application/json`.
   - **Secret**: (Optional) You can add a secret for security, but make sure to configure Jenkins to use this secret if you do.
   - **Which events would you like to trigger this webhook?**: Select "Let me select individual events." and check the following:
     - **Pull requests**
     - **Pushes**
   - **Active**: Ensure the webhook is active.

6. **Save**:
   - Click the "Add webhook" button to save your changes.

### Non-GitHub Webhook

1. **Open Jenkins**:

   - Navigate to your Jenkins instance.

2. **Create a New Job**:

   - Click on "New Item" in the Jenkins dashboard.
   - Enter a name for your job (e.g., "Deploy on Build Success") and select "Freestyle project" or "Pipeline" based on your needs.
   - Click "OK".

3. **Configure Job**:

   - In the job configuration, scroll down to the "Build Triggers" section.
   - Check the box for **"Trigger builds remotely (e.g., from scripts)"**.
   - Enter an authentication token (e.g., `my-token`). You will use this token in your webhook URL.

4. **Set Up Build Steps**:

   - Configure the build steps as needed for your deployment process (e.g., running scripts, deploying to servers, etc.).

5. **Save the Job**:
   - Click "Save" to save your job configuration.

### Triggering the Jenkins Job via Webhook

To trigger the Jenkins job using a webhook, you will need to use the following URL format:
