FROM mcr.microsoft.com/devcontainers/javascript-node:1-20

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and set permissions for node_modules directory
RUN mkdir -p /workspaces/entix-api/node_modules && \
    chown -R node:node /workspaces/entix-api/node_modules

# Switch to non-root user
USER node

# Install global development tools
RUN npm install -g nodemon typescript ts-node \
    eslint prettier \
    @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    eslint-config-prettier \
    tree-cli

WORKDIR /workspaces/entix-api