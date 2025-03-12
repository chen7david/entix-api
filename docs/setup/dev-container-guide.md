# Dev Container Guide

## Dev Container Configuration Overview

Our development environment is defined in `.devcontainer/devcontainer.json`. This configuration ensures all developers have a consistent environment with required tools and settings.

### Base Configuration

The container is configured with:

- Node.js development environment
- PostgreSQL database service
- Git and GitHub CLI tools
- Non-root user setup for security

```json
{
  "name": "Entix API Development",
  "dockerComposeFile": "docker-compose.yml",
  "service": "devcontainer",
  "workspaceFolder": "/workspaces/entix-api",
  "remoteUser": "node"
}
```

### Features and Extensions

The container comes pre-configured with essential development tools:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "mtxr.sqltools",
        "mtxr.sqltools-driver-pg",
        "christian-kohler.npm-intellisense"
      ]
    }
  }
}
```

### Port Forwarding

The container forwards essential ports for development:

- 3000: API server
- 5432: PostgreSQL database

## Making Changes to Dev Container

### Best Practices

1. **Version Control**

   - Always commit devcontainer changes to version control
   - Include clear documentation for any new requirements
   - Update README.md if setup steps change

2. **Testing Changes**
   - Test changes in a fresh container
   - Verify all automated setup steps work
   - Check that all team members can rebuild successfully

### Workflow for Updates

1. **Prepare Changes**

   ```bash
   # Create a new branch
   git checkout -b devcontainer-updates
   ```

2. **Modify Configuration**

   - Edit `.devcontainer/devcontainer.json`
   - Update related files (Dockerfile, docker-compose.yml)
   - Document changes in comments

3. **Test Changes**

   ```bash
   # Rebuild container
   Command Palette (F1) -> Dev Containers: Rebuild Container
   ```

4. **Validate Setup**

   - Verify automated setup completes
   - Test all development workflows
   - Check port forwarding
   - Validate database connections

5. **Share Changes**
   ```bash
   git add .devcontainer/
   git commit -m "devcontainer: describe your changes"
   git push origin devcontainer-updates
   ```

### Common Configurations

#### Adding New VS Code Extensions

```json
{
  "customizations": {
    "vscode": {
      "extensions": ["your-new-extension-id"]
    }
  }
}
```

#### Adding Environment Variables

```json
{
  "remoteEnv": {
    "NODE_ENV": "development",
    "YOUR_NEW_VAR": "value"
  }
}
```

#### Modifying Post-Create Commands

```json
{
  "postCreateCommand": "npm install && npm run test:init && your-new-command"
}
```

### Troubleshooting

1. **Container Build Failures**

   - Check Docker logs
   - Verify Docker resources are sufficient
   - Ensure all required files exist

2. **Port Conflicts**

   - Check for processes using required ports
   - Modify port mappings if needed
   - Use `docker ps` to verify port assignments

3. **Permission Issues**
   - Verify user permissions in container
   - Check file ownership
   - Review mounted volume permissions

If you need to completely reset your development environment, use the following command to remove all containers and volumes:

```bash
docker stop entix-api-devcontainer entix-api-db-devcontainer \
&& docker rm entix-api-devcontainer entix-api-db-devcontainer \
&& docker volume rm entix-api-node_modules \
&& docker volume rm entix-api-postgres \
&& docker volume rm vscode
```

# Dev Container Setup

## Setting Up Git

After starting your dev container, you may want to configure Git to make commits. You can do this by running the following commands in the terminal inside the container:

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

Replace `"Your Name"` with your actual name and `youremail@example.com` with your email address.

### Additional Configuration

If you want to ensure that your workspace is recognized as a safe directory and to disable file mode checking, you can also run:
